"use client";

import React, { useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import { CheckmarkCircle02Icon } from "@hugeicons/core-free-icons";
import { toast } from "react-toastify";

export default function PaymentSuccessPage() {
  const params = useParams();
  const paymentId = params?.paymentId as string;

  useEffect(() => {
    toast.success("Subscription Purchased Successfully");
  }, []);

  return (
    <div className="flex items-center justify-center min-h-[85vh] bg-[#f8fafc] dark:bg-slate-950 px-4 py-12">
      <div className="max-w-md w-full bg-white dark:bg-slate-900 rounded-3xl border border-gray-100 dark:border-slate-800 shadow-xl dark:shadow-none p-8 sm:p-10 text-center space-y-8 animate-in fade-in zoom-in-95 duration-500">

        {/* Success Icon */}
        <div className="bg-[#f0fdf4] dark:bg-green-950/20 text-green-500 dark:text-green-400 rounded-full p-4 w-20 h-20 flex items-center justify-center mx-auto shadow-sm">
          <HugeiconsIcon icon={CheckmarkCircle02Icon} size={40} />
        </div>

        {/* Successful text */}
        <div className="space-y-3">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">Payment Successful!</h1>
          <div className="text-sm text-gray-500 dark:text-slate-400 font-medium leading-relaxed">
            Your Subscription is now active. Your transaction id is
            <div className="text-gray-600 dark:text-slate-300 font-semibold mt-2 font-mono break-all bg-gray-50 dark:bg-slate-950 p-2 rounded-lg border border-gray-100/50 dark:border-slate-800">
              {paymentId}
            </div>
          </div>
        </div>

        {/* Link back to profile */}
        <div className="pt-4 border-t border-gray-50 dark:border-slate-800">
          <Link
            href="/profile"
            className="text-gray-500 dark:text-slate-400 hover:text-gray-800 dark:hover:text-white transition-colors text-sm font-semibold underline decoration-2 underline-offset-4"
          >
            Go to account page
          </Link>
        </div>
      </div>
    </div>
  );
}
