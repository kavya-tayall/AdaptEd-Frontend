import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

export const runtime = "nodejs";

type AnalogyEval = {
	accuracy: number;
	clarity: number;
	overall: number;
	strengths: string;
	improvements: string;
};

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function evaluateAnalogy(topic: string, content: string, fileId?: string): Promise<AnalogyEval> {
	const model = process.env.OPENAI_MODEL || "gpt-4o-mini";
	if (fileId) {
		const resp = await openai.responses.create({
			model: process.env.OPENAI_RESPONSES_MODEL || "gpt-4.1-mini",
			input: [
				{
					role: "user",
					content: [
						{ type: "input_text", text: `Evaluate this analogy for "${topic}". Provide JSON with: accuracy, clarity, overall (1-10 each), strengths, improvements. Analogy: ${content}` },
						{ type: "input_file", file_id: fileId },
					],
				},
			],
			max_output_tokens: 400,
		});
		const txt = (resp as any).output_text as string | undefined;
		if (!txt) throw new Error("No response from OpenAI");
		try { return JSON.parse(txt) as AnalogyEval; } catch {}
	}
	const response = await openai.chat.completions.create({
		model,
		messages: [
			{ role: "system", content: "You are an educational expert. Evaluate learning analogies. Focus on accuracy and clarity. Respond in JSON format." },
			{ role: "user", content: `Evaluate this analogy for "${topic}": "${content}".\n\nProvide JSON with: accuracy (1-10), clarity (1-10), overall (1-10), strengths (string), improvements (string)` },
		],
		response_format: { type: "json_object" },
		max_tokens: 400,
		temperature: 0.7,
	});
	const txt = response.choices[0]?.message?.content;
	if (!txt) throw new Error("No response from OpenAI");
	try {
		return JSON.parse(txt) as AnalogyEval;
	} catch {
		return { accuracy: 7, clarity: 7, overall: 7, strengths: "Good use of familiar concepts", improvements: "Could be more specific" };
	}
}

export async function POST(req: NextRequest) {
	try {
		const { topic, content, contextName, contextData } = await req.json();
		const fileId = req.headers.get("x-file-id") || undefined;
		if (!topic || !content) return NextResponse.json({ success: false, error: "Missing topic or content" }, { status: 400 });
		let evaluation: AnalogyEval | null = null;
		let warning: string | undefined = undefined;
		try {
			// If a file was uploaded (fileId present), don't include trimmed PDF text.
			const prefix = !fileId && contextData
				? `Context from ${contextName || "attachment"}:\n${contextData.slice(0, 2000)}\n\n`
				: "";
			evaluation = await evaluateAnalogy(topic, prefix + content, fileId);
		} catch (e) {
			warning = "OpenAI evaluation unavailable";
		}
		const data = { id: Date.now().toString(), topic, content, createdAt: new Date().toISOString(), evaluation };
		return NextResponse.json({ success: true, data, message: evaluation ? "Analogy evaluated successfully" : "Analogy saved (evaluation failed)", warning }, { status: 201 });
	} catch (err) {
		return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
	}
}


