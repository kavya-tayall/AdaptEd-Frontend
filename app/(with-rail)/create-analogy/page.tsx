"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Mic, ChevronDown, Check } from "lucide-react";

const STACK_W = "w-[578px]";
const SOFT_PURPLE = "color-mix(in srgb, var(--step-accent) 12%, white)";

export default function CreateAnalogyPage() {
  const router = useRouter();
  const search = useSearchParams();

  // --- Topic: prefer ?topic=, then sessionStorage, fallback to default ---
  const topicFromUrl = (search.get("topic") || "").trim();
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

  const templates = [
    "Water flowing through a pipe",
    "Cars on a road",
    "People entering a building",
  ];

  const [template, setTemplate] = useState("");
  const [cardOpen, setCardOpen] = useState(false);
  const selectWrapRef = useRef<HTMLDivElement | null>(null);

  const [text, setText] = useState("");
  const taRef = useRef<HTMLTextAreaElement | null>(null);
  const [recording, setRecording] = useState(false);
  const canEvaluate = text.trim().length > 0;

  // Close dropdown on outside click
  useEffect(() => {
    const onDocDown = (e: MouseEvent) => {
      if (!selectWrapRef.current?.contains(e.target as Node)) setCardOpen(false);
    };
    document.addEventListener("mousedown", onDocDown);
    return () => document.removeEventListener("mousedown", onDocDown);
  }, []);

  // Prefill from ?seed=... (when coming from Override)
  useEffect(() => {
    const seed = search.get("seed");
    if (seed && !text) setText(seed);
  }, [search, text]);

  // Restore text from sessionStorage (fallback)
  useEffect(() => {
    if (text) return; // prefer current/seed
    const saved = sessionStorage.getItem("analogyText");
    if (saved) setText(saved);
  }, [text]);

  // Auto-size textarea
  useEffect(() => {
    const ta = taRef.current;
    if (!ta) return;
    ta.style.height = "auto";
    ta.style.height = Math.min(ta.scrollHeight, 208) + "px";
  }, [text]);

  // Persist text
  const onChangeText = (v: string) => {
    setText(v);
    try {
      sessionStorage.setItem("analogyText", v);
    } catch {}
  };

  // When picking a template, optionally scaffold text with the topic
  const pickTemplate = (t: string) => {
    setTemplate(t);
    setCardOpen(false);
    if (!text.trim()) {
      const scaffold = `${topicName} is like ${t.toLowerCase()} — explain the mapping here.`;
      onChangeText(scaffold);
    }
  };

  // Navigate to SHARED feedback with analogy mode + pass topic
  const goEvaluate = () => {
    const payload = text.trim();
    if (!payload) return;

    try {
      sessionStorage.setItem("analogyText", payload);
      sessionStorage.setItem("topicName", topicName);
    } catch {}

    const maxLen = 4000; // basic URL safety
    const safe = payload.length > maxLen ? payload.slice(0, maxLen) : payload;

    router.push(
      `/shared-feedback?source=create-analogy&type=analogy&topic=${encodeURIComponent(
        topicName
      )}&text=${encodeURIComponent(safe)}`
    );
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
          Create an Analogy
        </h1>

        {/* Helper */}
        <p className={`${STACK_W} text-left text-[15px]/[22px] text-[var(--step-darkgrey)] mb-4`}>
          Compare <span className="font-medium">{topicName}</span> to something everyday.
        </p>

        {/* Template Selector */}
        <div ref={selectWrapRef} className={`relative ${STACK_W} mb-3`}>
          <button
            type="button"
            aria-haspopup="listbox"
            aria-expanded={cardOpen}
            onClick={() => setCardOpen((o) => !o)}
            className="relative w-full h-11 rounded-[12px] border border-[var(--step-border)] bg-white pl-4 pr-10 text-left text-[14px]/[20px] text-[var(--step-darkgrey)] outline-none transition-colors focus:border-[var(--step-accent)] hover:border-[var(--step-selected-border)]"
          >
            {template || "Choose an analogy template (optional)"}
            <ChevronDown
              className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4"
              style={{ color: "var(--field-icon, #9CA3AF)" }}
            />
          </button>

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
                    onClick={() => pickTemplate(t)}
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
                      {isActive && <Check className="h-4 w-4" style={{ color: "var(--step-accent)" }} />}
                    </span>
                    <span className="flex-1">{t}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Textarea Input */}
        <div className={`relative ${STACK_W} mb-8`}>
          <label htmlFor="analogy" className="sr-only">Analogy</label>
          <textarea
            id="analogy"
            ref={taRef}
            value={text}
            onChange={(e) => onChangeText(e.target.value)}
            placeholder={`Input your analogy for ${topicName} here...`}
            className="w-full min-h-16 max-h-[208px] resize-none rounded-[16px] border border-[var(--step-border)] pl-4 pr-12 py-3 text-[16px]/[24px] text-[var(--step-darkgrey)] placeholder:text-[var(--step-darkgrey)] outline-none focus:border-[var(--step-accent)]"
          />

          <button
            type="button"
            aria-label={recording ? "Stop voice input" : "Start voice input"}
            onClick={() => setRecording((r) => !r)}
            className="absolute right-3 top-1/2 -translate-y-1/2 h-8 w-8 rounded-[10px] border border-[var(--step-border)] bg-white inline-flex items-center justify-center transition-colors"
            title={recording ? "Stop voice input" : "Start voice input"}
            onMouseEnter={(e) => (e.currentTarget.style.background = SOFT_PURPLE)}
            onMouseLeave={(e) => (e.currentTarget.style.background = "white")}
          >
            <Mic
              className="h-4 w-4"
              style={{ color: recording ? "var(--step-accent)" : "var(--step-darkgrey)" }}
            />
          </button>
        </div>

        {/* Navigation Buttons */}
        <div className={`${STACK_W} flex items-center justify-between`}>
          <button
            type="button"
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 h-10 rounded-[10px] px-4 border border-[var(--step-border)] bg-white text-[var(--step-darkgrey)] hover:bg-[var(--step-selected-bg)]"
          >
            ← <span>Back</span>
          </button>

          <button
            type="button"
            disabled={!canEvaluate}
            onClick={goEvaluate}
            className={`inline-flex items-center gap-2 h-10 rounded-[10px] px-5 text-white ${
              canEvaluate ? "bg-[var(--step-accent)] hover:brightness-95" : "bg-[#9CA3AF] cursor-not-allowed"
            }`}
          >
            Evaluate →
          </button>
        </div>
      </div>
    </main>
  );
}
