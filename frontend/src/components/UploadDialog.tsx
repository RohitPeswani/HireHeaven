"use client";

import React, { useCallback, useRef, useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  FileUploadIcon,
  Delete02Icon,
  SparklesIcon,
  File01Icon,
} from "@hugeicons/core-free-icons";
import { toast } from "react-toastify";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ResumeAnalysis, ResumeAnalysisResponse } from "@/types";

const MAX_FILE_SIZE_MB = 5;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;
const ACCEPTED_MIME = "application/pdf";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_UTILS_SERVICE_URL || "http://localhost:5001";

interface UploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: (data: ResumeAnalysis) => void;
}

/**
 * Validates file: must be PDF and within size limit.
 * Returns an error string or null if valid.
 */
function validateFile(file: File): string | null {
  if (file.type !== ACCEPTED_MIME) {
    return "Only PDF files are accepted. Please upload a .pdf file.";
  }
  if (file.size > MAX_FILE_SIZE_BYTES) {
    return `File size exceeds ${MAX_FILE_SIZE_MB} MB. Please upload a smaller file.`;
  }
  return null;
}

export default function UploadDialog({
  open,
  onOpenChange,
  onSuccess,
}: UploadDialogProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = useCallback((file: File) => {
    const error = validateFile(file);
    if (error) {
      toast.error(error);
      return;
    }
    setSelectedFile(file);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileSelect(file);
    // Reset input value so same file can be re-selected after removal
    e.target.value = "";
  };

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files?.[0];
      if (file) handleFileSelect(file);
    },
    [handleFileSelect]
  );

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  const handleRemoveFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleAnalyze = async () => {
    if (!selectedFile) return;

    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append("file", selectedFile);

      const response = await fetch(
        `${API_BASE_URL}/api/utils/analyze-resume`,
        { method: "POST", body: formData }
      );

      const result: ResumeAnalysisResponse = await response.json();

      if (result.success && result.data) {
        toast.success("Resume analyzed successfully!");
        onSuccess(result.data);
        // Reset state for next use
        setSelectedFile(null);
        onOpenChange(false);
      } else {
        toast.error(result.error || "Failed to analyze resume. Please try again.");
      }
    } catch {
      toast.error("Unable to connect to the analysis service. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      setSelectedFile(null);
      setIsDragging(false);
    }
    onOpenChange(nextOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[520px] rounded-2xl border border-gray-200 dark:border-slate-700 shadow-2xl bg-white dark:bg-slate-900 p-6 space-y-5">
        <DialogHeader className="space-y-1">
          <div className="flex items-center gap-2">
            <HugeiconsIcon
              icon={File01Icon}
              size={22}
              className="text-red-500 dark:text-red-400"
            />
            <DialogTitle className="text-xl font-bold text-gray-900 dark:text-white">
              Upload Your Resume
            </DialogTitle>
          </div>
          <DialogDescription className="text-sm text-gray-500 dark:text-slate-400">
            Upload your resume in PDF format to get an instant ATS compatibility
            analysis
          </DialogDescription>
        </DialogHeader>

        {/* Drop Zone */}
        <div
          role="button"
          aria-label="Upload resume file area"
          tabIndex={0}
          onClick={() => !selectedFile && fileInputRef.current?.click()}
          onKeyDown={(e) =>
            e.key === "Enter" && !selectedFile && fileInputRef.current?.click()
          }
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={`
            relative flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed
            px-6 py-10 transition-colors
            ${isDragging ? "border-blue-400 bg-blue-50 dark:bg-blue-950/20" : "border-blue-200 dark:border-blue-900/30 bg-blue-50/30 dark:bg-blue-950/10"}
            ${!selectedFile ? "cursor-pointer hover:border-blue-400 dark:hover:border-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/20" : "cursor-default"}
          `}
        >
          <input
            ref={fileInputRef}
            id="resume-file-input"
            type="file"
            accept=".pdf,application/pdf"
            className="hidden"
            onChange={handleInputChange}
          />

          {selectedFile ? (
            /* Selected File Display */
            <div className="flex w-full items-center justify-between gap-3 rounded-lg bg-white dark:bg-slate-950 border border-gray-200 dark:border-slate-700 px-4 py-3 shadow-sm">
              <div className="flex items-center gap-3 min-w-0">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-red-50 dark:bg-red-950/20">
                  <HugeiconsIcon icon={File01Icon} size={18} className="text-red-500 dark:text-red-400" />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-gray-800 dark:text-slate-200">
                    {selectedFile.name}
                  </p>
                  <p className="text-xs text-gray-400 dark:text-slate-500">
                    {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                  </p>
                </div>
              </div>
              <button
                aria-label="Remove selected file"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemoveFile();
                }}
                className="shrink-0 rounded-full p-1.5 text-gray-400 dark:text-slate-500 transition-colors hover:bg-red-50 dark:hover:bg-red-950/20 hover:text-red-500 dark:hover:text-red-400"
              >
                <HugeiconsIcon icon={Delete02Icon} size={16} />
              </button>
            </div>
          ) : (
            /* Upload Prompt */
            <>
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-950/20">
                <HugeiconsIcon icon={FileUploadIcon} size={28} className="text-blue-500 dark:text-blue-400" />
              </div>
              <div className="text-center">
                <p className="text-sm font-semibold text-gray-700 dark:text-slate-300">
                  Click to upload your resume
                </p>
                <p className="text-xs text-gray-400 dark:text-slate-500 mt-1">
                  PDF format only, maximum {MAX_FILE_SIZE_MB}MB
                </p>
              </div>
            </>
          )}
        </div>

        {/* Analyze Button */}
        <Button
          onClick={handleAnalyze}
          disabled={!selectedFile || isLoading}
          className="w-full h-11 rounded-xl bg-[#0f172a] dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 font-semibold text-white hover:bg-[#1e293b] disabled:opacity-50"
        >
          {isLoading ? (
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/20 border-t-white" />
              <span>Analyzing Resume...</span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <HugeiconsIcon icon={SparklesIcon} size={16} className="text-blue-400" />
              <span>Analyze Resume</span>
            </div>
          )}
        </Button>
      </DialogContent>
    </Dialog>
  );
}
