import axios from "axios";
import { ErrorHandler } from "../utils/errorHandler.js";
import { sql } from "../utils/db.js";

export interface JobEmbeddingPayload {
  job_id: number | string;
  title?: string | null;
  role?: string | null;
  description?: string | null;
  company_name?: string | null;
  city?: string | null;
  state?: string | null;
  job_type?: string | null;
  work_location?: string | null;
  salary?: number | string | null;
  openings?: number | string | null;
}

export interface JobEmbeddingResponse {
  success: boolean;
  job_id: number | string;
  embedding: number[];
}

/**
 * Communicates with the Utils AI service to generate a semantic embedding vector for a given job.
 *
 * @param job The job information object containing job_id and details
 * @returns A promise that resolves to an embedding vector (number[])
 */
export async function generateJobEmbedding(job: JobEmbeddingPayload): Promise<number[]> {
  if (!job || job.job_id === undefined || job.job_id === null) {
    throw new ErrorHandler(400, "job_id is required to generate job embedding");
  }

  const utilsUrl = process.env.UTILS_SERVICE_URL;
  if (!utilsUrl) {
    throw new ErrorHandler(500, "UTILS_SERVICE_URL is not configured in environment variables");
  }

  try {
    const response = await axios.post<JobEmbeddingResponse>(
      `${utilsUrl}/api/utils/job-embedding`,
      job,
      {
        headers: {
          "Content-Type": "application/json"
        },
        timeout: 10000
      }
    );

    if (!response.data || !response.data.success) {
      throw new ErrorHandler(500, "Utils AI service returned an unsuccessful response for job embedding");
    }

    const { embedding } = response.data;

    if (!Array.isArray(embedding) || embedding.length === 0) {
      throw new ErrorHandler(500, "Utils AI service returned an invalid or empty embedding vector");
    }

    return embedding;
  } catch (error: any) {
    if (error instanceof ErrorHandler) {
      throw error;
    }

    if (axios.isAxiosError(error)) {
      const statusCode = error.response?.status || 500;
      const message =
        error.response?.data?.message ||
        error.message ||
        "Failed to communicate with Utils AI service";
      throw new ErrorHandler(statusCode, `Job embedding service error: ${message}`);
    }

    throw new ErrorHandler(500, `Unexpected error generating job embedding: ${error.message || error}`);
  }
}

/**
 * Persists an existing embedding vector into PostgreSQL for the specified job_id.
 * Uses parameterized SQL query via Neon template tag.
 *
 * @param job_id The ID of the job to update
 * @param embedding The generated embedding vector (number[])
 * @returns Resolves when database update succeeds
 */
export async function updateJobEmbedding(
  job_id: number | string,
  embedding: number[]
): Promise<{ success: boolean; job_id: number | string }> {
  if (job_id === undefined || job_id === null || job_id === "") {
    throw new ErrorHandler(400, "job_id is required to update job embedding");
  }

  if (!Array.isArray(embedding) || embedding.length === 0) {
    throw new ErrorHandler(400, "Invalid or empty embedding vector");
  }

  if (embedding.length !== 3072) {
    throw new ErrorHandler(
      400,
      `Incorrect embedding dimension: expected 3072, received ${embedding.length}`
    );
  }

  try {
    const formattedVector = `[${embedding.join(",")}]`;
    const result = await sql`
      UPDATE jobs 
      SET embedding = ${formattedVector}::halfvec 
      WHERE job_id = ${job_id} 
      RETURNING job_id
    `;

    if (!result || result.length === 0) {
      throw new ErrorHandler(404, `Job with ID ${job_id} not found`);
    }

    return {
      success: true,
      job_id: result[0].job_id
    };
  } catch (error: any) {
    if (error instanceof ErrorHandler) {
      throw error;
    }
    console.error("Database error updating job embedding:", error);
    throw new ErrorHandler(
      500,
      `Database error updating job embedding: ${error.message || error}`
    );
  }
}

