"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  registerSchema,
  RegisterFormValues
} from "@/lib/schemas/registerSchema";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import {
  UserIcon,
  Mail01Icon,
  LockIcon,
  CallIcon,
  File01Icon,
  Note01Icon,
  ArrowRight01Icon,
  SparklesIcon
} from "@hugeicons/core-free-icons";
import RoleSelect from "./RoleSelect";
import RegisterFormField from "./RegisterFormField";
import { useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { RegisterResponse } from "@/types";
import { HugeiconsIcon } from "@hugeicons/react";
import { Textarea } from "@/components/ui/textarea";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form";

const API_URL = process.env.NEXT_PUBLIC_AUTH_SERVICE_URL;

const RegisterForm = () => {
  const dispatch = useDispatch();
  const router = useRouter();

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    mode: "onChange",
    defaultValues: {
      role: undefined,
      name: "",
      email: "",
      password: "",
      phoneNumber: "",
      bio: "",
    },
  });

  const {
    formState: { isSubmitting }
  } = form;

  const watchRole = form.watch("role");

  const onSubmit = async (values: RegisterFormValues) => {

    try {
      const formData = new FormData();
      formData.append("name", values.name);
      formData.append("email", values.email);
      formData.append("password", values.password);
      formData.append("phoneNumber", `+91 ${values.phoneNumber}`);
      formData.append("role", values.role);

      if (values.role === "jobseeker") {
        if (values.resume) {
          formData.append("file", values.resume);
        }
        if (values.bio) {
          formData.append("bio", values.bio);
        }
      }

      const response = await fetch(`${API_URL}/api/auth/register`, {
        method: "POST",
        body: formData,
      });

      const data: RegisterResponse = await response.json();


      console.log(data);

      if (data.success) {
        toast.success("Registration successful!");
        // We don't automatically login here based on the controller code (it just returns user)
        // But for a better UX, usually you'd login or redirect to login.
        // Given the requirement "Store authenticated user information in Redux", 
        // and usually register returns a token if it's an auto-login register.
        // Let's check the controller again.
        // Controllers/auth.ts: returns message and registerUser (which is the user object).
        // It does NOT return a token. So the user needs to login.
        // However, the prompt says "Store authenticated user information in Redux".
        // I will redirect to login for now, or just show success.
        await new Promise(resolve => setTimeout(resolve, 1500));
        router.push("/login");
      } else {
        const errorMsg = (data as any).message || "Registration failed";
        toast.error(errorMsg);
      }
    } catch (err: any) {
      const errorMsg = "Unable to connect to the server";
      toast.error(errorMsg);
    }
  };

  console.log("isSubmitting", isSubmitting);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        <RoleSelect control={form.control} />

        {watchRole && (
          <div className="space-y-5 animate-in fade-in slide-in-from-top-2 duration-300">
            <RegisterFormField
              control={form.control}
              name="name"
              label="Full Name"
              placeholder="John Doe"
              icon={UserIcon}
            />

            <RegisterFormField
              control={form.control}
              name="email"
              label="Email Address"
              placeholder="you@example.com"
              icon={Mail01Icon}
              type="email"
            />

            <RegisterFormField
              control={form.control}
              name="password"
              label="Password"
              placeholder="••••••••"
              icon={LockIcon}
              type="password"
            />

            <RegisterFormField
              control={form.control}
              name="phoneNumber"
              label="Phone Number"
              placeholder="+91 1234567890"
              icon={CallIcon}
            />

            {watchRole === "jobseeker" && (
              <>
                <RegisterFormField
                  control={form.control}
                  name="resume"
                  label="Resume (PDF)"
                  placeholder="Select PDF file"
                  icon={File01Icon}
                  type="file"
                />

                <FormField
                  control={form.control}
                  name="bio"
                  render={({ field }: { field: any }) => (
                    <FormItem className="space-y-1.5">
                      <FormLabel className="text-sm font-semibold text-gray-700 dark:text-slate-300">Bio</FormLabel>
                      <FormControl>
                        <div className="relative group">
                          <div className="absolute left-3 top-3 text-gray-400 group-focus-within:text-blue-600 transition-colors">
                            <HugeiconsIcon icon={Note01Icon} size={18} />
                          </div>
                          <Textarea
                            {...field}
                            placeholder="Tell us about yourself..."
                            className="pl-10 min-h-[100px] rounded-lg border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-950 dark:text-white focus-visible:ring-blue-600 transition-all resize-none"
                          />
                        </div>
                      </FormControl>
                      <FormMessage className="text-xs text-red-500" />
                    </FormItem>
                  )}
                />
              </>
            )}

            <Button
              type="submit"
              className="w-full h-12 bg-[#0f172a] hover:bg-[#1e293b] text-white rounded-lg font-semibold group flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/20 border-t-white" />
                  <span>Registering...</span>

                </>

              ) : (
                <>
                  <span>Register</span>
                  <HugeiconsIcon icon={ArrowRight01Icon} size={18} className="transition-transform group-hover:translate-x-1" />
                </>
              )}
            </Button>
          </div>
        )}
      </form>
    </Form>
  );
};

export default RegisterForm;
