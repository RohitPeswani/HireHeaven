import { EmbeddingService } from "./EmbeddingService.js";
import { ProfileResumeProcessingService } from "../resume/ProfileResumeProcessingService.js";
import { ErrorHandler } from "../../utils/errorHandler.js";

export class ResumeEmbeddingService {
  /**
   * Generates a 3072-dimensional semantic embedding vector for a profile resume URL.
   * 
   * Flow:
   * ResumeEmbeddingService
   *         ↓
   * ProfileResumeProcessingService.extractTextFromUrl(resumeUrl)
   *         ↓
   * Resume text
   *         ↓
   * EmbeddingService.generateEmbedding(text)
   *         ↓
   * 3072-dimensional embedding
   * 
   * @param resumeUrl The Cloudinary or HTTP URL of the saved profile resume PDF
   * @returns 3072-dimensional embedding vector (number[])
   */
  static async generateResumeEmbedding(resumeUrl: string | undefined | null): Promise<number[]> {
    // 1. Missing resume URL validation
    if (!resumeUrl || typeof resumeUrl !== "string" || !resumeUrl.trim()) {
      throw new ErrorHandler(400, "Resume URL is required");
    }

    const trimmedUrl = resumeUrl.trim();

    // 2. Extract plain text directly using ProfileResumeProcessingService inside the same microservice
    let extractedText: string = "";
    try {
      const textResult = await ProfileResumeProcessingService.extractTextFromUrl(trimmedUrl);
      extractedText = textResult.text;
    } catch (error: any) {
      if (error instanceof ErrorHandler) {
        throw error;
      }
      throw new ErrorHandler(400, `Failed to retrieve resume text: ${error.message || error}`);
    }

    // 3. Validate extracted resume text
    if (!extractedText || typeof extractedText !== "string" || !extractedText.trim()) {
      throw new ErrorHandler(400, "Empty extracted resume text");
    }

    // 4. Pass extracted text to existing EmbeddingService
    let embedding: number[];
    try {
      embedding = await EmbeddingService.generateEmbedding(extractedText.trim());
    } catch (error: any) {
      if (error instanceof ErrorHandler) {
        throw error;
      }
      throw new ErrorHandler(500, `Embedding generation failure: ${error.message || error}`);
    }

    // 5. Validate generated embedding dimensions and format
    if (!embedding || !Array.isArray(embedding)) {
      throw new ErrorHandler(500, "Invalid embedding response: output is not an array");
    }

    if (embedding.length === 0) {
      throw new ErrorHandler(500, "Invalid embedding response: returned vector is empty");
    }

    if (embedding.length !== 3072) {
      throw new ErrorHandler(
        500,
        `Incorrect embedding dimension: expected 3072, received ${embedding.length}`
      );
    }

    return embedding;
  }
}
