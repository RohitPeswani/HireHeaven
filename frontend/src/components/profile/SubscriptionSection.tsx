"use client";

import React from "react";
import { User } from "@/types";
import { useRouter } from "next/navigation";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  LicenseIcon,
  Alert01Icon,
  CheckmarkCircle02Icon,
  Rotate01Icon
} from "@hugeicons/core-free-icons";

interface SubscriptionSectionProps {
  user: User | null;
}

const SubscriptionSection: React.FC<SubscriptionSectionProps> = ({ user }) => {
  const router = useRouter();
  const hasSubscription = user?.subscription ? true : false;
  const isSubscriptionActive = hasSubscription && new Date(user?.subscription!).getTime() > Date.now();
  const isSubscriptionExpired = hasSubscription && new Date(user?.subscription!).getTime() <= Date.now();

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      });
    } catch (e) {
      return dateString;
    }
  };

  return (
    <div className="mt-8 space-y-4">
      <div className="flex items-center gap-2 px-2 text-gray-900 dark:text-white font-semibold">
        <HugeiconsIcon icon={LicenseIcon} size={20} className="text-blue-600 dark:text-blue-400" />
        <span>Subscription Status</span>
      </div>

      {!hasSubscription && (
        <div className="bg-gradient-to-r from-blue-50/50 to-indigo-50/50 dark:from-blue-950/20 dark:to-indigo-950/20 border border-blue-100/50 dark:border-blue-900/30 p-6 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="font-bold text-gray-900 dark:text-white text-base">No Active Subscription</h3>
            <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">Subscribe to unlock premium features and benefits</p>
          </div>
          <button
            type="button"
            onClick={() => router.push("/subscribe")}
            className="bg-[#0f172a] hover:bg-[#1e293b] dark:bg-white dark:hover:bg-slate-100 dark:text-slate-900 active:scale-95 text-white font-bold px-6 py-2.5 rounded-xl text-sm flex items-center gap-2 shadow-sm transition-all cursor-pointer"
          >
            <HugeiconsIcon icon={LicenseIcon} size={18} />
            Subscribe Now
          </button>
        </div>
      )}

      {isSubscriptionExpired && (
        <div className="bg-red-50/40 dark:bg-red-950/10 border border-red-100 dark:border-red-900/30 p-6 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="font-bold text-red-700 dark:text-red-400 text-base flex items-center gap-2">
              <HugeiconsIcon icon={Alert01Icon} size={20} />
              Subscription Expired
            </h3>
            <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">Expired on: {formatDate(user?.subscription!)}</p>
          </div>
          <button
            type="button"
            onClick={() => router.push("/subscribe")}
            className="bg-red-600 hover:bg-red-700 active:scale-95 text-white font-bold px-6 py-2.5 rounded-xl text-sm flex items-center gap-2 shadow-sm transition-all cursor-pointer"
          >
            <HugeiconsIcon icon={Rotate01Icon} size={18} />
            Renew Subscription
          </button>
        </div>
      )}

      {isSubscriptionActive && (
        <div className="bg-green-50/40 dark:bg-green-950/10 border border-green-150 dark:border-green-900/30 p-6 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="font-bold text-green-700 dark:text-green-400 text-base flex items-center gap-2">
              <HugeiconsIcon icon={CheckmarkCircle02Icon} size={20} />
              Active Subscription
            </h3>
            <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">Valid until: {formatDate(user?.subscription!)}</p>
          </div>
          <button
            type="button"
            className="bg-green-600 hover:bg-green-750 text-white font-bold px-6 py-2.5 rounded-xl text-sm flex items-center gap-2 shadow-sm transition-all cursor-default"
          >
            <HugeiconsIcon icon={CheckmarkCircle02Icon} size={18} />
            Subscribed
          </button>
        </div>
      )}
    </div>
  );
};

export default SubscriptionSection;
