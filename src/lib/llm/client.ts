import OpenAI from "openai";

export function hasLlm(): boolean {
  return Boolean(process.env.OPENAI_API_KEY);
}

let client: OpenAI | null = null;

function getClient(): OpenAI {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY is not configured");
  }
  if (!client) {
    client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
  return client;
}

export async function complete(
  system: string,
  user: string,
  options?: { temperature?: number; json?: boolean },
): Promise<string> {
  const openai = getClient();
  const response = await openai.chat.completions.create({
    model: process.env.OPENAI_MODEL ?? "gpt-4o-mini",
    temperature: options?.temperature ?? 0.4,
    response_format: options?.json ? { type: "json_object" } : undefined,
    messages: [
      { role: "system", content: system },
      { role: "user", content: user },
    ],
  });
  return response.choices[0]?.message?.content ?? "";
}

export async function completeChat(
  system: string,
  messages: { role: "user" | "assistant"; content: string }[],
): Promise<string> {
  const openai = getClient();
  const response = await openai.chat.completions.create({
    model: process.env.OPENAI_MODEL ?? "gpt-4o-mini",
    temperature: 0.5,
    messages: [{ role: "system", content: system }, ...messages],
  });
  return response.choices[0]?.message?.content ?? "";
}
