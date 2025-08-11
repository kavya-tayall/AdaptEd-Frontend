// app/explanation-feedback/page.tsx
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Check,
  Mic,
  Volume2,
  RotateCcw,
} from "lucide-react";

const STACK_W = "w-[750px] max-w-[90vw]"; // roomier for this screen
const SOFT_PURPLE = "color-mix(in srgb, var(--step-accent) 12%, white)";

type Message = { role: "user" | "assistant"; content: string };

export default function ExplanationFeedbackPage() {
  const router = useRouter();
  const search = useSearchParams();

  // --- Seed explanation (from query or session) ---
  const initialFromQuery = search.get("exp")?.trim();
  const initialFromSession =
    typeof window !== "undefined" ? sessionStorage.getItem("simpleExp") ?? "" : "";
  const initialExplanation =
    initialFromQuery || initialFromSession ||
    "Ohm’s Law is a rule that tells us how electricity flows in a circuit. It says that how much electricity flows (current) depends on how strong the push is (voltage) and how much it’s being slowed down (resistance). The rule is: voltage = current × resistance.";

  const [explanation, setExplanation] = useState(initialExplanation);

  // --- Tabs ---
  type Tab = "question" | "retry";
  const [tab, setTab] = useState<Tab>("question");

  // --- Question feedback state ---
  const [question, setQuestion] = useState("");
  const [thread, setThread] = useState<Message[]>([]);
  const lastUserQ = useMemo(
    () => [...thread].reverse().find((m) => m.role === "user")?.content || "",
    [thread]
  );

  // --- Retry answer state ---
  const [retryText, setRetryText] = useState("");
  const [loadingRetry, setLoadingRetry] = useState(false);

  // --- Auto-size the retry textarea ---
  const retryRef = useRef<HTMLTextAreaElement | null>(null);
  useEffect(() => {
    const ta = retryRef.current;
    if (!ta) return;
    ta.style.height = "auto";
    ta.style.height = Math.min(ta.scrollHeight, 220) + "px";
  }, [retryText]);

  // --- Feedback generation (very simple heuristics, replace with real API later) ---
  const feedback = useMemo(() => generateFeedback(explanation), [explanation]);

  // --- Handlers ---
  const submitQuestion = () => {
    const q = question.trim();
    if (!q) return;
    const reply = mockAnswer(q);
    setThread((t) => [...t, { role: "user", content: q }, { role: "assistant", content: reply }]);
    setQuestion("");
  };

  const submitRetry = () => {
    const text = retryText.trim();
    if (!text) return;
    // Simulate a round-trip + “reload”
    setLoadingRetry(true);
    setTimeout(() => {
      setExplanation(text);
      setRetryText("");
      setLoadingRetry(false);
      // Optional: persist to session so “reload” feels real across nav
      try {
        sessionStorage.setItem("simpleExp", text);
      } catch {}
      // Keep user on this page, but you could also do:
      // router.replace(`/explanation-feedback?exp=${encodeURIComponent(text)}`);
    }, 900);
  };

  return (
    <main className="w-full">
      <div className="mx-auto pt-16 pb-12 px-6 flex flex-col items-center">
        {/* Title */}
        <h1 className="text-center text-[48px]/[56px] font-semibold tracking-[-0.01em] text-[var(--step-text)] mb-8">
          Explanation Feedback
        </h1>

        {/* Your Explanation box */}
        <section
          className={`${STACK_W} mb-6 rounded-[12px] border border-[var(--step-border)] bg-white px-5 py-4`}
        >
          <p className="text-[14px] font-semibold mb-2">Your Explanation:</p>
          <p className="italic text-[15px]/[22px] text-[var(--step-text)]">
            {explanation}
          </p>
        </section>

        {/* Feedback cards */}
        <div className={`${STACK_W} flex flex-col gap-4 mb-8`}>
          {/* Card 1 */}
          <article className="rounded-[12px] border border-[var(--step-border)] bg-white">
            <header className="flex items-center justify-between px-5 py-3 border-b border-[var(--step-border)]">
              <div className="flex items-center gap-2">
                <span className="text-[18px]">ⓘ</span>
                <h2 className="text-[15px] font-semibold">Simplify Wording</h2>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className="p-1 rounded hover:bg-[var(--step-superlight)]"
                  title="Speak"
                >
                  <Volume2 className="h-4 w-4 text-[var(--step-darkgrey)]" />
                </button>
                <button
                  type="button"
                  className="p-1 rounded hover:bg-[var(--step-superlight)]"
                  title="Rephrase"
                >
                  <RotateCcw className="h-4 w-4 text-[var(--step-darkgrey)]" />
                </button>
              </div>
            </header>
            <div className="px-5 py-3">
              {feedback.wording.length === 0 ? (
                <p className="text-[15px]/[22px] text-[var(--step-text)]">
                  Your explanation uses simple wording!
                </p>
              ) : (
                <ul className="list-disc pl-5 text-[15px]/[22px] text-[var(--step-text)]">
                  {feedback.wording.map((w, i) => (
                    <li key={i}>{w}</li>
                  ))}
                </ul>
              )}
            </div>
          </article>

          {/* Card 2 */}
          <article className="rounded-[12px] border border-[var(--step-border)] bg-white">
            <header className="flex items-center justify-between px-5 py-3 border-b border-[var(--step-border)]">
              <div className="flex items-center gap-2">
                <span className="text-[18px]">ⓘ</span>
                <h2 className="text-[15px] font-semibold">Fill Logical Gaps</h2>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className="p-1 rounded hover:bg-[var(--step-superlight)]"
                  title="Speak"
                >
                  <Volume2 className="h-4 w-4 text-[var(--step-darkgrey)]" />
                </button>
                <button
                  type="button"
                  className="p-1 rounded hover:bg-[var(--step-superlight)]"
                  title="Re-check"
                >
                  <RotateCcw className="h-4 w-4 text-[var(--step-darkgrey)]" />
                </button>
              </div>
            </header>
            <div className="px-5 py-3">
              {feedback.logic.length === 0 ? (
                <p className="text-[15px]/[22px] text-[var(--step-text)]">
                  Your explanation is logically sound!
                </p>
              ) : (
                <ul className="list-disc pl-5 text-[15px]/[22px] text-[var(--step-text)]">
                  {feedback.logic.map((g, i) => (
                    <li key={i}>{g}</li>
                  ))}
                </ul>
              )}
              <p className="mt-3 text-[13px]/[20px] text-[var(--step-darkgrey)]">
                Feel free to move on to the next section, or ask more questions
              </p>
            </div>
          </article>
        </div>

        {/* Conversation row (right-aligned last user question) */}
        {lastUserQ && (
          <div className={`${STACK_W} mb-4 flex justify-end`}>
            <div className="max-w-[520px] rounded-[12px] border border-[var(--step-border)] bg-white px-4 py-2">
              <p className="text-[14px]/[20px]">{lastUserQ}</p>
            </div>
          </div>
        )}

        {/* Latest assistant bubble if exists */}
        {thread.length > 0 && thread[thread.length - 1].role === "assistant" && (
          <div className={`${STACK_W} mb-6`}>
            <div className="inline-block max-w-[520px] rounded-[12px] border border-[var(--step-border)] bg-white px-4 py-3">
              <p className="text-[14px]/[20px] whitespace-pre-wrap">
                {thread[thread.length - 1].content}
              </p>
            </div>
          </div>
        )}

        {/* Tabs + input */}
        <div className={`${STACK_W} mt-2`}>
          <div className="inline-flex rounded-t-[10px] overflow-hidden">
            <button
              type="button"
              onClick={() => setTab("question")}
              className={`px-4 py-2 text-[13px] ${
                tab === "question"
                  ? "bg-[var(--step-accent)] text-white"
                  : "bg-[var(--step-superlight)] text-[var(--step-text)]"
              }`}
            >
              Question Feedback
            </button>
            <button
              type="button"
              onClick={() => setTab("retry")}
              className={`px-4 py-2 text-[13px] ${
                tab === "retry"
                  ? "bg-[var(--step-accent)] text-white"
                  : "bg-[var(--step-superlight)] text-[var(--step-text)]"
              }`}
            >
              Retry Answer
            </button>
          </div>

          {/* Input area (tab-aware) */}
          <div className="rounded-b-[12px] rounded-tr-[12px] border border-[var(--step-border)] bg-white p-3">
            {tab === "question" ? (
              <div className="relative">
                <input
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="Ask a question regarding the feedback..."
                  className="w-full h-11 rounded-[10px] border border-[var(--step-border)] px-3 pr-16 text-[15px] outline-none focus:border-[var(--step-accent)]"
                />
                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
                  <button
                    type="button"
                    title="Mic"
                    className="h-8 w-8 inline-flex items-center justify-center rounded-[8px] border border-[var(--step-border)] bg-white hover:bg-[var(--step-superlight)]"
                  >
                    <Mic className="h-4 w-4 text-[var(--step-darkgrey)]" />
                  </button>
                  <button
                    type="button"
                    onClick={submitQuestion}
                    title="Send question"
                    className="h-8 w-8 inline-flex items-center justify-center rounded-[8px] border border-[var(--step-border)] bg-white hover:bg-[var(--step-selected-bg)]"
                  >
                    <Check className="h-4 w-4" style={{ color: "var(--step-accent)" }} />
                  </button>
                </div>
              </div>
            ) : (
              <div className="relative">
                <textarea
                  ref={retryRef}
                  value={retryText}
                  onChange={(e) => setRetryText(e.target.value)}
                  placeholder="Retry your answer based on the feedback..."
                  className="w-full min-h-12 max-h-[220px] resize-none rounded-[10px] border border-[var(--step-border)] px-3 pr-16 py-2 text-[15px] outline-none focus:border-[var(--step-accent)]"
                />
                <div className="absolute right-2 top-2 flex items-center gap-1.5">
                  <button
                    type="button"
                    title="Mic"
                    className="h-8 w-8 inline-flex items-center justify-center rounded-[8px] border border-[var(--step-border)] bg-white hover:bg-[var(--step-superlight)]"
                  >
                    <Mic className="h-4 w-4 text-[var(--step-darkgrey)]" />
                  </button>
                  <button
                    type="button"
                    disabled={loadingRetry || retryText.trim().length === 0}
                    onClick={submitRetry}
                    title="Submit retry"
                    className={`h-8 w-8 inline-flex items-center justify-center rounded-[8px] border border-[var(--step-border)] bg-white ${
                      loadingRetry
                        ? "opacity-60 cursor-wait"
                        : "hover:bg-[var(--step-selected-bg)]"
                    }`}
                  >
                    <Check className="h-4 w-4" style={{ color: "var(--step-accent)" }} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className={`${STACK_W} mt-6 flex items-center justify-between`}>
          <button
            type="button"
            onClick={() => router.push("/simple-explanation")}
            className="
              inline-flex items-center gap-2 h-10 rounded-[10px] px-4
              border border-[var(--step-border)]
              bg-[var(--step-superlight)] text-[var(--step-text)]
              hover:bg-[var(--step-selected-bg)]
            "
          >
            ← <span>Back</span>
          </button>

          <button
            type="button"
            onClick={() => router.push("/create-analogy")}
            className="
              inline-flex items-center gap-2 h-10 rounded-[10px] px-5 text-white
              bg-[var(--step-accent)] hover:brightness-95
            "
          >
            Proceed →
          </button>
        </div>
      </div>
    </main>
  );
}

/* ---------- helpers (mock logic; swap with real API later) ---------- */

function generateFeedback(exp: string) {
  const lower = exp.toLowerCase();
  const hasV = /v\s*=?\s*i\s*\*?\s*r|voltage/.test(lower);
  const hasI = /current| i /.test(lower);
  const hasR = /resistance| r /.test(lower);

  const wording: string[] = [];
  const logic: string[] = [];

  if (!/simple|push|like|means|rule|shows/.test(lower)) {
    wording.push("Try using friendlier words or a simple comparison.");
  }
  if (!hasV) wording.push("Mention what voltage is in plain terms (the 'push').");
  if (!hasI) wording.push("Mention what current is (how much is flowing).");
  if (!hasR) wording.push("Mention what resistance is (what slows the flow).");

  if (!/v\s*=\s*i\s*×\s*r|v\s*=\s*i\s*r|v\s*=\s*ir/.test(lower)) {
    logic.push("State the formula explicitly (Ohm’s Law: V = I × R).");
  }
  if (!/when|if|because|therefore|so that|so/.test(lower)) {
    logic.push("Add a 'why' or 'when' example to show how you'd use the rule.");
  }

  // If it's very complete, clear issues
  if (hasV && hasI && hasR && /v\s*=\s*i\s*×?\s*r|v\s*=\s*ir/.test(lower)) {
    wording.splice(0, wording.length);
    logic.splice(0, logic.length);
  }

  return { wording, logic };
}

function mockAnswer(q: string) {
  // deliberately short and list-y, matches the screenshot vibe
  return [
    "Sure!",
    "• Voltage is the push that makes electricity move",
    "• Current is how much electricity is flowing",
    "• Resistance is what slows the electricity down",
  ].join("\n");
}
