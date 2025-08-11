// app/create-analogy/page.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Mic, ChevronDown, Check } from "lucide-react";

const STACK_W = "w-[578px]";
const SOFT_PURPLE = "color-mix(in srgb, var(--step-accent) 12%, white)";

export default function CreateAnalogyPage() {
  const router = useRouter();

  const topicName = "Ohm’s Law";
  const templates = [
    "Water flowing through a pipe",
    "Cars on a road",
    "People entering a building",
  ];

  // --- faux-select state ---
  const [template, setTemplate] = useState("");
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

  // --- text area with persistence ---
  const [text, setText] = useState("");
  const taRef = useRef<HTMLTextAreaElement | null>(null);

  // restore from session on mount
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem("analogyText");
      if (saved) setText(saved);
    } catch {}
  }, []);

  // keep textarea height comfy
  useEffect(() => {
    const ta = taRef.current;
    if (!ta) return;
    ta.style.height = "auto";
    ta.style.height = Math.min(ta.scrollHeight, 208) + "px";
  }, [text]);

  // persist as user types
  const onChangeText = (v: string) => {
    setText(v);
    try {
      sessionStorage.setItem("analogyText", v);
    } catch {}
  };

  // mic UI state (visual only)
  const [recording, setRecording] = useState(false);

  const canEvaluate = text.trim().length > 0;

  // send analogy text to Explanation Feedback as the "explanation"
  const goEvaluate = () => {
    const payload = text.trim();
    if (!payload) return;

    // 1) also stash as "simpleExp" so a hard refresh on /explanation-feedback keeps it
    try {
      sessionStorage.setItem("simpleExp", payload);
    } catch {}

    // 2) pass via query param (your /explanation-feedback page already reads ?exp=)
    router.push(`/explanation-feedback?exp=${encodeURIComponent(payload)}`);
  };

  return (
    <main className="w-full">
      <div className="mx-auto pt-16 pb-12 px-6 flex flex-col items-center">
        {/* badge */}
        <div className="flex justify-center mb-4">
          <span className="inline-flex items-center rounded-full border border-dashed border-[var(--step-selected-border)] px-3 py-1 text-[12px] leading-5 tracking-[0.14em] text-[var(--step-accent)]">
            FEYNMANN TECHNIQUE
          </span>
        </div>

        {/* title */}
        <h1 className="text-center text-[48px]/[56px] font-semibold tracking-[-0.01em] text-[var(--step-text)] mb-6">
          Create an Analogy
        </h1>

        {/* helper */}
        <p className={`${STACK_W} text-left text-[15px]/[22px] text-[var(--step-darkgrey)] mb-4`}>
          Compare {topicName} to something everyday.
        </p>

        {/* faux-select: Analogy template */}
        <div ref={selectWrapRef} className={`relative ${STACK_W} mb-3`}>
          <button
            type="button"
            aria-haspopup="listbox"
            aria-expanded={cardOpen}
            onClick={() => setCardOpen((o) => !o)}
            onKeyDown={(e) => {
              if (e.key === "Escape") setCardOpen(false);
              if (e.key === "ArrowDown" || e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                setCardOpen(true);
              }
            }}
            className="
              w-full h-11 rounded-[12px]
              border border-[var(--step-border)] bg-white
              pl-4 pr-10 text-left text-[14px]/[20px] text-[var(--step-text)]
              outline-none transition-colors
              focus:border-[var(--step-accent)]
              hover:border-[var(--step-selected-border)]
            "
          >
            {template || "Choose an analogy template (optional)"}
          </button>

          <ChevronDown
            className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4"
            style={{ color: "var(--field-icon, #9CA3AF)" }}
          />

          {cardOpen && (
            <div
              role="listbox"
              aria-label="Analogy templates"
              className="mt-2 rounded-[12px] border border-[var(--step-border)] bg-white overflow-hidden"
            >
              {templates.map((t) => {
                const isActive = t === template;
                return (
                  <button
                    key={t}
                    type="button"
                    role="option"
                    aria-selected={isActive}
                    onClick={() => {
                      setTemplate(t);
                      setCardOpen(false);
                    }}
                    className="w-full flex items-center gap-2 px-4 py-3 text-left text-[15px]/[22px]"
                    style={{ background: isActive ? "var(--step-selected-bg)" : "white" }}
                    onMouseEnter={(e) => {
                      if (!isActive) e.currentTarget.style.background = SOFT_PURPLE;
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive) e.currentTarget.style.background = "white";
                    }}
                  >
                    <span className="inline-flex w-5 justify-center">
                      {isActive && <Check className="h-4 w-4" style={{ color: "var(--step-accent)" }} />}
                    </span>
                    <span className="flex-1">{t}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* multiline textarea with mic */}
        <div className={`relative ${STACK_W} mb-8`} role="group" aria-labelledby="analogy-label">
          <label id="analogy-label" htmlFor="analogy" className="sr-only">
            Analogy
          </label>

          <textarea
            id="analogy"
            ref={taRef}
            value={text}
            onChange={(e) => onChangeText(e.target.value)}
            placeholder="Input your analogy here..."
            className="
              w-full min-h-16 max-h-[208px] resize-none
              rounded-[16px] border border-[var(--step-border)]
              pl-4 pr-12 py-3
              text-[16px]/[24px] text-[var(--step-text)]
              placeholder:text-[var(--step-darkgrey)]
              outline-none transition-colors focus:border-[var(--step-accent)]
            "
          />

          <button
            type="button"
            aria-label={recording ? "Stop voice input" : "Start voice input"}
            aria-pressed={recording}
            onClick={() => setRecording((r) => !r)}
            className="
              group absolute right-3 top-1/2 -translate-y-1/2
              h-8 w-8 rounded-[10px]
              border border-[var(--step-border)] bg-white
              inline-flex items-center justify-center
              transition-colors
            "
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

        {/* actions */}
        <div className={`${STACK_W} flex items-center justify-between`}>
          <button
            type="button"
            onClick={() => router.back()}
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
            disabled={!canEvaluate}
            onClick={goEvaluate}
            className={`
              inline-flex items-center gap-2 h-10 rounded-[10px] px-5 text-white
              ${canEvaluate ? "bg-[var(--step-accent)] hover:brightness-95" : "bg-[#9CA3AF] cursor-not-allowed"}
            `}
          >
            Evaluate →
          </button>
        </div>
      </div>
    </main>
  );
}
