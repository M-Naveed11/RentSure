"use client";

import { useRef, useState, DragEvent } from "react";
import { Upload, FileText, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface UploadZoneProps {
  onFile: (file: File) => void;
  loading?: boolean;
}

export default function UploadZone({ onFile, loading = false }: UploadZoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  function handleDrop(e: DragEvent) {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type === "application/pdf") onFile(file);
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) onFile(file);
  }

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      onClick={() => !loading && inputRef.current?.click()}
      className={cn(
        "border-2 border-dashed rounded-xl p-10 flex flex-col items-center justify-center gap-3 cursor-pointer transition-colors",
        dragging ? "border-blue-500 bg-blue-50" : "border-gray-300 hover:border-blue-400 hover:bg-gray-50",
        loading && "cursor-not-allowed opacity-60"
      )}
    >
      <input ref={inputRef} type="file" accept=".pdf" className="hidden" onChange={handleChange} />

      {loading ? (
        <>
          <Loader2 className="h-10 w-10 text-blue-500 animate-spin" />
          <p className="text-sm font-medium text-gray-600">Analyzing your lease with AI…</p>
          <p className="text-xs text-gray-400">This takes 15–30 seconds</p>
        </>
      ) : (
        <>
          <div className="h-14 w-14 rounded-full bg-blue-50 flex items-center justify-center">
            <Upload className="h-6 w-6 text-blue-500" />
          </div>
          <div className="text-center">
            <p className="text-sm font-semibold text-gray-700">Drop your lease PDF here</p>
            <p className="text-xs text-gray-500 mt-1">or click to browse — PDF only, max 10MB</p>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <FileText className="h-3 w-3" />
            <span>Ejari, RERA, or standard lease contracts</span>
          </div>
        </>
      )}
    </div>
  );
}
