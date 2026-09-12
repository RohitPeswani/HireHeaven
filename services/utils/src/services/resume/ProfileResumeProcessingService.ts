import { ErrorHandler } from "../../utils/errorHandler.js";
import pdfParse from "pdf-parse";

export interface ProcessedProfileResumeText {
  text: string;
}

export class ProfileResumeProcessingService {
  /**
   * Processes an existing resume from a URL (e.g. Cloudinary PDF URL stored in user profile):
   * 1. Validates existence and format of the resume URL.
   * 2. Downloads the PDF document from the provided URL.
   * 3. Validates that the downloaded file is a valid PDF document.
   * 4. Extracts plain text from the PDF.
   * 5. Returns the extracted text.
   * 
   * @param resumeUrl The URL of the saved profile resume PDF
   * @returns Object containing extracted plain text from the resume
   */
  static async extractTextFromUrl(resumeUrl: string | undefined | null): Promise<ProcessedProfileResumeText> {
    // 1. Missing resume URL check
    if (!resumeUrl || typeof resumeUrl !== "string" || resumeUrl.trim() === "") {
      throw new ErrorHandler(400, "Resume URL is required");
    }

    const trimmedUrl = resumeUrl.trim();

    // 2. Invalid URL validation
    let parsedUrl: URL;
    try {
      parsedUrl = new URL(trimmedUrl);
    } catch {
      throw new ErrorHandler(400, "Invalid resume URL format");
    }

    if (parsedUrl.protocol !== "http:" && parsedUrl.protocol !== "https:") {
      throw new ErrorHandler(400, "Invalid resume URL protocol. Only HTTP and HTTPS protocols are supported");
    }

    // 3. Download resume PDF
    let response: Response;
    try {
      response = await fetch(trimmedUrl, {
        method: "GET",
        headers: {
          "User-Agent": "HireHeaven-UtilsService/1.0"
        }
      });
    } catch (error: any) {
      throw new ErrorHandler(400, `Failed to download resume: ${error.message || "Network error"}`);
    }

    if (!response.ok) {
      throw new ErrorHandler(
        400,
        `Resume cannot be downloaded. Server responded with status ${response.status}: ${response.statusText}`
      );
    }

    // 4. Validate that response/file is a PDF
    const contentType = response.headers.get("content-type");

    let arrayBuffer: ArrayBuffer;
    try {
      arrayBuffer = await response.arrayBuffer();
    } catch (error: any) {
      throw new ErrorHandler(400, `Failed to read resume content: ${error.message}`);
    }

    const buffer = Buffer.from(arrayBuffer);

    if (buffer.length === 0) {
      throw new ErrorHandler(400, "Downloaded resume file is empty");
    }

    // Validate PDF magic bytes (%PDF) and content-type / file extension
    const isPdfHeader = buffer.length >= 4 && buffer.toString("utf-8", 0, 4) === "%PDF";
    const isPdfContentType = contentType ? contentType.toLowerCase().includes("application/pdf") : false;
    const isPdfUrl = parsedUrl.pathname.toLowerCase().endsWith(".pdf");

    if (!isPdfHeader && !isPdfContentType && !isPdfUrl) {
      throw new ErrorHandler(400, "The provided URL does not point to a valid PDF document");
    }

    // 5. Extract plain text from PDF
    let pdfData: pdfParse.Result;
    try {
      const parseFunc = typeof pdfParse === "function" ? pdfParse : (pdfParse as any).default;
      pdfData = await parseFunc(buffer);
    } catch (error: any) {
      throw new ErrorHandler(400, `Failed to parse PDF document: ${error.message || "Unextractable PDF format"}`);
    }

    const extractedText = pdfData && pdfData.text ? pdfData.text.trim() : "";

    if (!extractedText) {
      throw new ErrorHandler(400, "Empty or unextractable PDF resume text");
    }

    return {
      text: extractedText
    };
  }
}
