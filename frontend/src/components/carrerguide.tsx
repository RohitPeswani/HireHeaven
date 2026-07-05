"use client";

import React, { useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  SparklesIcon,
  ArrowRight01Icon,
  Cancel01Icon,
  ArtificialIntelligence02Icon,
  Idea01Icon,
  Briefcase02Icon,
  Tick01Icon,
  AlertCircleIcon,
  Book02Icon,
  FavouriteIcon,
} from "@hugeicons/core-free-icons";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { CareerGuidance, CareerGuidanceResponse, Skill } from "@/types";

const API_BASE_URL = process.env.NEXT_PUBLIC_UTILS_SERVICE_URL || "http://localhost:5001";

/**
 * Career Guidance Section Component
 */
export default function CarrerGuide() {
  const [isOpen, setIsOpen] = useState(false);
  const [skillInput, setSkillInput] = useState("");
  const [skills, setSkills] = useState<Skill[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [guidance, setGuidance] = useState<CareerGuidance | null>(null);
  const [error, setError] = useState<string | null>(null);

  // ─── Skill Management ──────────────────────────────────────────────────────

  const addSkill = () => {
    const trimmedSkill = skillInput.trim();
    if (!trimmedSkill) return;

    const isDuplicate = skills.some(
      (s) => s.name.toLowerCase() === trimmedSkill.toLowerCase()
    );

    if (isDuplicate) {
      setSkillInput("");
      return;
    }

    setSkills([...skills, { id: crypto.randomUUID(), name: trimmedSkill }]);
    setSkillInput("");
  };

  const removeSkill = (id: string) => {
    setSkills(skills.filter((s) => s.id !== id));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addSkill();
    }
  };

  // ─── AI Integration ────────────────────────────────────────────────────────

  const fetchGuidance = async () => {
    if (skills.length === 0) return;

    setIsLoading(true);
    setError(null);
    setGuidance(null);

    try {
      const response = await fetch(`${API_BASE_URL}/api/utils/career-guidance`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ skills: skills.map((s) => s.name) }),
      });

      const result: CareerGuidanceResponse = await response.json();
      console.log("result data : ", result.data);

      if (result.success && result.data) {
        setGuidance(result.data);
      } else {
        setError(result.error || "Failed to generate guidance. Please try again.");
      }
    } catch (err) {
      setError("Unable to connect to the AI service. Please ensure the backend is running.");
    } finally {
      setIsLoading(false);
    }
  };

  // ─── Render Helpers ────────────────────────────────────────────────────────

  return (
    <section className="relative overflow-hidden bg-gray-50/50 dark:bg-slate-900/50 py-20 lg:py-32">
      <div className="absolute top-0 left-1/2 -z-10 h-full w-full -translate-x-1/2 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] dark:bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)]" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center text-center space-y-6 max-w-3xl mx-auto">

          <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 dark:border-blue-900/40 bg-white dark:bg-slate-900 px-3 py-1 text-xs font-semibold text-blue-600 dark:text-blue-400 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
            <HugeiconsIcon icon={SparklesIcon} size={14} />
            <span>AI-Powered Carrer Guidance</span>
          </div>

          <div className="space-y-4">
            <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-4xl lg:text-5xl">
              Discover Your Carrer Path
            </h2>
            <p className="text-lg text-gray-600 dark:text-slate-400">
              Get personalized job recomendations and learnings roadmaps based on your skills.
            </p>
          </div>

          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger render={<Button
              size="lg"
              className="group h-14 rounded-xl bg-[#0f172a] px-8 py-4 transition-all hover:bg-[#1e293b]"
            >
              <div className="flex items-center gap-2">
                <HugeiconsIcon icon={ArtificialIntelligence02Icon} size={18} className="text-blue-400" />
                <span className="font-semibold text-white">Get Carrer Guidance</span>
                <HugeiconsIcon icon={ArrowRight01Icon} size={18} className="text-gray-400 group-hover:translate-x-1 transition-transform" />
              </div>
            </Button>}>

            </DialogTrigger>

            <DialogContent className="sm:max-w-[700px] max-h-[90vh] p-0 overflow-hidden rounded-2xl border border-gray-200 dark:border-slate-700 shadow-2xl flex flex-col bg-white dark:bg-slate-900">
              {!guidance && !error && (
                <div className="p-6 space-y-6 overflow-y-auto">
                  <DialogHeader className="space-y-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400">
                      <HugeiconsIcon icon={SparklesIcon} size={24} />
                    </div>
                    <DialogTitle className="text-2xl font-bold text-gray-900 dark:text-white">Tell us about your skills</DialogTitle>
                    <DialogDescription className="text-gray-500 dark:text-slate-400 text-sm">
                      Add your technical skills to recieve personalized carrer recomendations
                    </DialogDescription>
                  </DialogHeader>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label htmlFor="skill-input" className="text-sm font-semibold text-gray-700 dark:text-slate-300">Add Skills</label>
                      <div className="flex gap-2">
                        <Input
                          id="skill-input"
                          placeholder="e.g., React, Node.js, Python..."
                          value={skillInput}
                          onChange={(e) => setSkillInput(e.target.value)}
                          onKeyDown={handleKeyDown}
                          className="h-11 rounded-lg border-gray-200 dark:border-slate-700 dark:bg-slate-950 dark:text-white focus:ring-blue-600"
                        />
                        <Button
                          onClick={addSkill}
                          className="h-11 px-6 bg-gray-900 hover:bg-gray-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100"
                        >
                          Add
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider">
                          Your Skills ({skills.length})
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-2 min-h-[40px] p-1">
                        {skills.length === 0 ? (
                          <div className="text-sm text-gray-400 dark:text-slate-500 italic py-2">No skills added yet...</div>
                        ) : (
                          skills.map((skill) => (
                            <div key={skill.id} className="inline-flex items-center gap-1.5 rounded-full bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/30 px-3 py-1.5 text-sm font-medium text-blue-700 dark:text-blue-300 animate-in fade-in zoom-in-95 duration-200">
                              <span>{skill.name}</span>
                              <button
                                onClick={() => removeSkill(skill.id)}
                                className="rounded-full p-0.5 hover:bg-red-50 dark:hover:bg-red-950/20 text-gray-400 dark:text-slate-400 hover:text-red-500 dark:hover:text-red-400 transition-colors"
                              >
                                <HugeiconsIcon icon={Cancel01Icon} size={14} />
                              </button>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 sticky bottom-0 bg-white dark:bg-slate-900">
                    <Button
                      onClick={fetchGuidance}
                      disabled={skills.length === 0 || isLoading}
                      className="w-full h-12 rounded-xl bg-gray-900 group dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100"
                    >
                      {isLoading ? (
                        <div className="flex items-center gap-2">
                          <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/20 border-t-white" />
                          <span>Analyzing Your skills...</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <HugeiconsIcon icon={SparklesIcon} size={18} className="text-blue-400" />
                          <span>Generate Carrer Guidance</span>
                        </div>
                      )}
                    </Button>
                  </div>
                </div>
              )}

              {/* Guidance Result View */}
              {guidance && (
                <>
                  <div className="p-6 border-b border-gray-100 dark:border-slate-800 flex items-center justify-between bg-white dark:bg-slate-900 sticky top-0 z-10">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400">
                        <HugeiconsIcon icon={Idea01Icon} size={20} />
                      </div>
                      <DialogTitle className="text-xl font-bold text-gray-900 dark:text-white">Your Personalized Carrer Guide</DialogTitle>
                    </div>
                    <button
                      onClick={() => { setGuidance(null); }}
                      className="text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-white p-1 rounded-md hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
                    >
                      <HugeiconsIcon icon={Cancel01Icon} size={18} />
                    </button>
                  </div>

                  <div className="flex-1 overflow-y-auto p-6 space-y-10 bg-gray-50/30 dark:bg-slate-950/50">
                    {/* 1. Summary Section */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-blue-600">
                        <HugeiconsIcon icon={Idea01Icon} size={18} />
                        <h3 className="font-bold uppercase tracking-wider text-xs">Carrer Summary</h3>
                      </div>
                      <div className="rounded-2xl border border-blue-50 dark:border-blue-900/20 bg-white dark:bg-slate-900 p-6 text-sm leading-relaxed text-gray-700 dark:text-slate-300 shadow-sm">
                        {guidance.summary}
                      </div>
                    </div>

                    {/* 2. Recommended Career Paths (Job Options) */}
                    <div className="space-y-5">
                      <div className="flex items-center gap-2 text-blue-600">
                        <HugeiconsIcon icon={Briefcase02Icon} size={18} />
                        <h3 className="font-bold uppercase tracking-wider text-xs">Recomended Carrer Paths</h3>
                      </div>
                      <div className="grid grid-cols-1 gap-4">
                        {guidance.jobOptions.map((job, idx) => (
                          <div key={idx} className="group rounded-2xl border border-gray-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm transition-all hover:shadow-md hover:border-blue-100 dark:hover:border-blue-900/40">
                            <h4 className="text-lg font-bold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{job.title}</h4>
                            <div className="mt-4 space-y-4">
                              <div className="space-y-1.5">
                                <span className="text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest block">Responsibilities:</span>
                                <p className="text-sm text-gray-600 dark:text-slate-300 leading-snug">{job.responsibilities}</p>
                              </div>
                              <div className="space-y-1.5">
                                <span className="text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest block">Why this Role:</span>
                                <p className="text-sm text-gray-600 dark:text-slate-300 leading-snug italic font-medium">{job.why}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* 3. Skills to Learn */}
                    <div className="space-y-6">
                      <div className="flex items-center gap-2 text-blue-600">
                        <HugeiconsIcon icon={Book02Icon} size={18} />
                        <h3 className="font-bold uppercase tracking-wider text-xs">Skills to Learn</h3>
                      </div>
                      <div className="space-y-6">
                        {guidance.skillsToLearn.map((category, idx) => (
                          <div key={idx} className="space-y-3">
                            <h5 className="flex items-center gap-2 text-sm font-bold text-gray-800 dark:text-slate-200">
                              <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                              {category.category}
                            </h5>
                            <div className="grid grid-cols-1 gap-3">
                              {category.skills.map((skill, sIdx) => (
                                <div key={sIdx} className="rounded-xl border border-gray-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm hover:border-blue-50 dark:hover:border-blue-900/20 transition-colors">
                                  <div className="flex items-start gap-3">
                                    <div className="mt-1 h-5 w-5 flex shrink-0 items-center justify-center rounded-full bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400">
                                      <HugeiconsIcon icon={FavouriteIcon} size={10} />
                                    </div>
                                    <div className="space-y-2">
                                      <p className="text-sm font-bold text-gray-900 dark:text-white">{skill.title}</p>
                                      <p className="text-xs text-gray-600 dark:text-slate-400 leading-relaxed"><span className="font-semibold text-gray-400 dark:text-slate-500 uppercase text-[9px] mr-1">Why:</span>{skill.why}</p>
                                      <p className="text-xs text-blue-600 dark:text-blue-400 leading-relaxed bg-blue-50/30 dark:bg-blue-950/10 p-2 rounded-lg"><span className="font-semibold text-blue-400 dark:text-blue-500 uppercase text-[9px] mr-1">How:</span>{skill.how}</p>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* 4. Learning Approach */}
                    <div className="space-y-5">
                      <div className="flex items-center gap-2 text-blue-600">
                        <HugeiconsIcon icon={Tick01Icon} size={18} />
                        <h3 className="font-bold uppercase tracking-wider text-xs">Learning Approach</h3>
                      </div>
                      <div className="rounded-2xl border border-blue-50 dark:border-blue-900/20 bg-white dark:bg-slate-900 p-6 shadow-sm">
                        <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-4">{guidance.learningApproach.title}</h4>
                        <ul className="space-y-3">
                          {guidance.learningApproach.points.map((point, idx) => (
                            <li key={idx} className="flex items-start gap-3 text-xs text-gray-600 dark:text-slate-400 leading-relaxed">
                              <div className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400">
                                <HugeiconsIcon icon={Tick01Icon} size={10} />
                              </div>
                              <span dangerouslySetInnerHTML={{ __html: point.replace(/\*\*(.*?)\*\*/g, '<b class="text-gray-900 font-bold">$1</b>') }} />
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 border-t border-gray-100 dark:border-slate-800 bg-white dark:bg-slate-900 sticky bottom-0 z-10">
                    <Button
                      variant="outline"
                      className="w-full h-11 rounded-xl font-semibold border-gray-200 dark:border-slate-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800"
                      onClick={() => setGuidance(null)}
                    >
                      Back to Skills
                    </Button>
                  </div>
                </>
              )}

              {/* Error Handling */}
              {error && (
                <div className="p-10 text-center space-y-6">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 shadow-inner">
                    <HugeiconsIcon icon={AlertCircleIcon} size={32} />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">Something went wrong</h3>
                    <p className="text-sm text-gray-500 dark:text-slate-400 max-w-xs mx-auto">{error}</p>
                  </div>
                  <Button
                    onClick={() => { setError(null); setGuidance(null); }}
                    className="w-full h-12 bg-gray-900 rounded-xl"
                  >
                    Try Again
                  </Button>
                </div>
              )}
            </DialogContent>
          </Dialog>
        </div>

        <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto opacity-50">
          <div className="flex flex-col items-center text-center p-6 border border-dashed border-gray-200 dark:border-slate-700 rounded-2xl transition-all hover:opacity-100 hover:border-blue-200 dark:hover:border-blue-900/40">
            <p className="text-sm text-gray-500 dark:text-slate-400 italic">"The AI career path was spot on. Highly recommend!"</p>
            <span className="mt-2 font-bold text-[10px] tracking-widest text-blue-600 dark:text-blue-400 uppercase">— Top Talent</span>
          </div>
          <div className="flex flex-col items-center text-center p-6 border border-dashed border-gray-200 dark:border-slate-700 rounded-2xl transition-all hover:opacity-100 hover:border-blue-200 dark:hover:border-blue-900/40">
            <p className="text-sm text-gray-500 dark:text-slate-400 italic">"A great way to discover new learning roadmaps."</p>
            <span className="mt-2 font-bold text-[10px] tracking-widest text-blue-600 dark:text-blue-400 uppercase">— New Graduate</span>
          </div>
        </div>
      </div>
    </section>
  );
}