import "server-only";

export type ChatMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

/**
 * Free LLM provider configuration -----------------------------------
 *
 * Every provider below exposes an OpenAI-compatible
 * `/chat/completions` endpoint, so we can talk to all of them with the
 * same request shape. Providers are tried in order; the first one that
 * is configured (its env key is set) AND returns a successful response
 * wins. If a provider is configured but fails (rate limit, bad model,
 * network) we fall through to the next one.
 *
 * See `docs/FREE_LLM_PROVIDERS.md` for how to obtain each key for free.
 */

interface LlmProvider {
  /** Display name, surfaced in errors / docs. */
  name: string;
  /** Env vars that must all be set for this provider to be considered "configured". */
  requiredEnv: string[];
  /** Builds the full chat-completions URL. */
  url: () => string;
  /** Default model for this provider. */
  model: string;
  /** Extra request headers (auth + provider-specific). */
  headers: () => Record<string, string>;
}

const providers: LlmProvider[] = [
  {
    // Free tier, very fast. Already wired via GROQ_API_KEY in .env.
    name: "Groq",
    requiredEnv: ["GROQ_API_KEY"],
    url: () => "https://api.groq.com/openai/v1/chat/completions",
    model: "llama-3.3-70b-versatile",
    headers: () => ({ Authorization: `Bearer ${process.env.GROQ_API_KEY}` }),
  },
  {
    // SambaNova Cloud — free, OpenAI-compatible, strong quality.
    name: "SambaNova",
    requiredEnv: ["SAMBANOVA_API_KEY"],
    url: () => "https://api.sambanova.ai/v1/chat/completions",
    model: "Meta-Llama-3.3-70B-Instruct",
    headers: () => ({ Authorization: `Bearer ${process.env.SAMBANOVA_API_KEY}` }),
  },
  {
    // OpenRouter — many `:free` models available.
    name: "OpenRouter",
    requiredEnv: ["OPENROUTER_API_KEY"],
    url: () => "https://openrouter.ai/api/v1/chat/completions",
    model: "meta-llama/llama-3.3-70b-instruct:free",
    headers: () => ({
      Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
      "X-Title": "LainAI",
    }),
  },
  {
    // Google AI Studio (Gemini) — OpenAI-compatible endpoint, generous free tier.
    name: "Google Gemini",
    requiredEnv: ["GEMINI_API_KEY"],
    url: () =>
      "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions",
    model: "gemini-2.0-flash",
    headers: () => ({ Authorization: `Bearer ${process.env.GEMINI_API_KEY}` }),
  },
  {
    // Together AI — free starter credits, OpenAI-compatible.
    name: "Together AI",
    requiredEnv: ["TOGETHER_API_KEY"],
    url: () => "https://api.together.xyz/v1/chat/completions",
    model: "meta-llama/Llama-3.3-70B-Instruct-Turbo-Free",
    headers: () => ({ Authorization: `Bearer ${process.env.TOGETHER_API_KEY}` }),
  },
  {
    // Cloudflare Workers AI — free tier, requires account id.
    name: "Cloudflare Workers AI",
    requiredEnv: ["CLOUDFLARE_API_KEY", "CLOUDFLARE_ACCOUNT_ID"],
    url: () =>
      `https://api.cloudflare.com/client/v4/accounts/${process.env.CLOUDFLARE_ACCOUNT_ID}/ai/v1/chat/completions`,
    model: "@cf/meta/llama-3.1-8b-instruct",
    headers: () => ({ Authorization: `Bearer ${process.env.CLOUDFLARE_API_KEY}` }),
  },
];

type ChatCompletionResponse = {
  choices?: Array<{ message?: { role?: string; content?: string } }>;
};

export interface GenerateReplyOptions {
  /** Override the provider's default model. */
  model?: string;
  temperature?: number;
  maxTokens?: number;
}

/**
 * Generate the agent's reply by asking the first available free LLM
 * provider. The agent's `instructions` are injected as the system
 * prompt; `history` is the full conversation (oldest → newest).
 *
 * - If no provider is configured at all, returns a helpful stub so the
 *   app still works end-to-end without any API key.
 * - If at least one provider is configured but every one fails, throws
 *   an Error so the caller can surface it to the user.
 */
export async function generateAgentReply(
  instructions: string,
  history: ChatMessage[],
  opts: GenerateReplyOptions = {},
): Promise<string> {
  const configured = providers.filter((p) =>
    p.requiredEnv.every((k) => process.env[k]),
  );

  // Zero-config: nothing the user can do wrong, keep the app usable.
  if (configured.length === 0) {
    return stubReply(history);
  }

  const messages: ChatMessage[] = [
    { role: "system", content: instructions },
    ...history,
  ];

  const failures: string[] = [];

  for (const provider of configured) {
    try {
      const res = await fetch(provider.url(), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...provider.headers(),
        },
        body: JSON.stringify({
          model: opts.model ?? provider.model,
          messages,
          temperature: opts.temperature ?? 0.7,
          max_tokens: opts.maxTokens ?? 1024,
        }),
      });

      if (!res.ok) {
        const body = await res.text().catch(() => "");
        failures.push(`${provider.name}: ${res.status} ${body.slice(0, 120)}`);
        continue;
      }

      const json = (await res.json()) as ChatCompletionResponse;
      const content = json.choices?.[0]?.message?.content?.trim();
      if (content) {
        return content;
      }
      failures.push(`${provider.name}: empty response`);
    } catch (err) {
      failures.push(
        `${provider.name}: ${err instanceof Error ? err.message : "network error"}`,
      );
    }
  }

  throw new Error(
    `All configured LLM providers failed. ${failures.join(" | ")}`,
  );
}

/**
 * Names of the providers that are currently usable (env keys present),
 * in priority order. Handy for surfacing "powered by X" in the UI.
 */
export function configuredProviderNames(): string[] {
  return providers
    .filter((p) => p.requiredEnv.every((k) => process.env[k]))
    .map((p) => p.name);
}

/**
 * Offline / zero-config fallback so a brand-new install with no API key
 * still produces a sensible reply in the chat UI.
 */
function stubReply(history: ChatMessage[]): string {
  const lastUser = [...history].reverse().find((m) => m.role === "user");
  const userText = lastUser?.content?.trim() ?? "(nothing)";
  const preview =
    userText.length > 240 ? `${userText.slice(0, 240)}…` : userText;

  return [
    `You said: "${preview}"`,
    "",
    "_This is a placeholder reply — no LLM API key is set yet._",
    "Add a free key (Groq, SambaNova, OpenRouter, Google Gemini, Together, or Cloudflare) to your `.env` and the main agent will answer for real. See `docs/FREE_LLM_PROVIDERS.md`.",
  ].join("\n");
}