"use client";

import * as React from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Check, Mic, Volume2, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { evaluateAnalogy, evaluateExplanation, AnalogyResponse, ExplanationResponse } from "@/lib/api";

type Message = { role: "user" | "assistant"; content: string };
type FeedbackType = "explanation" | "analogy";

/* ---------- Small primitives ---------- */
function IconSquare(
  props: React.ButtonHTMLAttributes<HTMLButtonElement> & { "aria-label"?: string }
) {
  const { className = "", ...rest } = props;
  return (
    <button
      className={[
        "h-7 w-7 inline-flex items-center justify-center rounded-[8px]",
        "border bg-white transition-colors",
        "border-gray-300 hover:bg-gray-50",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500",
        className,
      ].join(" ")}
      {...rest}
    />
  );
}

const AutoTextarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className = "", value, onChange, rows = 4, ...props }, ref) => {
  const inner = useRef<HTMLTextAreaElement | null>(null);
  const setRefs = (node: HTMLTextAreaElement) => {
    inner.current = node;
    if (typeof ref === "function") ref(node);
    else if (ref) (ref as any).current = node;
  };
  useEffect(() => {
    const ta = inner.current;
    if (!ta) return;
    ta.style.height = "auto";
    ta.style.height = Math.min(ta.scrollHeight, 220) + "px";
  }, [value]);

  return (
    <textarea
      ref={setRefs}
      value={value}
      onChange={onChange}
      rows={rows}
      className={[
        "w-full bg-transparent outline-none border-0 resize-none",
        "text-[15px]/[22px] text-black",
        "placeholder:text-gray-500",
        "min-h-[112px] max-h-[220px] overflow-y-auto",
        className,
      ].join(" ")}
      {...props}
    />
  );
});
AutoTextarea.displayName = "AutoTextarea";

