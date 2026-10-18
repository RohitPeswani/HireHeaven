import { Annotation } from "@langchain/langgraph";
import type { JobSearchQuery } from "../../schemas/jobSearchQuery.schema.js";

/**
 * State annotation definition for the Job Matching LangGraph workflow.
 * Manages the state transitioning through:
 * 1. User query & parameters
 * 2. Extracted structured job filters
 * 3. Matched jobs returned from semantic search
 */
export const JobMatchingAnnotation = Annotation.Root({
  userId: Annotation<number | string>(),
  query: Annotation<string | undefined>({
    reducer: (curr, update) => (update !== undefined ? update : curr),
    default: () => undefined,
  }),
  filters: Annotation<JobSearchQuery | Record<string, any>>({
    reducer: (curr, update) => (update !== undefined ? update : curr),
    default: () => ({}),
  }),
  jobs: Annotation<any[]>({
    reducer: (curr, update) => (update !== undefined ? update : curr),
    default: () => [],
  }),
  limit: Annotation<number | undefined>({
    reducer: (curr, update) => (update !== undefined ? update : curr),
    default: () => 10,
  }),
  token: Annotation<string | undefined>({
    reducer: (curr, update) => (update !== undefined ? update : curr),
    default: () => undefined,
  }),
  error: Annotation<string | null | undefined>({
    reducer: (curr, update) => (update !== undefined ? update : curr),
    default: () => null,
  }),
});

export type JobMatchingStateType = typeof JobMatchingAnnotation.State;
