"use client";

import { useState, useCallback } from "react";
import { Upload, FileText, X, CheckCircle2, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface DropzoneProps {
  onFileSelect: (file: File) => void;
  label?: string;
  isUploading?: boolean;
  isSuccess?: boolean;
  className?: string;
}

export default function Dropzone({ 
  onFileSelect, 
  label = "Upload PDF Document", 
  isUploading = false,
  isSuccess = false,
  className 
}: DropzoneProps) {
  const [isDragActive, setIsDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(true);
  }, []);

  const onDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(false);
  }, []);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type === "application/pdf") {
      setSelectedFile(file);
      onFileSelect(file);
    }
  }, [onFileSelect]);

  const onInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === "application/pdf") {
      setSelectedFile(file);
      onFileSelect(file);
    }
  }, [onFileSelect]);

  return (
    <div
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      className={cn(
        "relative flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-xl transition-all duration-300",
        isDragActive ? "border-blue-500 bg-blue-50" : "border-gray-300 bg-gray-50",
        isSuccess ? "border-green-500 bg-green-50" : "",
        className
      )}
    >
      <input
        type="file"
        accept=".pdf"
        onChange={onInputChange}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        disabled={isUploading}
      />

      <div className="flex flex-col items-center text-center p-6">
        {isUploading ? (
          <>
            <Loader2 className="w-10 h-10 text-blue-500 animate-spin mb-3" />
            <p className="text-sm font-medium text-gray-700">Processing Document...</p>
          </>
        ) : isSuccess ? (
          <>
            <CheckCircle2 className="w-10 h-10 text-green-500 mb-3" />
            <p className="text-sm font-medium text-green-700">{selectedFile?.name || "Uploaded Successfully"}</p>
          </>
        ) : selectedFile ? (
          <>
            <FileText className="w-10 h-10 text-blue-500 mb-3" />
            <p className="text-sm font-medium text-gray-700">{selectedFile.name}</p>
            <p className="text-xs text-gray-500">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
          </>
        ) : (
          <>
            <Upload className="w-10 h-10 text-gray-400 mb-3" />
            <p className="text-sm font-semibold text-gray-700">{label}</p>
            <p className="text-xs text-gray-500 mt-1">Drag and drop or click to browse</p>
            <p className="text-[10px] text-gray-400 mt-2 uppercase tracking-widest font-bold">PDF ONLY</p>
          </>
        )}
      </div>
    </div>
  );
}
