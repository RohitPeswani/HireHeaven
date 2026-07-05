"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { User } from "@/types";
import { toast } from "react-toastify";
import ProfileHeader from "@/components/profile/ProfileHeader";
import ProfileInfo from "@/components/profile/ProfileInfo";
import ResumeSection from "@/components/profile/ResumeSection";
import SkillsSection from "@/components/profile/SkillsSection";
import { Loader } from "@/components/loader";

const USER_API_BASE = process.env.NEXT_PUBLIC_USER_SERVICE_URL || "http://localhost:5002";

export default function RecruiterProfilePage() {
  const { id } = useParams();
  const { token, isAuthenticated } = useSelector((state: RootState) => state.auth);
  const [profileUser, setProfileUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = useCallback(async () => {
    if (!token || !id) return;
    
    try {
      setLoading(true);
      const response = await fetch(`${USER_API_BASE}/api/user/profile/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      const result = await response.json();
      
      if (result.success && result.user) {
        setProfileUser(result.user);
        setError(null);
      } else {
        setError(result.message || "Failed to fetch profile");
        toast.error(result.message || "Failed to fetch profile");
      }
    } catch (err) {
      setError("An error occurred while fetching the profile");
      toast.error("An error occurred while fetching the profile");
    } finally {
      setLoading(false);
    }
  }, [token, id]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchProfile();
    }
  }, [isAuthenticated, fetchProfile]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader size={48} text="Loading profile..." />
      </div>
    );
  }

  if (error || !profileUser) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <h2 className="text-2xl font-bold text-gray-900">{error || "User not found"}</h2>
      </div>
    );
  }

  return (
    <div className="px-4 py-8 space-y-8 animate-in fade-in duration-500 max-w-7xl mx-auto">
      <div className="bg-white dark:bg-slate-950 rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <ProfileHeader 
          user={profileUser}
          isReadOnly={true}
        />
        
        <div className="p-6 pt-0 space-y-8">
          <ProfileInfo user={profileUser} />
          <ResumeSection user={profileUser} isReadOnly={true} />
          
          <div className="h-px bg-gray-100" />
          
          <SkillsSection user={profileUser} isReadOnly={true} />
        </div>
      </div>
    </div>
  );
}