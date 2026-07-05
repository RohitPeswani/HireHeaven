"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Location01Icon,
  CurrencyIcon,
  ArrowRight01Icon,
  Tick01Icon,
  Briefcase01Icon
} from "@hugeicons/core-free-icons";
import { Job } from "@/types";
import Link from "next/link";
import Image from "next/image";

interface JobCardProps {
  job: Job;
  isApplied?: boolean;
}

const JobCard: React.FC<JobCardProps> = ({ job, isApplied = false }) => {
  return (
    <Card className="group border border-gray-150 dark:border-slate-800 shadow-md hover:shadow-xl transition-all duration-300 rounded-2xl overflow-hidden bg-white dark:bg-slate-900">
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div className="space-y-1 pr-4">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors truncate max-w-[200px]">
              {job.title}
            </h3>
            <div className="flex items-center gap-2 text-gray-500 dark:text-slate-400 font-medium">
              <HugeiconsIcon icon={Briefcase01Icon} size={16} />
              <span className="text-sm truncate max-w-[150px]">{job.company_name}</span>
            </div>
          </div>

          <div className="w-14 h-14 relative rounded-xl overflow-hidden border border-gray-100 dark:border-slate-800 flex-shrink-0 bg-gray-50 dark:bg-slate-950">
            {job.company_logo ? (
              <Image
                src={job.company_logo}
                alt={job.company_name || "Company"}
                fill
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400 dark:text-slate-500">
                <HugeiconsIcon icon={Briefcase01Icon} size={24} />
              </div>
            )}
          </div>
        </div>

        <div className="space-y-3 mb-6">
          <div className="flex items-center gap-2 text-gray-600 dark:text-slate-300 bg-blue-50/50 dark:bg-blue-950/20 self-start px-3 py-1.5 rounded-lg w-fit">
            <HugeiconsIcon icon={Location01Icon} size={18} className="text-blue-600 dark:text-blue-400" />
            <span className="text-sm font-semibold">{job.location}</span>
          </div>
          <div className="flex items-center gap-2 text-gray-600 dark:text-slate-300 bg-green-50/50 dark:bg-green-950/20 self-start px-3 py-1.5 rounded-lg w-fit">
            <HugeiconsIcon icon={CurrencyIcon} size={18} className="text-green-600 dark:text-green-400" />
            <span className="text-sm font-bold text-gray-900 dark:text-white">₹ {job.salary.toLocaleString()} P.A</span>
          </div>
        </div>

        <div className={`${isApplied ? 'flex items-center gap-3' : 'block'} pt-4 border-t border-gray-50 dark:border-slate-800`}>
          <Link href={`/jobs/${job.job_id}`} className="flex-1">
            <Button
              variant="outline"
              className="w-full h-11 gap-2 border-gray-200 dark:border-slate-700 text-gray-700 dark:text-slate-350 hover:bg-gray-50 dark:hover:bg-slate-800 hover:text-blue-600 dark:hover:text-blue-450 rounded-xl transition-all"
            >
              View Details
              <HugeiconsIcon icon={ArrowRight01Icon} size={16} />
            </Button>
          </Link>

          <div className="flex-1">
            {isApplied ? (
              <Button
                disabled
                className="w-full h-11 gap-2 bg-green-50 dark:bg-green-950/20 text-green-600 dark:text-green-400 border border-green-100 dark:border-green-900/30 rounded-xl opacity-100 cursor-default"
              >
                <HugeiconsIcon icon={Tick01Icon} size={18} />
                Applied
              </Button>
            ) : null}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default JobCard;
