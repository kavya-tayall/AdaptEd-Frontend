import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

export const runtime = "nodejs";

type ExplanationEval = {
	score: number;
	strengths: string;
	improvements: string;
	suggestions: string;
};

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function evaluateExplanation(topic: string, content: string): Promise<ExplanationEval> {
	const model = process.env.OPENAI_MODEL || "gpt-4o-mini";
	const response = await openai.chat.completions.create({
		model,
		messages: [
			{ role: "system", content: "You are an educational expert. Evaluate explanations for 12-year-olds. Be encouraging but constructive. Respond in JSON format." },
			{ role: "user", content: `Evaluate this explanation of "${topic}" for a 12-year-old: "${content}".\n\nProvide JSON with: score (1-10), strengths (string), improvements (string), suggestions (string)` },
		],
		response_format: { type: "json_object" },
		max_tokens: 400,
		temperature: 0.7,
	});
	const txt = response.choices[0]?.message?.content;
	if (!txt) throw new Error("No response from OpenAI");
	try {
		return JSON.parse(txt) as ExplanationEval;
	} catch {
		return {
			score: 7,
			strengths: "Shows good understanding",
			improvements: "Add relatable examples",
			suggestions: "Use everyday objects for comparison",
		};
	}
}

export async function POST(req: NextRequest) {
	try {
		const { topic, content, contextName, contextData } = await req.json();
		if (!topic || !content) return NextResponse.json({ success: false, error: "Missing topic or content" }, { status: 400 });
		let evaluation: ExplanationEval | null = null;
		let warning: string | undefined = undefined;
		try {
			const prefix = contextData
				? `Context from ${contextName || "attachment"}:\n${contextData.slice(0, 2000)}\n\n`
				: "";
			evaluation = await evaluateExplanation(topic, prefix + content);
		} catch (e) {
			warning = "OpenAI evaluation unavailable";
		}
		const data = { id: Date.now().toString(), topic, content, createdAt: new Date().toISOString(), evaluation };
		return NextResponse.json({ success: true, data, message: evaluation ? "Explanation evaluated successfully" : "Explanation saved (evaluation failed)", warning }, { status: 201 });
	} catch (err) {
		return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
	}
}


