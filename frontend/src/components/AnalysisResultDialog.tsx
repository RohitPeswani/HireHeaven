"use client";

import React from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  ChartAverageIcon,
  Tick01Icon,
  AlertCircleIcon,
} from "@hugeicons/core-free-icons";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { ResumeAnalysis, ScoreDetail, Suggestion, SuggestionPriority } from "@/types";

// ─── Helpers ────────────────────────────────────────────────────────────────

function getScoreColor(score: number): string {
  if (score >= 80) return "text-green-600";
  if (score >= 60) return "text-yellow-500";
  return "text-red-500";
}

function getAtsScoreBackground(score: number): string {
  if (score >= 80) return "bg-green-50";
  if (score >= 60) return "bg-yellow-50";
  return "bg-red-50";
}

const PRIORITY_STYLES: Record<SuggestionPriority, string> = {
  high: "bg-red-100 text-red-700 border-red-200",
  medium: "bg-yellow-100 text-yellow-700 border-yellow-200",
  low: "bg-blue-100 text-blue-700 border-blue-200",
};

// ─── Sub-components ──────────────────────────────────────────────────────────

interface ScoreCardProps {
  atsScore: number;
}

function ScoreCard({ atsScore }: ScoreCardProps) {
  return (
    <div
      className={`rounded-xl px-6 py-5 text-center ${getAtsScoreBackground(atsScore)}`}
    >
      <p className="text-sm font-semibold text-gray-600">ATS Compatibility Score</p>
      <p className={`mt-2 text-6xl font-extrabold ${getScoreColor(atsScore)}`}>
        {atsScore}
      </p>
      <p className="mt-1 text-sm text-gray-500">out of 100</p>
    </div>
  );
}

interface ScoreBreakdownCardProps {
  label: string;
  detail: ScoreDetail;
}

function ScoreBreakdownCard({ label, detail }: ScoreBreakdownCardProps) {
  return (
    <div className="rounded-xl border border-gray-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 space-y-2 shadow-sm">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-gray-800 dark:text-slate-200">{label}</span>
        <span className={`text-sm font-bold ${getScoreColor(detail.score)}`}>
          {detail.score}%
        </span>
      </div>
      <Progress value={detail.score} className="h-1.5" />
      <p className="text-xs text-gray-500 dark:text-slate-400 leading-relaxed">{detail.feedback}</p>
    </div>
  );
}

interface StrengthsListProps {
  strengths: string[];
}

function StrengthsList({ strengths }: StrengthsListProps) {
  return (
    <div className="rounded-xl border border-green-100 dark:border-green-900/30 bg-green-50/50 dark:bg-green-950/10 p-5 space-y-3">
      <div className="flex items-center gap-2">
        <div className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-green-500 dark:border-green-400 text-green-500 dark:text-green-400">
          <HugeiconsIcon icon={Tick01Icon} size={13} />
        </div>
        <h3 className="font-bold text-gray-900 dark:text-white">What Your Resume Does Well</h3>
      </div>
      <ul className="space-y-2">
        {strengths.map((strength, idx) => (
          <li key={idx} className="flex items-start gap-2 text-sm text-gray-700 dark:text-slate-300">
            <HugeiconsIcon
              icon={Tick01Icon}
              size={14}
              className="mt-0.5 shrink-0 text-green-500 dark:text-green-400"
            />
            <span>{strength}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

interface SuggestionCardProps {
  suggestion: Suggestion;
}

function SuggestionCard({ suggestion }: SuggestionCardProps) {
  return (
    <div className="rounded-xl border border-gray-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 space-y-2 shadow-sm">
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm font-bold text-gray-800 dark:text-slate-200">{suggestion.category}</span>
        <span
          className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold capitalize ${PRIORITY_STYLES[suggestion.priority]}`}
        >
          {suggestion.priority}
        </span>
      </div>
      <p className="text-xs text-gray-600 dark:text-slate-400 leading-relaxed">
        <span className="font-semibold dark:text-slate-300">Issue: </span>
        {suggestion.issue}
      </p>
      <p className="text-xs text-gray-600 dark:text-slate-400 leading-relaxed">
        <span className="font-semibold dark:text-slate-300">Fix: </span>
        {suggestion.recommendation}
      </p>
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────

interface AnalysisResultDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  analysis: ResumeAnalysis;
}

const SCORE_BREAKDOWN_LABELS: Record<keyof ResumeAnalysis["scoreBreakdown"], string> = {
  formatting: "Formatting",
  keywords: "Keywords",
  structure: "Structure",
  readability: "Readability",
};

export default function AnalysisResultDialog({
  open,
  onOpenChange,
  analysis,
}: AnalysisResultDialogProps) {
  const breakdownEntries = Object.entries(analysis.scoreBreakdown) as [
    keyof ResumeAnalysis["scoreBreakdown"],
    ScoreDetail
  ][];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[620px] max-h-[90vh] rounded-2xl border border-gray-200 dark:border-slate-700 shadow-2xl p-0 overflow-hidden flex flex-col bg-white dark:bg-slate-900">
        {/* Sticky Header */}
        <div className="sticky top-0 z-10 flex items-center gap-3 border-b border-gray-100 dark:border-slate-800 bg-white dark:bg-slate-900 px-6 py-4">
          <HugeiconsIcon icon={ChartAverageIcon} size={20} className="text-blue-600 dark:text-blue-400 shrink-0" />
          <DialogTitle className="text-lg font-bold text-gray-900 dark:text-white">
            Your Resume Analysis
          </DialogTitle>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6 bg-gray-50/30 dark:bg-slate-950/50">
          {/* ATS Score */}
          <ScoreCard atsScore={analysis.atsScore} />

          {/* Summary */}
          <div className="rounded-xl border border-gray-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm">
            <p className="text-sm leading-relaxed text-gray-700 dark:text-slate-300">{analysis.summary}</p>
          </div>

          {/* Score Breakdown */}
          <section aria-label="Detailed Score Breakdown" className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-base">📈</span>
              <h3 className="text-base font-bold text-gray-900 dark:text-white">Detailed Score Breakdown</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {breakdownEntries.map(([key, detail]) => (
                <ScoreBreakdownCard
                  key={key}
                  label={SCORE_BREAKDOWN_LABELS[key]}
                  detail={detail}
                />
              ))}
            </div>
          </section>

          {/* Strengths */}
          <section aria-label="Resume Strengths">
            <StrengthsList strengths={analysis.strengths} />
          </section>

          {/* Recommendations */}
          {analysis.suggestions.length > 0 && (
            <section aria-label="Recommendations for Improvement" className="space-y-3">
              <div className="flex items-center gap-2">
                <HugeiconsIcon
                  icon={AlertCircleIcon}
                  size={20}
                  className="text-amber-500"
                />
                <h3 className="text-base font-bold text-gray-900 dark:text-white">
                  Recommendations for Improvement
                </h3>
              </div>
              <div className="space-y-3">
                {analysis.suggestions.map((suggestion, idx) => (
                  <SuggestionCard key={idx} suggestion={suggestion} />
                ))}
              </div>
            </section>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
