import { sql } from "../utils/db.js";
import { ErrorHandler } from "../utils/errorHandler.js";
import type { JobSearchQuery } from "../types/jobSearchQuery.type.js";
export type { JobSearchQuery };

export interface SemanticSearchJobResult {
  job_id: number;
  title: string;
  description: string;
  salary: number | string | null;
  city: string;
  state: string;
  job_type: string;
  openings: number | string | null;
  role: string;
  work_location: string;
  company_id: number;
  posted_by_recruiter_id: number;
  created_at: Date | string;
  is_active: boolean;
  company_name?: string | null;
  company_logo?: string | null;
  distance: number;
  cosine_distance: number;
  [key: string]: any;
}

export interface JobSemanticSearchOptions {
  userId: number | string;
  limit?: number;
  filters?: JobSearchQuery | null;
}

/**
 * Service to perform semantic job search matching a user's resume embedding
 * against job embeddings stored in PostgreSQL using pgvector cosine distance.
 */
export class JobSemanticSearchService {
  /**
   * Finds jobs matching a user's saved resume embedding using pgvector cosine distance,
   * optionally filtered by structured criteria (title, state, city, company, role,
   * job_type, work_location, min_salary, max_salary).
   *
   * @param userId The ID of the user whose resume embedding to match
   * @param limit Optional maximum number of jobs to return (default: 10)
   * @param filters Optional structured filters to constrain the search
   * @returns Array of jobs with cosine distance included, ordered by smallest distance first
   */
  static async searchJobs(
    userId: number | string,
    limit?: number,
    filters?: JobSearchQuery | null
  ): Promise<SemanticSearchJobResult[]>;
  static async searchJobs(
    options: JobSemanticSearchOptions
  ): Promise<SemanticSearchJobResult[]>;
  static async searchJobs(
    userIdOrOptions: number | string | JobSemanticSearchOptions,
    limit: number = 10,
    filters?: JobSearchQuery | null
  ): Promise<SemanticSearchJobResult[]> {
    let userId: number | string;
    let effectiveLimit = limit;
    let effectiveFilters = filters;

    if (typeof userIdOrOptions === "object" && userIdOrOptions !== null) {
      userId = userIdOrOptions.userId;
      effectiveLimit = userIdOrOptions.limit ?? 10;
      effectiveFilters = userIdOrOptions.filters;
    } else {
      userId = userIdOrOptions;
    }

    if (userId === undefined || userId === null || userId === "") {
      throw new ErrorHandler(400, "userId is required");
    }

    const parsedUserId = Number(userId);
    if (isNaN(parsedUserId)) {
      throw new ErrorHandler(400, "Invalid userId: must be a valid number");
    }

    const parsedLimit = effectiveLimit !== undefined && effectiveLimit !== null ? Number(effectiveLimit) : 10;
    if (isNaN(parsedLimit) || parsedLimit <= 0) {
      throw new ErrorHandler(400, "limit must be a positive number");
    }
    const validatedLimit = Math.floor(parsedLimit);

    // 1. Retrieve the user's current resume embedding from resume_embeddings
    let userRows: any[];
    try {
      userRows = await sql`
        SELECT embedding 
        FROM resume_embeddings 
        WHERE user_id = ${parsedUserId}
      `;
    } catch (error: any) {
      if (error instanceof ErrorHandler) {
        throw error;
      }
      console.error("Database error retrieving resume embedding:", error);
      throw new ErrorHandler(
        500,
        `Database error retrieving resume embedding: ${error.message || error}`
      );
    }

    if (!userRows || userRows.length === 0 || !userRows[0]?.embedding) {
      throw new ErrorHandler(404, `No resume embedding found for user ${userId}`);
    }

    // 2. Parse and validate the retrieved embedding
    let embeddingVector: number[];
    const rawEmbedding = userRows[0].embedding;

    if (Array.isArray(rawEmbedding)) {
      embeddingVector = rawEmbedding.map(Number);
    } else if (typeof rawEmbedding === "string") {
      try {
        embeddingVector = JSON.parse(rawEmbedding);
      } catch {
        embeddingVector = rawEmbedding
          .replace(/[\[\]]/g, "")
          .split(",")
          .map((val) => Number(val.trim()))
          .filter((val) => !isNaN(val));
      }
    } else {
      throw new ErrorHandler(500, "Invalid resume embedding format stored in database");
    }

    // Validate that the retrieved embedding has exactly 3072 dimensions before performing the job search
    if (!Array.isArray(embeddingVector) || embeddingVector.length !== 3072) {
      throw new ErrorHandler(
        400,
        `Incorrect embedding dimension: expected 3072, received ${embeddingVector?.length ?? 0}`
      );
    }

    if (embeddingVector.some((val) => isNaN(val))) {
      throw new ErrorHandler(400, "Resume embedding contains invalid numeric values");
    }

    // 3. Format vector string for pgvector halfvec
    const formattedVector = `[${embeddingVector.join(",")}]`;

    // 4. Build dynamic filter conditions and parameter values
    const conditions: string[] = ["j.embedding IS NOT NULL"];
    const queryParams: any[] = [formattedVector];
    let paramIndex = 2; // $1 is formattedVector

    if (effectiveFilters) {
      if (effectiveFilters.title !== undefined && effectiveFilters.title !== null && String(effectiveFilters.title).trim() !== "") {
        conditions.push(`j.title ILIKE $${paramIndex}`);
        queryParams.push(`%${String(effectiveFilters.title).trim()}%`);
        paramIndex++;
      }

      if (effectiveFilters.city !== undefined && effectiveFilters.city !== null && String(effectiveFilters.city).trim() !== "") {
        conditions.push(`j.city ILIKE $${paramIndex}`);
        queryParams.push(`%${String(effectiveFilters.city).trim()}%`);
        paramIndex++;
      }

      if (effectiveFilters.state !== undefined && effectiveFilters.state !== null && String(effectiveFilters.state).trim() !== "") {
        conditions.push(`j.state ILIKE $${paramIndex}`);
        queryParams.push(`%${String(effectiveFilters.state).trim()}%`);
        paramIndex++;
      }

      if (effectiveFilters.company !== undefined && effectiveFilters.company !== null && String(effectiveFilters.company).trim() !== "") {
        conditions.push(`c.name ILIKE $${paramIndex}`);
        queryParams.push(`%${String(effectiveFilters.company).trim()}%`);
        paramIndex++;
      }

      if (effectiveFilters.role !== undefined && effectiveFilters.role !== null && String(effectiveFilters.role).trim() !== "") {
        conditions.push(`j.role ILIKE $${paramIndex}`);
        queryParams.push(`%${String(effectiveFilters.role).trim()}%`);
        paramIndex++;
      }

      if (effectiveFilters.job_type !== undefined && effectiveFilters.job_type !== null && String(effectiveFilters.job_type).trim() !== "") {
        conditions.push(`j.job_type = $${paramIndex}`);
        queryParams.push(String(effectiveFilters.job_type).trim());
        paramIndex++;
      }

      if (effectiveFilters.work_location !== undefined && effectiveFilters.work_location !== null && String(effectiveFilters.work_location).trim() !== "") {
        conditions.push(`j.work_location = $${paramIndex}`);
        queryParams.push(String(effectiveFilters.work_location).trim());
        paramIndex++;
      }

      if (effectiveFilters.min_salary !== undefined && effectiveFilters.min_salary !== null && !isNaN(Number(effectiveFilters.min_salary))) {
        conditions.push(`j.salary >= $${paramIndex}`);
        queryParams.push(Number(effectiveFilters.min_salary));
        paramIndex++;
      }

      if (effectiveFilters.max_salary !== undefined && effectiveFilters.max_salary !== null && !isNaN(Number(effectiveFilters.max_salary))) {
        conditions.push(`j.salary <= $${paramIndex}`);
        queryParams.push(Number(effectiveFilters.max_salary));
        paramIndex++;
      }
    }

    const limitParamIndex = paramIndex;
    queryParams.push(validatedLimit);

    // 5. Perform cosine distance search on jobs.embedding with filters applied
    const searchQuery = `
      SELECT 
        j.job_id,
        j.title,
        j.description,
        j.salary,
        j.city,
        j.state,
        j.job_type,
        j.openings,
        j.role,
        j.work_location,
        j.company_id,
        j.posted_by_recruiter_id,
        j.created_at,
        j.is_active,
        c.name AS company_name,
        c.logo AS company_logo,
        (j.embedding <=> $1::halfvec) AS cosine_distance
      FROM jobs j
      LEFT JOIN companies c ON j.company_id = c.company_id
      WHERE ${conditions.join(" AND ")}
      ORDER BY j.embedding <=> $1::halfvec ASC
      LIMIT $${limitParamIndex}
    `;

    let jobs: any[];
    try {
      if (typeof sql.query === "function") {
        jobs = await sql.query(searchQuery, queryParams);
      } else {
        jobs = await (sql as any)(searchQuery, queryParams);
      }
    } catch (error: any) {
      if (error instanceof ErrorHandler) {
        throw error;
      }
      console.error("Database error during semantic job search:", error);
      throw new ErrorHandler(
        500,
        `Database error during semantic job search: ${error.message || error}`
      );
    }

    return (jobs || []).map((job: any) => ({
      ...job,
      distance: Number(job.cosine_distance),
      cosine_distance: Number(job.cosine_distance)
    }));
  }

  // Instance method alias
  async searchJobs(
    userId: number | string,
    limit?: number,
    filters?: JobSearchQuery | null
  ): Promise<SemanticSearchJobResult[]>;
  async searchJobs(
    options: JobSemanticSearchOptions
  ): Promise<SemanticSearchJobResult[]>;
  async searchJobs(
    userIdOrOptions: number | string | JobSemanticSearchOptions,
    limit: number = 10,
    filters?: JobSearchQuery | null
  ): Promise<SemanticSearchJobResult[]> {
    return JobSemanticSearchService.searchJobs(userIdOrOptions as any, limit, filters);
  }
}

export const searchJobsByResumeEmbedding = JobSemanticSearchService.searchJobs;
export default JobSemanticSearchService;
