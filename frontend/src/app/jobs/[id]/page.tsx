"use client";

import React, { useEffect, useState, use } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/store/store";
import { Job, Application } from "@/types";
import { Loader } from "@/components/loader";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Location01Icon,
  CurrencyIcon,
  UserGroupIcon,
  Briefcase01Icon,
  ArrowLeft01Icon,
  Tick01Icon,
  InformationCircleIcon
} from "@hugeicons/core-free-icons";
import { toast } from "react-toastify";
import { addApplication } from "@/store/applicationsSlice";
import { convertServerPatchToFullTree } from "next/dist/client/components/segment-cache/navigation";

const JOB_API_BASE = process.env.NEXT_PUBLIC_JOB_SERVICE_URL || "http://localhost:5003";
const USER_API_BASE = process.env.NEXT_PUBLIC_USER_SERVICE_URL || "http://localhost:5002";

const JobDetailsPage = ({ params }: { params: Promise<{ id: string }> }) => {
  const router = useRouter();
  const dispatch = useDispatch();
  const { id: jobId } = use(params);
  const { user, token } = useSelector((state: RootState) => state.auth);
  const { applications } = useSelector((state: RootState) => state.applications);

  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);

  // Recruiter job applications states
  const [jobApplications, setJobApplications] = useState<Application[]>([]);
  const [applicationsLoading, setApplicationsLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [selectedStatus, setSelectedStatus] = useState<Record<number, string>>({});
  const [updatingStatus, setUpdatingStatus] = useState<Record<number, boolean>>({});

  const isApplied = applications.some((app) => Number(app.job_id) === Number(jobId));
  const isOwnJob = user?.role === "recruiter" && Number(job?.posted_by_recruiter_id) === Number(user?.user_id);

  useEffect(() => {
    const fetchJobDetails = async () => {
      try {
        const response = await fetch(`${JOB_API_BASE}/api/job/${jobId}`);
        const data = await response.json();
        if (data.success) {
          setJob(data.job);
        } else {
          toast.error("Job not found");
          router.push("/jobs");
        }
      } catch (error) {
        console.error("Fetch job error:", error);
        toast.error("Failed to load job details");
      } finally {
        setLoading(false);
      }
    };

    fetchJobDetails();
  }, [jobId, router]);

  useEffect(() => {
    const fetchJobApplications = async () => {
      if (!user || !token || !job || !isOwnJob) {
        return;
      }
      setApplicationsLoading(true);
      try {
        const response = await fetch(`${JOB_API_BASE}/api/job/applications/${jobId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await response.json();
        if (data.success) {
          setJobApplications(data.applications);
        }
      } catch (error) {
        console.error("Fetch job applications error:", error);
      } finally {
        setApplicationsLoading(false);
      }
    };
    fetchJobApplications();
  }, [jobId, user, token, job, isOwnJob]);

  const handleStatusSelect = (appId: number, status: string) => {
    setSelectedStatus(prev => ({ ...prev, [appId]: status }));
  };

  const handleUpdateStatus = async (appId: number) => {
    const status = selectedStatus[appId];
    if (!status) return;

    setUpdatingStatus(prev => ({ ...prev, [appId]: true }));
    try {
      const response = await fetch(`${JOB_API_BASE}/api/job/application/${appId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      });
      const data = await response.json();
      if (data.success) {
        toast.success("Application updated");
        setJobApplications(prev =>
          prev.map(app => app.application_id === appId ? { ...app, status: data.application.status } : app)
        );
        setSelectedStatus(prev => {
          const next = { ...prev };
          delete next[appId];
          return next;
        });
      } else {
        toast.error(data.message || "Failed to update status");
      }
    } catch (error) {
      console.error("Update status error:", error);
      toast.error("Failed to update status");
    } finally {
      setUpdatingStatus(prev => ({ ...prev, [appId]: false }));
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "Hired":
        return "bg-green-50 text-green-700 hover:bg-green-50 border border-green-200";
      case "Rejected":
        return "bg-red-50 text-red-700 hover:bg-red-50 border border-red-200";
      case "Submitted":
      default:
        return "bg-yellow-50 text-yellow-700 hover:bg-yellow-50 border border-yellow-200";
    }
  };

  console.log(jobApplications);

  const filteredApplications = jobApplications.filter(app => {
    if (statusFilter === "All Status") return true;
    return app.status === statusFilter;
  });

  const handleApply = async () => {
    if (!user || !token) {
      toast.info("Please login to apply for this job");
      router.push("/login");
      return;
    }

    if (user.role !== "jobseeker") {
      toast.warning("Only seekers can apply for jobs");
      return;
    }

    setApplying(true);
    try {
      const response = await fetch(`${USER_API_BASE}/api/user/apply/${jobId}`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });
      const data = await response.json();

      if (data.success) {
        const newApp: Application = {
          ...data.application,
          job_title: job?.title || "",
          job_salary: String(job?.salary || ""),
          job_location: job?.location || "",
          company_name: job?.company_name || "",
        };
        dispatch(addApplication(newApp));
        toast.success("Applied for job successfully!");
      } else {
        toast.error(data.message || "Failed to apply for job");
      }
    } catch (error) {
      console.error("Apply job error:", error);
      toast.error("An error occurred. Please try again.");
    } finally {
      setApplying(false);
    }
  };

  if (loading) return <Loader size={64} fullscreen text="Loading job details..." />;
  if (!job) return null;

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-slate-950 pb-20">
      {/* Hero Header */}
      <div className="bg-blue-600 text-white pt-10 pb-20 px-4 md:px-8 shadow-inner overflow-hidden relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-20 -mt-20 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-400/10 rounded-full -ml-16 -mb-16 blur-2xl" />

        <div className="max-w-5xl mx-auto space-y-6 relative z-10">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-white/80 hover:text-white transition-colors font-medium mb-4 group"
          >
            <HugeiconsIcon icon={ArrowLeft01Icon} size={20} className="group-hover:-translate-x-1 transition-transform" />
            Back to search
          </button>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div className="space-y-4">
              <Badge className="bg-green-400/20 text-white border-green-400/50 px-3 py-1 text-xs font-bold uppercase tracking-wider backdrop-blur-sm">
                Open
              </Badge>
              <div className="space-y-1">
                <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
                  {job.title}
                </h1>
                <div className="flex items-center gap-2 text-blue-100 font-semibold text-lg">
                  <HugeiconsIcon icon={Briefcase01Icon} size={20} />
                  {job.company_name}
                </div>
              </div>
            </div>

            <div className="flex-shrink-0">
              {user?.role !== "recruiter" && (
                isApplied ? (
                  <Button
                    disabled
                    className="h-14 px-8 bg-white/10 text-white border border-white/20 rounded-2xl opacity-100 backdrop-blur-md font-bold text-lg flex items-center gap-3 cursor-default"
                  >
                    <HugeiconsIcon icon={Tick01Icon} size={24} className="text-green-400" />
                    Already Applied
                  </Button>
                ) : (
                  <Button
                    onClick={handleApply}
                    disabled={applying}
                    className="h-14 px-10 bg-[#0f172a] dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 text-white hover:bg-[#1e293b] rounded-2xl font-bold text-lg shadow-2xl transition-all hover:scale-105 active:scale-100 flex items-center gap-3"
                  >
                    {applying ? <Loader size={20} className="text-white" /> : <HugeiconsIcon icon={Briefcase01Icon} size={24} />}
                    {applying ? "Applying..." : "Easy Apply"}
                  </Button>
                )
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto -mt-12 px-4 md:px-0 grid grid-cols-1 md:grid-cols-3 gap-8 relative z-20">
        {/* Metadata Cards */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 flex items-center gap-4 transition-transform hover:-translate-y-1 duration-300">
          <div className="w-12 h-12 bg-blue-50 dark:bg-blue-955/20 rounded-xl flex items-center justify-center text-blue-600 dark:text-blue-400">
            <HugeiconsIcon icon={Location01Icon} size={24} />
          </div>
          <div>
            <p className="text-xs font-bold text-gray-400 dark:text-slate-550 uppercase tracking-wider">Location</p>
            <p className="font-bold text-gray-900 dark:text-white leading-tight">{job.location}</p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 flex items-center gap-4 transition-transform hover:-translate-y-1 duration-300">
          <div className="w-12 h-12 bg-green-50 dark:bg-green-955/20 rounded-xl flex items-center justify-center text-green-600 dark:text-green-400">
            <HugeiconsIcon icon={CurrencyIcon} size={24} />
          </div>
          <div>
            <p className="text-xs font-bold text-gray-400 dark:text-slate-550 uppercase tracking-wider">Salary</p>
            <p className="font-bold text-gray-900 dark:text-white leading-tight">₹ {job.salary.toLocaleString()} P.A</p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 flex items-center gap-4 transition-transform hover:-translate-y-1 duration-300">
          <div className="w-12 h-12 bg-purple-50 dark:bg-purple-955/20 rounded-xl flex items-center justify-center text-purple-600 dark:text-purple-400">
            <HugeiconsIcon icon={UserGroupIcon} size={24} />
          </div>
          <div>
            <p className="text-xs font-bold text-gray-400 dark:text-slate-550 uppercase tracking-wider">Openings</p>
            <p className="font-bold text-gray-900 dark:text-white leading-tight">{job.openings} positions</p>
          </div>
        </div>

        {/* Description Section */}
        <div className="md:col-span-3 bg-white dark:bg-slate-900 p-8 md:p-10 rounded-3xl shadow-sm border border-gray-100 dark:border-slate-800 space-y-8">
          <div className="flex items-center gap-3 border-b border-gray-100 dark:border-slate-800 pb-6">
            <div className="w-10 h-10 bg-gray-900 dark:bg-white text-white dark:text-slate-900 rounded-xl flex items-center justify-center">
              <HugeiconsIcon icon={InformationCircleIcon} size={20} />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Job Description</h2>
          </div>

          <div className="prose prose-blue max-w-none text-gray-600 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
            {job.description || "No description provided."}
          </div>

          {/* Additional Details (Optional Grid) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-6 border-t border-gray-100 dark:border-slate-800">
            <div className="space-y-1">
              <p className="text-sm font-semibold text-gray-400 dark:text-slate-550">Job Type</p>
              <Badge variant="outline" className="rounded-lg bg-gray-50 dark:bg-slate-950 font-bold border-gray-200 dark:border-slate-800 dark:text-slate-300">{job.job_type}</Badge>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-semibold text-gray-400 dark:text-slate-550">Role</p>
              <p className="font-bold text-gray-900 dark:text-white">{job.role}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-semibold text-gray-400 dark:text-slate-550">Work Location</p>
              <p className="font-bold text-gray-900 dark:text-white">{job.work_location}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-semibold text-gray-400 dark:text-slate-550">Posted Date</p>
              <p className="font-bold text-gray-900 dark:text-white">{new Date(job.created_at).toLocaleDateString()}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recruiter Applications Section */}
      {isOwnJob && (
        <div className="max-w-5xl mx-auto mt-12 px-4 md:px-0">
          <div className="flex items-center justify-between border-b border-gray-150 dark:border-slate-800 pb-4 mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">All Applications</h2>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-gray-500 dark:text-slate-400">Filter:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="border border-gray-200 dark:border-slate-700 rounded-xl px-3 py-1.5 text-sm bg-white dark:bg-slate-950 font-medium text-gray-700 dark:text-slate-300 outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="All Status">All Status</option>
                <option value="Submitted">Submitted</option>
                <option value="Hired">Hired</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>
          </div>

          {applicationsLoading ? (
            <div className="flex justify-center py-12">
              <Loader size={36} text="Loading applications..." />
            </div>
          ) : filteredApplications.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 pb-20">
              {filteredApplications.map((app) => (
                <div key={app.application_id} className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm space-y-4">
                  <div className="flex items-center justify-between">
                    <span className={`px-4 py-1.5 rounded-full text-xs font-bold ${getStatusBadgeClass(app.status)}`}>
                      {app.status}
                    </span>
                  </div>

                  <div className="flex items-center gap-4 text-xs font-bold text-blue-600 dark:text-blue-450">
                    <a
                      href={app.resume}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:underline"
                    >
                      View Resume
                    </a>
                    <Link
                      href={`/profile/${app.applicant_id}`}
                      className="hover:underline"
                    >
                      View Profile
                    </Link>
                  </div>

                  <div className="flex gap-3">
                    <select
                      value={selectedStatus[app.application_id] || ""}
                      onChange={(e) => handleStatusSelect(app.application_id, e.target.value)}
                      className="flex-1 border border-gray-200 dark:border-slate-700 rounded-xl px-4 py-2.5 bg-white dark:bg-slate-950 text-sm text-gray-700 dark:text-slate-300 outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Update status</option>
                      <option value="Submitted">Submitted</option>
                      <option value="Hired">Hired</option>
                      <option value="Rejected">Rejected</option>
                    </select>

                    <Button
                      onClick={() => handleUpdateStatus(app.application_id)}
                      disabled={updatingStatus[app.application_id] || !selectedStatus[app.application_id]}
                      className="bg-gray-900 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 hover:bg-gray-800 text-white font-bold px-6 py-4 rounded-xl text-sm min-w-[90px]"
                    >
                      {updatingStatus[app.application_id] ? <Loader size={16} className="text-white dark:text-black" /> : "Update"}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500 dark:text-slate-400 font-semibold bg-white dark:bg-slate-900 rounded-3xl border border-gray-100 dark:border-slate-800 shadow-sm">
              No application Yet.
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default JobDetailsPage;