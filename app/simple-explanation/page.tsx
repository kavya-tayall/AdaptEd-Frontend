"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Volume2, Mic } from "lucide-react";

export default function SimpleExplanationPage() {
  const [explanationText, setExplanationText] = useState("");
  const [selectedStarter, setSelectedStarter] = useState("");
  const [fileContent, setFileContent] = useState<string | null>(null);
  const [showContent, setShowContent] = useState(false);
  const isProceedDisabled = explanationText.trim() === "";

  const topicName = "Ohm's Law";

  const sentenceStarters = [
    "",
    "Think of it like...",
    "Imagine that...",
    "Let's say you have...",
    "Picture this...",
    "It's similar to when...",
    "You know how...",
    "Consider this example...",
  ];

  const handlePlayInstruction = () => {
    const utterance = new SpeechSynthesisUtterance(
      `Explain ${topicName} as if teaching a 12-year-old with no prior knowledge.`
    );
    speechSynthesis.speak(utterance);
  };

  useEffect(() => {
    const content = sessionStorage.getItem("uploadedFileContent");
    if (content) {
      setFileContent(content);

      // Placeholder for developers: pass `content` to AI model here
      console.log("Loaded file content from sessionStorage:", content);
    }
  }, []);

  return (
    <div className="flex-1 px-12 py-16">
      <h1 className="text-4xl font-bold mb-12 text-center">Simple Explanation</h1>

      {fileContent && (
        <div className="mb-6 text-sm">
          <button
            onClick={() => setShowContent(!showContent)}
            className="text-blue-600 hover:underline"
          >
            {showContent ? "Hide uploaded file content" : "View uploaded file content"}
          </button>
          {showContent && (
            <div className="mt-2 border border-blue-200 bg-blue-50 rounded-md p-4 text-gray-700 whitespace-pre-wrap max-h-64 overflow-auto">
              {fileContent}
            </div>
          )}
        </div>
      )}

      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm">
          Explain <span className="font-medium">{topicName}</span> as if teaching a 12-year-old with no prior knowledge.
        </p>
        <Button variant="ghost" size="icon" onClick={handlePlayInstruction} className="ml-4">
          <Volume2 className="h-5 w-5 text-gray-400" />
        </Button>
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium mb-2">Optional sentence starter:</label>
        <select
          className="w-full border border-gray-300 rounded-md px-4 py-3 text-sm"
          value={selectedStarter}
          onChange={(e) => setSelectedStarter(e.target.value)}
        >
          <option value="">Choose a sentence starter (optional)</option>
          {sentenceStarters.slice(1).map((starter, index) => (
            <option key={index} value={starter}>
              {starter}
            </option>
          ))}
        </select>
      </div>

      <div className="relative mb-10">
        <Input
          className="pl-4 pr-12 py-6 text-base rounded-lg"
          placeholder="Start explaining here..."
          value={
            selectedStarter && explanationText.startsWith(selectedStarter)
              ? explanationText
              : selectedStarter + explanationText
          }
          onChange={(e) => {
            const value = e.target.value;
            if (selectedStarter && value.startsWith(selectedStarter)) {
              setExplanationText(value.substring(selectedStarter.length));
            } else {
              setExplanationText(value);
            }
          }}
        />
        <Button variant="ghost" size="icon" className="absolute right-3 top-1/2 -translate-y-1/2">
          <Mic className="h-5 w-5 text-gray-400" />
        </Button>
      </div>

      <div className="flex justify-between">
        <Button variant="outline" onClick={() => window.history.back()}>
          ← Back
        </Button>
        <Button
          className="bg-black text-white hover:bg-gray-900"
          disabled={isProceedDisabled}
          onClick={() => (window.location.href = "/create-analogy")}
        >
          Evaluate →
        </Button>
      </div>
    </div>
  );
}
