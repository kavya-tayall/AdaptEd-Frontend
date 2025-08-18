
// Fixed Sidebar Component
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
      className="min-h-screen shrink-0 bg-white border-r"
      style={{
        width: '26.79%', // 405/1512 from Figma ratio
        minHeight: '100vh',
        backgroundColor: 'white',
        borderRight: '1px solid #e5e7eb',
        borderColor: 'var(--new-light-grey, #e5e7eb)',
      }}
    >
      {/* Auto layout container matching Figma flow with -1 gap */}
      <div
        className="flex flex-col h-full"
        style={{
          paddingBottom: '24px', // Bottom padding from Figma
        }}
      >
        {/* Header Section */}
        <header className="px-8 pt-8 pb-4 border-b border-gray-200">
          <h1 className="text-[24px]/[28px] font-bold tracking-[-0.01em] text-black">
            AdaptEd
          </h1>
        </header>

        {/* Progress Section with -1px margin for gap */}
        <nav
          aria-label="Progress"
          className="px-8 pt-6 pb-6 border-b border-gray-200 -mt-px"
        >
          <h2 className="text-[15px] font-semibold tracking-[0.18em] uppercase text-gray-700">
            Topic Progress
          </h2>
          <p className="mt-1 text-[15px] text-gray-600">
            Master the concept through these steps
          </p>
          {/* Dynamic content width based on container */}
          <div className="mt-4" style={{ width: 'calc(100% - 0px)' }}>
            <SidebarSteps steps={steps} />
          </div>
        </nav>

        {/* Uploader Section with -1px margin for gap */}
        <section className="px-8 pt-6 flex-1 -mt-px">
          <h3 className="text-[15px] font-semibold tracking-[0.18em] uppercase text-gray-700">
            Supplemental Files
          </h3>
          <p className="mt-1 text-[15px] text-gray-600">
            Personalize your AdaptEd journey
          </p>
          {/* Dynamic content width based on container */}
          <div className="mt-4" style={{ width: 'calc(100% - 0px)' }}>
            <FileUploader onLoaded={(f) => setLastUploaded(f)} />
          </div>
        </section>
      </div>
    </aside>
  );
}