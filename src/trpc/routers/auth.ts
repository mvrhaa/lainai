import { headers } from 'next/headers';
import { auth } from '@/lib/auth';
import { baseProcedure, createTRPCRouter, protectedProcedure } from '../init';

export const authRouter = createTRPCRouter({
  /**
   * Returns the current user (or null if not signed in).
   * Safe to call from login pages, layouts, etc.
   */
  me: baseProcedure.query(async ({ ctx }) => {
    // ctx.session is already populated from createTRPCContext
    if (!ctx.session?.user) return null;

    const u = ctx.session.user;
    return {
      id: u.id,
      name: u.name ?? null,
      email: u.email ?? null,
      image: u.image ?? null,
    };
  }),

  /**
   * Strict version — throws UNAUTHORIZED if not signed in.
   * Use in protected procedures that build on top of `user`.
   */
  requireUser: protectedProcedure.query(({ ctx }) => ({
    id: ctx.user.id,
    name: ctx.user.name ?? null,
    email: ctx.user.email ?? null,
    image: ctx.user.image ?? null,
  })),

  /**
   * Server-side sign out. Useful if you want to invalidate the session
   * via tRPC instead of calling authClient.signOut() on the client.
   */
  signOut: protectedProcedure.mutation(async () => {
    await auth.api.signOut({ headers: await headers() });
    return { success: true } as const;
  }),
});
