import { agentsRouter } from '@/modules/agents/server/procedures';
import { meetingsRouter, messagesRouter } from '@/modules/meetings/server/procedures';
import {createTRPCRouter } from '../init';


export const appRouter = createTRPCRouter({
  agents: agentsRouter,
  meetings: meetingsRouter,
  messages: messagesRouter,
});

export type AppRouter = typeof appRouter;
