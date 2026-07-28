import { z } from "zod";

export const resumeAnalysisSchema = z.object({
  atsScore: z.number().describe("ATS compatibility score from 0 to 100"),
  scoreBreakdown: z.object({
    formatting: z.object({
      score: z.number(),
      feedback: z.string()
    }),
    keywords: z.object({
      score: z.number(),
      feedback: z.string()
    }),
    structure: z.object({
      score: z.number(),
      feedback: z.string()
    }),
    readability: z.object({
      score: z.number(),
      feedback: z.string()
    })
  }).describe("Breakdown of score by formatting, keywords, structure, and readability"),
  suggestions: z.array(
    z.object({
      category: z.string().describe("Category of the suggestion (e.g. Formatting, Content, Keywords, Structure)"),
      issue: z.string().describe("Description of the issue found"),
      recommendation: z.string().describe("Specific actionable recommendation to fix it"),
      priority: z.enum(["high", "medium", "low"]).describe("Priority level of suggestion")
    })
  ).describe("Detailed suggestions to improve the resume"),
  strengths: z.array(z.string()).describe("List of things the resume does well for ATS"),
  summary: z.string().describe("A brief 2-3 sentence summary of the overall ATS performance")
});

export type ResumeAnalysis = z.infer<typeof resumeAnalysisSchema>;
