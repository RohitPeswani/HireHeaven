import { ChatPromptTemplate } from "@langchain/core/prompts";

export const resumeAnalysisPrompt = ChatPromptTemplate.fromMessages([
  [
    "system",
    `You are an expert ATS (Applicant Tracking System) analyzer. Your task is to analyze the provided resume and return structured feedback containing:
- An ATS compatibility score (0-100)
- Detailed suggestions to improve the resume (with category, issue, recommendation, and priority: high/medium/low)
- A list of strengths (things the resume does well)
- A brief 2-3 sentence summary of the overall ATS performance

Analyze the resume for:
- File format and structure compatibility
- Proper use of standard section headings
- Keyword optimization
- Formatting issues (tables, columns, graphics, special characters)
- Contact information placement
- Date formatting
- Use of action verbs and quantifiable achievements
- Section organization and flow`
  ],
  [
    "human",
    [
      {
        type: "text",
        text: "Please analyze the attached resume and return a structured report according to the schema rules."
      },
      {
        type: "media",
        mimeType: "application/pdf",
        data: "{pdfBase64}"
      }
    ]
  ]
]);
