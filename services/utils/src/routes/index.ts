import express from 'express';
import { analyzeResume, carrerGuidance, deleteFileController, sendEmail, uploadFileController, extractJobFilters, generateJobEmbeddingController, generateResumeEmbeddingController } from '../controllers/utils.js';
import uploadFile from '../middlewares/multer.js';

const routes = express.Router();

routes.post('/upload', uploadFileController);
routes.put('/delete', deleteFileController);
routes.post('/send-email', sendEmail);
routes.post('/career-guidance', carrerGuidance);
routes.post('/analyze-resume', uploadFile, analyzeResume);
routes.post('/job-query-extract', extractJobFilters);
routes.post('/job-embedding', generateJobEmbeddingController);
routes.post('/resume-embedding', generateResumeEmbeddingController);

export default routes;

