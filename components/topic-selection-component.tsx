"use client";

import * as React from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Mic, Square } from "lucide-react";

const STACK_W = "w-[578px]";

export default function TopicSelection() {
  const router = useRouter();

  const topics = [
    "Ohm's Law",
    "Kirchhoff's Laws",
    "Resistors and Resistance",
    "Capacitors",
    "Inductors",
    "Operational Amplifiers",
    "Superposition Theorem",
    "Impedance and Reactance",
    "First-Order Circuits",
    "Second-Order Circuits",
  ];

  // single-select value
  const [query, setQuery] = useState("");
  const selectedTopic = useMemo(() => (query.trim() ? query.trim() : null), [query]);

  // mic UI state
  const [recording, setRecording] = useState(false);
  const toggleMic = () => setRecording((r) => !r);

  // auto-grow <textarea>
  const taRef = useRef<HTMLTextAreaElement | null>(null);
  useEffect(() => {
    const ta = taRef.current;
    if (!ta) return;
    ta.style.height = "auto";
    const maxPx = 168; // ~6 lines at 26px
    ta.style.height = Math.min(ta.scrollHeight, maxPx) + "px";
  }, [query]);

  const pick = (label: string) => setQuery((prev) => (prev === label ? "" : label));

  const proceed = () => {
    if (!selectedTopic) {
      alert("Please select a topic before proceeding.");
      return;
    }
    try {
      sessionStorage.setItem("topicName", selectedTopic);
    } catch {}
    router.push(`/simple-explanation?topic=${encodeURIComponent(selectedTopic)}`);
  };

  // a11y ids
  const helperId = "topic-helper";
  const micHintId = "topic-mic-hint";
  const inputId = "topic-textarea";

  return (
    <main className="w-full">
      <div className="mx-auto pt-16 pb-12 px-6 flex flex-col items-center">
        {/* badge */}
        <div className="flex justify-center mb-4">
          <span className="inline-flex items-center rounded-full border border-dashed border-[var(--step-selected-border)] px-3 py-1 text-[12px] leading-5 tracking-[0.14em] text-[var(--step-accent)]">
            FEYNMANN TECHNIQUE
          </span>
        </div>

        {/* title – fixed dark so it never goes white */}
        <h1 className="text-center text-[48px]/[56px] font-semibold tracking-[-0.01em] text-[var(--step-darkgrey)] mb-4">
          Topic Selection
        </h1>

        {/* helper */}
        <p
          id={helperId}
          className={`${STACK_W} text-left text-[15px]/[22px] text-[var(--step-darkgrey)] mb-6`}
        >
          What specific concept within Electrical Engineering do you want to master?
        </p>

        {/* MULTI-LINE FIELD */}
        <div className={`relative ${STACK_W} mb-6`} role="group" aria-labelledby="topic-label">
          <label id="topic-label" htmlFor={inputId} className="sr-only">
            Topic
          </label>

          <textarea
            ref={taRef}
            id={inputId}
            value={query}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setQuery(e.target.value)}
            onKeyDown={(e: React.KeyboardEvent<HTMLTextAreaElement>) => {
              if (e.key === "Escape" && query) {
                e.preventDefault();
                setQuery("");
              }
            }}
            placeholder="Input any Electrical Engineering concept or select one below"
            aria-describedby={`${helperId} ${micHintId}`}
            className="
              w-full min-h-16 max-h-[208px] resize-none
              rounded-[16px] border border-[var(--step-border)]
              pl-6 pr-14 py-4
              text-[18px]/[26px] text-[var(--step-darkgrey)]
              placeholder:text-[var(--step-darkgrey)]
              outline-none transition-colors focus:border-[var(--step-accent)]
            "
          />

          {/* mic inside the field */}
          <button
            type="button"
            aria-label={recording ? "Stop voice input" : "Start voice input"}
            aria-pressed={recording}
            onClick={toggleMic}
            title={recording ? "Stop voice input" : "Start voice input"}
            className="
              group absolute right-3 top-1/2 -translate-y-1/2
              h-9 w-9 rounded-[12px]
              border border-[var(--step-border)] bg-white
              hover:bg-white
              inline-flex items-center justify-center
            "
          >
            {recording ? (
              <Square className="h-4 w-4" style={{ color: "var(--step-accent)" }} />
            ) : (
              <Mic
                className="h-4 w-4 transition-colors"
                style={{ color: "var(--field-icon, #9CA3AF)" }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.color = "var(--field-icon-hover, #6B7280)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.color = "var(--field-icon, #9CA3AF)")
                }
              />
            )}
          </button>

          <p id={micHintId} className="sr-only">
            Use the microphone button to dictate the topic. Press again to stop recording. Press
            Escape to clear.
          </p>
          <div aria-live="polite" className="sr-only">
            {recording ? "Recording started." : "Recording stopped."}
          </div>
        </div>

        {/* chips (single-select) */}
        <div className={`${STACK_W} flex flex-wrap gap-3`}>
          {topics.map((t) => (
            <TopicChipInline
              key={t}
              label={t}
              selected={selectedTopic === t}
              onClick={() => pick(t)}
              closable={selectedTopic === t}
            />
          ))}
        </div>

        {/* CTA */}
        <div className={`${STACK_W} mt-8 flex justify-end`}>
          <button
            type="button"
            onClick={proceed}
            className={`inline-flex items-center gap-2 px-5 h-10 rounded-[10px] text-white ${
              selectedTopic
                ? "bg-[var(--step-accent)] hover:brightness-95"
                : "bg-[#4B5563] hover:bg-[#374151]"
            }`}
          >
            Proceed <span>→</span>
          </button>
        </div>
      </div>
    </main>
  );
}

/* Inline chip so this file compiles without extra imports. */
function TopicChipInline({
  label,
  selected = false,
  onClick,
  closable = false,
}: {
  label: string;
  selected?: boolean;
  onClick: () => void;
  closable?: boolean;
}) {
  const base =
    "inline-flex items-center justify-center h-9 px-4 rounded-full border text-[15px] leading-[20px] transition-colors select-none cursor-pointer " +
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[var(--ring-accent)]";

  const styles = selected
    ? "bg-white text-[var(--step-accent)] border-[var(--step-selected-border)] hover:bg-white hover:text-[var(--step-accent)] hover:border-[var(--step-selected-border)]"
    : "bg-white text-[var(--step-darkgrey)] border-[var(--step-border)] hover:bg-white hover:text-[var(--step-darkgrey)] hover:border-[var(--step-selected-border)]";

  return (
    <button type="button" aria-pressed={selected} onClick={onClick} className={base + " " + styles}>
      <span className="truncate">{label}</span>
      {selected && closable && (
        <span className="ml-1.5" aria-hidden>
          ×
        </span>
      )}
    </button>
  );
}
