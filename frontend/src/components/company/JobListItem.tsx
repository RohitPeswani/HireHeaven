"use client";

import React from "react";
import { Job } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Briefcase01Icon,
  Location01Icon,
  CurrencyIcon,
  UserGroupIcon,
  ComputerIcon,
  ViewIcon,
  Edit01Icon,
  Tick01Icon,
  Cancel01Icon
} from "@hugeicons/core-free-icons";
import Link from "next/link";

interface JobListItemProps {
  job: Job;
  onEdit?: (job: Job) => void;
}

const JobListItem: React.FC<JobListItemProps> = ({ job, onEdit }) => {
  return (
    <div className="group bg-white dark:bg-slate-900 border border-blue-100/50 dark:border-slate-800 rounded-xl p-4 hover:border-blue-400 dark:hover:border-blue-500 hover:shadow-md transition-all duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Left Side: Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="text-base font-bold text-gray-900 dark:text-white truncate">
              {job.title}
            </h3>
            <Badge className={`${job.is_active
                ? "bg-green-50 dark:bg-green-950/20 text-green-700 dark:text-green-400 border-green-100 dark:border-green-900/30 hover:bg-green-100 dark:hover:bg-green-950/30"
                : "bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-400 border-red-100 dark:border-red-900/30 hover:bg-red-100 dark:hover:bg-red-950/30"
              } flex items-center gap-1 py-0.5 px-2 text-[10px] font-bold uppercase tracking-wider`}>
              <HugeiconsIcon icon={job.is_active ? Tick01Icon : Cancel01Icon} size={10} />
              {job.is_active ? "Active" : "Inactive"}
            </Badge>
          </div>

          {/* Metadata Row */}
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-gray-500 dark:text-slate-400 font-medium">
            <div className="flex items-center gap-1.5">
              <HugeiconsIcon icon={Briefcase01Icon} size={14} className="text-gray-400 dark:text-slate-550" />
              <span>{job.role}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <HugeiconsIcon icon={CurrencyIcon} size={14} className="text-gray-400 dark:text-slate-555" />
              <span>{job.salary}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <HugeiconsIcon icon={Location01Icon} size={14} className="text-gray-400 dark:text-slate-550" />
              <span>{job.city}, {job.state}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <HugeiconsIcon icon={ComputerIcon} size={14} className="text-gray-400 dark:text-slate-550" />
              <span>{job.work_location} ({job.job_type})</span>
            </div>
            <div className="flex items-center gap-1.5">
              <HugeiconsIcon icon={UserGroupIcon} size={14} className="text-gray-400 dark:text-slate-550" />
              <span>{job.openings} openings</span>
            </div>
          </div>
        </div>

        {/* Right Side: Actions */}
        <div className="flex items-center gap-2 shrink-0">
          <Link href={`/jobs/${job.job_id}`}>
          <Button
            variant="outline"
            size="sm"
            className="h-9 gap-2 text-gray-600 dark:text-slate-300 border-gray-200 dark:border-slate-800 hover:bg-gray-50 dark:hover:bg-slate-800 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
          >
            <HugeiconsIcon icon={ViewIcon} size={16} />
            <span className="hidden sm:inline">View</span>
          </Button>
          </Link>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onEdit?.(job)}
            className="h-9 gap-2 text-gray-600 dark:text-slate-300 border-gray-200 dark:border-slate-800 hover:bg-gray-50 dark:hover:bg-slate-800 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
          >
            <HugeiconsIcon icon={Edit01Icon} size={16} />
            <span className="hidden sm:inline">Edit</span>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default JobListItem;
