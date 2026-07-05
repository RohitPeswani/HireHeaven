"use client";

import React, { useRef } from "react";
import { User } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { HugeiconsIcon } from "@hugeicons/react";
import { File01Icon, ViewIcon } from "@hugeicons/core-free-icons";
import { toast } from "react-toastify";
import { Loader } from "../loader";

interface ResumeSectionProps {
  user: User | null;
  onUpload?: (file: File) => Promise<void>;
  loading?: boolean;
  isReadOnly?: boolean;
}

const ResumeSection: React.FC<ResumeSectionProps> = ({ 
  user, 
  onUpload, 
  loading = false,
  isReadOnly = false 
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validation
    if (file.type !== "application/pdf") {
      toast.error("Only PDF files are allowed");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size must not exceed 5 MB");
      return;
    }

    try {
      if (onUpload) {
        await onUpload(file);
        toast.success("Resume updated successfully");
      }
    } catch (err) {
      toast.error("Failed to upload resume");
    }
  };

  const resumeFilename = user?.resume?.split("/").pop() || "Resume Document";

  return (
    <div className="mt-8 space-y-4">
      <div className="flex items-center gap-2 px-2 text-gray-900 dark:text-white font-semibold">
          <HugeiconsIcon icon={File01Icon} size={20} className="text-blue-600 dark:text-blue-400" />
          <span>Resume</span>
      </div>

      <Card className="border shadow-none">
        <CardContent className="p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          {loading ? <Loader size={18} text={"Uploading resume"} />:<><div className="flex items-center gap-4 w-full sm:w-auto">
            <div className="p-3 bg-red-50 dark:bg-red-950/20 rounded-lg">
              <HugeiconsIcon icon={File01Icon} size={24} className="text-red-500 dark:text-red-400" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-gray-900 dark:text-slate-200 truncate max-w-[200px] sm:max-w-xs" title={resumeFilename}>
                {resumeFilename}
              </p>
              {user?.resume && (
                <a 
                  href={user.resume} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-xs text-blue-600 font-medium hover:underline flex items-center gap-1"
                >
                  <HugeiconsIcon icon={ViewIcon} size={12} />
                  View Resume PDF
                </a>
              )}
            </div>
          </div>

          <div className="w-full sm:w-auto">
            <input 
              type="file" 
              className="hidden" 
              ref={fileInputRef} 
              onChange={handleFileChange}
              accept=".pdf"
            />
            {!isReadOnly && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                className="w-full sm:w-auto px-6 font-medium hover:bg-gray-50 dark:hover:bg-slate-800 border-gray-200 dark:border-slate-700 dark:text-slate-300"
              >
                Update
              </Button>
            )}
          </div> </>}
        </CardContent>
      </Card>
    </div>
  );
};

export default ResumeSection;
