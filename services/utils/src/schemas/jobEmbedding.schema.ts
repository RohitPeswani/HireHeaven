import { z } from "zod";

export const jobEmbeddingRequestSchema = z.object({
  job_id: z.union([z.number(), z.string()], {
    required_error: "job_id is required",
    invalid_type_error: "job_id must be a string or a number"
  }),
  title: z.string().nullable().optional(),
  role: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  company_name: z.string().nullable().optional(),
  city: z.string().nullable().optional(),
  state: z.string().nullable().optional(),
  job_type: z.string().nullable().optional(),
  work_location: z.string().nullable().optional(),
  salary: z.union([z.number(), z.string()]).nullable().optional(),
  openings: z.union([z.number(), z.string()]).nullable().optional()
});

export type JobEmbeddingRequest = z.infer<typeof jobEmbeddingRequestSchema>;
