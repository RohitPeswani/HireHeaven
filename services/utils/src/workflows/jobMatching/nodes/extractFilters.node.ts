import { JobSearchQueryService } from "../../../services/jobSearchQuery.service.js";
import type { JobMatchingStateType } from "../jobMatching.state.js";
import { ErrorHandler } from "../../../utils/errorHandler.js";

/**
 * LangGraph node that extracts structured job filters from a user's natural language query.
 * Reuses the existing JobSearchQueryService.extractFilters() implementation.
 */
export async function extractFiltersNode(
  state: JobMatchingStateType
): Promise<Partial<JobMatchingStateType>> {
  const query = state.query;

  if (!query || typeof query !== "string" || !query.trim()) {
    return {
      filters: {},
    };
  }

  try {
    const filters = await JobSearchQueryService.extractFilters(query.trim());
    return {
      filters: filters ?? {},
    };
  } catch (error: any) {
    if (error instanceof ErrorHandler) {
      throw error;
    }
    console.error("Error in extractFiltersNode:", error);
    throw new ErrorHandler(
      500,
      `Failed to extract job filters: ${error?.message || error}`
    );
  }
}
