import express from 'express';
import { isAuthenticated } from '../middlewares/auth.js';
import uploadFile from '../middlewares/multer.js';
import { createCompany, createJob, deleteCompany, getAllActiveJobs, getAllCompanies, getApplicationsForJob, getCompanyDetails, getSingleJob, updateApplicationStatus, updateJob, semanticJobSearch } from '../controllers/job.js';

const router = express.Router();

router.post('/company', isAuthenticated, uploadFile, createCompany);
router.put('/company/:companyId', isAuthenticated, deleteCompany);
router.post('/new', isAuthenticated, createJob);
router.patch('/:jobId', isAuthenticated, updateJob);
router.get('/company/all', isAuthenticated, getAllCompanies);
router.get('/company/:companyId', isAuthenticated, getCompanyDetails);
router.get('/all', getAllActiveJobs);
router.get('/:jobId', getSingleJob);
router.get('/applications/:jobId', isAuthenticated, getApplicationsForJob);
router.patch('/application/:applicationId', isAuthenticated, updateApplicationStatus);
router.post('/semantic-search', isAuthenticated, semanticJobSearch);

export default router;