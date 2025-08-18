"use client";

import * as React from "react";

interface Step {
  number: number;
  title: string;
  active: boolean;
}

interface SidebarStepsProps {
  steps: Step[];
  className?: string;
}

export default function SidebarSteps({ steps, className }: SidebarStepsProps) {
  return (
    // Figma parent container: gap 16px, width ~336px
    <div className={`flex flex-col gap-4 w-full ${className ?? ""}`}>
      {steps.map((step) => (
        <StepRow key={step.number} step={step} />
      ))}
    </div>
  );
}

/** One row, matched to Figma (fill width, h=55, px16/py8, gap16, radius12) */
function StepRow({ step }: { step: Step }) {
  const rowBase =
    "flex items-center w-full h-[55px] px-4 py-2 gap-4 rounded-[12px] border transition-colors";

  const rowClass = step.active
    ? "bg-[var(--step-selected-bg)] border-[var(--step-selected-border)]"
    : "bg-white border-[var(--step-border)]";

  // Badge: 40×40 circle; ring when off, filled accent when on
  const badgeBase =
    "flex items-center justify-center w-10 h-10 rounded-full font-semibold leading-none border-2";
  const badgeClass = step.active
    ? "bg-[var(--step-accent)] border-[var(--step-accent)] text-white"
    : "bg-white border-[var(--step-border)] text-[var(--step-darkgrey)]"; // ← changed

  const titleClass = step.active
    ? "text-[16px]/[22px] font-semibold text-[var(--step-accent)]"
    : "text-[16px]/[22px] font-normal text-[var(--step-darkgrey)]"; // ← changed

  return (
    <div className={`${rowBase} ${rowClass}`} aria-current={step.active ? "step" : undefined}>
      <div className={`${badgeBase} ${badgeClass}`}>{step.number}</div>
      <span className={`${titleClass} truncate`}>{step.title}</span>
    </div>
  );
}
