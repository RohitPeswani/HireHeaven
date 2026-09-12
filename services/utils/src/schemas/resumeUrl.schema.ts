import { z } from "zod";

export const resumeUrlRequestSchema = z.object({
  resume_url: z.string({
    required_error: "resume_url is required",
    invalid_type_error: "resume_url must be a string"
  }).min(1, "resume_url cannot be empty").url("Invalid resume URL format")
});

export type ResumeUrlRequest = z.infer<typeof resumeUrlRequestSchema>;
