"use client";

import React, { useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { File01Icon, ArrowRight01Icon } from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import UploadDialog from "@/components/UploadDialog";
import AnalysisResultDialog from "@/components/AnalysisResultDialog";
import { ResumeAnalysis } from "@/types";

/**
 * Resume Analyzer landing section.
 * Renders the section heading and the "Analyze My Resume" CTA.
 * Manages the upload dialog and the analysis result dialog.
 */
export default function ResumeAnalyzer() {
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<ResumeAnalysis | null>(null);
  const [isResultOpen, setIsResultOpen] = useState(false);

  const handleAnalysisSuccess = (data: ResumeAnalysis) => {
    setAnalysisResult(data);
    setIsResultOpen(true);
  };

  return (
    <section className="relative overflow-hidden bg-white dark:bg-slate-950 py-20 lg:py-32">
      {/* Subtle dot-grid background */}
      <div className="absolute top-0 left-1/2 -z-10 h-full w-full -translate-x-1/2 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] dark:bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)]" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center text-center space-y-6 max-w-3xl mx-auto">

          {/* Badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-red-200 dark:border-red-900/40 bg-white dark:bg-slate-900 px-3 py-1 text-xs font-semibold text-red-500 dark:text-red-400 shadow-sm">
            <HugeiconsIcon icon={File01Icon} size={14} />
            <span>AI-Powered ATS Analysis</span>
          </div>

          {/* Heading */}
          <div className="space-y-4">
            <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-4xl lg:text-5xl">
              Optimize Your Resume for ATS
            </h2>
            <p className="text-lg text-gray-500 dark:text-slate-400">
              Get instant feedback on your resume&apos;s compatibility with Applicant Tracking Systems
            </p>
          </div>

          {/* CTA Button */}
          <Button
            size="lg"
            className="group h-14 rounded-xl bg-[#0f172a] dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 px-8 py-4 transition-all hover:bg-[#1e293b]"
            onClick={() => setIsUploadOpen(true)}
          >
            <div className="flex items-center gap-2">
              <HugeiconsIcon icon={File01Icon} size={18} className="text-gray-300 dark:text-slate-600" />
              <span className="font-semibold text-white dark:text-slate-900">Analyze My Resume</span>
              <HugeiconsIcon
                icon={ArrowRight01Icon}
                size={18}
                className="text-gray-400 dark:text-slate-500 transition-transform group-hover:translate-x-1"
              />
            </div>
          </Button>
        </div>
      </div>

      {/* Upload Dialog */}
      <UploadDialog
        open={isUploadOpen}
        onOpenChange={setIsUploadOpen}
        onSuccess={handleAnalysisSuccess}
      />

      {/* Result Dialog */}
      {analysisResult && (
        <AnalysisResultDialog
          open={isResultOpen}
          onOpenChange={setIsResultOpen}
          analysis={analysisResult}
        />
      )}
    </section>
  );
}