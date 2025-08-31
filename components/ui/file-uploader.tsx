"use client";

import { useRef, useState } from "react";
import { Paperclip, FileText, X } from "lucide-react";

type FileUploaderProps = {
  onLoaded?: (args: { name: string; content: string; type: string }) => void;
  accept?: string;
  multiple?: boolean;
};

const MAX_INLINE_BYTES = 1_000_000;

export default function FileUploader({
  onLoaded,
  accept = "application/pdf,.pdf",
  multiple,
}: FileUploaderProps) {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const handleFile = (file: File) => {
    setUploadedFile(file);

    const saveMetaOnly = () => {
      sessionStorage.setItem("uploadedFileName", file.name);
      sessionStorage.setItem("uploadedFileContent", "");
      onLoaded?.({ name: file.name, content: "", type: file.type || "unknown" });
    };

    const isPdf = file.type === "application/pdf" || /\.pdf$/i.test(file.name);
    if (isPdf && file.size > MAX_INLINE_BYTES) return saveMetaOnly();

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result ?? "";
      let content = "";
      if (typeof result === "string") content = result;
      else {
        try {
          content = new TextDecoder().decode(new Uint8Array(result as ArrayBuffer));
        } catch {
          content = "";
        }
      }
      sessionStorage.setItem("uploadedFileName", file.name);
      sessionStorage.setItem("uploadedFileContent", content);
      onLoaded?.({ name: file.name, content, type: file.type || "unknown" });
    };

    if (isPdf) reader.readAsDataURL(file);
    else if (file.type.startsWith("text/") || /\.(txt|md|csv)$/i.test(file.name))
      reader.readAsText(file);
    else reader.readAsDataURL(file);
  };

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) handleFile(f);
    if (inputRef.current) inputRef.current.value = "";
  };

  const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files?.[0];
    if (f) handleFile(f);
  };

  const removeFile = () => {
    setUploadedFile(null);
    sessionStorage.removeItem("uploadedFileName");
    sessionStorage.removeItem("uploadedFileContent");
  };

  return (
    <div className="w-full">
      {!uploadedFile ? (
        <>
          {/* Dropzone */}
          <div className="w-full">
            <div
              role="button"
              tabIndex={0}
              aria-describedby="upload-help"
              onClick={() => inputRef.current?.click()}
              onKeyDown={(e) =>
                (e.key === "Enter" || e.key === " ") && inputRef.current?.click()
              }
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={onDrop}
              className={[
                "rounded-[16px] border-2 border-dashed transition-colors",
                "px-10 py-14 flex flex-col items-center justify-center text-center cursor-pointer",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[var(--ring-accent)]",
                dragOver
                  ? "bg-[var(--surface-muted)] border-[var(--border-default)]"
                  : "border-[var(--border-default)]",
              ].join(" ")}
              title="Click or drop a PDF file"
            >
              <div
                className="mb-4 flex items-center justify-center w-10 h-10 rounded-md border-2"
                style={{
                  borderColor: "var(--step-selected-border)",
                  color: "var(--step-accent)",
                }}
                aria-hidden
              >
                <Paperclip className="w-5 h-5" />
              </div>
              {/* FIX: use dark grey so it's visible on white in dark mode */}
              <p className="text-[18px] leading-6 text-[var(--step-darkgrey)]">
                Drag and drop your PDF files
              </p>
            </div>
          </div>

          <input
            ref={inputRef}
            type="file"
            className="hidden"
            accept={accept}
            multiple={multiple}
            onChange={onChange}
            aria-describedby="upload-help"
          />
        </>
      ) : (
        <div className="w-full mt-4 rounded-[16px] border border-[var(--border-default)] bg-white px-5 py-4 flex items-center">
          <div
            className="w-10 h-10 rounded-md border border-[var(--border-default)] flex items-center justify-center mr-4"
            aria-hidden
          >
            <FileText className="w-5 h-5 text-[var(--step-darkgrey)]" />
          </div>
          <div className="flex-1 min-w-0">
            {/* FIX: name text to dark grey (bg is white) */}
            <span
              className="truncate block max-w-full text-[18px] leading-[22px] text-[var(--step-darkgrey)]"
              title={uploadedFile.name}
            >
              {uploadedFile.name}
            </span>
          </div>
          <button
            type="button"
            aria-label="Remove file"
            onClick={removeFile}
            className="ml-4 rounded-full p-1 hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[var(--border-default)]"
          >
            <X className="w-6 h-6 text-[var(--step-darkgrey)]" />
          </button>
        </div>
      )}
    </div>
  );
}
