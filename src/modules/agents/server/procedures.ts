import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { db } from "@/db"
import { agents } from "@/db/schema"
import { TRPCError } from "@trpc/server";
import { and, eq } from "drizzle-orm";
import { z } from "zod";

export const agentsRouter = createTRPCRouter({
    getMany: protectedProcedure.query(async ({ ctx }) => {
        const data = await db
            .select()
            .from(agents)
            .where(eq(agents.userId, ctx.user.id));

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

            const [deleted] = await db
                .delete(agents)
                .where(and(eq(agents.id, input.id), eq(agents.userId, ctx.user.id)))
                .returning();

            return deleted;
        }),
});
