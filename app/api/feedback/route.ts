import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

export const runtime = "nodejs";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const { topic, content, question, type, contextName, contextData } = await req.json();
    if (!topic || !content || !question) {
      return NextResponse.json({ success: false, error: "Missing fields" }, { status: 400 });
    }
    const model = process.env.OPENAI_MODEL || "gpt-4o-mini";
    const sys =
      type === "analogy"
        ? "You are a helpful tutor. Answer questions to improve a student's analogy. Keep answers concise and actionable."
        : "You are a helpful tutor. Answer questions to improve a student's explanation. Keep answers concise and actionable.";
    const resp = await openai.chat.completions.create({
      model,
      messages: [
        { role: "system", content: sys },
        {
          role: "user",
          content:
            (contextData ? `Context from ${contextName || "attachment"}:\n${contextData.slice(0, 1500)}\n\n` : "") +
            `Topic: ${topic}\nStudent draft: ${content}\nQuestion: ${question}\n\nAnswer with 3-5 bullet points and use **bold** for key terms.`,
        },
      ],
      max_tokens: 300,
      temperature: 0.7,
    });
    const reply = resp.choices[0]?.message?.content?.trim() || "I couldn't generate a response right now.";
    return NextResponse.json({ success: true, data: { reply } }, { status: 200 });
  } catch {
    return NextResponse.json({ success: true, data: { reply: "(Offline) Try: define terms briefly, add a concrete example, and restate the idea in one sentence." }, warning: "OpenAI unavailable" }, { status: 200 });
  }
}


