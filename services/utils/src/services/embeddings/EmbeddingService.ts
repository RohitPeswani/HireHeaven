import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { ErrorHandler } from "../../utils/errorHandler.js";

export class EmbeddingService {
  private static model: GoogleGenerativeAIEmbeddings;

  private static getModel(): GoogleGenerativeAIEmbeddings {
    if (!this.model) {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        throw new ErrorHandler(500, "GEMINI_API_KEY is not defined in the environment");
      }
      this.model = new GoogleGenerativeAIEmbeddings({
        modelName: "text-embedding-004",
        apiKey: apiKey,
      });
    }
    return this.model;
  }

  /**
   * Generates a semantic embedding vector for a given text query.
   * @param text The input text to embed.
   */
  static async generateEmbedding(text: string): Promise<number[]> {
    if (!text || typeof text !== "string") {
      throw new ErrorHandler(400, "Input text must be a valid, non-empty string");
    }

    const trimmedText = text.trim();
    if (!trimmedText) {
      throw new ErrorHandler(400, "Input text cannot contain only whitespace");
    }

    try {
      const model = this.getModel();
      const embedding = await model.embedQuery(trimmedText);
      
      if (!embedding || !Array.isArray(embedding)) {
        throw new ErrorHandler(500, "Invalid embedding vector returned from Gemini API");
      }

      return embedding;
    } catch (error: any) {
      if (error instanceof ErrorHandler) {
        throw error;
      }
      console.error("Gemini Embedding Generation Error:", error);
      throw new ErrorHandler(500, `Failed to generate embedding: ${error.message || error}`);
    }
  }
}

