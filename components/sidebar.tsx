
// Fixed Sidebar Component
"use client";
import { useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import SidebarSteps from "./ui/sidebarsteps";
import FileUploader from "./ui/file-uploader";

export default function Sidebar() {
  const [, setLastUploaded] = useState<{ name: string; content: string; type: string } | null>(null);
  const pathname = usePathname();
  const search = useSearchParams();
  
  // Determine current step based on route
  const currentStep = (() => {
    const path = pathname || "/";
    if (path === "/") return 1; // Topic Selection
    if (path.startsWith("/simple-explanation")) return 2; // Simple Explanation
    if (path.startsWith("/shared-feedback")) {
      const type = search?.get("type");
      return type === "analogy" ? 5 : 3; // Analogy Feedback vs Explanation Feedback
    }
    if (path.startsWith("/create-analogy")) return 4; // Create Analogy
    if (path.startsWith("/review-summary")) return 6; // Review & Summary
    return 1;
  })();
  
  const steps = [
    { number: 1, title: "Topic Selection", active: currentStep === 1 },
    { number: 2, title: "Simple Explanation", active: currentStep === 2 },
    { number: 3, title: "Explanation Feedback", active: currentStep === 3 },
    { number: 4, title: "Create Analogy", active: currentStep === 4 },
    { number: 5, title: "Analogy Feedback", active: currentStep === 5 },
    { number: 6, title: "Review & Summary", active: currentStep === 6 },
  ];

  return (
    <aside
      aria-label="Sidebar"
      className="h-screen overflow-y-auto shrink-0 bg-white border-r"
      style={{
        width: '26.79%', // 405/1512 from Figma ratio
        backgroundColor: 'white',
        borderRight: '1px solid #e5e7eb',
        borderColor: 'var(--new-light-grey, #e5e7eb)',
      }}
    >
      {/* Auto layout container matching Figma flow with -1 gap */}
      <div
        className="flex flex-col h-full"
        style={{
          paddingBottom: '40px', // Extra bottom whitespace for scroll area
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
          <div className="mt-4 pb-4" style={{ width: 'calc(100% - 0px)' }}>
            <SidebarSteps steps={steps} />
          </div>
        </nav>

        {/* Uploader Section with -1px margin for gap */}
        <section className="px-8 pt-6 pb-8 flex-1 -mt-px">
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