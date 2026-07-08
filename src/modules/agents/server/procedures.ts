import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { db } from "@/db"
import { agents } from "@/db/schema"
import { TRPCError } from "@trpc/server";
import { and, asc, eq, ilike } from "drizzle-orm";
import { z } from "zod";

export const agentsRouter = createTRPCRouter({
    getMany: protectedProcedure.query(async ({ ctx }) => {
        const data = await db
            .select()
            .from(agents)
            .where(eq(agents.userId, ctx.user.id))
            // Oldest first so the UI can treat data[0] as the protected
            // "main" agent (see the delete guard in `delete` below).
            .orderBy(asc(agents.createdAt), asc(agents.id));

        return data;
    }),
    getOne: protectedProcedure
        .input(z.object({ id: z.string() }))
        .query(async ({ ctx, input }) => {
            const [agent] = await db
                .select()
                .from(agents)
                .where(
                    and(
                        eq(agents.id, input.id),
                        eq(agents.userId, ctx.user.id),
                    ),
                )
                .limit(1);

            if (!agent) {
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: "Agent not found",
                });
            }
            return agent;
        }),
    create: protectedProcedure
        .input(
            z.object({
                name: z.string().min(1).max(120),
                instructions: z.string().min(1),
            }),
        )
        .mutation(async ({ ctx, input }) => {
            const [row] = await db
                .insert(agents)
                .values({
                    name: input.name,
                    instructions: input.instructions,
                    userId: ctx.user.id,
                })
                .returning();
            return row;
        }),
    search: protectedProcedure
        .input(z.object({ query: z.string().optional() }))
        .query(async ({ ctx, input }) => {
            const conditions = [eq(agents.userId, ctx.user.id)];

            if (input.query?.trim()) {
                conditions.push(ilike(agents.name, `%${input.query.trim()}%`));
            }

            return db
                .select()
                .from(agents)
                .where(and(...conditions));
        }),
    delete: protectedProcedure
        .input(z.object({ id: z.string() }))
        .mutation(async ({ ctx, input }) => {
            const [agent] = await db
                .select()
                .from(agents)
                .where(
                    and(
                        eq(agents.id, input.id),
                        eq(agents.userId, ctx.user.id),
                    ),
                )
                .limit(1);

            if (!agent) {
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: "Agent not found",
                });
            }

            // The user's oldest agent is the protected "main" agent and
            // can NEVER be deleted — not from the UI, not via a direct
            // API call. Every other agent the user creates is freely
            // deletable. createdAt is immutable, so "oldest" is stable
            // even as agents are added or removed.
            const [oldest] = await db
                .select({ id: agents.id })
                .from(agents)
                .where(eq(agents.userId, ctx.user.id))
                .orderBy(asc(agents.createdAt), asc(agents.id))
                .limit(1);

            if (oldest && oldest.id === input.id) {
                throw new TRPCError({
                    code: "FORBIDDEN",
                    message: "Your main agent cannot be deleted.",
                });
            }

            const [deleted] = await db
                .delete(agents)
                .where(and(eq(agents.id, input.id), eq(agents.userId, ctx.user.id)))
                .returning();

            return deleted;
        }),
});