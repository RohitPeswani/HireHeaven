"use client";

import React from "react";
import { User } from "@/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { HugeiconsIcon } from "@hugeicons/react";
import { Camera01Icon, PencilEdit01Icon, Briefcase02Icon } from "@hugeicons/core-free-icons";
import { Loader } from "../loader";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";

interface ProfileHeaderProps {
  user?: User | null;
  onEditAvatar?: () => void;
  onEditName?: () => void;
  loading?: boolean;
  isReadOnly?: boolean;
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  user: profileUser,
  onEditAvatar,
  onEditName,
  loading = false,
  isReadOnly = false
}) => {
  const { user: authUser } = useSelector((state: RootState) => state.auth);

  console.log("profile header component", authUser);
  const user = profileUser || authUser;

  const userInitials = user?.name
    ? user.name
      .split(" ")
      .map((n: string) => n[0])
      .join("")
      .toUpperCase()
    : "??";

  return (
    <div className="relative mb-8">
      {/* Banner */}
      <div className="h-48 w-full bg-blue-600 rounded-t-xl" />

      {/* Profile Info Overlay */}
      <div className="px-6 -mt-12 flex flex-col md:flex-row md:items-end gap-4 relative">
        <div className="relative group">
          <Avatar className="h-32 w-32 border-4 border-white dark:border-slate-900 shadow-lg bg-white dark:bg-slate-900 overflow-hidden">
            {loading ? <Loader size={32} /> : <><AvatarImage src={user?.profile_pic} alt={user?.name} className="object-cover" />
              <AvatarFallback className="bg-gray-100 dark:bg-slate-800 text-3xl font-bold text-blue-600 dark:text-blue-400 uppercase">
                {userInitials}
              </AvatarFallback></>}
          </Avatar>
          {!isReadOnly && (
            <button
              onClick={onEditAvatar}
              className="absolute bottom-1 right-1 p-2 bg-white dark:bg-slate-850 rounded-full shadow-md hover:bg-gray-50 dark:hover:bg-slate-800 border border-gray-100 dark:border-slate-700 transition-all"
              aria-label="Change profile picture"
            >
              <HugeiconsIcon icon={Camera01Icon} size={18} className="text-gray-600 dark:text-slate-350" />
            </button>
          )}
        </div>

        <div className="flex-1 pb-2">
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{user?.name || "Anonymous User"}</h1>
            {!isReadOnly && (
              <button
                onClick={onEditName}
                className="p-1 hover:bg-gray-100 dark:hover:bg-slate-800 rounded transition-colors"
                aria-label="Edit name"
              >
                <HugeiconsIcon icon={PencilEdit01Icon} size={20} className="text-gray-400 dark:text-slate-500" />
              </button>
            )}
          </div>
          <div className="flex items-center gap-2 mt-1 text-gray-500 dark:text-slate-400">
            <HugeiconsIcon icon={Briefcase02Icon} size={16} />
            <span className="text-sm font-medium capitalize">{user?.role || "Jobseeker"}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileHeader;
