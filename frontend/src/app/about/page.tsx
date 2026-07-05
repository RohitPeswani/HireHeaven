"use client";

import React from "react";
import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  InformationCircleIcon,
  ArrowRight01Icon,
  SparklesIcon,
  Tick01Icon,
  UserCircleIcon,
} from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Image from "next/image";


const About = () => {
  return (
    <div className="relative min-h-screen overflow-hidden bg-white dark:bg-slate-950 transition-colors duration-200">
      {/* Background glow blobs */}
      <div className="absolute -top-32 -right-32 -z-10 h-96 w-96 rounded-full bg-blue-100/40 dark:bg-blue-950/20 blur-3xl" />
      <div className="absolute top-1/3 -left-32 -z-10 h-96 w-96 rounded-full bg-red-50/40 dark:bg-red-950/10 blur-3xl" />
      <div className="absolute -bottom-32 right-1/4 -z-10 h-96 w-96 rounded-full bg-blue-50/30 dark:bg-blue-950/10 blur-3xl" />

      {/* Background dot grid pattern */}
      <div className="absolute inset-0 -z-20 h-full w-full bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] dark:bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)]" />

      {/* Mission Section */}
      <section className="container mx-auto px-4 py-16 md:py-24 animate-in fade-in slide-in-from-bottom-8 duration-700 ease-out">
        <div className="max-w-4xl mx-auto flex flex-col items-center text-center space-y-12">
          
          {/* Top Badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-100 dark:border-blue-900/40 bg-blue-50/50 dark:bg-blue-950/20 px-3.5 py-1.5 text-xs font-semibold text-blue-700 dark:text-blue-400 shadow-sm transition-colors hover:bg-blue-100/50 dark:hover:bg-blue-950/30">
            <HugeiconsIcon icon={InformationCircleIcon} size={14} className="text-blue-600 dark:text-blue-400" />
            <span>Discover Our Story</span>
          </div>

          {/* Image with container border and shadow matching Hero component */}
          <div className="relative w-full max-w-[850px]  group transition-transform duration-500 hover:scale-[1.01]">
            <div className="relative overflow-hidden max-h-[500px] rounded-[2.5rem] border-[12px] border-white dark:border-slate-800 bg-white dark:bg-slate-800 shadow-2xl shadow-blue-900/10 dark:shadow-blue-950/30">
              <Image
                src="/about.png"
                width={150}
                height={150}
                className="w-full h-[400px] object-cover rounded-[1.8rem]"
                alt="About HireHeaven"
              />
              {/* Glass overlay ring */}
              <div className="absolute inset-0 ring-1 ring-inset ring-black/5 dark:ring-white/5 rounded-[1.8rem]" />
            </div>
          </div>

          {/* Title and Mission Paragraph */}
          <div className="space-y-6 max-w-3xl">
            <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-5xl lg:text-6xl">
              Our Mission At{" "}
              <span className="inline-block">
                <span className="text-blue-600">Hire</span>
                <span className="text-red-500">Heaven</span>
              </span>
            </h1>
            <p className="text-lg md:text-xl leading-relaxed text-gray-600 dark:text-slate-400 font-medium">
              At HireHeaven, we're dedicated to revolutionizing the job search
              experience. Our mission is to create meaningful connections
              between talented individuals and forward-thinking companies,
              fostering growth and success for both.
            </p>
          </div>

        </div>
      </section>

      {/* Core Values Section */}
      <section className="border-t border-gray-100 dark:border-slate-900/60 py-20 bg-gray-50/30 dark:bg-slate-900/20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto space-y-12">
            <div className="text-center space-y-4">
              <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
                Our Core Pillars
              </h2>
              <p className="text-base text-gray-500 dark:text-slate-400 max-w-2xl mx-auto font-medium">
                The foundational principles guiding our effort to connect talent with their dream opportunities.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Card 1: Innovation */}
              <Card className="group border border-gray-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm hover:shadow-md hover:border-blue-100 dark:hover:border-blue-900/40 transition-all duration-300">
                <CardHeader className="p-0 flex flex-row items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform">
                    <HugeiconsIcon icon={SparklesIcon} size={20} />
                  </div>
                  <CardTitle className="text-base font-bold text-gray-900 dark:text-white">Innovation</CardTitle>
                </CardHeader>
                <CardContent className="p-0 mt-4">
                  <p className="text-sm text-gray-600 dark:text-slate-400 leading-relaxed font-medium">
                    Leveraging state-of-the-art AI technology to guide career growth and deliver highly tailored opportunities.
                  </p>
                </CardContent>
              </Card>

              {/* Card 2: Integrity */}
              <Card className="group border border-gray-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm hover:shadow-md hover:border-blue-100 dark:hover:border-blue-900/40 transition-all duration-300">
                <CardHeader className="p-0 flex flex-row items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-green-50 dark:bg-green-950/30 text-green-600 dark:text-green-400 group-hover:scale-110 transition-transform">
                    <HugeiconsIcon icon={Tick01Icon} size={20} />
                  </div>
                  <CardTitle className="text-base font-bold text-gray-900 dark:text-white">Integrity</CardTitle>
                </CardHeader>
                <CardContent className="p-0 mt-4">
                  <p className="text-sm text-gray-600 dark:text-slate-400 leading-relaxed font-medium">
                    Fostering trust by verifying listings and establishing absolute transparency between recruiters and candidates.
                  </p>
                </CardContent>
              </Card>

              {/* Card 3: Inclusivity */}
              <Card className="group border border-gray-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm hover:shadow-md hover:border-blue-100 dark:hover:border-blue-900/40 transition-all duration-300">
                <CardHeader className="p-0 flex flex-row items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-purple-50 dark:bg-purple-950/30 text-purple-600 dark:text-purple-400 group-hover:scale-110 transition-transform">
                    <HugeiconsIcon icon={UserCircleIcon} size={20} />
                  </div>
                  <CardTitle className="text-base font-bold text-gray-900 dark:text-white">Inclusivity</CardTitle>
                </CardHeader>
                <CardContent className="p-0 mt-4">
                  <p className="text-sm text-gray-600 dark:text-slate-400 leading-relaxed font-medium">
                    Democratizing employment opportunities for diverse applicants across all experience levels and backgrounds.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative overflow-hidden border-t border-gray-100 dark:border-slate-900/60 py-20 bg-gray-50/50 dark:bg-slate-900/50">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-4xl lg:text-5xl">
              Ready to find your dream job?
            </h2>

            <p className="text-lg text-gray-600 dark:text-slate-400 font-medium max-w-xl mx-auto">
              Join thousands of successful job seekers on HireHeaven today and secure your next big opportunity.
            </p>
            
            <div className="pt-4">
              <Link href="/jobs">
                <Button size="lg" className="gap-2 h-14 px-8 text-base rounded-xl font-bold group shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all">
                  Get Started
                  <HugeiconsIcon icon={ArrowRight01Icon} size={18} className="text-white/80 dark:text-slate-900/80 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;