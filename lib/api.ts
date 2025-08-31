export type ExplanationEvaluation = {
	score: number;
	strengths: string;
	improvements: string;
	suggestions: string;
};

export type AnalogyEvaluation = {
	accuracy: number;
	clarity: number;
	overall: number;
	strengths: string;
	improvements: string;
};

export type ApiSuccess<T> = {
	success: true;
	data: T;
	message?: string;
	warning?: string;
};

export type ExplanationResponse = ApiSuccess<{
	id: string;
	topic: string;
	content: string;
	createdAt: string | Date;
	evaluation: ExplanationEvaluation | null;
}>;

export type AnalogyResponse = ApiSuccess<{
	id: string;
	topic: string;
	content: string;
	createdAt: string | Date;
	evaluation: AnalogyEvaluation | null;
}>;

export type ChatResponse = ApiSuccess<{
	reply: string;
}>;

function getApiBase(): string {
	const base = process.env.NEXT_PUBLIC_API_BASE || "";
	return base.replace(/\/$/, "");
}

async function postJson<T>(path: string, body: unknown): Promise<T> {
	const res = await fetch(`${getApiBase()}${path}`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(body),
		cache: "no-store",
	});
	if (!res.ok) {
		const text = await res.text().catch(() => "");
		throw new Error(`Request failed (${res.status}): ${text || res.statusText}`);
	}
	return (await res.json()) as T;
}

export async function evaluateExplanation(
	topic: string,
	content: string,
	contextName?: string,
	contextData?: string
) {
	return postJson<ExplanationResponse>("/api/explanations", { topic, content, contextName, contextData });
}

export async function evaluateAnalogy(
	topic: string,
	content: string,
	contextName?: string,
	contextData?: string
) {
	return postJson<AnalogyResponse>("/api/analogies", { topic, content, contextName, contextData });
}

export async function askFeedbackQuestion(
	topic: string,
	content: string,
	question: string,
	type: "explanation" | "analogy",
	contextName?: string,
	contextData?: string
) {
	return postJson<ChatResponse>("/api/feedback", { topic, content, question, type, contextName, contextData });
}


