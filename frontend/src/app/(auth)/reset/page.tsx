"use client";

import React, { useState, Suspense } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { toast } from "react-toastify";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  LockPasswordIcon,
  ArrowLeft01Icon,
  ViewIcon,
  ViewOffIcon
} from "@hugeicons/core-free-icons";
import { Loader } from "@/components/loader";

const resetSchema = z.object({
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string().min(1, "Confirm password is required"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type ResetFormValues = z.infer<typeof resetSchema>;

const AUTH_API_BASE = process.env.NEXT_PUBLIC_AUTH_SERVICE_URL || "http://localhost:5000";

const ResetPasswordContent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const form = useForm<ResetFormValues>({
    resolver: zodResolver(resetSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (values: ResetFormValues) => {
    if (!token) {
      toast.error("Invalid or missing reset token.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${AUTH_API_BASE}/api/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          password: values.password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("Password reset successfully!");
        router.push("/login");
      } else {
        toast.error(data.message || "Failed to reset password. The link may have expired.");
      }
    } catch (error) {
      console.error("Reset password error:", error);
      toast.error("An error occurred. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="text-center p-8 bg-red-50 dark:bg-red-950/10 border border-red-100 dark:border-red-900/30 rounded-2xl max-w-md mx-auto">
        <h2 className="text-xl font-bold text-red-700 dark:text-red-400 mb-2">Invalid Link</h2>
        <p className="text-red-600 dark:text-red-400 mb-6">This password reset link is invalid or has expired.</p>
        <Button onClick={() => router.push("/forgot")} className="bg-red-600 hover:bg-red-700 text-white rounded-xl">
          Request new link
        </Button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md">
      <Card className="border border-gray-100 dark:border-slate-800 shadow-xl dark:shadow-none rounded-2xl overflow-hidden bg-white dark:bg-slate-900">
        <CardContent className="p-8">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Reset Password</h1>
            <p className="text-gray-500 dark:text-slate-400">Enter your new password below.</p>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-700 dark:text-slate-300 font-semibold mb-1 block text-sm">Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showPassword ? "text" : "password"}
                          placeholder="••••••••"
                          {...field}
                          className="h-12 pl-4 pr-12 border-gray-200 dark:border-slate-700 dark:bg-slate-950 dark:text-white focus:border-blue-500 focus:ring-blue-500 transition-all text-gray-900 rounded-xl"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300"
                        >
                          <HugeiconsIcon icon={showPassword ? ViewOffIcon : ViewIcon} size={18} />
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-700 dark:text-slate-300 font-semibold mb-1 block text-sm">Confirm Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showConfirmPassword ? "text" : "password"}
                          placeholder="••••••••"
                          {...field}
                          className="h-12 pl-4 pr-12 border-gray-200 dark:border-slate-700 dark:bg-slate-950 dark:text-white focus:border-blue-500 focus:ring-blue-500 transition-all text-gray-900 rounded-xl"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300"
                        >
                          <HugeiconsIcon icon={showConfirmPassword ? ViewOffIcon : ViewIcon} size={18} />
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                className="w-full h-12 bg-[#0f172a] dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 text-white hover:bg-[#1e293b] rounded-xl font-bold text-lg transition-all"
                disabled={loading}
              >
                {loading ? <Loader size={20} className="text-white dark:text-blck" text="Submitting" /> : "Submit"}
              </Button>

              <div className="text-center">
                <Link
                  href="/login"
                  className="inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium transition-colors"
                >
                  Go to login page
                </Link>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

const ResetPasswordPage = () => {
  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4 bg-gray-50/50 dark:bg-slate-950">
      <Suspense fallback={<Loader size={40} className="text-blue-600" />}>
        <ResetPasswordContent />
      </Suspense>
    </div>
  );
};

export default ResetPasswordPage;
