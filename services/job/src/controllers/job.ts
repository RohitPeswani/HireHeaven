import axios from "axios";
import { AuthenticatedRequest } from "../middlewares/auth.js";
import { getBuffer } from "../utils/buffer.js";
import { sql } from "../utils/db.js";
import { ErrorHandler } from "../utils/errorHandler.js";
import { tryCatch } from "../utils/tryCatch.js";
import { applicationStatusUpdateTemplate } from "../utils/template.js";
import { generateJobEmbedding, updateJobEmbedding, JobEmbeddingPayload } from "../services/jobEmbedding.service.js";
import { JobSemanticSearchService } from "../services/jobSemanticSearch.service.js";


export const createCompany = tryCatch(async(req : AuthenticatedRequest, res, next) => {
  const user = req.user;

  if(!user){
    next(new ErrorHandler(401, "Unauthorized"));
    return;
  }

  if(user.role !== 'recruiter'){
    next(new ErrorHandler(403, "Forbidden"));
    return;
  }

  const {name, description, website} = req.body;

  if(!name  || !description || !website){
    next(new ErrorHandler(400, "All fields are required"));
    return;
  }

  const checkCount = await sql`SELECT COUNT(*) FROM companies WHERE recruiter_id = ${user.user_id}`;

  if(checkCount[0].count >= 3){
    next(new ErrorHandler(403, "You can only create 3 companies"));
    return;
  }

  console.time("checking existing company");

  const existingCompany = await sql`SELECT company_id FROM companies WHERE name = ${name}`;

  console.timeEnd("checking existing company");

  if(existingCompany.length > 0){
    next(new ErrorHandler(409, "Company already exists"));
    return;
  }

  const file = req.file;

  if(!file){
    next(new ErrorHandler(400, "Company logo is required"));
    return;
  }


  console.time("buffer");

  const buffer = getBuffer(file);

  console.timeEnd("buffer");


  if(!buffer){
    next(new ErrorHandler(500, "Internal Server Error"));
    return;
  }


  console.time("upload service")

  const {data} = await axios.post(`${process.env.UTILS_SERVICE_URL}/api/utils/upload`, {
    buffer
  });

  console.timeEnd("upload service");



  console.time("Inserting record");
  const [company] = await sql`INSERT INTO companies (name, description, website,logo, logo_public_id, recruiter_id) VALUES (${name}, ${description}, ${website}, ${data.url}, ${data.public_id}, ${user.user_id}) RETURNING *`;

  console.timeEnd("Inserting record");

  res.status(201).json({
    success: true,
    company
  });
})

export const deleteCompany = tryCatch(async(req : AuthenticatedRequest, res, next) => {
    const user = req.user;

    if(!user){
        next(new ErrorHandler(401, "Unauthorized"));
        return;
    }

    if(user.role !== 'recruiter'){
        next(new ErrorHandler(403, "Forbidden"));
        return;
    }

    const {companyId} = req.params;

    const [company] = await sql`SELECT logo_public_id FROM companies WHERE company_id = ${companyId} AND recruiter_id = ${user.user_id}`;

    if(!company){
        next(new ErrorHandler(404, "Company not found"));
        return;
    }

    const {data : deleteData} = await axios.put(`${process.env.UTILS_SERVICE_URL}/api/utils/delete`, {
        publicId : company.logo_public_id
    });


    await sql`DELETE FROM companies WHERE company_id = ${companyId}`;

    res.status(200).json({
        success: true,
        message: "Company deleted successfully"
    });
})

export const createJob = tryCatch(async(req : AuthenticatedRequest, res, next) => {
    const user = req.user;

    if(!user){
        next(new ErrorHandler(401, "Unauthorized"));
        return;
    }

    if(user.role !== 'recruiter'){
        next(new ErrorHandler(403, "Forbidden"));
        return;
    }

    const {title, description, salary, city, state, job_type, openings, role, work_location,company_id} = req.body;

    console.log(title);

    if(!title || !description || !salary || !city || !state || !openings || !role){
        next(new ErrorHandler(400, "All fields are required"));
        return;
    }

    const [company] = await sql`SELECT company_id, name FROM companies WHERE company_id = ${company_id} AND recruiter_id = ${user.user_id}`;

    if(!company){
        next(new ErrorHandler(404, "Company not found"));
        return;
    }

    const [job] = await sql`INSERT INTO jobs (title, description, salary, city, state, job_type, openings, role, work_location, company_id, posted_by_recruiter_id) VALUES (${title}, ${description}, ${salary}, ${city}, ${state}, ${job_type}, ${openings}, ${role}, ${work_location}, ${company_id}, ${user.user_id}) RETURNING *`;

    
        const payload: JobEmbeddingPayload = {
            job_id: job.job_id,
            title: job.title,
            role: job.role,
            description: job.description,
            company_name: company?.name || null,
            city: job.city,
            state: job.state,
            job_type: job.job_type,
            work_location: job.work_location,
            salary: job.salary,
            openings: job.openings
        };

        const embedding = await generateJobEmbedding(payload);
        await updateJobEmbedding(job.job_id, embedding);

    const [companyWithJob] = await sql`SELECT c.*, COALESCE(
    (
        SELECT json_agg(j.*) FROM jobs j WHERE j.company_id = c.company_id
    ), '[]'::json) as jobs FROM companies c WHERE c.company_id = ${company_id}`;

    res.status(201).json({
        success: true,
        company: companyWithJob
    });
})


