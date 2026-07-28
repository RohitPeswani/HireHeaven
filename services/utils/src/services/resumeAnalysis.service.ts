import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { resumeAnalysisSchema, ResumeAnalysis } from "../schemas/resumeAnalysis.schema.js";
import { resumeAnalysisPrompt } from "../prompts/resumeAnalysis.prompt.js";

export class ResumeAnalysisService {
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

  
  static async analyze(pdfBase64: string): Promise<ResumeAnalysis> {
    const model = this.getModel();

    
    const structuredModel = model.withStructuredOutput(resumeAnalysisSchema);

   
    const formattedMessages = await resumeAnalysisPrompt.formatMessages({
      pdfBase64
    });

    const result = await structuredModel.invoke(formattedMessages);
    return result as ResumeAnalysis;
  }
}
