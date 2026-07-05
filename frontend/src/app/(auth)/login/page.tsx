import React from "react";
import LoginForm from "@/components/login/LoginForm";
import Link from "next/link";

const Login = () => {
  return (
    <div className="min-h-[calc(100vh-64px)] w-full flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8 bg-gray-50/50 dark:bg-slate-950">
      {/* Radial dot pattern — light only; hidden in dark to avoid visual noise */}
      <div className="absolute inset-0 -z-10 h-full w-full bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] dark:bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)]" />

      <div className="w-full max-w-md space-y-8">
        <div className="text-center space-y-2 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white leading-tight">
            Welcome back to <br />
            <span className="text-blue-600">Hire</span>
            <span className="text-red-500">Heaven</span>
          </h1>
          <p className="text-gray-500 dark:text-slate-400 font-medium">
            Sign in to continue your journey
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-2xl shadow-xl shadow-gray-200/50 dark:shadow-none border border-gray-100 dark:border-slate-800 animate-in fade-in slide-in-from-bottom-8 duration-700">
          <LoginForm />
        </div>

        <div className="text-center animate-in fade-in slide-in-from-bottom-4 duration-1000">
          <p className="text-sm text-gray-500 dark:text-slate-400">
            Don't have an account?{" "}
            <Link
              href="/register"
              className="text-blue-600 dark:text-blue-400 font-bold hover:underline underline-offset-4 decoration-2"
            >
              Create a new account?
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;