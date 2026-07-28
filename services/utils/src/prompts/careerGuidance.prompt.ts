import { ChatPromptTemplate } from "@langchain/core/prompts";

export const careerGuidancePrompt = ChatPromptTemplate.fromMessages([
  [
    "system",
    "You are an expert career advisor. Your task is to analyze the user's skill set and generate structured career guidance suggestions, job roles, skills to learn, and learning pathways matching the requested schema structure."
  ],
  [
    "human",
    "Based on the following skills: {skills}. Please act as a career advisor and generate a career path suggestion."
  ]
]);
