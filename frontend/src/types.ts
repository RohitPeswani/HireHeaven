/**
 * Type definitions for Career Guidance Feature
 */

export interface JobOption {
  title: string;
  responsibilities: string;
  why: string;
}

export interface SkillDetail {
  title: string;
  why: string;
  how: string;
}

export interface SkillCategory {
  category: string;
  skills: SkillDetail[];
}

export interface LearningApproach {
  title: string;
  points: string[];
}

export interface CareerGuidance {
  summary: string;
  jobOptions: JobOption[];
  skillsToLearn: SkillCategory[];
  learningApproach: LearningApproach;
}

export interface CareerGuidanceResponse {
  success: boolean;
  data?: CareerGuidance;
  error?: string;
}

export interface Skill {
  id: string;
  name: string;
}

/**
 * Type definitions for Resume Analyzer Feature
 */

export interface ScoreDetail {
  score: number;
  feedback: string;
}

export interface ScoreBreakdown {
  formatting: ScoreDetail;
  keywords: ScoreDetail;
  structure: ScoreDetail;
  readability: ScoreDetail;
}

export type SuggestionPriority = "high" | "medium" | "low";

export interface Suggestion {
  category: string;
  issue: string;
  recommendation: string;
  priority: SuggestionPriority;
}

export interface ResumeAnalysis {
  atsScore: number;
  scoreBreakdown: ScoreBreakdown;
  suggestions: Suggestion[];
  strengths: string[];
  summary: string;
}

export interface ResumeAnalysisResponse {
  success: boolean;
  data?: ResumeAnalysis;
  error?: string;
}

/**
 * Authentication and User Types
 */

export type UserRole = "jobseeker" | "recruiter";

export interface User {
  user_id: string;
  name: string;
  email: string;
  phone_number: string;
  role: UserRole;
  bio?: string;
  resume?: string;
  profile_pic?: string;
  skills?: string[];
  subscription?: string | null;
  created_at?: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
}

export interface ApplicationsState {
  applications: Application[];
  loading: boolean;
  error: string | null;
  hasFetched: boolean;
}

export interface RegisterResponse {
  success : boolean;
  message: string;
  registerUser: User[];
}

export interface LoginResponse {
  success: boolean;
  message: string;
  existingUser: User[];
  token: string;
}

/**
 * Profile and Application Types
 */

export interface Application {
  application_id: number;
  job_id: number;
  applicant_id: number;
  applicant_email: string;
  status: "Submitted" | "Hired" | "Rejected";
  resume: string;
  applied_at: string;
  subscribed: boolean;
  job_title: string;
  job_salary: string;
  job_location: string;
  company_name: string;
  applicant_name?: string;
  phone_number?: string;
}

export interface ApplicationResponse {
  success: boolean;
  applications: Application[];
}

export interface UpdateProfileRequest {
  name?: string;
  phone_number?: string;
  bio?: string;
}

export interface ResumeUploadResponse {
  success: boolean;
  resume_url: string;
}

/* loader props */

export interface LoaderProps {
    size?: number;
    text?: string;
    className?: string;
    fullscreen?: boolean;
};

export interface Company {
  company_id: string;
  name: string;
  description: string;
  website: string;
  logo: string;
  logo_public_id: string;
  recruiter_id: string;
  created_at: string;
}

export interface CompanyResponse {
  success: boolean;
  company: Company;
}

export interface CompaniesResponse {
  success: boolean;
  companies: Company[];
}

export interface DeleteCompanyResponse {
  success: boolean;
  message: string;
}

export interface Job {
  job_id: string;
  title: string;
  description: string;
  salary: number;
  city : string,
  state : string,
  job_type: "Full-time" | "Part-time" | "Contract" | "Internship";
  work_location: "On-site" | "Remote" | "Hybrid";
  openings: number;
  role: string;
  company_id: string;
  posted_by_recruiter_id: string;
  is_active: boolean;
  created_at: string;
  company_name?: string;
  company_logo?: string;
}

export interface CompanyWithJobs extends Company {
  jobs: Job[];
}

export interface CompanyDetailsResponse {
  success: boolean;
  company: CompanyWithJobs;
}

declare global {
  interface Window {
    Razorpay: any;
  }
}