export type ChatMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

type GroqChatResponse = {
  choices?: Array<{
    message?: { role?: string; content?: string };
  }>;
};

const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
const DEFAULT_MODEL = "llama-3.1-8b-instant"; // fast + free-tier friendly

/**
 * 
 *
 * @param 
 * @param 
 * @param
 */
export async function generateAgentReply(
  instructions: string,
  history: ChatMessage[],
  model: string = DEFAULT_MODEL,
): Promise<string> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return stubReply(history);
  }

  const messages: ChatMessage[] = [
    { role: "system", content: instructions },
    ...history,
  ];

  const res = await fetch(GROQ_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages,
      temperature: 0.7,
      max_tokens: 512,
    }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(
      `Groq request failed: ${res.status} ${res.statusText} ${body}`.trim(),
    );
  }

  const json = (await res.json()) as GroqChatResponse;
  const content = json.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error("Groq returned an empty response");
  }
  return content;
}


function stubReply(history: ChatMessage[]): string {
  const lastUser = [...history].reverse().find((m) => m.role === "user");
  const userText = lastUser?.content?.trim() ?? "(nothing)";
  
  const preview =
    userText.length > 240 ? `${userText.slice(0, 240)}…` : userText;
  return `[stub — no GROQ_API_KEY set] You said: "${preview}"`;
}
