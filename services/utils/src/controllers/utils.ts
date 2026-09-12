import nodemailer from "nodemailer";
import { Request, Response } from "express";
import cloudinary from 'cloudinary';
import { GoogleGenAI } from '@google/genai';
import { guidancePrompt, resumePrompt } from "../utils/template.js";
import { tryCatch } from "../utils/tryCatch.js";
import { ErrorHandler } from "../utils/errorHandler.js";
import dotenv from 'dotenv';
import { getBuffer } from "../utils/buffer.js";
import { CareerGuidanceService } from "../services/careerGuidance.service.js";
import { ResumeAnalysisService } from "../services/resumeAnalysis.service.js";
import { JobSearchQueryService } from "../services/jobSearchQuery.service.js";
import { ResumeProcessingService } from "../services/resume/ResumeProcessingService.js";
import { ProfileResumeProcessingService } from "../services/resume/ProfileResumeProcessingService.js";
import { JobEmbeddingService } from "../services/embeddings/JobEmbeddingService.js";
import { ResumeEmbeddingService } from "../services/embeddings/ResumeEmbeddingService.js";
import { JobEmbeddingInput } from "../services/embeddings/buildJobEmbeddingText.js";
import { jobEmbeddingRequestSchema } from "../schemas/jobEmbedding.schema.js";
import { resumeUrlRequestSchema } from "../schemas/resumeUrl.schema.js";

dotenv.config();

const ai = new GoogleGenAI({
    apiKey : process.env.GEMINI_API_KEY
});


export const sendEmail = tryCatch(async(req, res) => {
    
        const { to, subject, html } = req.body;

        const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: Number(process.env.SMTP_PORT),
            secure: true,
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS
            }
        });

        await transporter.sendMail({
            from: "HireHeaven <no-reply@hireheaven.com>",
            to,
            subject,
            html
        });

        return res.status(200).json({
            success: true
        });

     
});

// export const uploadFileController = tryCatch(async (req, res)=> {
   
//         const {buffer, public_id} = req.body;

//         if(public_id){
//             await cloudinary.v2.uploader.destroy(public_id);

//             return res.status(200).json({
//                 success : true,
//                 message : "File deleted successfully"
//             })
//         }
//         if(buffer){
//             const cloud = await cloudinary.v2.uploader.upload(buffer);
        

//         return res.status(200).json({
//             success: true,
//             url: cloud.secure_url,
//             public_id: cloud.public_id
//         })
//     }
// });
// export const uploadFileController = tryCatch(async(req, res) => {
//     const {buffer, public_id} = req.body;
  
//     let cloud;

//     if(public_id){
//         await cloudinary.v2.uploader.destroy(public_id);
//     }

//     if(buffer){

//       cloud = await cloudinary.v2.uploader.upload(buffer);
//     }


//     return res.status(200).json({
//         success:true,
//         url: cloud?.secure_url,
//         public_id: cloud?.public_id
//     });

// });

export const uploadFileController = tryCatch(async (req, res) => {
    const { buffer } = req.body;

    if (!buffer) {
        return res.status(400).json({
            success: false,
            message: "Buffer is required"
        });
    }

    const cloud = await cloudinary.v2.uploader.upload(buffer);

    return res.status(200).json({
        success: true,
        url: cloud.secure_url,
        public_id: cloud.public_id
    });
});

export const deleteFileController = tryCatch(async (req, res) => {
    const { publicId } = req.body;

    console.log("from utils service", publicId);

    if (!publicId) {
        return res.status(400).json({
            success: false,
            message: "Public id is required"
        });
    }

    const result = await cloudinary.v2.uploader.destroy(publicId);

    

    if (result.result !== "ok") {
        return res.status(404).json({
            success: false,
            message: "File not found"
        });
    }

    return res.status(200).json({
        success: true,
        message: "File deleted successfully"
    });
});

