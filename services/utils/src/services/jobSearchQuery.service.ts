import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { jobSearchQuerySchema, JobSearchQuery } from "../schemas/jobSearchQuery.schema.js";
import { jobSearchQueryPrompt } from "../prompts/jobSearchQuery.prompt.js";
import { ErrorHandler } from "../utils/errorHandler.js";

export class JobSearchQueryService {
  private static model: ChatGoogleGenerativeAI;

  private static getModel(): ChatGoogleGenerativeAI {
    if (!this.model) {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error("GEMINI_API_KEY is not defined in the environment");
      }
      this.model = new ChatGoogleGenerativeAI({
        model: "gemini-2.5-flash",
        apiKey: apiKey,
        temperature: 0.1, 
      });
    }
    return this.model;
  }

  static async extractFilters(query: string): Promise<JobSearchQuery> {
    const model = this.getModel();
    
    try {
      const structuredModel = model.withStructuredOutput(jobSearchQuerySchema);
      
      const formattedPrompt = await jobSearchQueryPrompt.formatMessages({
        query
      });

      const result = await structuredModel.invoke(formattedPrompt);
      
      // Explicitly validate with Zod schema to ensure correct type mapping & no bad types are bypassed
      const validated = jobSearchQuerySchema.safeParse(result);
      if (!validated.success) {
        throw new ErrorHandler(400, `Validation failed: ${validated.error.message}`);
      }
      
      return validated.data;
    } catch (error: any) {
      // Re-throw if it's already an ErrorHandler
      if (error instanceof ErrorHandler) {
        throw error;
      }
      
      console.error("Job Search Filter Extraction Error:", error);
      
      // Check if it's a validation error or JSON parsing error
      if (error.name === "ValidationError" || error.message?.includes("validation") || error.message?.includes("parse")) {
        throw new ErrorHandler(400, `Validation failed: ${error.message}`);
      }
      
      if (error instanceof SyntaxError || error.message?.includes("JSON")) {
        throw new ErrorHandler(500, `Invalid JSON received from Gemini: ${error.message}`);
      }
      
      // Default fallback error
      throw new ErrorHandler(500, `Gemini service failed: ${error.message || error}`);
    }
  }
}
