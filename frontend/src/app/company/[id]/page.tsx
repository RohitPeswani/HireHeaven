"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { CompanyWithJobs, Job } from "@/types";
import { toast } from "react-toastify";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Building02Icon,
  GlobalIcon,
  Briefcase01Icon,
  Add01Icon,
  HelpCircleIcon
} from "@hugeicons/core-free-icons";
import JobListItem from "@/components/company/JobListItem";
import JobModal from "@/components/company/JobModal";
import { Loader } from "@/components/loader";

const JOB_API_BASE = process.env.NEXT_PUBLIC_JOB_SERVICE_URL || "http://localhost:5003";

export default function CompanyPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user, token, isAuthenticated } = useSelector((state: RootState) => state.auth);
  const [company, setCompany] = useState<CompanyWithJobs | null>(null);
  const [loading, setLoading] = useState(true);
  const [isJobModalOpen, setIsJobModalOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<Job | null>(null);

  const fetchCompanyDetails = useCallback(async () => {
    if (!token || !id) return;
    try {
      setLoading(true);
      const response = await fetch(`${JOB_API_BASE}/api/job/company/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (data.success) {
        setCompany(data.company);
      } else {
        toast.error(data.message || "Failed to fetch company details");
        router.push("/profile");
      }
    } catch (error) {
      console.error("Failed to fetch company details:", error);
      toast.error("An error occurred while fetching company details");
    } finally {
      setLoading(false);
    }
  }, [id, token, router]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchCompanyDetails();
    } else {
      router.push("/");
    }
  }, [isAuthenticated, fetchCompanyDetails, router]);

  const handleSaveJob = async (values: any) => {
    console.log(values);
    if (!token || !company) return;
    try {
      const url = editingJob
        ? `${JOB_API_BASE}/api/job/${editingJob.job_id}`
        : `${JOB_API_BASE}/api/job/new`;

      const method = editingJob ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          ...values,
          company_id: company.company_id
        }),
      });
      const data = await response.json();
      if (data.success) {
        toast.success(editingJob ? "Job updated successfully" : "Job posted successfully");
        if (data.company) {
          setCompany(data.company);
        }

      } else {
        toast.error(data.message || `Failed to ${editingJob ? "update" : "post"} job`);
      }
    } catch (error) {
      console.error(`Failed to ${editingJob ? "update" : "post"} job:`, error);
      toast.error(`An error occurred while ${editingJob ? "updating" : "posting"} job`);
    }
  };

  const openPostJobModal = () => {
    setEditingJob(null);
    setIsJobModalOpen(true);
  };

  const openEditJobModal = (job: Job) => {
    setEditingJob(job);
    setIsJobModalOpen(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!company) return null;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8 animate-in fade-in duration-500">
      {/* Company Header Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="h-40 bg-blue-600 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-700/50 to-transparent"></div>
          {/* Decorative circles */}
          <div className="absolute -top-24 -right-24 w-64 h-64 rounded-full bg-blue-500/20 blur-3xl"></div>
          <div className="absolute -bottom-24 -left-24 w-64 h-64 rounded-full bg-blue-400/20 blur-3xl"></div>
        </div>

        <div className="px-6 pb-8 relative">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 -mt-16 sm:-mt-20">
            <div className="flex flex-col sm:flex-row sm:items-end gap-6">
              <div className="relative group">
                <Avatar className="h-32 w-32 sm:h-40 sm:w-40 border-4 border-white rounded-3xl bg-white shadow-xl overflow-hidden transition-transform hover:scale-[1.02]">
                  <AvatarImage src={company.logo} alt={company.name} className="object-contain" />
                  <AvatarFallback className="bg-gray-100 font-bold text-4xl text-blue-600">
                    {company.name[0]}
                  </AvatarFallback>
                </Avatar>
              </div>

              <div className="space-y-2 mb-2">
                <h1 className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight">
                  {company.name}
                </h1>
                <p className="text-gray-500 font-medium max-w-xl text-lg leading-relaxed">
                  {company.description}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 mb-2">
              <Button
                variant="outline"
                onClick={() => window.open(company.website, "_blank")}
                className="bg-gray-900 border-none text-white dark:text-black cursor-pointer gap-2 h-12 px-6 rounded-xl font-bold shadow-lg shadow-gray-200"
              >
                <HugeiconsIcon icon={GlobalIcon} size={20} />
                Visit Website
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Open Positions Section */}
      <Card className="shadow-sm border-gray-100 overflow-hidden">
        <div className="bg-blue-600 p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 text-white">
            <div className="p-2 bg-white/20 rounded-lg">
              <HugeiconsIcon icon={Briefcase01Icon} size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold">Open Positions</h2>
              <p className="text-blue-100 text-sm">{company.jobs.length} active jobs</p>
            </div>
          </div>

          {user?.role === "recruiter" && (
            <Button
              onClick={openPostJobModal}
              className="bg-gray-900 border-none text-white hover:bg-gray-800 gap-2 h-11 px-6 rounded-xl font-bold transition-all hover:translate-y-[-2px] active:translate-y-0"
            >
              <HugeiconsIcon icon={Add01Icon} size={20} />
              Post New Job
            </Button>
          )}
        </div>

        <CardContent className="p-6">
          {company.jobs.length > 0 ? (
            <div className="flex flex-col gap-4">
              {company.jobs.map((job) => (
                <JobListItem
                  key={job.job_id}
                  job={job}
                  onEdit={openEditJobModal}
                />
              ))}
            </div>
          ) : (
            <div className="py-20 flex flex-col items-center justify-center text-gray-400 bg-gray-50/50 rounded-2xl border-2 border-dashed border-gray-100">
              <div className="p-4 bg-white rounded-full shadow-sm mb-4">
                <HugeiconsIcon icon={HelpCircleIcon} size={48} className="opacity-20" />
              </div>
              <p className="font-bold text-lg text-gray-600">No active positions</p>
              <p className="text-sm">Start by posting a new job opportunity.</p>
            </div>
          )}
        </CardContent>
      </Card>

      <JobModal
        isOpen={isJobModalOpen}
        onClose={() => setIsJobModalOpen(false)}
        onSave={handleSaveJob}
        companyName={company.name}
        job={editingJob}
      />
    </div>
  );
}