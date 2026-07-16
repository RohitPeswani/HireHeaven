"use client";

import React, { useMemo } from "react";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Combobox } from "../company/LocationCombobox";
import { HugeiconsIcon } from "@hugeicons/react";
import { Location01Icon, Calendar03Icon, CurrencyIcon, Briefcase02Icon, Home01Icon } from "@hugeicons/core-free-icons";
import majorCities from "@/data/major-cities.json";

interface FilterSidebarProps {
  state: string;
  onStateChange: (state: string) => void;
  city: string;
  onCityChange: (city: string) => void;
  salary: string;
  onSalaryChange: (salary: string) => void;
  jobTypes: string[];
  onJobTypesChange: (jobTypes: string[]) => void;
  workModes: string[];
  onWorkModesChange: (workModes: string[]) => void;
  datePosted: string;
  onDatePostedChange: (datePosted: string) => void;
  sortBy: string;
  onSortByChange: (sortBy: string) => void;
}

const salaryOptions = [
  "0–3 LPA",
  "3–6 LPA",
  "6–10 LPA",
  "10–15 LPA",
  "15–20 LPA",
  "20+ LPA"
];

const jobTypeOptions = [
  "Full-time",
  "Internship",
  "Part-time",
  "Contract"
];

const workModeOptions = [
  "Remote",
  "Hybrid",
  "On-site"
];

const datePostedOptions = [
  { value: "24h", label: "Last 24 hours" },
  { value: "3d", label: "Last 3 days" },
  { value: "7d", label: "Last 7 days" },
  { value: "30d", label: "Last 30 days" }
];

const sortByOptions = [
  { value: "newest", label: "Newest First" },
  { value: "oldest", label: "Oldest First" },
  { value: "salary_high", label: "Salary: High → Low" },
  { value: "salary_low", label: "Salary: Low → High" },
  { value: "title_asc", label: "Title A → Z" }
];

