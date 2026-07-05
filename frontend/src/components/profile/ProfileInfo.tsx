"use client";

import React from "react";
import { User } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { HugeiconsIcon } from "@hugeicons/react";
import { Note01Icon, Mail01Icon, CallIcon, ContactIcon } from "@hugeicons/core-free-icons";

interface ProfileInfoProps {
  user: User | null;
}

const ProfileInfo: React.FC<ProfileInfoProps> = ({ user }) => {
  return (
    <div className="grid gap-6">
      {/* About Section */}
      <Card>
        <CardHeader className="flex flex-row items-center gap-2 py-4">
            <HugeiconsIcon icon={Note01Icon} size={20} className="text-gray-500 dark:text-slate-400" />
            <CardTitle className="text-lg font-semibold">About</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 dark:text-slate-300 leading-relaxed">
            {user?.bio || "Hello, I am ready to work with you."}
          </p>
        </CardContent>
      </Card>

      {/* Contact Information */}
      <div className="grid gap-4">
        <div className="flex items-center gap-2 px-2 text-gray-900 dark:text-white font-semibold">
            <HugeiconsIcon icon={ContactIcon} size={20} className="text-blue-600 dark:text-blue-400" />
            <span>Contact Information</span>
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          <Card className="bg-blue-50/30 dark:bg-blue-950/10 border-blue-100/50 dark:border-blue-900/20 shadow-none">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <HugeiconsIcon icon={Mail01Icon} size={20} className="text-blue-600 dark:text-blue-400" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs text-gray-500 dark:text-slate-400 font-medium">Email</p>
                <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{user?.email}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-blue-50/30 dark:bg-blue-950/10 border-blue-100/50 dark:border-blue-900/20 shadow-none">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <HugeiconsIcon icon={CallIcon} size={20} className="text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-slate-400 font-medium">Phone</p>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">{user?.phone_number || "Not provided"}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ProfileInfo;
