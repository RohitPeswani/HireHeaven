"use client";

import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from "@/components/ui/dialog";
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { HugeiconsIcon } from "@hugeicons/react";
import { 
  Briefcase01Icon, 
  Note01Icon, 
  UserCircleIcon, 
  CurrencyIcon, 
  UserGroupIcon, 
  Location01Icon, 
  Clock01Icon, 
  Home01Icon,
  Add01Icon,
  Edit01Icon,
  Tick01Icon,
  Cancel01Icon
} from "@hugeicons/core-free-icons";
import { Job } from "@/types";
import { LocationCombobox } from "./LocationCombobox";

const jobSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  role: z.string().min(2, "Role/Department is required"),
  salary: z.preprocess(
  (val) => Number(val),
  z.number().positive("Salary is required")
),
  openings: z.preprocess((val) => Number(val), z.number().min(1, "At least 1 opening is required")),
  state: z.string().min(1, "State is required"),
  city: z.string().min(1, "City is required"),
  job_type: z.enum(["Full-time", "Part-time", "Contract", "Internship"]),
  work_location: z.enum(["On-site", "Remote", "Hybrid"]),
  is_active: z.boolean().default(true),
});

type JobFormValues = z.infer<typeof jobSchema>;

interface JobModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (values: JobFormValues) => Promise<void>;
  companyName: string;
  job?: Job | null;
}

