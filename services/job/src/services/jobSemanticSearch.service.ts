import { sql } from "../utils/db.js";
import { ErrorHandler } from "../utils/errorHandler.js";

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
}

/**
 * Service to perform semantic job search matching a user's resume embedding
 * against job embeddings stored in PostgreSQL using pgvector cosine distance.
 */
export class JobSemanticSearchService {
  /**
   * Finds jobs matching a user's saved resume embedding using pgvector cosine distance.
   *
   * @param userId The ID of the user whose resume embedding to match
   * @param limit Optional maximum number of jobs to return (default: 10)
   * @returns Array of jobs with cosine distance included, ordered by smallest distance first
   */
  static async searchJobs(
    userId: number | string,
    limit: number = 10
  ): Promise<SemanticSearchJobResult[]> {
    if (userId === undefined || userId === null || userId === "") {
      throw new ErrorHandler(400, "userId is required");
    }

    const parsedUserId = Number(userId);
    if (isNaN(parsedUserId)) {
      throw new ErrorHandler(400, "Invalid userId: must be a valid number");
    }

    const parsedLimit = limit !== undefined && limit !== null ? Number(limit) : 10;
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

    // 4. Perform cosine distance search on jobs.embedding
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
      WHERE j.embedding IS NOT NULL
      ORDER BY j.embedding <=> $1::halfvec ASC
      LIMIT $2
    `;

    let jobs: any[];
    try {
      if (typeof sql.query === "function") {
        jobs = await sql.query(searchQuery, [formattedVector, validatedLimit]);
      } else {
        jobs = await (sql as any)(searchQuery, [formattedVector, validatedLimit]);
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
      cosine_distance: Number(job.cosine_distance)
    }));
  }

  // Instance method alias
  async searchJobs(
    userId: number | string,
    limit: number = 10
  ): Promise<SemanticSearchJobResult[]> {
    return JobSemanticSearchService.searchJobs(userId, limit);
  }

  
}

export const searchJobsByResumeEmbedding = JobSemanticSearchService.searchJobs;
export default JobSemanticSearchService;
