"use client";

import React from "react";
import Image from "next/image";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowUpRight01Icon,
  Search01Icon,
  ArrowRight01Icon,
  PlayIcon,
  Tick01Icon,
} from "@hugeicons/core-free-icons";

import { Button } from "@/components/ui/button";
import Link from "next/link";

/**
 * Hero component for the HireHeaven landing page
 */
export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-white dark:bg-slate-950 pt-16 pb-20 lg:pt-24 lg:pb-32">
      {/* Background glow blobs */}
      <div className="absolute -top-32 -right-32 -z-10 h-96 w-96 rounded-full bg-blue-100/40 dark:bg-blue-950/20 blur-3xl" />
      <div className="absolute -bottom-32 -left-32 -z-10 h-96 w-96 rounded-full bg-red-50/40 dark:bg-red-950/10 blur-3xl" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:items-center">

          {/* Left Content Column */}
          <div className="flex flex-col items-start space-y-8 animate-in fade-in slide-in-from-left-8 duration-700 ease-out">

            {/* Top Badge */}
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-100 dark:border-blue-900/40 bg-blue-50/50 dark:bg-blue-950/20 px-3 py-1 text-xs font-semibold text-blue-700 dark:text-blue-400 transition-colors hover:bg-blue-100/50 dark:hover:bg-blue-950/30">
              <HugeiconsIcon icon={ArrowUpRight01Icon} size={14} className="text-blue-600 dark:text-blue-400" />
              <span>#1 Job Platform in India</span>
            </div>

            {/* Main Heading */}
            <div className="space-y-4">
              <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-5xl lg:text-6xl xl:text-7xl">
                Find Your Dream Job at{" "}
                <span className="block mt-2">
                  <span className="text-blue-600">Hire</span>
                  <span className="text-red-500">Heaven</span>
                </span>
              </h1>
              <p className="max-w-xl text-lg leading-relaxed text-gray-600 dark:text-slate-400 sm:text-xl">
                Connect with top employers and discover opportunities that match your
                skills. Whether you're a job seeker or recruiter, we've got you covered
                with powerful tools and seamless experience.
              </p>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-3 gap-8 pt-4">
              {[
                { label: "Active Jobs", value: "10k+" },
                { label: "Companies", value: "5k+" },
                { label: "Job Seekers", value: "50k+" },
              ].map((stat) => (
                <div key={stat.label} className="flex flex-col gap-1">
                  <span className="text-2xl font-bold text-blue-600 dark:text-blue-400 tracking-tight sm:text-3xl">
                    {stat.value}
                  </span>
                  <span className="text-xs font-medium text-gray-500 dark:text-slate-500 uppercase tracking-wider">
                    {stat.label}
                  </span>
                </div>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-4 pt-4 sm:flex-row sm:items-center">
              <Link href="/jobs">
                <Button
                  size="lg"
                  className="group relative h-14 rounded-xl bg-[#0f172a] dark:bg-white dark:text-slate-900 px-8 py-4 transition-all hover:bg-[#1e293b] dark:hover:bg-slate-100 active:scale-[0.98]"
                >
                  <div className="flex items-center gap-3">
                    <HugeiconsIcon icon={Search01Icon} size={20} className="text-blue-400 dark:text-blue-600 group-hover:scale-110 transition-transform" />
                    <span className="font-semibold text-white dark:text-slate-900">Browse Jobs</span>
                    <HugeiconsIcon icon={ArrowRight01Icon} size={18} className="text-gray-400 dark:text-slate-500 group-hover:translate-x-1 transition-transform" />
                  </div>
                </Button>
              </Link>

              <Button
                variant="outline"
                size="lg"
                className="h-14 rounded-xl px-8 border-gray-200 dark:border-slate-700 bg-transparent hover:bg-gray-50 dark:hover:bg-slate-900 hover:border-gray-300 dark:hover:border-slate-600 text-gray-700 dark:text-slate-300 transition-all"
              >
                <div className="flex items-center gap-2">
                  <HugeiconsIcon icon={PlayIcon} size={18} className="text-blue-600 dark:text-blue-400" />
                  <span className="font-semibold">Learn More</span>
                </div>
              </Button>
            </div>

            {/* Bottom Features List */}
            <div className="flex flex-wrap items-center gap-x-8 gap-y-3 pt-6 border-t border-gray-100 dark:border-slate-800 w-full">
              {[
                "Free to use",
                "Verified employers",
                "Secure platform",
              ].map((feature) => (
                <div key={feature} className="flex items-center gap-2 group">
                  <div className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 transition-colors group-hover:bg-blue-100 dark:group-hover:bg-blue-950/50">
                    <HugeiconsIcon icon={Tick01Icon} size={12} />
                  </div>
                  <span className="text-sm font-medium text-gray-600 dark:text-slate-400 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">
                    {feature}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Right Image Column */}
          <div className="relative lg:block animate-in fade-in zoom-in duration-1000 ease-out">
            {/* Image Container */}
            <div className="relative overflow-hidden rounded-[2.5rem] border-[12px] border-white dark:border-slate-800 bg-white dark:bg-slate-800 shadow-2xl shadow-blue-900/10 dark:shadow-blue-950/30">
              <Image
                src="/hero-image.png"
                alt="Professional woman in a modern office environment"
                width={800}
                height={800}
                className="h-full w-full object-cover"
                priority
              />
              {/* Glass ring overlay */}
              <div className="absolute inset-0 ring-1 ring-inset ring-black/5 dark:ring-white/5 rounded-[1.8rem]" />
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}