const JobModal: React.FC<JobModalProps> = ({ isOpen, onClose, onSave, companyName, job = null }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEditMode = !!job;

  const form = useForm<JobFormValues>({
    resolver: zodResolver(jobSchema) as any,
    defaultValues: {
      title: "",
      description: "",
      role: "",
      salary: 0,
      openings: 1,
      state: "",
      city: "",
      job_type: "Full-time",
      work_location: "On-site",
      is_active: true,
    },
  });

  useEffect(() => {
    if (job) {
      form.reset({
        title: job.title,
        description: job.description,
        role: job.role,
        salary: job.salary,
        openings: job.openings,
        state: job.state || "",
        city: job.city || "",
        job_type: job.job_type,
        work_location: job.work_location,
        is_active: job.is_active,
      });
    } else {
      form.reset({
        title: "",
        description: "",
        role: "",
        salary: 0,
        openings: 1,
        state: "",
        city: "",
        job_type: "Full-time",
        work_location: "On-site",
        is_active: true,
      });
    }
  }, [job, form, isOpen]);

  const onSubmit = async (values: JobFormValues) => {
    setIsSubmitting(true);
    try {
      await onSave(values);
      form.reset();
      onClose();
    } catch (error) {
      console.error(`Failed to ${isEditMode ? "update" : "post"} job:`, error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto p-6">
        <DialogHeader className="border-b pb-4">
          <DialogTitle className="text-xl font-bold text-gray-900 dark:text-gray-300 flex items-center gap-2">
             <HugeiconsIcon 
               icon={isEditMode ? Edit01Icon : Add01Icon} 
               size={24} 
               className="text-blue-600" 
             />
             {isEditMode ? "Update Job" : "Post a new Job"}
          </DialogTitle>
          <p className="text-gray-500 text-sm dark:text-gray-400">
            {isEditMode ? `Updating job for ${companyName}` : `Fill in the details to hire for ${companyName}`}
          </p>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
            <div className="grid gap-6">
              {/* Job Title */}
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2 text-gray-700 font-semibold mb-1 dark:text-gray-300">
                      <HugeiconsIcon icon={Briefcase01Icon} size={18} />
                      Job Title
                    </FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="e.g. Senior Frontend Engineer" 
                        {...field} 
                        className="h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500 transition-all text-gray-900 dark:text-gray-300" 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Description */}
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2 text-gray-700 font-semibold mb-1 dark:text-gray-300">
                      <HugeiconsIcon icon={Note01Icon} size={18} />
                      Description
                    </FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Describe the responsibilities and requirements..." 
                        {...field} 
                        className="min-h-[120px] border-gray-200 focus:border-blue-500 focus:ring-blue-500 transition-all text-gray-900 resize-none dark:text-gray-300" 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid sm:grid-cols-2 gap-6">
                {/* Role/Department */}
                <FormField
                  control={form.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2 text-gray-700 font-semibold mb-1 dark:text-gray-300">
                        <HugeiconsIcon icon={UserCircleIcon} size={18} />
                        Role/Department
                      </FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="e.g. Engineering" 
                          {...field} 
                          className="h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500 transition-all text-gray-900 dark:text-gray-300" 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Salary */}
                <FormField
                  control={form.control}
                  name="salary"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2 text-gray-700 font-semibold mb-1 dark:text-gray-300">
                      <HugeiconsIcon icon={CurrencyIcon} size={16} />
                      Salary
                    </FormLabel>
                      <FormControl>
                        <Input 
                          type="number"
                          {...field} 
                          value={Number.isNaN(field.value) ? "" : (field.value ?? "")}
                          onChange={(e) => field.onChange(e.target.valueAsNumber)}
                          placeholder="e.g. $120k - $150k" 
                        
                          className="h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500 transition-all text-gray-900 dark:text-gray-300" 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid sm:grid-cols-2 gap-6">
                {/* Openings */}
                <FormField
                  control={form.control}
                  name="openings"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2 text-gray-700 font-semibold mb-1 dark:text-gray-300">
                        <HugeiconsIcon icon={UserGroupIcon} size={18} />
                        Openings
                      </FormLabel>
                      <FormControl>
                        <Input 
                          type="number"
                          placeholder="1" 
                          {...field} 
                          className="h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500 transition-all text-gray-900 dark:text-gray-300" 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid sm:grid-cols-2 gap-6">
                <LocationCombobox form={form} />
              </div>

              <div className="grid sm:grid-cols-2 gap-6">
                {/* Job Type */}
                <FormField
                  control={form.control}
                  name="job_type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2 text-gray-700 font-semibold mb-1 dark:text-gray-300">
                        <HugeiconsIcon icon={Clock01Icon} size={18} />
                        Job Type
                      </FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger className="h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500 transition-all text-gray-900 dark:text-gray-300">
                            <SelectValue placeholder="Select job type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Full-time">Full-time</SelectItem>
                          <SelectItem value="Part-time">Part-time</SelectItem>
                          <SelectItem value="Contract">Contract</SelectItem>
                          <SelectItem value="Internship">Internship</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Work Location */}
                <FormField
                  control={form.control}
                  name="work_location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2 text-gray-700 font-semibold mb-1 dark:text-gray-300">
                        <HugeiconsIcon icon={Home01Icon} size={18} />
                        Work Location
                      </FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger className="h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500 transition-all text-gray-900 dark:text-gray-300">
                            <SelectValue placeholder="Select work location" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="On-site">On-site</SelectItem>
                          <SelectItem value="Remote">Remote</SelectItem>
                          <SelectItem value="Hybrid">Hybrid</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Status Field (Only in Edit Mode) */}
              {isEditMode && (
                <FormField
                  control={form.control}
                  name="is_active"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2 text-gray-700 font-semibold mb-1 dark:text-gray-300">
                        <HugeiconsIcon 
                          icon={field.value ? Tick01Icon : Cancel01Icon} 
                          size={18} 
                          className={field.value ? "text-green-600" : "text-red-500"} 
                        />
                        Status
                      </FormLabel>
                      <Select 
                        onValueChange={(val) => field.onChange(val === "Active")} 
                        value={field.value ? "Active" : "Inactive"}
                      >
                        <FormControl>
                          <SelectTrigger className="h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500 transition-all text-gray-900 dark:text-gray-300">
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Active">Active</SelectItem>
                          <SelectItem value="Inactive">Inactive</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </div>

            <DialogFooter className="pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={onClose}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={isSubmitting}
                className="bg-gray-900 text-white min-w-[120px]"
              >
                {isSubmitting ? (
                  isEditMode ? "Updating job..." : "Posting..."
                ) : (
                  isEditMode ? "Update Job" : "Post Job"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default JobModal;
