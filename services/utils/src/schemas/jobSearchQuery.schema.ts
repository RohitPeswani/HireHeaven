import { z } from "zod";

export const jobSearchQuerySchema = z.object({
  title: z.string().optional().describe("The job title or primary skill searched for (e.g. 'React', 'Node Developer') or null if not specified"),
  state: z.string().optional().describe("The state name (e.g. 'Gujarat', 'Maharashtra') or null if not specified. If a city is specified, always infer its state (e.g. Ahmedabad -> Gujarat, Mumbai -> Maharashtra, Bangalore -> Karnataka)"),
  city: z.string().optional().describe("The city name (e.g. 'Ahmedabad', 'Mumbai') or null if not specified"),
  company: z.string().optional().describe("The company name or null if not specified"),
  role: z.string().optional().describe("The job role/category or null if not specified"),
  job_type: z.enum(["Full-time", "Part-time", "Contract", "Internship"]).optional().describe("The job type. Supported values are: 'Full-time', 'Part-time', 'Contract', 'Internship', or null if not specified"),
  work_location: z.enum(["On-site", "Remote", "Hybrid"]).optional().describe("The work location mode. Supported values are: 'On-site', 'Remote', 'Hybrid', or null if not specified. Map 'WFH' or 'Work from home' or 'Remote' to 'Remote'"),
  min_salary: z.number().optional().describe("The minimum salary as a number in INR (e.g. 800000 for 8 LPA, 1500000 for 15 LPA, 1000000 for high paying) or null if not specified"),
  max_salary: z.number().optional().describe("The maximum salary as a number in INR (e.g. 1200000 for 12 LPA) or null if not specified")
});

export type JobSearchQuery = z.infer<typeof jobSearchQuerySchema>;