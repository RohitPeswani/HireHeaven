"use client";

import React, { useEffect, useState, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  FilterIcon,
  Search01Icon,
  Cancel01Icon,
  Briefcase01Icon,
  HelpCircleIcon
} from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader } from "@/components/loader";
import JobCard from "@/components/jobs/JobCard";
import FilterModal from "@/components/jobs/FilterModal";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { Job } from "@/types";
import { toast } from "react-toastify";

const JOB_API_BASE = process.env.NEXT_PUBLIC_JOB_SERVICE_URL || "http://localhost:5003";
const USER_API_BASE = process.env.NEXT_PUBLIC_USER_SERVICE_URL || "http://localhost:5002";

const JobsListingContent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, token } = useSelector((state: RootState) => state.auth);

  const { applications } = useSelector((state: RootState) => state.applications);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);

  // Current filters from URL
  const titleFilter = searchParams.get("title") || "";
  const locationFilter = searchParams.get("location") || "All Locations";

  const fetchJobs = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (titleFilter) params.append("title", titleFilter);
      if (locationFilter && locationFilter !== "All Locations") params.append("location", locationFilter);

      console.log("params ", params);

      const response = await fetch(`${JOB_API_BASE}/api/job/all?${params.toString()}`);
      const data = await response.json();

      if (data.success) {
        setJobs(data.jobs);
      } else {
        toast.error("Failed to fetch jobs");
      }
    } catch (error) {
      console.error("Fetch jobs error:", error);
      toast.error("An error occurred while fetching jobs");
    } finally {
      setLoading(false);
    }
  }, [titleFilter, locationFilter]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  const updateFilters = (newFilters: { title: string; location: string }) => {
    const params = new URLSearchParams(searchParams.toString());

    if (newFilters.title) params.set("title", newFilters.title);
    else params.delete("title");

    if (newFilters.location && newFilters.location !== "All Locations") params.set("location", newFilters.location);
    else params.delete("location");

    router.push(`/jobs?${params.toString()}`);
  };

  const removeFilter = (key: "title" | "location") => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete(key);
    router.push(`/jobs?${params.toString()}`);
  };

  const clearAllFilters = () => {
    router.push("/jobs");
  };

  const activeFiltersCount = (titleFilter ? 1 : 0) + (locationFilter !== "All Locations" ? 1 : 0);

  return (
    <div className="min-h-screen bg-gray-50/30 dark:bg-slate-950 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white leading-tight">
              Explore <span className="text-red-500">Opportunities</span>
            </h1>
            <p className="text-gray-500 dark:text-slate-400 font-medium">
              {jobs.length} {jobs.length === 1 ? "job" : "jobs"} found
            </p>
          </div>

          <Button
            onClick={() => setIsFilterModalOpen(true)}
            className="h-12 px-6 bg-[#0f172a] dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 text-white hover:bg-[#1e293b] rounded-xl font-bold flex items-center gap-2 group transition-all"
          >
            <HugeiconsIcon icon={FilterIcon} size={20} className="group-hover:rotate-12 transition-transform" />
            Filters
            {activeFiltersCount > 0 && (
              <Badge className="bg-red-500 text-white border-none ml-1 px-1.5 h-5 min-w-[20px] flex items-center justify-center">
                {activeFiltersCount}
              </Badge>
            )}
          </Button>
        </div>

        {/* Active Filters Display */}
        {activeFiltersCount > 0 && (
          <div className="flex flex-wrap items-center gap-3 bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800">
            <span className="text-sm font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider mr-2">Active Filters:</span>
            {titleFilter && (
              <Badge className="h-9 px-4 flex items-center gap-2 bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400 border-blue-100 dark:border-blue-900/30 rounded-full hover:bg-blue-100 dark:hover:bg-blue-950/30 transition-colors">
                <HugeiconsIcon icon={Search01Icon} size={14} />
                <span className="font-semibold">{titleFilter}</span>
                <button onClick={() => removeFilter("title")} className="p-0.5 hover:bg-blue-200 dark:hover:bg-blue-900/40 rounded-full transition-colors">
                  <HugeiconsIcon icon={Cancel01Icon} size={14} />
                </button>
              </Badge>
            )}
            {locationFilter !== "All Locations" && (
              <Badge className="h-9 px-4 flex items-center gap-2 bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400 border-blue-100 dark:border-blue-900/30 rounded-full hover:bg-blue-100 dark:hover:bg-blue-950/30 transition-colors">
                <HugeiconsIcon icon={FilterIcon} size={14} />
                <span className="font-semibold">{locationFilter}</span>
                <button onClick={() => removeFilter("location")} className="p-0.5 hover:bg-blue-200 dark:hover:bg-blue-900/40 rounded-full transition-colors">
                  <HugeiconsIcon icon={Cancel01Icon} size={14} />
                </button>
              </Badge>
            )}
            <button
              onClick={clearAllFilters}
              className="text-sm font-bold text-gray-500 hover:text-red-500 px-3 transition-colors ml-auto"
            >
              Clear All
            </button>
          </div>
        )}

        {/* Jobs Grid */}
        {loading ? (
          <div className="flex flex-col items-center justify-center min-h-[40vh] space-y-4">
            <Loader size={48} className="text-blue-600" />
            <p className="text-gray-500 font-medium animate-pulse">Searching for opening positions...</p>
          </div>
        ) : jobs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-12">
            {jobs.map((job) => {
              const isApplied = applications.some((app) => Number(app.job_id) === Number(job.job_id));
              return <JobCard key={job.job_id} job={job} isApplied={isApplied} />;
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center space-y-6 bg-white dark:bg-slate-900 rounded-3xl border-2 border-dashed border-gray-100 dark:border-slate-800">
            <div className="w-24 h-24 bg-gray-50 dark:bg-slate-950 rounded-3xl flex items-center justify-center text-gray-300 dark:text-slate-650">
              <HugeiconsIcon icon={HelpCircleIcon} size={48} />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">No jobs found</h2>
              <p className="text-gray-500 dark:text-slate-400 max-w-sm">We couldn't find any jobs matching your current filters. Try adjusting your search criteria.</p>
            </div>
            <Button
              onClick={clearAllFilters}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 rounded-xl h-12 font-bold"
            >
              Reset All Filters
            </Button>
          </div>
        )}
      </div>

      <FilterModal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        onApply={updateFilters}
        onClear={clearAllFilters}
        initialFilters={{ title: titleFilter, location: locationFilter }}
      />
    </div>
  );
};

const JobsPage = () => {
  return (
    <Suspense fallback={<Loader size={48} fullscreen />}>
      <JobsListingContent />
    </Suspense>
  );
};

export default JobsPage;