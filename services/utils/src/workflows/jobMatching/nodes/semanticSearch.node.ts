import type { JobMatchingStateType } from "../jobMatching.state.js";
import { ErrorHandler } from "../../../utils/errorHandler.js";
import jwt from "jsonwebtoken";

/**
 * LangGraph node that calls the Job Service semantic-search HTTP API
 * to retrieve jobs matching the user's resume embedding filtered by
 * the extracted structured filters.
 */
export async function semanticSearchNode(
  state: JobMatchingStateType
): Promise<Partial<JobMatchingStateType>> {
  const userId = state.userId;

  if (userId === undefined || userId === null || userId === "") {
    throw new ErrorHandler(400, "userId is required for semantic job search");
  }

  const parsedUserId = Number(userId);
  if (isNaN(parsedUserId)) {
    throw new ErrorHandler(400, "Invalid userId: must be a valid number");
  }

  const jobServiceUrl = process.env.JOB_SERVICE_URL;
  if (!jobServiceUrl) {
    throw new ErrorHandler(
      500,
      "JOB_SERVICE_URL is not configured in environment variables"
    );
  }

  // Determine authorization token: either explicitly provided in state, or signed via JWT_SECRET
  let token = state.token;
  if (!token && process.env.JWT_SECRET) {
    try {
      token = jwt.sign({ id: parsedUserId }, process.env.JWT_SECRET, {
        expiresIn: "1h",
      });
    } catch (err: any) {
      console.warn("Failed to generate service JWT token:", err.message);
    }
  }

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const requestBody = {
    userId: parsedUserId,
    limit: state.limit ?? 10,
    filters: state.filters ?? {},
  };

  try {
    const response = await fetch(`${jobServiceUrl}/api/job/semantic-search`, {
      method: "POST",
      headers,
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      let errorMessage = `Job Service returned HTTP ${response.status}`;
      try {
        const errorData = await response.json();
        if (errorData?.message) {
          errorMessage = `Job Service error: ${errorData.message}`;
        }
      } catch {
        // Fallback to HTTP status text
        if (response.statusText) {
          errorMessage = `Job Service error: ${response.statusText} (${response.status})`;
        }
      }
      throw new ErrorHandler(response.status, errorMessage);
    }

    const data = await response.json();

    if (!data || typeof data !== "object" || !Array.isArray(data.jobs)) {
      throw new ErrorHandler(
        500,
        "Invalid response from Job Service: expected 'jobs' array"
      );
    }

    return {
      jobs: data.jobs,
    };
  } catch (error: any) {
    if (error instanceof ErrorHandler) {
      throw error;
    }
    console.error("Error in semanticSearchNode:", error);
    throw new ErrorHandler(
      500,
      `Semantic search request failed: ${error.message || error}`
    );
  }
}
