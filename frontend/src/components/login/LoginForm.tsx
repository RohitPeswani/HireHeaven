"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, LoginFormValues } from "@/lib/schemas/loginSchema";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { 
  Mail01Icon, 
  LockIcon, 
  ArrowRight01Icon 
} from "@hugeicons/core-free-icons";
import RegisterFormField from "../register/RegisterFormField";
import { useDispatch } from "react-redux";
import { setUser } from "@/store/authSlice";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { LoginResponse } from "@/types";
import { HugeiconsIcon } from "@hugeicons/react";
import Link from "next/link";

const API_URL = process.env.NEXT_PUBLIC_AUTH_SERVICE_URL;

const LoginForm = () => {
  const dispatch = useDispatch();
  const router = useRouter();

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    mode: "onChange",
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const {
    formState: { isSubmitting, isValid }
  } = form;

  const onSubmit = async (values: LoginFormValues) => {
    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      const data: LoginResponse = await response.json();

      if (data.success) {
        toast.success("Login successful!");
        dispatch(setUser({
          user: data.existingUser[0],
          token: data.token
        }));
        
        // Wait a bit for toast to be seen
        await new Promise(resolve => setTimeout(resolve, 1000));
        router.push("/");
      } else {
        toast.error(data.message || "Invalid credentials");
      }
    } catch (err: any) {
      toast.error("Unable to connect to the server");
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <RegisterFormField
          control={form.control}
          name="email"
          label="Email Address"
          placeholder="you@example.com"
          icon={Mail01Icon}
          type="email"
        />

        <div className="space-y-1">
          <RegisterFormField
            control={form.control}
            name="password"
            label="Password"
            placeholder="••••••••"
            icon={LockIcon}
            type="password"
          />
          <div className="flex justify-end">
            <Link 
              href="/forgot" 
              className="text-xs font-medium text-blue-600 hover:underline"
            >
              Forgot Password?
            </Link>
          </div>
        </div>

        <Button 
          type="submit" 
          className="w-full h-12 bg-[#0f172a] dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 hover:bg-[#1e293b] text-white rounded-lg font-semibold group flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          disabled={isSubmitting || !isValid}
        >
          {isSubmitting ? (
            <>
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/20 border-t-white dark:border-black/20 dark:border-t-black" />
              <span>Signing in...</span>
            </>
          ) : (
            <>
              <span>Sign In</span>
              <HugeiconsIcon icon={ArrowRight01Icon} size={18} className="transition-transform group-hover:translate-x-1" />
            </>
          )}
        </Button>
      </form>
    </Form>
  );
};

export default LoginForm;