export const FilterSidebar: React.FC<FilterSidebarProps> = ({
  state,
  onStateChange,
  city,
  onCityChange,
  salary,
  onSalaryChange,
  jobTypes,
  onJobTypesChange,
  workModes,
  onWorkModesChange,
  datePosted,
  onDatePostedChange,
  sortBy,
  onSortByChange
}) => {
  // Extract unique states sorted alphabetically
  const statesList = useMemo(() => {
    const uniqueStates = Array.from(new Set(majorCities.map((item) => item.state)));
    return uniqueStates.sort((a, b) => a.localeCompare(b));
  }, []);

  // Filter cities by state and sort alphabetically
  const cityOptions = useMemo(() => {
    if (!state) return [];
    const filtered = majorCities.filter((item) => item.state === state);
    const uniqueCities = Array.from(new Set(filtered.map((item) => item.city)));
    return uniqueCities
      .sort((a, b) => a.localeCompare(b))
      .map((c) => ({ value: c, label: c }));
  }, [state]);

  const handleJobTypeChange = (option: string, checked: boolean) => {
    if (checked) {
      onJobTypesChange([...jobTypes, option]);
    } else {
      onJobTypesChange(jobTypes.filter((t) => t !== option));
    }
  };

  const handleWorkModeChange = (option: string, checked: boolean) => {
    if (checked) {
      onWorkModesChange([...workModes, option]);
    } else {
      onWorkModesChange(workModes.filter((m) => m !== option));
    }
  };

  return (
    <div className="w-full bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-3xl p-6 space-y-6 shadow-sm">
      <div className="flex items-center justify-between pb-4 border-b border-gray-50 dark:border-slate-800">
        <h2 className="text-lg font-black text-gray-900 dark:text-white tracking-tight">Filters</h2>
      </div>

      {/* Sort By */}
      <div className="space-y-2.5">
        <label className="text-xs font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider block">
          Sort By
        </label>
        <Select onValueChange={onSortByChange} value={sortBy || "newest"}>
          <SelectTrigger className="h-11 w-full border-gray-200 focus:border-blue-500 focus:ring-blue-500 transition-all text-gray-900 dark:text-gray-300 dark:bg-slate-950">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent className="bg-white dark:bg-slate-950">
            {sortByOptions.map((opt) => (
              <SelectItem key={opt.value} value={opt.value} className="cursor-pointer">
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Location (State & City) */}
      <div className="space-y-4">
        <div className="space-y-2.5">
          <label className="text-xs font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
            <HugeiconsIcon icon={Location01Icon} size={14} className="text-gray-400" />
            State
          </label>
          <Select onValueChange={(val) => {
            onStateChange(val);
            onCityChange(""); // Reset city when state changes
          }} value={state || undefined}>
            <SelectTrigger className="h-11 w-full border-gray-200 focus:border-blue-500 focus:ring-blue-500 transition-all text-gray-900 dark:text-gray-300 dark:bg-slate-950">
              <SelectValue placeholder="Select State" />
            </SelectTrigger>
            <SelectContent className="bg-white dark:bg-slate-950 max-h-[300px]">
              {statesList.map((st) => (
                <SelectItem key={st} value={st} className="cursor-pointer">
                  {st}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2.5">
          <label className="text-xs font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
            <HugeiconsIcon icon={Location01Icon} size={14} className="text-gray-400" />
            City
          </label>
          <Combobox
            options={cityOptions}
            value={city}
            onChange={onCityChange}
            placeholder={state ? "Select City" : "Select state first"}
            searchPlaceholder="Search city..."
            emptyMessage="No cities found."
            disabled={!state}
            className="dark:bg-slate-950"
          />
        </div>
      </div>

      {/* Salary Filter (Radio buttons) */}
      <div className="space-y-3">
        <label className="text-xs font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
          <HugeiconsIcon icon={CurrencyIcon} size={14} className="text-gray-400" />
          Salary Range
        </label>
        <div className="space-y-2">
          {salaryOptions.map((option) => (
            <label 
              key={option} 
              className="flex items-center gap-3 cursor-pointer text-xs font-semibold text-gray-600 dark:text-slate-350 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              <input
                type="radio"
                name="salary"
                checked={salary === option}
                onChange={() => onSalaryChange(option)}
                className="h-4 w-4 rounded-full border-gray-300 text-blue-600 focus:ring-blue-500 accent-blue-600 cursor-pointer"
              />
              <span>{option}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Job Type (Checkboxes) */}
      <div className="space-y-3">
        <label className="text-xs font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
          <HugeiconsIcon icon={Briefcase02Icon} size={14} className="text-gray-400" />
          Job Type
        </label>
        <div className="space-y-2">
          {jobTypeOptions.map((option) => (
            <label 
              key={option} 
              className="flex items-center gap-3 cursor-pointer text-xs font-semibold text-gray-600 dark:text-slate-355 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              <input
                type="checkbox"
                checked={jobTypes.includes(option)}
                onChange={(e) => handleJobTypeChange(option, e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 accent-blue-600 cursor-pointer"
              />
              <span>{option}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Work Mode (Checkboxes) */}
      <div className="space-y-3">
        <label className="text-xs font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
          <HugeiconsIcon icon={Home01Icon} size={14} className="text-gray-400" />
          Work Mode
        </label>
        <div className="space-y-2">
          {workModeOptions.map((option) => (
            <label 
              key={option} 
              className="flex items-center gap-3 cursor-pointer text-xs font-semibold text-gray-600 dark:text-slate-355 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              <input
                type="checkbox"
                checked={workModes.includes(option)}
                onChange={(e) => handleWorkModeChange(option, e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 accent-blue-600 cursor-pointer"
              />
              <span>{option}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Date Posted (Radio buttons) */}
      <div className="space-y-3">
        <label className="text-xs font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
          <HugeiconsIcon icon={Calendar03Icon} size={14} className="text-gray-400" />
          Date Posted
        </label>
        <div className="space-y-2">
          {datePostedOptions.map((option) => (
            <label 
              key={option.value} 
              className="flex items-center gap-3 cursor-pointer text-xs font-semibold text-gray-600 dark:text-slate-355 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              <input
                type="radio"
                name="datePosted"
                checked={datePosted === option.value}
                onChange={() => onDatePostedChange(option.value)}
                className="h-4 w-4 rounded-full border-gray-300 text-blue-600 focus:ring-blue-500 accent-blue-600 cursor-pointer"
              />
              <span>{option.label}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
};
