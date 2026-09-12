import { ErrorHandler } from "../../utils/errorHandler.js";

export interface UploadedFile {
  fieldname?: string;
  originalname?: string;
  encoding?: string;
  mimetype: string;
  size: number;
  buffer: Buffer;
}

export interface ProcessedResume {
  base64: string;
}

export class ResumeProcessingService {
  /**
   * Processes a resume file: validates existence, format, size and returns base64 encoding.
   * Generically structured to support future text extraction, embeddings, metadata, etc.
   */
  static async process(file: UploadedFile | undefined): Promise<ProcessedResume> {
    if (!file) {
      throw new ErrorHandler(400, "resume is required");
    }

    // Validate file type
    if (file.mimetype !== "application/pdf") {
      throw new ErrorHandler(400, "Only PDF resumes are supported");
    }

    // Validate file size (limit to 5MB)
    const MAX_FILE_SIZE = 5 * 1024 * 1024;
    if (file.size > MAX_FILE_SIZE) {
      throw new ErrorHandler(400, "Resume file size exceeds the 5MB limit");
    }

    const base64 = file.buffer.toString("base64");

    return {
      base64
    };
  }
}
