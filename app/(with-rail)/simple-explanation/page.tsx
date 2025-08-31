"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Mic, ChevronDown, Check } from "lucide-react";

const STACK_W = "w-[578px]";
const SOFT_PURPLE = "color-mix(in srgb, var(--step-accent) 12%, white)";

export default function SimpleExplanationPage() {
  const router = useRouter();
  const search = useSearchParams();

  // --- Topic: prefer URL ?topic=..., then sessionStorage, fallback text ---
  const topicFromUrl = search.get("topic")?.trim() || "";
  const [topicName, setTopicName] = useState<string>(topicFromUrl || "Ohm’s Law");

  useEffect(() => {
    if (topicFromUrl) {
      setTopicName(topicFromUrl);
      try { sessionStorage.setItem("topicName", topicFromUrl); } catch {}
    } else {
      const saved = typeof window !== "undefined" ? sessionStorage.getItem("topicName") : null;
      if (saved) setTopicName(saved);
    }
  }, [topicFromUrl]);

  // Build sentence starters dynamically from topic
  const starterChoices = useMemo(
    () => [
      `${topicName} is…`,
      `The main idea of ${topicName} is…`,
      `${topicName} means that…`,
    ],
    [topicName]
  );

  const [starter, setStarter] = useState("");
  const [text, setText] = useState("");

  const [recording, setRecording] = useState(false);
  const toggleMic = () => setRecording((r) => !r);

  const [cardOpen, setCardOpen] = useState(false);
  const selectWrapRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const onDocDown = (e: MouseEvent) => {
      if (!selectWrapRef.current) return;
      if (!selectWrapRef.current.contains(e.target as Node)) setCardOpen(false);
    };
    document.addEventListener("mousedown", onDocDown);
    return () => document.removeEventListener("mousedown", onDocDown);
  }, []);

  const composed = useMemo(
    () => (starter ? `${starter} ${text}`.trimStart() : text),
    [starter, text]
  );

  const taRef = useRef<HTMLTextAreaElement | null>(null);
  useEffect(() => {
    const ta = taRef.current;
    if (!ta) return;
    ta.style.height = "auto";
    const maxPx = 208;
    ta.style.height = Math.min(ta.scrollHeight, maxPx) + "px";
  }, [composed]);

  const onChangeComposed = (value: string) => {
    if (starter && value.startsWith(starter)) {
      setText(value.slice(starter.length).trimStart());
    } else {
      setStarter("");
      setText(value);
    }
  };

  const canEvaluate = composed.trim().length > 0;

  const handleEvaluate = () => {
    if (!canEvaluate) return;
    const payload = composed.trim();
    try {
      sessionStorage.setItem("simpleExp", payload);
      sessionStorage.setItem("topicName", topicName);
    } catch {}
    const encodedText = encodeURIComponent(payload);
    const encodedTopic = encodeURIComponent(topicName);
    router.push(`/shared-feedback?source=simple-explanation&topic=${encodedTopic}&text=${encodedText}`);
  };

  return (
    <main className="w-full">
      <div className="mx-auto pt-16 pb-12 px-6 flex flex-col items-center">
        {/* Badge */}
        <div className="flex justify-center mb-4">
          <span className="inline-flex items-center rounded-full border border-dashed border-[var(--step-selected-border)] px-3 py-1 text-[12px] leading-5 tracking-[0.14em] text-[var(--step-accent)]">
            FEYNMANN TECHNIQUE
          </span>
        </div>

        {/* Title */}
        <h1 className="text-center text-[48px]/[56px] font-semibold tracking-[-0.01em] text-[var(--step-darkgrey)] mb-6">
          Simple Explanation
        </h1>

        {/* Helper */}
        <p className={`${STACK_W} text-left text-[15px]/[22px] text-[var(--step-darkgrey)] mb-4`}>
          Explain {topicName} as if teaching a 12-year-old with no prior knowledge.
        </p>

        {/* Starter Dropdown */}
        <div ref={selectWrapRef} className={`relative ${STACK_W} mb-3`}>
          <button
            type="button"
            aria-haspopup="listbox"
            aria-expanded={cardOpen}
            onClick={() => setCardOpen((o) => !o)}
            onKeyDown={(e) => {
              if (e.key === "Escape") setCardOpen(false);
              if (["ArrowDown", "Enter", " "].includes(e.key)) {
                e.preventDefault();
                setCardOpen(true);
              }
            }}
            className="w-full h-11 rounded-[12px] border border-[var(--step-border)] bg-white pl-4 pr-10 text-left text-[14px]/[20px] text-[var(--step-darkgrey)] outline-none transition-colors focus:border-[var(--step-accent)] hover:border-[var(--step-selected-border)]"
          >
            {starter || "Choose a sentence starter (optional)"}
          </button>

          <ChevronDown
            className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4"
            style={{ color: "var(--field-icon, #9CA3AF)" }}
          />

          {cardOpen && (
            <div
              role="listbox"
              aria-label="Sentence starter suggestions"
              className="mt-2 rounded-[12px] border border-[var(--step-border)] bg-white overflow-hidden"
            >
              {starterChoices.map((s) => {
                const isActive = s === starter;
                return (
                  <button
                    key={s}
                    type="button"
                    role="option"
                    aria-selected={isActive}
                    onClick={() => {
                      setStarter(s);
                      setCardOpen(false);
                    }}
                    className="w-full flex items-center gap-2 px-4 py-3 text-left text-[15px]/[22px] text-[var(--step-darkgrey)]"
                    style={{ background: isActive ? "var(--step-selected-bg)" : "white" }}
                    onMouseEnter={(e) => {
                      if (!isActive) e.currentTarget.style.background = SOFT_PURPLE;
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive) e.currentTarget.style.background = "white";
                    }}
                  >
                    <span className="inline-flex w-5 justify-center">
                      {isActive && (
                        <Check className="h-4 w-4" style={{ color: "var(--step-accent)" }} />
                      )}
                    </span>
                    <span className="flex-1">{s}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Textarea */}
        <div className={`relative ${STACK_W} mb-8`} role="group" aria-labelledby="explain-label">
          <label id="explain-label" htmlFor="explain" className="sr-only">
            Explanation
          </label>

          <textarea
            id="explain"
            ref={taRef}
            value={composed}
            onChange={(e) => onChangeComposed(e.target.value)}
            placeholder="Start explaining here..."
            className="w-full min-h-16 max-h-[208px] resize-none rounded-[16px] border border-[var(--step-border)] pl-4 pr-12 py-3 text-[16px]/[24px] text-[var(--step-darkgrey)] placeholder:text-[var(--step-darkgrey)] outline-none transition-colors focus:border-[var(--step-accent)]"
          />

          <button
            type="button"
            aria-label={recording ? "Stop voice input" : "Start voice input"}
            aria-pressed={recording}
            onClick={toggleMic}
            className="group absolute right-3 top-1/2 -translate-y-1/2 h-8 w-8 rounded-[10px] border border-[var(--step-border)] bg-white inline-flex items-center justify-center transition-colors"
            onMouseEnter={(e) => (e.currentTarget.style.background = SOFT_PURPLE)}
            onMouseLeave={(e) => (e.currentTarget.style.background = "white")}
            title={recording ? "Stop voice input" : "Start voice input"}
          >
            <Mic
              className="h-4 w-4 transition-colors"
              style={{ color: recording ? "var(--step-accent)" : "var(--step-darkgrey)" }}
            />
          </button>
        </div>

        {/* Actions */}
        <div className={`${STACK_W} flex items-center justify-between`}>
          <button
            type="button"
            onClick={() => router.push("/")}
            className="inline-flex items-center gap-2 h-10 rounded-[10px] px-4 border border-[var(--step-border)] bg-white text-[var(--step-darkgrey)] hover:bg-[var(--step-selected-bg)]"
          >
            ← <span>Back</span>
          </button>

          <button
            type="button"
            disabled={!canEvaluate}
            onClick={handleEvaluate}
            className={`inline-flex items-center gap-2 h-10 rounded-[10px] px-5 text-white ${
              canEvaluate
                ? "bg-[var(--step-accent)] hover:brightness-95"
                : "bg-[#9CA3AF] cursor-not-allowed"
            }`}
          >
            Evaluate →
          </button>
        </div>
      </div>
    </main>
  );
}