/* ---------- Page ---------- */
export default function SharedFeedbackPage() {
  const router = useRouter();
  const search = useSearchParams();

  // topic handling (URL > sessionStorage > default)
  const topicParam = search.get("topic")?.trim() || "";
  const [topicName, setTopicName] = useState<string>(topicParam || "Ohm’s Law");
  useEffect(() => {
    if (topicParam) {
      setTopicName(topicParam);
      try { sessionStorage.setItem("topicName", topicParam); } catch {}
    } else {
      const saved = typeof window !== "undefined" ? sessionStorage.getItem("topicName") : null;
      if (saved) setTopicName(saved);
    }
  }, [topicParam]);

  const type = (search.get("type") || "explanation") as FeedbackType;
  const initialText =
    search.get("text")?.trim() ??
    "Ohm's Law is a rule in electricity that shows how voltage, current, and resistance are connected with a formula using V, I, and R.";
  const title = type === "analogy" ? "Analogy Feedback" : "Explanation Feedback";

  const [content, setContent] = useState(initialText);
  const [tab, setTab] = useState<"question" | "retry">("question");
  const [question, setQuestion] = useState("");
  const [retryText, setRetryText] = useState("");
  const [loadingRetry, setLoadingRetry] = useState(false);
  const [thread, setThread] = useState<Message[]>([]);

  // --- Backend evaluation state ---
  const [evalLoading, setEvalLoading] = useState(false);
  const [evalError, setEvalError] = useState<string | null>(null);
  const [evalWarning, setEvalWarning] = useState<string | undefined>(undefined);
  const [explanationEval, setExplanationEval] = useState<ExplanationResponse["data"]["evaluation"] | null>(null);
  const [analogyEval, setAnalogyEval] = useState<AnalogyResponse["data"]["evaluation"] | null>(null);

  const feedback = useMemo(() => generateFeedback(content), [content]);

  useEffect(() => {
    setThread([]);
    setQuestion("");
    setRetryText("");
    setTab("question");
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
  }, [content]);

  // Fetch evaluation from backend when content/topic/type changes
  useEffect(() => {
    let isCancelled = false;
    async function run() {
      setEvalLoading(true);
      setEvalError(null);
      setEvalWarning(undefined);
      try {
        if (type === "analogy") {
          const res = await evaluateAnalogy(topicName, content);
          if (isCancelled) return;
          setAnalogyEval(res.data.evaluation);
          setExplanationEval(null);
          if (res.warning) setEvalWarning(res.warning);
        } else {
          const res = await evaluateExplanation(topicName, content);
          if (isCancelled) return;
          setExplanationEval(res.data.evaluation);
          setAnalogyEval(null);
          if (res.warning) setEvalWarning(res.warning);
        }
      } catch (err: any) {
        if (isCancelled) return;
        setEvalError(err?.message || "Failed to fetch evaluation");
      } finally {
        if (!isCancelled) setEvalLoading(false);
      }
    }
    run();
    return () => {
      isCancelled = true;
    };
  }, [type, topicName, content]);

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
    setLoadingRetry(true);
    setTimeout(() => {
      setContent(text);
      setRetryText("");
      setLoadingRetry(false);
      router.replace(
        `/shared-feedback?type=${type}&topic=${encodeURIComponent(topicName)}&text=${encodeURIComponent(
          text
        )}`
      );
    }, 450);
  };

  /* ---- unified tick behavior ---- */
  const canSubmit = tab === "question" ? !!question.trim() : !!retryText.trim();
  const onSubmit = () => {
    if (!canSubmit) return;
    if (tab === "question") submitQuestion();
    else submitRetry();
  };
  const onAreaKeyDown: React.KeyboardEventHandler<HTMLTextAreaElement> = (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
      e.preventDefault();
      onSubmit();
    }
  };

  const goBack = () =>
    router.push(
      type === "analogy"
        ? `/create-analogy?topic=${encodeURIComponent(topicName)}`
        : `/simple-explanation?topic=${encodeURIComponent(topicName)}`
    );

  /* ---- Override behavior ----
     - type=explanation → go author an analogy (keep topic).
     - type=analogy → open Review & Summary (pass analogy + topic).
  */
  const onOverride = () => {
    const encoded = encodeURIComponent(content);
    const topicQ = `topic=${encodeURIComponent(topicName)}`;
    if (type === "explanation") {
      router.push(`/create-analogy?seed=${encoded}&${topicQ}`);
    } else {
      try {
        sessionStorage.setItem("analogyText", content); // fallback for summary page
        sessionStorage.setItem("topicName", topicName);
      } catch {}
      router.push(`/review-summary?from=analogy-feedback&${topicQ}&analogy=${encoded}`);
    }
  };

  const overrideLabel = type === "explanation" ? "Go to Analogy →" : "Finish →";

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Main Content */}
      <main className="flex-1 flex flex-col">
        {/* Header with title and explanation card -> STICKY */}
        <div className="bg-white border-b border-gray-200 p-8 sticky top-0 z-20">
          <h1
            className="text-[40px] font-medium text-center text-black mb-2"
            style={{
              fontFamily:
                "'Kantumruv Pro', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
            }}
          >
            {title}
          </h1>

          {/* Topic line */}
          <p className="text-center text-sm text-gray-600 mb-6">
            Topic:&nbsp;<span className="font-medium text-gray-800">{topicName}</span>
          </p>

          {/* Your Explanation/Analogy Card - Proportional width */}
          <div className="mx-auto" style={{ maxWidth: "45.9%" }}>
            <div className="bg-[#F8F8F8] border border-[#E5E5E5] rounded-[16px] p-4">
              <p className="text-[14px] font-semibold text-black mb-2">
                Your {type === "analogy" ? "Analogy" : "Explanation"}:
              </p>
              <div
                className="text-black italic leading-relaxed"
                style={{
                  fontFamily:
                    "'Ag Midfi body', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
                }}
              >
                {content}
              </div>
            </div>
          </div>
        </div>

        {/* Scrollable content area */}
        <div className="flex-1 overflow-y-auto p-8">
          <div className="flex flex-col items-start">
            {/* AI Evaluation (from backend) */}
            <div
              className="bg-white border rounded-[8px] flex flex-col mb-6"
              style={{
                width: "59.26%",
                borderColor: "#D1D5DB",
                gap: "12px",
                padding: "16px",
              }}
            >
              <div className="flex items-center justify-between">
                <h3 className="text-[16px] font-semibold text-black">
                  AI Evaluation
                </h3>
                {evalLoading && (
                  <span className="text-[12px] text-gray-500">Evaluating…</span>
                )}
              </div>
              {evalError && (
                <div className="text-[14px] text-red-600">
                  {evalError}
                </div>
              )}
              {evalWarning && !evalError && (
                <div className="text-[13px] text-yellow-700 bg-yellow-50 border border-yellow-200 rounded-md p-2">
                  {evalWarning}
                </div>
              )}
              {!evalError && !evalLoading && (
                <div className="text-[14px] text-black space-y-2">
                  {type === "analogy" && analogyEval && (
                    <div className="space-y-1">
                      <div>Accuracy: <span className="font-medium">{analogyEval.accuracy}</span></div>
                      <div>Clarity: <span className="font-medium">{analogyEval.clarity}</span></div>
                      <div>Overall: <span className="font-medium">{analogyEval.overall}</span></div>
                      <div className="mt-2"><span className="font-semibold">Strengths:</span> {analogyEval.strengths}</div>
                      <div><span className="font-semibold">Improvements:</span> {analogyEval.improvements}</div>
                    </div>
                  )}
                  {type !== "analogy" && explanationEval && (
                    <div className="space-y-1">
                      <div>Score: <span className="font-medium">{explanationEval.score}</span> / 10</div>
                      <div className="mt-2"><span className="font-semibold">Strengths:</span> {explanationEval.strengths}</div>
                      <div><span className="font-semibold">Improvements:</span> {explanationEval.improvements}</div>
                      <div><span className="font-semibold">Suggestions:</span> {explanationEval.suggestions}</div>
                    </div>
                  )}
                  {!analogyEval && !explanationEval && (
                    <div className="text-gray-600">No evaluation available.</div>
                  )}
                </div>
              )}
            </div>

            {/* Feedback sections (heuristic) */}
            <div
              className="bg-white border rounded-[8px] flex flex-col mb-6"
              style={{
                width: "59.26%",
                borderColor: "#D1D5DB",
                gap: "16px",
                padding: "16px",
              }}
            >
              {/* Simplify Wording */}
              <div className="flex flex-col" style={{ gap: "10px" }}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center" style={{ gap: "12px" }}>
                    <div className="w-6 h-6 rounded-full bg-orange-100 border-2 border-orange-400 flex items-center justify-center">
                      <span className="text-orange-600 text-xs font-bold">!</span>
                    </div>
                    <h3 className="text-[16px] font-semibold text-black">Simplify Wording</h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <IconSquare aria-label="Listen to feedback">
                      <Volume2 className="h-4 w-4 text-gray-600" />
                    </IconSquare>
                    <IconSquare aria-label="Regenerate suggestions">
                      <RotateCcw className="h-4 w-4 text-gray-600" />
                    </IconSquare>
                  </div>
                </div>
                <div className="text-[15px] leading-[24px] text-black" style={{ gap: "4px" }}>
                  <div>
                    • "Shows how voltage, current, and resistance are connected" — vague and
                    abstract; doesn't explain how they relate.
                  </div>
                  <div>
                    • "With a formula using V, I, and R" — letters may confuse someone with no
                    prior knowledge; unclear what they represent.
                  </div>
                </div>
              </div>

              {/* Fill Logical Gaps */}
              <div className="flex flex-col" style={{ gap: "10px" }}>
                <div className="flex items-center" style={{ gap: "12px" }}>
                  <div className="w-6 h-6 rounded-full bg-orange-100 border-2 border-orange-400 flex items-center justify-center">
                    <span className="text-orange-600 text-xs font-bold">!</span>
                  </div>
                  <h3 className="text-[16px] font-semibold text-black">Fill Logical Gaps</h3>
                </div>
                <div className="text-[15px] leading-[24px] text-black" style={{ gap: "4px" }}>
                  <div>• Doesn't state what the formula actually is (Ohm's Law: V = I×R).</div>
                  <div>• Doesn't explain what voltage, current, or resistance mean in basic terms.</div>
                  <div>• No explanation of why or when you would use this rule.</div>
                </div>
              </div>

              <div className="text-[14px] text-gray-600">
                Ask questions regarding the feedback or retry your answer!
              </div>
            </div>

            {/* Chat Thread */}
            <div className="w-full space-y-4">
              {thread.map((m, idx) =>
                m.role === "user" ? (
                  <UserBubble key={idx} text={m.content} />
                ) : (
                  <AssistantBubble key={idx} text={m.content} />
                )
              )}
            </div>
          </div>
        </div>

        {/* Bottom Input Area */}
        <div className="sticky bottom-0 z-10 bg-white border-t border-gray-200 p-6">
          <div className="flex items-end justify-center gap-2">
            {/* Back Button */}
            <Button variant="outline" onClick={goBack} className="px-6 py-2">
              ← Back
            </Button>

            {/* Center: tabs + input */}
            <div className="flex flex-col" style={{ width: "63.24%" }}>
              <div className="flex mb-2">
                <button
                  onClick={() => setTab("question")}
                  className={`px-4 py-2 rounded-t-lg text-[14px] font-medium ${
                    tab === "question"
                      ? "bg-purple-500 text-white"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                >
                  Question Feedback
                </button>
                <button
                  onClick={() => setTab("retry")}
                  className={`px-4 py-2 rounded-t-lg text-[14px] font-medium ml-1 ${
                    tab === "retry"
                      ? "bg-purple-500 text-white"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                >
                  Retry Answer
                </button>
              </div>

              <div className="bg-white border border-gray-300 rounded-lg p-4">
                {tab === "question" ? (
                  <div className="relative">
                    <AutoTextarea
                      value={question}
                      onChange={(e) => setQuestion(e.target.value)}
                      onKeyDown={onAreaKeyDown}
                      placeholder="Ask a question regarding the feedback..."
                      className="pr-20"
                      rows={2}
                      style={{ minHeight: "40px" }}
                    />
                    <div className="absolute bottom-2 right-2 flex gap-2">
                      <button className="p-1 text-gray-500 hover:text-gray-700" aria-label="Voice input">
                        <Mic className="w-4 h-4" />
                      </button>
                      <IconSquare
                        aria-label="Submit question"
                        onClick={onSubmit}
                        disabled={!canSubmit}
                        className={`${canSubmit ? "border-purple-500" : ""} disabled:opacity-50`}
                        title="Submit (⌘/Ctrl + Enter)"
                      >
                        <Check className="h-4 w-4 text-purple-600" />
                      </IconSquare>
                    </div>
                  </div>
                ) : (
                  <div className="relative">
                    <AutoTextarea
                      value={retryText}
                      onChange={(e) => setRetryText(e.target.value)}
                      onKeyDown={onAreaKeyDown}
                      placeholder="Retry your answer based on the feedback..."
                      className="pr-20"
                      rows={2}
                      style={{ minHeight: "40px" }}
                    />
                    <div className="absolute bottom-2 right-2 flex gap-2">
                      <button className="p-1 text-gray-500 hover:text-gray-700" aria-label="Voice input">
                        <Mic className="w-4 h-4" />
                      </button>
                      <IconSquare
                        aria-label="Submit retry"
                        onClick={onSubmit}
                        disabled={!canSubmit || loadingRetry}
                        className={`${canSubmit && !loadingRetry ? "border-purple-500" : ""} disabled:opacity-50`}
                        title="Submit (⌘/Ctrl + Enter)"
                      >
                        <Check className="h-4 w-4 text-purple-600" />
                      </IconSquare>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Right: Override / Finish */}
            <Button
              onClick={onOverride}
              className="px-6 py-2 bg-purple-500 hover:bg-purple-600 text-white"
            >
              {overrideLabel}
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}

/* ---------- Bubbles ---------- */
function AssistantBubble({ text }: { text: string }) {
  return (
    <div className="flex justify-start">
      <div
        className="bg-white border rounded-[16px] flex flex-col"
        style={{
          width: "59.26%",
          borderColor: "#D1D5DB",
          padding: "16px",
          gap: "8px",
        }}
      >
        <div className="text-[14px] leading-[20px] text-black whitespace-pre-wrap">{text}</div>
      </div>
    </div>
  );
}

function UserBubble({ text }: { text: string }) {
  return (
    <div className="flex justify-end">
      <div
        className="bg-blue-500 text-white rounded-[16px] p-4"
        style={{ width: "40.56%" }}
      >
        <div className="text-[14px] leading-[20px] whitespace-pre-wrap">{text}</div>
      </div>
    </div>
  );
}

/* ---------- Mock logic ---------- */
function generateFeedback(text: string) {
  const lower = text.toLowerCase();
  const wording: string[] = [];
  const logic: string[] = [];

  if (!/simple|like|push|means|rule/.test(lower))
    wording.push(
      '"Shows how voltage, current, and resistance are connected" - vague and abstract; doesn\'t explain how they relate.'
    );
  if (!/voltage/.test(lower))
    wording.push('"With a formula using V, I, and R" - unclear without definitions.');
  if (!/\bv\s*=\s*i\s*[*·]?\s*r\b/.test(lower))
    logic.push("Doesn't state what the formula actually is (Ohm's Law: V = I·R).");
  if (!/what voltage|what current|what resistance/.test(lower))
    logic.push("Doesn't explain what voltage, current, or resistance mean in basic terms.");
  if (!/why|when|how/.test(lower))
    logic.push("No explanation of why or when you would use this rule.");

  return { wording, logic };
}

function mockAnswer(q: string) {
  return [
    "Sure!",
    "• Voltage is the push that makes electricity move.",
    "• Current is how much electricity is flowing.",
    "• Resistance is what slows the electricity down.",
  ].join("\n");
}
