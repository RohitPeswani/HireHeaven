import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { careerGuidanceSchema, CareerGuidance } from "../schemas/careerGuidance.schema.js";
import { careerGuidancePrompt } from "../prompts/careerGuidance.prompt.js";

export class CareerGuidanceService {
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
        temperature: 0.2, 
      });
    }
    return this.model;
  }

 
  static async generateGuidance(skills: string[]): Promise<CareerGuidance> {
    const model = this.getModel();

    
    const structuredModel = model.withStructuredOutput(careerGuidanceSchema);

  
    const formattedPrompt = await careerGuidancePrompt.formatMessages({
      skills: skills.join(", ")
    });

    const result = await structuredModel.invoke(formattedPrompt);
    return result as CareerGuidance;
  }
}
