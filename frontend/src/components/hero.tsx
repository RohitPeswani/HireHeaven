"use client";

import React, { useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowUpRight01Icon,
  Search01Icon,
  Tick01Icon,
} from "@hugeicons/core-free-icons";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

/**
 * Hero component for the HireHeaven landing page.
 * Implements a clean, centered layout with a natural language search input
 * and AI-powered filter extraction.
 */
export default function Hero() {
  const router = useRouter();
  const [queryText, setQueryText] = useState("");
  const [loading, setLoading] = useState(false);

  const examples = [
    "Looking for remote React internships in Ahmedabad above 8 LPA",
    "high paying React jobs in Mumbai",
    "WFH full-time jobs in Pune between 8 and 12 LPA"
  ];

  const handleNormalSearch = () => {
    if (!queryText.trim()) {
      toast.info("Please enter a search query first.");
      return;
    }
    router.push(`/jobs?title=${encodeURIComponent(queryText.trim())}`);
  };

  const handleAISearch = async () => {
    if (!queryText.trim()) {
      toast.info("Please describe your ideal job first.");
      return;
    }
    setLoading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_UTILS_SERVICE_URL || 'http://localhost:5001'}/api/utils/job-query-extract`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ query: queryText.trim() })
      });

      const data = await response.json();

      if (data.success && data.filters) {
        const filters = data.filters;
        
        // Map min_salary (numeric INR) to LPA filter string
        let salaryFilterStr = "";
        if (filters.min_salary) {
          const lpa = filters.min_salary / 100000;
          if (lpa >= 20) salaryFilterStr = "20+ LPA";
          else if (lpa >= 15) salaryFilterStr = "15–20 LPA";
          else if (lpa >= 10) salaryFilterStr = "10–15 LPA";
          else if (lpa >= 6) salaryFilterStr = "6–10 LPA";
          else if (lpa >= 3) salaryFilterStr = "3–6 LPA";
          else if (lpa > 0) salaryFilterStr = "0–3 LPA";
        }

        // Construct query parameters
        const params = new URLSearchParams();
        if (filters.title) params.append("title", filters.title);
        else if (filters.role) params.append("title", filters.role);
        
        if (filters.state) params.append("state", filters.state);
        if (filters.city) params.append("city", filters.city);
        if (salaryFilterStr) params.append("salary", salaryFilterStr);
        if (filters.job_type) params.append("job_type", filters.job_type);
        if (filters.work_location) params.append("work_location", filters.work_location);

        router.push(`/jobs?${params.toString()}`);
        toast.success("AI filters extracted successfully!");
      } else {
        toast.error(data.message || "Failed to analyze your query. Try normal search.");
      }
    } catch (error: any) {
      console.error("AI Search query extract error:", error);
      toast.error("Unable to connect to AI analysis service.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="relative overflow-hidden bg-white dark:bg-slate-950 pt-20 pb-24 lg:pt-28 lg:pb-36">
      {/* Background glow blobs */}
      <div className="absolute -top-32 -right-32 -z-10 h-[500px] w-[500px] rounded-full bg-blue-100/30 dark:bg-blue-950/10 blur-[128px]" />
      <div className="absolute -bottom-32 -left-32 -z-10 h-[500px] w-[500px] rounded-full bg-red-50/30 dark:bg-red-950/5 blur-[128px]" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl">
        <div className="flex flex-col items-center text-center space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-700 ease-out">
          
          {/* Top Badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-100 dark:border-blue-900/40 bg-blue-50/50 dark:bg-blue-950/20 px-4 py-1.5 text-xs sm:text-sm font-semibold text-blue-700 dark:text-blue-400 transition-colors hover:bg-blue-100/50 dark:hover:bg-blue-950/30 shadow-sm">
            <HugeiconsIcon icon={ArrowUpRight01Icon} size={14} className="text-blue-600 dark:text-blue-400" />
            <span>#1 AI-Powered Job Platform in India</span>
          </div>

          {/* Main Heading */}
          <div className="space-y-6 max-w-4xl">
            <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-5xl md:text-6xl lg:text-7xl leading-tight">
              Find Your Dream Job at{" "}
              <span className="block sm:inline">
                <span className="text-blue-600">Hire</span>
                <span className="text-red-500">Heaven</span>
              </span>
            </h1>
            <p className="mx-auto max-w-2xl text-lg leading-relaxed text-gray-500 dark:text-slate-400 sm:text-xl md:text-2xl font-light">
              Connect with top employers and discover opportunities that match your
              skills. Build your career with our next-generation intelligent job search.
            </p>
          </div>

          {/* The Prominent Search Bar */}
          <div className="w-full max-w-2xl space-y-2.5">
            <div className="relative w-full bg-white dark:bg-slate-900 rounded-full border border-gray-200 dark:border-slate-800 shadow-lg shadow-blue-900/5 focus-within:ring-2 focus-within:ring-blue-500/40 focus-within:border-blue-500 transition-all p-1.5 flex items-center gap-2">
              <div className="relative flex-1 flex items-center gap-2.5 pl-3.5 min-w-0">
                <HugeiconsIcon icon={Search01Icon} className="text-gray-400 dark:text-slate-500 h-4.5 w-4.5 flex-shrink-0" />
                <input
                  type="text"
                  value={queryText}
                  onChange={(e) => setQueryText(e.target.value)}
                  placeholder='Describe your ideal job... (e.g., "remote React internships in Ahmedabad above 8 LPA")'
                  className="w-full bg-transparent border-none text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-500 outline-none text-xs sm:text-sm md:text-base py-1.5 min-w-0"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAISearch();
                    }
                  }}
                />
              </div>
              
              <div className="flex-shrink-0 pr-0.5">
                <Button
                  onClick={handleAISearch}
                  disabled={loading}
                  type="button"
                  className="h-9 sm:h-10 px-4 sm:px-5 rounded-full bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-700 hover:to-violet-700 text-white font-bold transition-all shadow-md shadow-blue-500/10 hover:shadow-lg active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2 whitespace-nowrap text-xs sm:text-sm"
                >
                  {loading ? (
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  ) : (
                    <span>✨ Search with AI</span>
                  )}
                </Button>
              </div>
            </div>

            {/* Clickable Examples / Suggested Queries */}
            <div className="flex flex-wrap items-center justify-center gap-2 text-xs sm:text-sm pt-2">
              <span className="text-gray-400 dark:text-slate-500 font-medium">Try:</span>
              {examples.map((ex, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setQueryText(ex)}
                  className="px-3.5 py-1.5 rounded-full border border-gray-200 dark:border-slate-800 hover:border-blue-500 dark:hover:border-blue-400 bg-gray-50/55 hover:bg-blue-50/30 dark:bg-slate-900/30 dark:hover:bg-blue-950/20 text-gray-600 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 font-medium transition-all text-left cursor-pointer"
                >
                  {ex.length > 40 ? `${ex.substring(0, 40)}...` : ex}
                </button>
              ))}
            </div>
          </div>

          {/* Stats Section (Centered) */}
          <div className="flex flex-wrap items-center justify-center gap-12 sm:gap-20 pt-8 max-w-3xl">
            {[
              { label: "Active Jobs", value: "10k+" },
              { label: "Companies", value: "5k+" },
              { label: "Job Seekers", value: "50k+" },
            ].map((stat) => (
              <div key={stat.label} className="flex flex-col items-center gap-1.5 select-none">
                <span className="text-3xl font-extrabold text-blue-600 dark:text-blue-400 tracking-tight sm:text-4xl">
                  {stat.value}
                </span>
                <span className="text-xs font-semibold text-gray-400 dark:text-slate-500 uppercase tracking-wider">
                  {stat.label}
                </span>
              </div>
            ))}
          </div>

          {/* Bottom Features List (Centered) */}
          <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-4 pt-8 border-t border-gray-150 dark:border-slate-900 max-w-2xl w-full">
            {[
              "Free to use",
              "Verified employers",
              "Secure platform",
            ].map((feature) => (
              <div key={feature} className="flex items-center gap-2 select-none">
                <div className="flex h-5.5 w-5.5 items-center justify-center rounded-full bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 transition-colors">
                  <HugeiconsIcon icon={Tick01Icon} size={12} />
                </div>
                <span className="text-sm font-semibold text-gray-600 dark:text-slate-400">
                  {feature}
                </span>
              </div>
            ))}
          </div>

        </div>
      </div>
    </section>
  );
}