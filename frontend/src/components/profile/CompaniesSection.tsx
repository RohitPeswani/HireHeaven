"use client";

import React from "react";
import { Company } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Building02Icon,
  ViewIcon,
  Delete02Icon,
  Add01Icon,
  GlobalIcon
} from "@hugeicons/core-free-icons";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from "@/components/ui/alert-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";

interface CompaniesSectionProps {
  companies: Company[];
  onDelete: (companyId: string) => Promise<void>;
  onAddClick: () => void;
  loading: boolean;
  companiesLoading: boolean;
}

const CompaniesSection: React.FC<CompaniesSectionProps> = ({ companies, onDelete, onAddClick, loading, companiesLoading }) => {
  console.log("companies section", companies);
  return (
    <Card className="shadow-sm border border-gray-150 dark:border-slate-800 bg-white dark:bg-slate-950 overflow-hidden mt-8">
      {/* Header Section */}
      <div className="bg-blue-600 p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white/20 rounded-lg">
            <HugeiconsIcon icon={Building02Icon} size={24} className="text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">My Companies</h2>
            <p className="text-blue-100 text-sm">
              Manage your registered companies ({companies.length}/3)
            </p>
          </div>
        </div>

        {companies.length < 3 && (
          <Button
            onClick={onAddClick}
            className="bg-[#0f172a] hover:bg-[#1e293b] dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 border-none text-white gap-2 px-6"
          >
            <HugeiconsIcon icon={Add01Icon} size={18} />
            Add Company
          </Button>
        )}
      </div>

      {companiesLoading ? <div className="flex items-center justify-center min-h-[20vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div> : <CardContent className="p-6 space-y-4">
        {/* Companies List */}
        {companies ? (
          companies.map((company) => (
            <Card key={company.company_id} className="border border-gray-100 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4 w-full sm:w-auto">
                  <Avatar className="h-16 w-16 rounded-full bg-white dark:bg-slate-950 border border-gray-150 dark:border-slate-800 overflow-hidden">
                    <AvatarImage src={company.logo} alt={company.name} className="object-cover" />
                    <AvatarFallback className="bg-gray-100 dark:bg-slate-800 font-bold text-blue-600 dark:text-blue-400">
                      {company.name[0].toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white truncate">{company.name}</h3>
                    <p className="text-sm text-gray-500 dark:text-slate-400 line-clamp-1">{company.description}</p>
                    <a
                      href={company.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-blue-600 dark:text-blue-400 font-medium hover:underline flex items-center gap-1 mt-1"
                    >
                      <HugeiconsIcon icon={GlobalIcon} size={12} />
                      {company.website.replace(/^https?:\/\//, "")}
                    </a>
                  </div>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                  <Link href={`/company/${company.company_id}`}>
                    <Button variant="outline" size="icon" className="h-9 w-9 text-gray-400 dark:text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 border-gray-100 dark:border-slate-800 hover:bg-gray-50 dark:hover:bg-slate-800">
                      <HugeiconsIcon icon={ViewIcon} size={18} />
                    </Button>
                  </Link>

                  <AlertDialog>
                    <AlertDialogTrigger render={<Button variant="outline" size="icon" className="h-9 w-9 text-gray-400 dark:text-slate-500 hover:text-red-600 dark:hover:text-red-400 border-gray-100 dark:border-slate-800 hover:bg-gray-50 dark:hover:bg-slate-800">
                      <HugeiconsIcon icon={Delete02Icon} size={18} />
                    </Button>}>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure you want to delete this company?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently delete the company and all associated data.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => onDelete(company.company_id)}
                          className="bg-red-600 hover:bg-red-700 text-white"
                          disabled={loading}
                        >
                          {loading ? "Deleting..." : "Delete"}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="py-12 flex flex-col items-center justify-center text-gray-400 dark:text-slate-500 bg-white dark:bg-slate-900 rounded-xl border border-dashed border-gray-200 dark:border-slate-800">
            <HugeiconsIcon icon={Building02Icon} size={48} className="opacity-10 mb-4" />
            <p className="font-medium">No companies registered yet.</p>
          </div>
        )}
      </CardContent>}
    </Card>
  );
};

export default CompaniesSection;
