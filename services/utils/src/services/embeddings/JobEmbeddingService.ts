import { EmbeddingService } from "./EmbeddingService.js";
import { buildJobEmbeddingText, JobEmbeddingInput } from "./buildJobEmbeddingText.js";
import { ErrorHandler } from "../../utils/errorHandler.js";

export class JobEmbeddingService {
  /**
   * Generates a semantic embedding vector for a given job input object.
   * Coordinates buildJobEmbeddingText and EmbeddingService.
   *
   * @param job The input job data
   * @returns A promise that resolves to an embedding vector (number[])
   */
  static async generateJobEmbedding(job: JobEmbeddingInput): Promise<number[]> {
    const semanticText = buildJobEmbeddingText(job);

    if (!semanticText || !semanticText.trim()) {
      throw new ErrorHandler(
        400,
        "Generated job semantic text is empty or contains only whitespace"
      );
    }

    return await EmbeddingService.generateEmbedding(semanticText);
  }
}
