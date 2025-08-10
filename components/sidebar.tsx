"use client";

import { useState } from "react";
import SidebarSteps from "./ui/sidebarsteps";
import FileUploader from "./ui/file-uploader";

export default function Sidebar() {
  const [, setLastUploaded] = useState<{ name: string; content: string; type: string } | null>(null);

  const steps = [
    { number: 1, title: "Topic Selection", active: true },
    { number: 2, title: "Simple Explanation", active: false },
    { number: 3, title: "Explanation Feedback", active: false },
    { number: 4, title: "Create Analogy", active: false },
    { number: 5, title: "Analogy Feedback", active: false },
    { number: 6, title: "Review & Summary", active: false },
  ];

  return (
    <aside
      aria-label="Sidebar"
      className="w-[405px] shrink-0 bg-white border-r border-[var(--step-border)]"
    >
      {/* sticky so the rail behaves like the Figma frame */}
      <div className="sticky top-0 h-dvh flex flex-col">
        {/* ===== Header (405×69) with pt32 pr24 pb16 pl32 and bottom divider ===== */}
        <header className="pl-8 pr-6 pt-8 pb-4 border-b border-[var(--step-border)]">
          <h1 className="text-[24px]/[28px] font-bold tracking-[-0.01em]">AdaptEd</h1>
        </header>

        {/* ===== Progress block ===== */}
        <nav aria-label="Progress" className="pl-8 pr-6 pt-6 pb-6 border-b border-[var(--step-border)]">
          <h2 className="text-[15px] font-semibold tracking-[0.18em] uppercase text-[var(--step-text)]">
            Topic Progress
          </h2>
          <p className="mt-1 text-[15px] text-[var(--step-darkgrey)]">
            Master the concept through these steps
          </p>

          {/* Inner content must be exactly 349px (405 - 32 - 24) */}
          <div className="mt-4 w-[349px]">
            <SidebarSteps steps={steps} />
          </div>
        </nav>

        {/* ===== Uploader block ===== */}
        <section className="pl-8 pr-6 pt-6 pb-8">
          <h3 className="text-[15px] font-semibold tracking-[0.18em] uppercase text-[var(--step-text)]">
            Supplemental Files
          </h3>
          <p className="mt-1 text-[15px] text-[var(--step-darkgrey)]">
            Personalize your AdaptEd journey
          </p>

          {/* Dropzone width must also be 349px to align with steps */}
          <div className="mt-4 w-[349px]">
            <FileUploader onLoaded={(f) => setLastUploaded(f)} />
          </div>
        </section>
      </div>
    </aside>
  );
}
