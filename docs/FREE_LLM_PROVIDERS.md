# Free LLM providers for the main agent

The main agent (the protected **LainAI** assistant) talks to an LLM through
`src/lib/llm.ts`. That file tries a list of **free, OpenAI-compatible**
providers in order and uses the first one that is configured and responds.
You only need **one** key to get real replies — add more for redundancy.

`GROQ_API_KEY` is already in `.env`, so the main agent works out of the box.
This document explains how to get each free key and which env variable to set.

## How it works

1. The agent's `instructions` field becomes the system prompt.
2. The full conversation history is sent as `messages`.
3. Providers are tried in priority order (see table).
4. The first provider that returns a non-empty reply wins.
5. If a provider errors (rate limit, bad model, network), we fall through
   to the next configured one.
6. If **no** key is set, a placeholder reply is returned so the app still
   works end-to-end.

## Priority order & env variables

| # | Provider              | Env var(s)                                   | Default model                                 | Where to get a free key                                              |
|---|-----------------------|----------------------------------------------|-----------------------------------------------|----------------------------------------------------------------------|
| 1 | Groq                  | `GROQ_API_KEY`                               | `llama-3.3-70b-versatile`                     | https://console.groq.com/keys                                        |
| 2 | SambaNova             | `SAMBANOVA_API_KEY`                          | `Meta-Llama-3.3-70B-Instruct`                 | https://cloud.sambanova.ai/ (API Keys)                              |
| 3 | OpenRouter            | `OPENROUTER_API_KEY`                         | `meta-llama/llama-3.3-70b-instruct:free`      | https://openrouter.ai/keys                                           |
| 4 | Google Gemini         | `GEMINI_API_KEY`                             | `gemini-2.0-flash`                            | https://aistudio.google.com/apikey                                   |
| 5 | Together AI           | `TOGETHER_API_KEY`                           | `meta-llama/Llama-3.3-70B-Instruct-Turbo-Free`| https://api.together.ai/settings/api-keys                            |
| 6 | Cloudflare Workers AI | `CLOUDFLARE_API_KEY` + `CLOUDFLARE_ACCOUNT_ID` | `@cf/meta/llama-3.1-8b-instruct`             | https://dash.cloudflare.com/ → Workers AI                            |

> Models change over time. If a provider returns `404` / `model not found`,
> pick a current free model from that provider's docs and set it in
> `src/lib/llm.ts` (or pass `model` per call). The fallback chain means a
> bad model just skips to the next provider instead of breaking the chat.

## Step-by-step: add a provider

1. Sign up at the provider's link above (all have free tiers).
2. Create an API key and copy it.
3. Add it to `.env` (and `CLOUDFLARE_ACCOUNT_ID` for Cloudflare — found in
   the Cloudflare dashboard sidebar on the right):

   ```env
   GROQ_API_KEY=gsk_...
   # optional extras, in fallback order:
   SAMBANOVA_API_KEY=...
   OPENROUTER_API_KEY=sk-or-...
   GEMINI_API_KEY=...
   TOGETHER_API_KEY=...
   CLOUDFLARE_API_KEY=...
   CLOUDFLARE_ACCOUNT_ID=...
   ```

4. Restart the dev server (`npm run dev`) so the new env vars are loaded.
5. Open any chat and send a message — the main agent replies for real.

## Notes & limits

- **Groq** — generous free tier, very low latency. Recommended primary.
- **SambaNova** — free, strong 70B quality, OpenAI-compatible.
- **OpenRouter** — aggregate; free models are suffixed `:free`. Watch the
  `:free` daily limits per model.
- **Google Gemini** — free tier via AI Studio; the OpenAI-compatible
  endpoint (`/v1beta/openai/chat/completions`) accepts a Bearer key.
- **Together AI** — free starter credits (not unlimited), good for testing.
- **Cloudflare Workers AI** — free neurons/day quota; needs the account id.

## Without any key

If no provider key is set, `generateAgentReply` returns a placeholder echo
of the user's message with a note pointing back to this file. The app
remains fully usable — you just won't get real LLM replies until a key is
added.