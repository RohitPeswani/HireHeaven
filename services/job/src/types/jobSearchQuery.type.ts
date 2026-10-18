export type JobSearchQuery = {
  title?: string;
  state?: string;
  city?: string;
  company?: string;
  role?: string;
  job_type?: string;
  work_location?: string;
  min_salary?: number;
  max_salary?: number;
};