const parseJson = (text: string) => {
    try {
        return JSON.parse(text);
    } catch {
        return null;
    }
};
export const carrerGuidance = tryCatch(async(req, res, next) => {
    const { skills } = req.body;

    if (!skills) {
        return res.status(400).json({
            success: false,
            message: "skills are required"
        });
    }

    try {
        const jsonResponse = await CareerGuidanceService.generateGuidance(
            Array.isArray(skills) ? skills : [skills]
        );

        return res.status(200).json({
            success: true,
            data: jsonResponse
        });
    } catch (error: any) {
        console.error("LangChain Career Guidance Error:", error);
        
      
        const message = error instanceof Error ? error.message : "Failed to generate career guidance";
        return next(new ErrorHandler(500, `Failed to generate career guidance: ${message}`));
    }
});

export const analyzeResume = tryCatch(async(req, res, next) => {
    try {
        const processedResume = await ResumeProcessingService.process(req.file);
        const jsonResponse = await ResumeAnalysisService.analyze(processedResume);

        return res.status(200).json({
            success: true,
            data: jsonResponse
        });
    } catch (error: any) {
        console.error("Resume Analysis Error:", error);
        if (error instanceof ErrorHandler) {
            return next(error);
        }
        const message = error instanceof Error ? error.message : "Failed to analyze resume";
        return next(new ErrorHandler(500, `Failed to analyze resume: ${message}`));
    }
});

export const extractJobFilters = tryCatch(async (req: Request, res: Response, next) => {
    const { query } = req.body;

    if (!query) {
        return res.status(400).json({
            success: false,
            message: "Query is required"
        });
    }

    try {
        const filters = await JobSearchQueryService.extractFilters(query);

        return res.status(200).json({
            success: true,
            filters
        });
    } catch (error: any) {
        console.error("Job Query Filter Extraction Controller Error:", error);
        const statusCode = error instanceof ErrorHandler ? error.statusCode : 500;
        const message = error instanceof Error ? error.message : "Failed to extract job filters";
        return next(new ErrorHandler(statusCode, message));
    }
});

export const generateJobEmbeddingController = tryCatch(async (req: Request, res: Response, next) => {
    const parseResult = jobEmbeddingRequestSchema.safeParse(req.body);

    if (!parseResult.success) {
        const errorMessages = parseResult.error.errors.map(err => err.message).join(", ");
        return next(new ErrorHandler(400, `Invalid job data: ${errorMessages}`));
    }

    const {
        job_id,
        title,
        role,
        description,
        company_name,
        city,
        state,
        job_type,
        work_location
    } = parseResult.data;

    const jobInput: JobEmbeddingInput = {
        title: title ?? null,
        role: role ?? null,
        description: description ?? null,
        companyName: company_name ?? null,
        city: city ?? null,
        state: state ?? null,
        jobType: job_type ?? null,
        workLocation: work_location ?? null
    };

    try {
        const embedding = await JobEmbeddingService.generateJobEmbedding(jobInput);

        return res.status(200).json({
            success: true,
            job_id,
            embedding
        });
    } catch (error: any) {
        console.error("Job Embedding Controller Error:", error);
        const statusCode = error instanceof ErrorHandler ? error.statusCode : 500;
        const message = error instanceof Error ? error.message : "Failed to generate job embedding";
        return next(new ErrorHandler(statusCode, message));
    }
});


export const generateResumeEmbeddingController = tryCatch(async (req: Request, res: Response, next) => {
    const parseResult = resumeUrlRequestSchema.safeParse(req.body);
    const resumeUrl = parseResult.success ? parseResult.data.resume_url : (req.body.resume_url || req.body.resumeUrl || req.body.url);

    if (!resumeUrl) {
        return next(new ErrorHandler(400, "Resume URL is required"));
    }

    try {
        const embedding = await ResumeEmbeddingService.generateResumeEmbedding(resumeUrl);

        return res.status(200).json({
            success: true,
            embedding
        });
    } catch (error: any) {
        console.error("Resume Embedding Controller Error:", error);
        const statusCode = error instanceof ErrorHandler ? error.statusCode : 500;
        const message = error instanceof Error ? error.message : "Failed to generate resume embedding";
        return next(new ErrorHandler(statusCode, message));
    }
});




