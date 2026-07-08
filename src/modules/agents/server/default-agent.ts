import "server-only";

import { eq } from "drizzle-orm";

import { db } from "@/db";
import { agents } from "@/db/schema";

/**
 * The default "main" agent that every workspace starts with.
 *
 * This is the one agent that can never be deleted (see the delete guard
 * in `./procedures.ts`). It is intentionally defined here in code so the
 * workspace always has a ready-to-chat assistant before the user creates
 * any of their own.
 */
export const DEFAULT_AGENT = {
  name: "LainAI",
  instructions: [
    "You are LainAI, the user's primary AI assistant.",
    "Be friendly, concise, and genuinely helpful.",
    "Answer clearly and keep responses focused; use short paragraphs or lists when useful.",
    "Ask a clarifying question when the request is ambiguous.",
    "If you don't know something, say so rather than guessing.",
    "The user can create additional specialized agents for specific tasks — you are the general-purpose one.",
  ].join(" "),
} as const;

/**
 * Make sure the user has at least their main agent. Idempotent: only
 * inserts when the user has zero agents. Called from the dashboard
 * layout so every signed-in user lands with a usable main agent.
 *
 * The newest insert always becomes the user's oldest agent (they had
 * none before), which is exactly the one the delete guard protects.
 */
export async function ensureDefaultAgent(userId: string): Promise<void> {
  const [existing] = await db
    .select({ id: agents.id })
    .from(agents)
    .where(eq(agents.userId, userId))
    .limit(1);

  if (existing) {
    return;
  }

  await db.insert(agents).values({
    name: DEFAULT_AGENT.name,
    instructions: DEFAULT_AGENT.instructions,
    userId,
  });
}