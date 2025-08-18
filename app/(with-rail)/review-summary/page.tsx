"use client";
import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";

/**
 * Review & Summary
 * - Reads topic, explanation, and analogy from query params or sessionStorage fallbacks.
 * - Shows two read-only cards.
 * - Export buttons create .txt downloads.
 * - Back and Restart actions included.
 */
export default function ReviewSummaryPage() {
  const router = useRouter();
  const search = useSearchParams();

  // --- inputs (with robust fallbacks) ---
  const topicParam = search.get("topic")?.trim();
  const explanationParam = search.get("explanation")?.trim() ?? search.get("exp")?.trim();
  const analogyParam = search.get("analogy")?.trim();

  const [topic, setTopic] = useState(topicParam || "Ohm's Law");
  const [explanation, setExplanation] = useState(
    explanationParam ||
    "Ohm's Law is a rule in electricity that shows how voltage, current, and resistance are connected with a formula using V, I, and R."
  );
  const [analogy, setAnalogy] = useState(
    analogyParam ||
    "Ohm's Law is like water flowing through a pipe — the pressure pushes the water, the pipe's size slows it down, and how much water flows depends on both."
  );

  // Prefer query params; otherwise restore from sessionStorage
  useEffect(() => {
    if (!explanationParam) {
      const savedExp = sessionStorage.getItem("simpleExp") || sessionStorage.getItem("explanation");
      if (savedExp) setExplanation(savedExp);
    }
    if (!analogyParam) {
      const savedAna = sessionStorage.getItem("analogyText") || sessionStorage.getItem("analogy");
      if (savedAna) setAnalogy(savedAna);
    }
    if (!topicParam) {
      const savedTopic = sessionStorage.getItem("topicName");
      if (savedTopic) setTopic(savedTopic);
    }
  }, [explanationParam, analogyParam, topicParam]);

  // Build export payloads
  const summaryText = useMemo(() => {
    return [
      `Topic: ${topic}`,
      "",
      "Your Explanation:",
      explanation,
      "",
      "Your Analogy:",
      analogy,
      "",
      "— Generated with AdaptEd (Feynman Technique) —",
    ].join("\n");
  }, [topic, explanation, analogy]);

  // Helpers: download text files
  const downloadTxt = (filename: string, contents: string) => {
    const blob = new Blob([contents], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  // Actions
  const onExportExplanation = () =>
    downloadTxt(`${sanitize(topic)}-explanation.txt`, explanation);
  const onExportAnalogy = () => downloadTxt(`${sanitize(topic)}-analogy.txt`, analogy);
  const onExportSummary = () => downloadTxt(`${sanitize(topic)}-summary.txt`, summaryText);

  const onBack = () => {
    // If arriving from analogy feedback, go there; else fallback to explanation feedback
    const from = search.get("from") || "";
    if (from === "analogy-feedback") router.push("/shared-feedback?type=analogy");
    else if (from === "explanation-feedback") router.push("/shared-feedback?type=explanation");
    else router.back();
  };

  const onRestart = () => {
    router.push("/simple-explanation"); // or `/` or your topic selection route
  };

  return (
    <main className="min-h-screen bg-white">
      {/* Main container with proper centering */}
      <div className="max-w-4xl mx-auto px-6 py-16">
        {/* Badge */}
        <div className="flex justify-center mb-6">
          <span className="inline-flex items-center rounded-full border border-dashed border-purple-300 px-4 py-1.5 text-xs font-medium tracking-wider text-purple-600 uppercase">
            FEYNMANN TECHNIQUE
          </span>
        </div>

        {/* Title */}
        <h1 className="text-center text-4xl md:text-5xl font-semibold text-gray-900 mb-8 tracking-tight">
          Review & Summary
        </h1>

        {/* Topic subtitle */}
        <div className="text-center mb-12">
          <h2 className="text-lg font-medium text-gray-700">{topic}</h2>
        </div>

        {/* Content cards container - matching Figma layout */}
        <div className="max-w-2xl mx-auto space-y-6 mb-12">
          {/* Explanation card */}
          <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Your Explanation:</h3>
            <p className="text-gray-800 italic leading-relaxed text-sm">
              {explanation}
            </p>
          </div>

          {/* Analogy card */}
          <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Your Analogy:</h3>
            <p className="text-gray-800 italic leading-relaxed text-sm">
              {analogy}
            </p>
          </div>
        </div>

        {/* Export buttons - horizontal layout matching Figma */}
        <div className="flex flex-wrap justify-center gap-4 mb-16">
          <Button 
            variant="outline" 
            onClick={onExportExplanation}
            className="px-6 py-2.5 text-sm font-medium border-gray-300 hover:bg-gray-50"
          >
            📄 Export Explanation
          </Button>
          <Button 
            variant="outline" 
            onClick={onExportAnalogy}
            className="px-6 py-2.5 text-sm font-medium border-gray-300 hover:bg-gray-50"
          >
            📄 Export Analogy
          </Button>
          <Button 
            variant="outline" 
            onClick={onExportSummary}
            className="px-6 py-2.5 text-sm font-medium border-gray-300 hover:bg-gray-50"
          >
            📄 Export Summary
          </Button>
        </div>

        {/* Bottom navigation - matching Figma with proper spacing */}
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <Button 
            variant="outline" 
            onClick={onBack}
            className="px-6 py-2.5 text-sm font-medium border-gray-300 hover:bg-gray-50 bg-gray-100"
          >
            ← Back
          </Button>
          <Button 
            onClick={onRestart}
            className="px-6 py-2.5 text-sm font-medium bg-purple-600 hover:bg-purple-700 text-white"
          >
            Restart →
          </Button>
        </div>
      </div>
    </main>
  );
}

// Utility to make safe filenames
function sanitize(s: string) {
  return s.replace(/[^\w\-]+/g, "_").slice(0, 60) || "export";
}