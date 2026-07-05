"use client";

import React, { useState } from "react";
import { User } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { HugeiconsIcon } from "@hugeicons/react";
import { Award01Icon, Add01Icon, Cancel01Icon, CourseIcon } from "@hugeicons/core-free-icons";
import { toast } from "react-toastify";
import { Loader } from "../loader";


interface SkillsSectionProps {
  user: User | null;
  onSkillsUpdate?: (skills: string[]) => Promise<void>;
  loading?: boolean;
  isReadOnly?: boolean;
}

const SkillsSection: React.FC<SkillsSectionProps> = ({
  user,
  onSkillsUpdate,
  loading = false,
  isReadOnly = false
}) => {
  const [newSkill, setNewSkill] = useState("");
  const currentSkills = user?.skills || [];

  const handleAddSkill = async () => {
    const skill = newSkill.trim();
    if (!skill) return;

    if (currentSkills.includes(skill)) {
      toast.error("Skill already exists");
      return;
    }

    try {
      if (onSkillsUpdate) {
        await onSkillsUpdate([...currentSkills, skill]);
        setNewSkill("");

      }
    } catch (err) {
      console.log(err);
    }
  };

  const handleRemoveSkill = async (skillToRemove: string) => {
    try {
      if (onSkillsUpdate) {
        await onSkillsUpdate(currentSkills.filter(s => s !== skillToRemove));
      }
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <Card className="overflow-hidden border border-gray-150 dark:border-slate-800 shadow-sm mb-8 bg-white dark:bg-slate-950">
      <div className="bg-blue-600 p-6 flex items-center gap-3">
        <div className="p-2 bg-white/20 rounded-lg">
          <HugeiconsIcon icon={Award01Icon} size={24} className="text-white" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-white">Your Skills</h2>
          <p className="text-blue-100 text-sm">Showcase your expertise and abilities</p>
        </div>
      </div>
      <CardContent className="p-6">
        {!isReadOnly && (
          <div className="flex gap-2 mb-6">
            <div className="relative flex-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                <HugeiconsIcon icon={CourseIcon} size={18} />
              </span>
              <Input
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                placeholder="e.g. React, Node.js, Python..."
                className="pl-10 h-11 border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 dark:text-white"
                onKeyPress={(e) => e.key === "Enter" && handleAddSkill()}
              />
            </div>
            <Button
              onClick={handleAddSkill}
              className="h-11 bg-[#0f172a] hover:bg-[#1e293b] dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 text-white gap-2 px-6"
            >
              {loading ? <Loader size={18} text={"Adding skills"} className="text-white" /> : <HugeiconsIcon icon={Add01Icon} size={18} />}
              {loading ? "" : "Add Skill"}
            </Button>
          </div>
        )}

        <div className="flex flex-wrap gap-3">
          {currentSkills.length > 0 ? (
            currentSkills.map((skill) => (
              <Badge
                key={skill}
                variant="secondary"
                className="bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-700 px-4 py-2 text-sm font-medium gap-2 border-none rounded-full"
              >
                {skill}
                {!isReadOnly && (
                  <button
                    onClick={() => handleRemoveSkill(skill)}
                    className="hover:text-red-500 transition-colors"
                    aria-label={`Remove ${skill}`}
                  >
                    <HugeiconsIcon icon={Cancel01Icon} size={14} />
                  </button>
                )}
              </Badge>
            ))
          ) : (
            <div className="w-full py-12 flex flex-col items-center justify-center text-gray-400 gap-4">
              <HugeiconsIcon icon={Award01Icon} size={48} className="opacity-20" />
              <p className="text-sm font-medium">No Skill Added Yet. Start Building Your Profile!</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default SkillsSection;
