import { z } from 'zod';
import { baseProcedure, createTRPCRouter } from '../init';
import { authRouter } from './auth';

export const appRouter = createTRPCRouter({
  auth: authRouter,
  hello: baseProcedure
    .input(z.object({ text: z.string() }))
    .query((opts) => ({ greeting: `hello ${opts.input.text}` })),
});

export type AppRouter = typeof appRouter;
