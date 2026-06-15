import { NextResponse } from "next/server";
import { hasLlm } from "@/lib/llm/client";

export async function GET() {
  return NextResponse.json({
    llmEnabled: hasLlm(),
    model: process.env.OPENAI_MODEL ?? "gpt-4o-mini",
  });
}
