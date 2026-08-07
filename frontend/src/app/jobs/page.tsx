"use client";

import React, { useEffect, useState, useCallback, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  FilterIcon,
  Search01Icon,
  Cancel01Icon,
  HelpCircleIcon
} from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader } from "@/components/loader";
import JobCard from "@/components/jobs/JobCard";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { Job } from "@/types";
import { toast } from "react-toastify";
import { FilterSidebar } from "@/components/jobs/FilterSidebar";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

const JOB_API_BASE = process.env.NEXT_PUBLIC_JOB_SERVICE_URL || "http://localhost:5003";

const JobsListingContent = () => {
  const searchParams = useSearchParams();
  const { applications } = useSelector((state: RootState) => state.applications);

  const [allJobs, setAllJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter States
  const [searchQuery, setSearchQuery] = useState(searchParams.get("title") || "");
  const [stateFilter, setStateFilter] = useState(searchParams.get("state") || "");
  const [cityFilter, setCityFilter] = useState(searchParams.get("city") || "");
  const [salaryFilter, setSalaryFilter] = useState(searchParams.get("salary") || "");
  const [jobTypesFilter, setJobTypesFilter] = useState<string[]>([]);
  const [workModesFilter, setWorkModesFilter] = useState<string[]>([]);
  const [datePostedFilter, setDatePostedFilter] = useState("");
  const [sortByFilter, setSortByFilter] = useState("newest");

  // Pagination States
  const [page, setPage] = useState(1);
  const limit = 6; // Set limit to 6 for a balanced paginated grid

  // Fetch all active jobs once on mount
  const fetchAllJobs = useCallback(async () => {
    setLoading(true);
    try {
      // Request a high limit to get all active jobs in a single payload
      const response = await fetch(`${JOB_API_BASE}/api/job/all?limit=100`);
      const data = await response.json();

      if (data.success) {
        setAllJobs(data.jobs || []);
      } else {
        toast.error("Failed to fetch jobs");
      }
    } catch (error) {
      console.error("Fetch jobs error:", error);
      toast.error("An error occurred while fetching jobs");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAllJobs();
  }, [fetchAllJobs]);

  // Reset to page 1 whenever search query or filters change
  useEffect(() => {
    setPage(1);
  }, [searchQuery, stateFilter, cityFilter, salaryFilter, jobTypesFilter, workModesFilter, datePostedFilter, sortByFilter]);

  // Clear all filters handler
  const clearAllFilters = () => {
    setSearchQuery("");
    setStateFilter("");
    setCityFilter("");
    setSalaryFilter("");
    setJobTypesFilter([]);
    setWorkModesFilter([]);
    setDatePostedFilter("");
  };

  const hasActiveFilters = useMemo(() => {
    return !!(
      searchQuery ||
      stateFilter ||
      cityFilter ||
      salaryFilter ||
      jobTypesFilter.length > 0 ||
      workModesFilter.length > 0 ||
      datePostedFilter
    );
  }, [searchQuery, stateFilter, cityFilter, salaryFilter, jobTypesFilter, workModesFilter, datePostedFilter]);

  // Clientside filtering, sorting, and pagination logic
  const filteredJobs = useMemo(() => {
    let result = [...allJobs];

    // 1. Search Query (Global Search matching title, role, or company name)
    if (searchQuery) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (job) =>
          job.title?.toLowerCase().includes(q) ||
          job.role?.toLowerCase().includes(q) ||
          job.company_name?.toLowerCase().includes(q)
      );
    }

    // 2. State Filter
    if (stateFilter) {
      result = result.filter((job) => job.state?.toLowerCase() === stateFilter.toLowerCase());
    }

    // 3. City Filter
    if (cityFilter) {
      result = result.filter((job) => job.city?.toLowerCase() === cityFilter.toLowerCase());
    }

    // 4. Salary Filter
    if (salaryFilter) {
      result = result.filter((job) => {
        // Handle LPA conversion if absolute number is provided
        const lpa = job.salary <= 100 ? job.salary : job.salary / 100000;
        if (salaryFilter === "0–3 LPA") return lpa >= 0 && lpa < 3;
        if (salaryFilter === "3–6 LPA") return lpa >= 3 && lpa < 6;
        if (salaryFilter === "6–10 LPA") return lpa >= 6 && lpa < 10;
        if (salaryFilter === "10–15 LPA") return lpa >= 10 && lpa < 15;
        if (salaryFilter === "15–20 LPA") return lpa >= 15 && lpa < 20;
        if (salaryFilter === "20+ LPA") return lpa >= 20;
        return true;
      });
    }

    // 5. Job Type Filter (Checkbox list)
    if (jobTypesFilter.length > 0) {
      result = result.filter((job) => jobTypesFilter.includes(job.job_type));
    }

    // 6. Work Mode Filter (Checkbox list)
    if (workModesFilter.length > 0) {
      result = result.filter((job) => workModesFilter.includes(job.work_location));
    }

    // 7. Date Posted Filter (Radio buttons)
    if (datePostedFilter) {
      const now = Date.now();
      const intervals: Record<string, number> = {
        "24h": 24 * 60 * 60 * 1000,
        "3d": 3 * 24 * 60 * 60 * 1000,
        "7d": 7 * 24 * 60 * 60 * 1000,
        "30d": 30 * 24 * 60 * 60 * 1000
      };
      const ms = intervals[datePostedFilter];
      if (ms) {
        result = result.filter(
          (job) => now - new Date(job.created_at).getTime() <= ms
        );
      }
    }

    // 8. Sorting
    if (sortByFilter === "newest") {
      result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    } else if (sortByFilter === "oldest") {
      result.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
    } else if (sortByFilter === "salary_high") {
      result.sort((a, b) => {
        const diff = b.salary - a.salary;
        if (diff !== 0) return diff;
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime(); // secondary sort
      });
    } else if (sortByFilter === "salary_low") {
      result.sort((a, b) => {
        const diff = a.salary - b.salary;
        if (diff !== 0) return diff;
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime(); // secondary sort
      });
    } else if (sortByFilter === "title_asc") {
      result.sort((a, b) => {
        const diff = a.title.localeCompare(b.title);
        if (diff !== 0) return diff;
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime(); // secondary sort
      });
    }

    return result;
  }, [allJobs, searchQuery, stateFilter, cityFilter, salaryFilter, jobTypesFilter, workModesFilter, datePostedFilter, sortByFilter]);

  // Paginated subset calculations
  const totalJobsCount = filteredJobs.length;
  const totalPages = Math.ceil(totalJobsCount / limit);

  const paginatedJobs = useMemo(() => {
    const start = (page - 1) * limit;
    return filteredJobs.slice(start, start + limit);
  }, [filteredJobs, page, limit]);

  const X = totalJobsCount === 0 ? 0 : (page - 1) * limit + 1;
  const Y = Math.min(page * limit, totalJobsCount);
  const Z = totalJobsCount;

  // Generate simple sequential list of page numbers
  const pageNumbers = useMemo(() => {
    const pages = [];
    for (let i = 1; i <= totalPages; i++) {
      pages.push(i);
    }
    return pages;
  }, [totalPages]);

  return (
    <div className="min-h-screen bg-gray-50/30 dark:bg-slate-950 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">

        {/* Header Title Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white leading-tight tracking-tight">
              Explore <span className="text-red-500">Opportunities</span>
            </h1>
            <p className="text-gray-550 dark:text-slate-400 font-semibold text-sm">
              {totalJobsCount} {totalJobsCount === 1 ? "job" : "jobs"} match your current criteria
            </p>
          </div>
        </div>

        {/* Global Search Bar & Mobile Filters trigger */}
        <div className="flex gap-4">
          <div className="relative flex-1">
            <HugeiconsIcon
              icon={Search01Icon}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-500 h-5 w-5"
            />
            <input
              type="text"
              placeholder="Search jobs, roles, or companies..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-12 pl-12 pr-4 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 text-gray-900 dark:text-white rounded-2xl shadow-xs focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none text-sm font-medium transition-all"
            />
          </div>

          <Sheet>
            <SheetTrigger render={<Button
              className="lg:hidden h-12 px-6 bg-gray-900 dark:bg-white text-white dark:text-slate-900 hover:bg-gray-800 dark:hover:bg-slate-100 rounded-2xl font-bold flex items-center gap-2 group transition-all shrink-0 cursor-pointer"
            >
              <HugeiconsIcon icon={FilterIcon} size={20} className="group-hover:rotate-12 transition-transform" />
              Filters
            </Button>}>
            </SheetTrigger>
            <SheetContent side="left" className="w-[300px] sm:w-[350px] p-0 bg-white dark:bg-slate-900 border-r border-gray-100 dark:border-slate-800 overflow-y-auto">
              <div className="p-6">
                <FilterSidebar
                  state={stateFilter}
                  onStateChange={setStateFilter}
                  city={cityFilter}
                  onCityChange={setCityFilter}
                  salary={salaryFilter}
                  onSalaryChange={setSalaryFilter}
                  jobTypes={jobTypesFilter}
                  onJobTypesChange={setJobTypesFilter}
                  workModes={workModesFilter}
                  onWorkModesChange={setWorkModesFilter}
                  datePosted={datePostedFilter}
                  onDatePostedChange={setDatePostedFilter}
                  sortBy={sortByFilter}
                  onSortByChange={setSortByFilter}
                />
              </div>
            </SheetContent>
          </Sheet>
        </div>

        {/* Main Content Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">

          {/* Sidebar Filter Panel (visible on desktop) */}
          <div className="hidden lg:block lg:col-span-1">
            <FilterSidebar
              state={stateFilter}
              onStateChange={setStateFilter}
              city={cityFilter}
              onCityChange={setCityFilter}
              salary={salaryFilter}
              onSalaryChange={setSalaryFilter}
              jobTypes={jobTypesFilter}
              onJobTypesChange={setJobTypesFilter}
              workModes={workModesFilter}
              onWorkModesChange={setWorkModesFilter}
              datePosted={datePostedFilter}
              onDatePostedChange={setDatePostedFilter}
              sortBy={sortByFilter}
              onSortByChange={setSortByFilter}
            />
          </div>

          {/* Jobs Listing Column */}
          <div className="col-span-1 lg:col-span-3 space-y-6">

            {/* Active Filter Badges */}
            {hasActiveFilters && (
              <div className="flex flex-wrap items-center gap-2 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-gray-100/80 dark:border-slate-800 shadow-xs animate-in fade-in duration-300">
                <span className="text-xs font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider mr-2 select-none">
                  Active Filters:
                </span>
                {searchQuery && (
                  <Badge className="h-8 px-3 flex items-center gap-1.5 bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400 border border-blue-100/50 dark:border-blue-900/30 rounded-xl hover:bg-blue-100 transition-colors">
                    <span className="font-semibold text-xs">{searchQuery}</span>
                    <button onClick={() => setSearchQuery("")} className="p-0.5 hover:bg-blue-200 dark:hover:bg-blue-900/40 rounded-full transition-colors cursor-pointer">
                      <HugeiconsIcon icon={Cancel01Icon} size={12} />
                    </button>
                  </Badge>
                )}
                {stateFilter && (
                  <Badge className="h-8 px-3 flex items-center gap-1.5 bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400 border border-blue-100/50 dark:border-blue-900/30 rounded-xl hover:bg-blue-100 transition-colors">
                    <span className="font-semibold text-xs">{stateFilter}</span>
                    <button onClick={() => {
                      setStateFilter("");
                      setCityFilter(""); // Reset city as well
                    }} className="p-0.5 hover:bg-blue-200 dark:hover:bg-blue-900/40 rounded-full transition-colors cursor-pointer">
                      <HugeiconsIcon icon={Cancel01Icon} size={12} />
                    </button>
                  </Badge>
                )}
                {cityFilter && (
                  <Badge className="h-8 px-3 flex items-center gap-1.5 bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400 border border-blue-100/50 dark:border-blue-900/30 rounded-xl hover:bg-blue-100 transition-colors">
                    <span className="font-semibold text-xs">{cityFilter}</span>
                    <button onClick={() => setCityFilter("")} className="p-0.5 hover:bg-blue-200 dark:hover:bg-blue-900/40 rounded-full transition-colors cursor-pointer">
                      <HugeiconsIcon icon={Cancel01Icon} size={12} />
                    </button>
                  </Badge>
                )}
                {salaryFilter && (
                  <Badge className="h-8 px-3 flex items-center gap-1.5 bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400 border border-blue-100/50 dark:border-blue-900/30 rounded-xl hover:bg-blue-100 transition-colors">
                    <span className="font-semibold text-xs">{salaryFilter}</span>
                    <button onClick={() => setSalaryFilter("")} className="p-0.5 hover:bg-blue-200 dark:hover:bg-blue-900/40 rounded-full transition-colors cursor-pointer">
                      <HugeiconsIcon icon={Cancel01Icon} size={12} />
                    </button>
                  </Badge>
                )}
                {jobTypesFilter.map((type) => (
                  <Badge key={type} className="h-8 px-3 flex items-center gap-1.5 bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400 border border-blue-100/50 dark:border-blue-900/30 rounded-xl hover:bg-blue-100 transition-colors">
                    <span className="font-semibold text-xs">{type}</span>
                    <button onClick={() => setJobTypesFilter(jobTypesFilter.filter(t => t !== type))} className="p-0.5 hover:bg-blue-200 dark:hover:bg-blue-900/40 rounded-full transition-colors cursor-pointer">
                      <HugeiconsIcon icon={Cancel01Icon} size={12} />
                    </button>
                  </Badge>
                ))}
                {workModesFilter.map((mode) => (
                  <Badge key={mode} className="h-8 px-3 flex items-center gap-1.5 bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400 border border-blue-100/50 dark:border-blue-900/30 rounded-xl hover:bg-blue-100 transition-colors">
                    <span className="font-semibold text-xs">{mode}</span>
                    <button onClick={() => setWorkModesFilter(workModesFilter.filter(m => m !== mode))} className="p-0.5 hover:bg-blue-200 dark:hover:bg-blue-900/40 rounded-full transition-colors cursor-pointer">
                      <HugeiconsIcon icon={Cancel01Icon} size={12} />
                    </button>
                  </Badge>
                ))}
                {datePostedFilter && (
                  <Badge className="h-8 px-3 flex items-center gap-1.5 bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400 border border-blue-100/50 dark:border-blue-900/30 rounded-xl hover:bg-blue-100 transition-colors">
                    <span className="font-semibold text-xs">
                      {datePostedFilter === "24h" && "Last 24 hours"}
                      {datePostedFilter === "3d" && "Last 3 days"}
                      {datePostedFilter === "7d" && "Last 7 days"}
                      {datePostedFilter === "30d" && "Last 30 days"}
                    </span>
                    <button onClick={() => setDatePostedFilter("")} className="p-0.5 hover:bg-blue-200 dark:hover:bg-blue-900/40 rounded-full transition-colors cursor-pointer">
                      <HugeiconsIcon icon={Cancel01Icon} size={12} />
                    </button>
                  </Badge>
                )}
                <button
                  onClick={clearAllFilters}
                  className="text-xs font-bold text-gray-500 hover:text-red-505 px-3 py-1 cursor-pointer transition-colors ml-auto hover:text-red-550"
                >
                  Clear All
                </button>
              </div>
            )}

            {/* Grid of Job Cards */}
            {loading ? (
              <div className="flex flex-col items-center justify-center min-h-[40vh] space-y-4">
                <Loader size={48} className="text-blue-600" />
                <p className="text-gray-550 font-semibold animate-pulse text-sm">Searching for open positions...</p>
              </div>
            ) : paginatedJobs.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6 pb-6">
                {paginatedJobs.map((job) => {
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
                  <p className="text-gray-500 dark:text-slate-400 max-w-sm text-xs/relaxed">
                    We couldn't find any jobs matching your current criteria. Adjust your search or filters.
                  </p>
                </div>
                {hasActiveFilters && (
                  <Button
                    onClick={clearAllFilters}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-8 rounded-xl h-12 font-bold cursor-pointer transition-all"
                  >
                    Reset All Filters
                  </Button>
                )}
              </div>
            )}

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-6 border-t border-gray-100 dark:border-slate-800">
                <p className="text-sm font-semibold text-gray-500 dark:text-slate-400 text-center sm:text-left select-none">
                  Showing {X}–{Y} of {Z} jobs
                </p>
                <div className="flex items-center justify-center gap-1.5 self-center sm:self-auto">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page === 1}
                    onClick={() => setPage((p) => Math.max(p - 1, 1))}
                    className="h-10 px-4 rounded-xl border-gray-200 dark:border-slate-800 text-gray-700 dark:text-slate-350 hover:bg-gray-50 dark:hover:bg-slate-800 cursor-pointer disabled:opacity-50 transition-all font-bold"
                  >
                    Previous
                  </Button>
                  {pageNumbers.map((num) => (
                    <Button
                      key={num}
                      variant={page === num ? "default" : "outline"}
                      size="sm"
                      onClick={() => setPage(num)}
                      className={cn(
                        "h-10 w-10 p-0 rounded-xl cursor-pointer transition-all font-bold",
                        page === num
                          ? "bg-blue-600 hover:bg-blue-700 text-white border-none"
                          : "border-gray-200 dark:border-slate-800 text-gray-700 dark:text-slate-350 hover:bg-gray-50 dark:hover:bg-slate-800"
                      )}
                    >
                      {num}
                    </Button>
                  ))}
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page === totalPages}
                    onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                    className="h-10 px-4 rounded-xl border-gray-200 dark:border-slate-800 text-gray-700 dark:text-slate-350 hover:bg-gray-50 dark:hover:bg-slate-800 cursor-pointer disabled:opacity-50 transition-all font-bold"
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}

          </div>

        </div>
      </div>
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