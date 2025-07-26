"use client";

import { useRef, useState } from "react";
import { Paperclip, FileText } from "lucide-react";

export default function Sidebar() {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const steps = [
    { number: 1, title: "Topic Selection", active: true },
    { number: 2, title: "Simple Explanation", active: false },
    { number: 3, title: "Explanation Feedback", active: false },
    { number: 4, title: "Create Analogy", active: false },
    { number: 5, title: "Analogy Feedback", active: false },
    { number: 6, title: "Review & Summary", active: false },
  ];

  const handleFileUpload = (file: File) => {
    setUploadedFile(file);

    const reader = new FileReader();
    reader.onload = () => {
      const content = reader.result;
      sessionStorage.setItem("uploadedFileName", file.name);
      sessionStorage.setItem("uploadedFileContent", content as string);
    };
    reader.readAsText(file); // You can use readAsDataURL for binary files
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileUpload(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) handleFileUpload(file);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  return (
    <div className="w-[410px] border-r border-gray-200 p-6 bg-white flex flex-col">
      <h1 className="text-2xl font-bold mb-8">AdaptEd</h1>

      {/* Progress Steps */}
      <div className="mb-8">
        <h2 className="text-sm font-medium mb-4">Progress</h2>
        <div className="space-y-3">
          {steps.map((step) => (
            <div
              key={step.number}
              className={`flex items-center gap-3 p-4 rounded-md border ${step.active ? "bg-gray-50" : "bg-white"}`}
            >
              <div className="flex items-center justify-center w-6 h-6 rounded-full bg-white border border-gray-300 text-xs">
                {step.number}
              </div>
              <span className="text-sm">{step.title}</span>
            </div>
          ))}
        </div>
      </div>

      {/* File Upload Section */}
      <div>
        <h2 className="text-sm font-medium mb-4">Supplemental Files</h2>

        <div
          onClick={() => fileInputRef.current?.click()}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          className="border border-dashed border-gray-300 rounded-md p-6 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-gray-50 transition"
        >
          <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center mb-2">
            <Paperclip className="h-4 w-4 text-gray-500" />
          </div>
          <p className="text-sm text-gray-500">
            Drag and drop your files to personalize your learning
          </p>
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            onChange={handleFileChange}
          />
        </div>

        {uploadedFile && (
          <div className="mt-4 border border-gray-300 rounded-md p-3 flex items-center gap-2">
            <FileText className="h-5 w-5 text-gray-600" />
            <span className="text-sm text-gray-800 truncate">{uploadedFile.name}</span>
          </div>
        )}
      </div>
    </div>
  );
}