export const updateJob = tryCatch(async(req : AuthenticatedRequest, res, next) => {
    const user = req.user;

    if(!user){
        next(new ErrorHandler(401, "Unauthorized"));
        return;
    }

    if(user.role !== 'recruiter'){
        next(new ErrorHandler(403, "Forbidden"));
        return;
    }

    const {jobId} = req.params;
    const {title, description, salary, city, state, job_type, openings, role, work_location, is_active} = req.body;

    const [job] = await sql`SELECT * FROM jobs WHERE job_id = ${jobId} AND posted_by_recruiter_id = ${user.user_id}`;

    if(!job){
        next(new ErrorHandler(404, "Job not found"));
        return;
    }

    const isFieldChanged = (newVal: any, oldVal: any) =>
        newVal !== undefined && newVal !== null && String(newVal).trim() !== String(oldVal || "").trim();

    const isEmbeddingRelevantChanged =
        (title !== undefined && isFieldChanged(title, job.title)) ||
        (role !== undefined && isFieldChanged(role, job.role)) ||
        (description !== undefined && isFieldChanged(description, job.description)) ||
        (city !== undefined && isFieldChanged(city, job.city)) ||
        (state !== undefined && isFieldChanged(state, job.state)) ||
        (job_type !== undefined && isFieldChanged(job_type, job.job_type)) ||
        (work_location !== undefined && isFieldChanged(work_location, job.work_location)) ||
        (salary !== undefined && isFieldChanged(salary, job.salary)) ||
        (openings !== undefined && isFieldChanged(openings, job.openings));

    const [updatedJob] = await sql`UPDATE jobs SET title = COALESCE(${title}, title), description = COALESCE(${description}, description), salary = COALESCE(${salary}, salary), city = COALESCE(${city}, city), state = COALESCE(${state}, state), job_type = COALESCE(${job_type}, job_type), openings = COALESCE(${openings}, openings), role = COALESCE(${role}, role), work_location = COALESCE(${work_location}, work_location), is_active = COALESCE(${is_active}, is_active) WHERE job_id = ${jobId} RETURNING *`;

    if (isEmbeddingRelevantChanged) {
        
            const [company] = await sql`SELECT name FROM companies WHERE company_id = ${updatedJob.company_id}`;
            const payload: JobEmbeddingPayload = {
                job_id: updatedJob.job_id,
                title: updatedJob.title,
                role: updatedJob.role,
                description: updatedJob.description,
                company_name: company?.name || null,
                city: updatedJob.city,
                state: updatedJob.state,
                job_type: updatedJob.job_type,
                work_location: updatedJob.work_location,
                salary: updatedJob.salary,
                openings: updatedJob.openings
            };

            const embedding = await generateJobEmbedding(payload);
            await updateJobEmbedding(updatedJob.job_id, embedding);
    }
    

    const [companyWithJob] = await sql`SELECT c.*, COALESCE(
    (
        SELECT json_agg(j.*) FROM jobs j WHERE j.company_id = c.company_id
    ), '[]'::json) as jobs FROM companies c WHERE c.company_id = ${updatedJob.company_id}`;

    res.status(200).json({
        success: true,
        company: companyWithJob
    });
})

export const getAllCompanies = tryCatch(async(req : AuthenticatedRequest, res, next) => {
    const user = req.user;

    if(!user){
        next(new ErrorHandler(401, "Unauthorized"));
        return;
    }

    const companies = await sql`SELECT * FROM companies WHERE recruiter_id = ${user.user_id}`;

    res.status(200).json({
        success: true,
        companies
    });
})

