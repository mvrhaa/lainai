import { z } from "zod";
import { and, asc, desc, eq, ilike } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { nanoid } from "nanoid";

import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { db } from "@/db";
import { agents, meetings, messages } from "@/db/schema";
import { generateAgentReply, type ChatMessage } from "@/lib/llm";

/**
 * Helpers ------------------------------------------------------------
 */

/** Load a meeting and confirm it belongs to the caller. */
async function loadMeetingForUser(meetingId: string, userId: string) {
    const [meeting] = await db
        .select()
        .from(meetings)
        .where(and(eq(meetings.id, meetingId), eq(meetings.userId, userId)))
        .limit(1);

    if (!meeting) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Meeting not found" });
    }
    return meeting;
}

/** Load the agent that owns the meeting and confirm it belongs to the caller. */
async function loadAgentForUser(agentId: string, userId: string) {
    const [agent] = await db
        .select()
        .from(agents)
        .where(and(eq(agents.id, agentId), eq(agents.userId, userId)))
        .limit(1);

    if (!agent) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Agent not found" });
    }
    return agent;
}

/** Highest order value in the meeting, or 0 if empty. */
async function nextOrderForMeeting(meetingId: string) {
    const [last] = await db
        .select({ order: messages.order })
        .from(messages)
        .where(eq(messages.meetingId, meetingId))
        .orderBy(desc(messages.order))
        .limit(1);
    return last?.order ?? 0;
}

/** Conversation history (oldest → newest) for the LLM call. */
async function loadHistory(meetingId: string): Promise<ChatMessage[]> {
    const rows = await db
        .select()
        .from(messages)
        .where(eq(messages.meetingId, meetingId))
        .orderBy(asc(messages.order));
    return rows.map((m) => ({
        // schema accepts the three OpenAI-compatible roles
        role: m.role as ChatMessage["role"],
        content: m.content,
    }));
}

/**
 * Routers ------------------------------------------------------------
 */

export const meetingsRouter = createTRPCRouter({
    /**
     * List all meetings the caller has with a given agent.
     */
    getMany: protectedProcedure
        .input(z.object({ agentId: z.string() }))
        .query(async ({ ctx, input }) => {
            // Verify the agent exists & belongs to the caller so we don't leak
            // a list of meeting IDs attached to someone else's agent.
            await loadAgentForUser(input.agentId, ctx.user.id);

            return db
                .select()
                .from(meetings)
                .where(
                    and(
                        eq(meetings.agentId, input.agentId),
                        eq(meetings.userId, ctx.user.id),
                    ),
                )
                .orderBy(desc(meetings.updatedAt));
        }),
    search: protectedProcedure
        .input(z.object({ query: z.string().optional() }))
        .query(async ({ ctx, input }) => {
            const conditions = [eq(meetings.userId, ctx.user.id)];

            if (input.query?.trim()) {
                conditions.push(ilike(meetings.name, `%${input.query.trim()}%`));
            }

            return db
                .select()
                .from(meetings)
                .where(and(...conditions))
                .orderBy(desc(meetings.updatedAt));
        }),

    /**
     * Fetch a single meeting.
     */
    getOne: protectedProcedure
        .input(z.object({ id: z.string() }))
        .query(async ({ ctx, input }) => {
            return loadMeetingForUser(input.id, ctx.user.id);
        }),

    /**
     * Create a meeting with the given agent. Name defaults to a short stamp
     * so users don't have to fill in anything before they start typing.
     */
    create: protectedProcedure
        .input(
            z.object({
                agentId: z.string(),
                name: z.string().min(1).max(120).optional(),
            }),
        )
        .mutation(async ({ ctx, input }) => {
            const agent = await loadAgentForUser(input.agentId, ctx.user.id);
            const stamp = new Date().toLocaleString();
            const name = input.name?.trim() || `Chat with ${agent.name} — ${stamp}`;

            const [row] = await db
                .insert(meetings)
                .values({
                    name,
                    agentId: agent.id,
                    userId: ctx.user.id,
                })
                .returning();
            return row;
        }),
    delete: protectedProcedure
        .input(z.object({ id: z.string() }))
        .mutation(async ({ ctx, input }) => {
            const meeting = await loadMeetingForUser(input.id, ctx.user.id);

            const [deleted] = await db
                .delete(meetings)
                .where(and(eq(meetings.id, meeting.id), eq(meetings.userId, ctx.user.id)))
                .returning();

            return deleted;
        }),
});

export const messagesRouter = createTRPCRouter({
    /**
     * List every message in a meeting, oldest → newest.
     */
    getMany: protectedProcedure
        .input(z.object({ meetingId: z.string() }))
        .query(async ({ ctx, input }) => {
            await loadMeetingForUser(input.meetingId, ctx.user.id);

            return db
                .select()
                .from(messages)
                .where(eq(messages.meetingId, input.meetingId))
                .orderBy(asc(messages.order));
        }),

    /**
     * Append a user message to a meeting, then ask the LLM for the agent's
     * reply, and persist that too. The agent's `instructions` field is
     * used as the system prompt.
     */
    create: protectedProcedure
        .input(
            z.object({
                meetingId: z.string(),
                content: z.string().min(1).max(8_000),
            }),
        )
        .mutation(async ({ ctx, input }) => {
            const meeting = await loadMeetingForUser(input.meetingId, ctx.user.id);
            const agent = await loadAgentForUser(meeting.agentId, ctx.user.id);

            // 1. Persist the user message.
            const baseOrder = await nextOrderForMeeting(meeting.id);
            const [userRow] = await db
                .insert(messages)
                .values({
                    id: nanoid(),
                    meetingId: meeting.id,
                    userId: ctx.user.id,
                    role: "user",
                    content: input.content,
                    order: baseOrder + 1,
                })
                .returning();

            // 2. Build history (includes the row we just wrote) and ask the LLM.
            const history: ChatMessage[] = [
                ...(await loadHistory(meeting.id)),
            ];
            // The user message we just wrote is already in history; if for
            // some reason it isn't (concurrent insert race), make sure the
            // LLM sees it.
            if (
                history.length === 0 ||
                history[history.length - 1].content !== userRow.content
            ) {
                history.push({ role: "user", content: userRow.content });
            }

            const reply = await generateAgentReply(
                agent.instructions,
                history,
            );

            // 3. Persist the assistant reply.
            const [assistantRow] = await db
                .insert(messages)
                .values({
                    id: nanoid(),
                    meetingId: meeting.id,
                    userId: ctx.user.id,
                    role: "assistant",
                    content: reply,
                    order: baseOrder + 2,
                })
                .returning();

            // 4. Bump the meeting's updatedAt so it sorts to the top.
            await db
                .update(meetings)
                .set({ updatedAt: new Date() })
                .where(eq(meetings.id, meeting.id));

            return { user: userRow, assistant: assistantRow };
        }),
});
