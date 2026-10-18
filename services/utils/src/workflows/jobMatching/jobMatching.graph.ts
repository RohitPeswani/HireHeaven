import { StateGraph, START, END } from "@langchain/langgraph";
import { JobMatchingAnnotation } from "./jobMatching.state.js";
import { extractFiltersNode } from "./nodes/extractFilters.node.js";
import { semanticSearchNode } from "./nodes/semanticSearch.node.js";

/**
 * LangGraph workflow for AI-assisted job matching in HireHeaven:
 * 
 * START
 *   ↓
 * extractFilters  (extracts structured JobSearchQuery filters from natural language query)
 *   ↓
 * semanticSearch  (calls Job Service semantic-search endpoint via HTTP with resume embedding matching)
 *   ↓
 *  END
 */
const workflow = new StateGraph(JobMatchingAnnotation)
  .addNode("extractFilters", extractFiltersNode)
  .addNode("semanticSearch", semanticSearchNode)
  .addEdge(START, "extractFilters")
  .addEdge("extractFilters", "semanticSearch")
  .addEdge("semanticSearch", END);

export const jobMatchingGraph = workflow.compile();
export default jobMatchingGraph;
