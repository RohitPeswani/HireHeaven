"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { AppDispatch, RootState } from "@/store/store";
import { setUser } from "@/store/authSlice";
import { Application, UpdateProfileRequest } from "@/types";
import { toast } from "react-toastify";
import ProfileHeader from "@/components/profile/ProfileHeader";
import ProfileInfo from "@/components/profile/ProfileInfo";
import EditProfileModal from "@/components/profile/EditProfileModal";
import ResumeSection from "@/components/profile/ResumeSection";
import SkillsSection from "@/components/profile/SkillsSection";
import ApplicationsSection from "@/components/profile/ApplicationsSection";
import CompaniesSection from "@/components/profile/CompaniesSection";
import AddCompanyModal from "@/components/profile/AddCompanyModal";
import { Company } from "@/types";
import { fetchApplications } from "@/store/applicationsSlice";
import SubscriptionSection from "@/components/profile/SubscriptionSection";

const USER_API_BASE = process.env.NEXT_PUBLIC_USER_SERVICE_URL || "http://localhost:5002";
const JOB_API_BASE = process.env.NEXT_PUBLIC_JOB_SERVICE_URL || "http://localhost:5003";

export default function ProfilePage() {
  const { user, token, isAuthenticated } = useSelector((state: RootState) => state.auth);
  const { applications } = useSelector((state: RootState) => state.applications);
  const dispatch = useDispatch<AppDispatch>();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddCompanyModalOpen, setIsAddCompanyModalOpen] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState<Record<string, boolean>>({});

  const setSectionLoading = (
    section: string,
    value: boolean
  ) => {
    setLoading(prev => ({
      ...prev,
      [section]: value
    }));
  };

  const fetchCompanies = useCallback(async () => {
    setSectionLoading("companies", true);
    if (!token) return;
    try {
      const response = await fetch(`${JOB_API_BASE}/api/job/company/all`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (data.success) {
        setCompanies(data.companies);
      }
    } catch (error) {
      console.error("Failed to fetch companies:", error);
    } finally {
      setSectionLoading("companies", false);
    }
  }, [token]);

  useEffect(() => {
    if (isAuthenticated) {
      if (user?.role === "recruiter") {
        fetchCompanies();
      }
    }
  }, [isAuthenticated, fetchCompanies, user?.role]);

  useEffect(() => {
    if (token) {
      dispatch(fetchApplications(token)).unwrap().catch(error => {
        toast.error(error);
      });
    }
  }, [token])

  const handleUpdateProfile = async (data: UpdateProfileRequest) => {
    if (!token) return;
    const response = await fetch(`${USER_API_BASE}/api/user/update-profile`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
    const result = await response.json();
    if (result.success && result.user) {
      dispatch(setUser({ user: result.user, token }));
    } else {
      throw new Error(result.message || "Failed to update profile");
    }
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    setSectionLoading("avatar", true);
    const file = event.target.files?.[0];
    if (!file || !token) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch(`${USER_API_BASE}/api/user/update-profile-pic`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const result = await response.json();
      if (result.success && result.user) {
        dispatch(setUser({ user: result.user, token }));
        toast.success("Profile picture updated");
      } else {
        toast.error(result.message || "Failed to update profile picture");
      }
    } catch (err) {
      toast.error("An error occurred during upload");
    } finally {
      setSectionLoading("avatar", false);
    }
  };

  const handleResumeUpload = async (file: File) => {
    setSectionLoading("resume", true);
    if (!token) return;
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch(`${USER_API_BASE}/api/user/update-resume`, {
      method: "PUT",
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });
    const result = await response.json();
    if (result.success && result.user) {
      dispatch(setUser({ user: result.user, token }));
      setSectionLoading("resume", false);
    } else {
      setSectionLoading("resume", false);
      throw new Error(result.message || "Failed to upload resume");

    }
  };

  const handleSkillsUpdate = async (skills: string[]) => {
    setSectionLoading("skills", true);
    if (!token || !user) return;

    // The backend seems to have individual add/delete endpoints, 
    // but the frontend UI I built passes the full list.
    // I check if I should call add or delete based on difference.

    const prevSkills = user.skills || [];
    const added = skills.filter(s => !prevSkills.includes(s));
    const removed = prevSkills.filter(s => !skills.includes(s));

    if (added.length > 0) {
      for (const skillName of added) {
        try {
          const response = await fetch(`${USER_API_BASE}/api/user/skills`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ skillName }),
          });
          const result = await response.json();
          if (result.success && result.user) {
            toast.success("skill added successfully");
            dispatch(setUser({ user: result.user, token }));

          }
        } catch (error) {
          console.log(error);
          toast.error("Failed to add skill");
        } finally {
          setSectionLoading("skills", false);
        }
      }
    }

    setSectionLoading("skills", false);
    if (removed.length > 0) {

      for (const skillName of removed) {
        try {

          const response = await fetch(`${USER_API_BASE}/api/user/skills`, {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ skillName }),
          });
          const result = await response.json();
          if (result.success && result.user) {
            toast.success("skill removed successfully");
            dispatch(setUser({ user: result.user, token }));
          }
        } catch (error) {
          console.log(error);
          toast.error("Failed to remove skill");
        }
      }
    }
  };

  const handleCreateCompany = async (values: any, logo: File) => {
    if (!token) return;
    const formData = new FormData();
    formData.append("name", values.name);
    formData.append("description", values.description);
    formData.append("website", values.website);
    formData.append("file", logo);

    try {
      const response = await fetch(`${JOB_API_BASE}/api/job/company`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const result = await response.json();
      if (result.success) {
        setCompanies(prev => [...prev, result.company]);
        toast.success("Company created successfully");
      } else {
        toast.error(result.message || "Failed to create company");
      }
    } catch (err) {
      toast.error("An error occurred while creating company");
    }
  };

  const handleDeleteCompany = async (companyId: string) => {
    setSectionLoading("delete", true);
    if (!token) return;
    try {
      const response = await fetch(`${JOB_API_BASE}/api/job/company/${companyId}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      });
      const result = await response.json();
      if (result.success) {
        setCompanies(prev => prev.filter(c => c.company_id !== companyId));
        toast.success("Company deleted successfully");
      } else {
        toast.error(result.message || "Failed to delete company");
      }
    } catch (err) {
      toast.error("An error occurred while deleting company");
    } finally {
      setSectionLoading("delete", false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Please sign in to view your profile</h2>
      </div>
    );
  }

  return (
    <div className="px-4 py-8 space-y-8 animate-in fade-in duration-500">
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-gray-100 dark:border-slate-800 overflow-hidden">
        <ProfileHeader
          onEditAvatar={() => avatarInputRef.current?.click()}
          onEditName={() => setIsEditModalOpen(true)}
          loading={loading.avatar}
        />
        <input
          type="file"
          className="hidden"
          ref={avatarInputRef}
          onChange={handleAvatarUpload}
          accept="image/*"
        />

        <div className="p-6 pt-0 space-y-8">
          <ProfileInfo user={user} />
          {user?.role !== "recruiter" && <ResumeSection user={user} onUpload={handleResumeUpload} loading={loading.resume} />}
          {user?.role !== "recruiter" && <SubscriptionSection user={user} />}

          {user?.role !== "recruiter" && <>
              <div className="h-px bg-gray-100 dark:bg-slate-800" />

              <SkillsSection user={user} onSkillsUpdate={handleSkillsUpdate} loading={loading.skills} />
              <ApplicationsSection applications={applications} />
            </>
          }
        </div>
      </div>

      {user?.role === "recruiter" && (
        <CompaniesSection
          companies={companies}
          onDelete={handleDeleteCompany}
          onAddClick={() => setIsAddCompanyModalOpen(true)}
          loading={loading.delete}
          companiesLoading={loading.companies}
        />
      )}

      <EditProfileModal
        user={user}
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSave={handleUpdateProfile}
      />

      {user?.role === "recruiter" && (
        <AddCompanyModal
          isOpen={isAddCompanyModalOpen}
          onClose={() => setIsAddCompanyModalOpen(false)}
          onSave={handleCreateCompany}
        />
      )}
    </div>
  );
}