export const getCompanyDetails = tryCatch(async(req : AuthenticatedRequest, res, next) => {
    const user = req.user;

    if(!user){
        next(new ErrorHandler(401, "Unauthorized"));
        return;
    }

    const {companyId} = req.params;

    const [company] = await sql`SELECT c.*, COALESCE(
    (
        SELECT json_agg(j.*) FROM jobs j WHERE j.company_id = c.company_id
    ), '[]'::json) as jobs FROM companies c WHERE c.company_id = ${companyId}`;

    if(!company){
        next(new ErrorHandler(404, "Company not found"));
        return;
    }

    res.status(200).json({
        success: true,
        company
    });
})

export const getAllActiveJobs = tryCatch(async(req, res, next) => {

    const {
        title,
        city,
        state,
        company,
        role,
        job_type,
        work_location,
        min_salary,
        max_salary,
        sort,
        date_posted,
        page,
        limit
    } = req.query;

    const conditions = ["j.is_active = true"];
    const values: any[] = [];
    let paramIndex = 1;

    if (title) {
        conditions.push(`j.title ILIKE $${paramIndex}`);
        values.push(`%${title}%`);
        paramIndex++;
    }

    if (city) {
        conditions.push(`j.city ILIKE $${paramIndex}`);
        values.push(`%${city}%`);
        paramIndex++;
    }

    if (state) {
        conditions.push(`j.state ILIKE $${paramIndex}`);
        values.push(`%${state}%`);
        paramIndex++;
    }

    if (company) {
        conditions.push(`c.name ILIKE $${paramIndex}`);
        values.push(`%${company}%`);
        paramIndex++;
    }

    if (role) {
        conditions.push(`j.role ILIKE $${paramIndex}`);
        values.push(`%${role}%`);
        paramIndex++;
    }

    if (job_type) {
        conditions.push(`j.job_type = $${paramIndex}`);
        values.push(job_type);
        paramIndex++;
    }

    if (work_location) {
        conditions.push(`j.work_location = $${paramIndex}`);
        values.push(work_location);
        paramIndex++;
    }

    if (min_salary && !isNaN(Number(min_salary))) {
        conditions.push(`j.salary >= $${paramIndex}`);
        values.push(Number(min_salary));
        paramIndex++;
    }

    if (max_salary && !isNaN(Number(max_salary))) {
        conditions.push(`j.salary <= $${paramIndex}`);
        values.push(Number(max_salary));
        paramIndex++;
    }

    // Date Filter Logic using Lookup Map
    const dateMap: Record<string, string> = {
        "24h": "24 hours",
        "3d": "3 days",
        "7d": "7 days",
        "30d": "30 days"
    };

    if (date_posted && dateMap[date_posted as string]) {
        conditions.push(`j.created_at >= NOW() - INTERVAL '${dateMap[date_posted as string]}'`);
    }

    // Determine sorting using Lookup Map
    const sortMap: Record<string, string> = {
        newest: "ORDER BY j.created_at DESC",
        oldest: "ORDER BY j.created_at ASC",
        salary_high: "ORDER BY j.salary DESC NULLS LAST, j.created_at DESC",
        salary_low: "ORDER BY j.salary ASC NULLS LAST, j.created_at DESC",
        title_asc: "ORDER BY j.title ASC, j.created_at DESC"
    };

    const orderClause = sort && sortMap[sort as string] ? sortMap[sort as string] : "ORDER BY j.created_at DESC";

    // Pagination calculations and validation
    const pageNum = page ? parseInt(page as string, 10) : 1;
    const limitNum = limit ? parseInt(limit as string, 10) : 10;
    const parsedPage = isNaN(pageNum) || pageNum < 1 ? 1 : pageNum;
    
    let parsedLimit = isNaN(limitNum) ? 10 : limitNum;
    if (parsedLimit < 1) {
        parsedLimit = 1;
    } else if (parsedLimit > 50) {
        parsedLimit = 50;
    }

    const offset = (parsedPage - 1) * parsedLimit;

    // Count query to get total jobs matching criteria
    const countQueryString = `
        SELECT COUNT(*) 
        FROM jobs j 
        JOIN companies c ON j.company_id = c.company_id 
        WHERE ${conditions.join(" AND ")}
    `;
    const countResult = await sql.query(countQueryString, values);
    const totalJobs = parseInt(countResult[0]?.count || "0", 10);

    // Main jobs query with pagination
    const queryString = `
        SELECT j.job_id, j.title, j.description, j.salary, j.city,j.state, j.job_type, j.openings, j.role, j.work_location, j.created_at, j.is_active,
               c.company_id, c.name as company_name, c.logo as company_logo 
        FROM jobs j 
        JOIN companies c ON j.company_id = c.company_id 
        WHERE ${conditions.join(" AND ")}
        ${orderClause}
        LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;

    const jobsValues = [...values, parsedLimit, offset];
    const jobs = await sql.query(queryString, jobsValues);

    const totalPages = Math.ceil(totalJobs / parsedLimit);
    const hasNextPage = parsedPage < totalPages;
    const hasPreviousPage = parsedPage > 1;

    res.status(200).json({
        success: true,
        jobs,
        pagination: {
            totalJobs,
            currentPage: parsedPage,
            totalPages,
            limit: parsedLimit,
            hasNextPage,
            hasPreviousPage
        }
    });
})

export const getSingleJob = tryCatch(async(req, res, next) => {
    const {jobId} = req.params;

    const [job] = await sql`SELECT j.* FROM jobs j WHERE j.job_id = ${jobId}`;

    if(!job){
        next(new ErrorHandler(404, "Job not found"));
        return;
    }

    res.status(200).json({
        success: true,
        job
    });
})

export const getApplicationsForJob = tryCatch(async(req: AuthenticatedRequest, res, next) => {
    const user = req.user;

    if(!user){
        next(new ErrorHandler(401, "Unauthorized"));
        return;
    }

    if(user.role !== 'recruiter'){
        next(new ErrorHandler(403, "Forbidden"));
        return;
    }

    const {jobId} = req.params;

    const [job] = await sql`SELECT posted_by_recruiter_id FROM jobs WHERE job_id = ${jobId}`;

    if(!job){
        next(new ErrorHandler(404, "Job not found"));
        return;
    }

    if(job.posted_by_recruiter_id !== user.user_id){
        next(new ErrorHandler(403, "Forbidden you are only allowed to view applications of your jobs"));
        return;
    }

    const applications = await sql`SELECT a.*, u.name as applicant_name, u.email as applicant_email FROM applications as a join users as u on a.applicant_id = u.user_id WHERE job_id = ${jobId} ORDER BY subscribed DESC, applied_at ASC`;

    res.status(200).json({
        success: true,
        applications
    });
})

export const updateApplicationStatus = tryCatch(async(req: AuthenticatedRequest, res, next) => {
    const user = req.user;

    if(!user){
        next(new ErrorHandler(401, "Unauthorized"));
        return;
    }

    if(user.role !== 'recruiter'){
        next(new ErrorHandler(403, "Forbidden"));
        return;
    }

    const {applicationId} = req.params;
    const {status} = req.body;

    const [application] = await sql`SELECT job_id, applicant_email, subscribed FROM applications WHERE application_id = ${applicationId}`;

    if(!application){
        next(new ErrorHandler(404, "Application not found"));
        return;
    }

    const [job] = await sql`SELECT j.title, j.posted_by_recruiter_id FROM jobs j WHERE j.job_id = ${application.job_id}`;

    if(!job){
        next(new ErrorHandler(404, "Job not found"));
        return;
    }

    if(job.posted_by_recruiter_id !== user.user_id){
        next(new ErrorHandler(403, "Forbidden you are only allowed to update applications of your jobs"));
        return;
    }

    const [updatedApplication] = await sql`UPDATE applications SET status = ${status} WHERE application_id = ${applicationId} RETURNING *`;

    const message = {
        to : application.applicant_email,
        subject : `Application Status Update for ${job.title}`,
        html : applicationStatusUpdateTemplate(job.title)
    }

    await axios.post(`${process.env.UTILS_SERVICE_URL}/api/utils/send-email`, message);

    res.status(200).json({
        success: true,
        application: updatedApplication
    });
})

export const getAllRecruiterJobs = tryCatch(async(req : AuthenticatedRequest, res, next) => {
    const user = req.user;

    if(!user){
        next(new ErrorHandler(401, "Unauthorized"));
        return;
    }

    if(user.role !== 'recruiter'){
        next(new ErrorHandler(403, "Forbidden"));
        return;
    }

    const jobs = await sql`SELECT * FROM jobs WHERE posted_by_recruiter_id = ${user.user_id}`;

    res.status(200).json({
        success: true,
        jobs
    });
})

export const semanticJobSearch = tryCatch(async (req: AuthenticatedRequest, res, next) => {
    const user = req.user;

    if (!user) {
        return next(new ErrorHandler(401, "Unauthorized"));
    }

    const { userId, limit } = req.body;
    const targetUserId = userId ?? user.user_id;

    if (!targetUserId) {
        return next(new ErrorHandler(400, "userId is required"));
    }

    const jobs = await JobSemanticSearchService.searchJobs(targetUserId, limit);

    return res.status(200).json({
        success: true,
        jobs
    });
});

export const jobSemanticSearch = semanticJobSearch;