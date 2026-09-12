import { tryCatch } from "../utils/tryCatch.js";
import { AuthenticatedRequest } from "../middlewares/auth.js";
import { sql } from "../utils/db.js";
import { ErrorHandler } from "../utils/errorHandler.js";
import { getBuffer } from "../utils/buffer.js";
import axios from "axios";

export const myProfile = tryCatch(async(req : AuthenticatedRequest, res, next) => {
    const user = req.user;

    return res.status(200).json({
        success : true,
        user
    });

})

export const getUserProfile = tryCatch(async (req: AuthenticatedRequest, res, next) => {

    const { userId } = req.params;

    if (req?.user?.role !== "recruiter") {
        return next(new ErrorHandler(401, "Unauthorized"));
    }

    const [canView] = await sql`SELECT 1 FROM applications a JOIN jobs j ON a.job_id = j.job_id WHERE a.applicant_id = ${userId} AND j.posted_by_recruiter_id = ${req.user.user_id} LIMIT 1`;

    if (!canView) {
        return next(new ErrorHandler(403, "Forbidden"));
    }

    const users = await sql`SELECT u.user_id, u.name, u.email, u.phone_number, u.role, u.bio, u.resume, u.resume_public_id, u.profile_pic, u.profile_pic_public_id, u.subscription, ARRAY_AGG(s.name) FILTER (WHERE s.name IS NOT NULL) as skills, u.subscription, u.created_at FROM users u LEFT JOIN user_skills us ON u.user_id = us.user_id LEFT JOIN skills s ON us.skill_id = s.skill_id WHERE u.user_id = ${userId} GROUP BY u.user_id`;

    if (users.length === 0) {
        return next(new ErrorHandler(404, "User not found"));
    }

    const user = users[0];
    user.skills = user.skills || [];

    return res.status(200).json({
        success: true,
        user
    });
})

export const updateUserProfile = tryCatch(async(req : AuthenticatedRequest, res, next) => {
    let user = req.user;
    
    if(!user){
        return next(new ErrorHandler(401, "Authentication required"));
    }

    const {name, phone_number, bio} = req.body;

    const newName = name || user.name;
    const newPhone = phone_number || user.phone_number;
    const newBio = bio || user.bio;

    const [updatedUser] = await sql`UPDATE users SET name = ${newName}, phone_number = ${newPhone}, bio = ${newBio} WHERE user_id = ${user.user_id} RETURNING *`;
    
    user = {...user, ...updatedUser};
    return res.status(200).json({
        success : true,
        user
    });
})

export const updateProfilePic = tryCatch(async(req : AuthenticatedRequest, res, next) => {
    let user = req.user;
    
    if(!user){
        return next(new ErrorHandler(401, "Authentication required"));
    }

    const file = req.file;



    if(!file){
        return next(new ErrorHandler(400, "File is required"));
    }


    const oldPublicId = user.profile_pic_public_id;

    const buffer = getBuffer(file);


    if(!buffer){
        return next("failed to generate content");
    }

    const {data} = await axios.post(`${process.env.UTILS_SERVICE_URL}/api/utils/upload`, {
        buffer,
        public_id : oldPublicId
    });

    const {data : deleteData} = await axios.post(`${process.env.UTILS_SERVICE_URL}/api/utils/delete`, {
        publicId : oldPublicId
    });

    const [updatedUser] = await sql`UPDATE users SET profile_pic = ${data.url}, profile_pic_public_id = ${data.public_id} WHERE user_id = ${user.user_id} RETURNING *`;
    
    user = {...user, ...updatedUser};
    return res.status(200).json({
        success : true,
        user
    });
})

export const updateResume = tryCatch(async(req : AuthenticatedRequest, res, next) => {
    let user = req.user;
    
    if(user?.role === "recruiter"){
        return next(new ErrorHandler(403, "Unauthorized"));
    }
    if(!user){
        return next(new ErrorHandler(401, "Authentication required"));
    }

    const file = req.file;



    if(!file){
        return next(new ErrorHandler(400, "File is required"));
    }


    const oldPublicId = user.resume_public_id;

    console.log("old public id ", oldPublicId);

    const buffer = getBuffer(file);


    if(!buffer){
        return next("failed to generate content");
    }

    const {data} = await axios.post(`${process.env.UTILS_SERVICE_URL}/api/utils/upload`, {
        buffer
    });



    const {data : deleteData} = await axios.put(`${process.env.UTILS_SERVICE_URL}/api/utils/delete`, {
        publicId : oldPublicId
    });

    // console.log("from updateResume function", user.user_id);

    const [updatedUser] = await sql`UPDATE users SET resume = ${data.url}, resume_public_id = ${data.public_id} WHERE user_id = ${user.user_id} RETURNING *`;

console.log("from updateResume function", updatedUser);
    // Synchronously generate resume embedding from Utils Service
    let embedding: number[];
    try {
        const { data: embeddingData } = await axios.post(`${process.env.UTILS_SERVICE_URL}/api/utils/resume-embedding`, {
            resume_url: data.url
        });

    


        if (!embeddingData || !embeddingData.success || !Array.isArray(embeddingData.embedding)) {
            return next(new ErrorHandler(500, "Invalid embedding response from Utils service"));
        }

        embedding = embeddingData.embedding;

        
        if (embedding.length !== 3072) {
            return next(new ErrorHandler(500, `Incorrect embedding dimension: expected 3072, received ${embedding.length}`));
        }
    } catch (err: any) {
        console.error("Resume Embedding Error:", err);
        const statusCode = err instanceof ErrorHandler ? err.statusCode : (err.response?.status || 500);
        const message = err.response?.data?.message || err.message || "Failed to generate resume embedding";
        return next(new ErrorHandler(statusCode, message));
    }

    // Store embedding in resume_embeddings table (UPSERT)
    try {
        const formattedVector = `[${embedding.join(",")}]`;
        await sql`
            INSERT INTO resume_embeddings (user_id, embedding, updated_at)
            VALUES (${user.user_id}, ${formattedVector}::halfvec, CURRENT_TIMESTAMP)
            ON CONFLICT (user_id) DO UPDATE
            SET embedding = EXCLUDED.embedding, updated_at = CURRENT_TIMESTAMP
        `;
    } catch (err: any) {
        console.error("Database Error Saving Resume Embedding:", err);
        const statusCode = err instanceof ErrorHandler ? err.statusCode : 500;
        const message = err instanceof Error ? err.message : "Failed to store resume embedding in database";
        return next(new ErrorHandler(statusCode, message));
    }

    user = {...user, ...updatedUser};
    return res.status(200).json({
        success : true,
        user,
        embedding
    });
})

export const addSkillToUser = tryCatch(async(req : AuthenticatedRequest, res, next) => {
    const userId = req.user?.user_id;
    let user = req.user;

    if(!userId){
        return res.status(401).json({
            success : false,
            message : "Unauthorized"
        });
    }

    const {skillName} = req.body;


    if(!skillName || skillName.trim() === ""){
        return res.status(400).json({
            success : false,
            message : "Skill is required"
        });
    }  
    let wasSkillAdded = false;

    try {
        await sql`BEGIN`

        const users = await sql`select user_id from users where user_id = ${userId}`;

        if(users.length === 0){
            throw new ErrorHandler(404, "User not found");
        }

        const normalizedSkill = skillName.trim().toLowerCase().replace(/\s+/g, " ");

        const [skill] = await sql`insert into skills (name) values (${normalizedSkill}) on conflict (name) do update set name = excluded.name returning skill_id`;

        const skillId = skill.skill_id;

        const insertionResult = await sql`insert into user_skills (user_id, skill_id) values (${userId}, ${skillId}) on conflict (user_id, skill_id) do nothing returning user_id`;

        if(insertionResult.length > 0){
           wasSkillAdded = true;
        }

        await sql`COMMIT`;

    if(!wasSkillAdded){
        return res.status(200).json({
            success : false,
            message : "Skill already exists"
        });
    }

    const [updatedUser] = await sql`SELECT u.user_id, u.name, u.email, u.phone_number, u.role, u.bio, u.resume, u.resume_public_id, u.profile_pic, u.profile_pic_public_id, u.subscription, ARRAY_AGG(s.name) FILTER (WHERE s.name IS NOT NULL) as skills, u.subscription, u.created_at FROM users u LEFT JOIN user_skills us ON u.user_id = us.user_id LEFT JOIN skills s ON us.skill_id = s.skill_id WHERE u.user_id = ${userId} GROUP BY u.user_id`;

   
     res.status(200).json({
            success : true,
            user : updatedUser
        });
    } catch (error) {
        await sql`ROLLBACK`;
        throw error;
    }

})

export const deleteSkillFromUser = tryCatch(async(req : AuthenticatedRequest, res, next) => {
    const userId = req.user?.user_id;

    if(!userId){
        return res.status(401).json({
            success : false,
            message : "Unauthorized"
        });
    }

    const {skillName} = req.body;

    if(!skillName || skillName.trim() === ""){
        return res.status(400).json({
            success : false,
            message : "Skill is required"
        });
    }

    const normalizedSkill = skillName.trim().toLowerCase();

    const [skill] = await sql`SELECT skill_id FROM skills WHERE name = ${normalizedSkill}`;

    if(skill.length === 0){
        return next(new ErrorHandler(404, "Skill not found"));
    }

    const skillId = skill.skill_id;

    const deletionResult = await sql`DELETE FROM user_skills WHERE user_id = ${userId} AND skill_id = ${skillId} RETURNING user_id`;

    if(deletionResult.length === 0){
        return next(new ErrorHandler(404, "Skill not found"));
    }

    const [updatedUser] = await sql`SELECT u.user_id, u.name, u.email, u.phone_number, u.role, u.bio, u.resume, u.resume_public_id, u.profile_pic, u.profile_pic_public_id, u.subscription, ARRAY_AGG(s.name) FILTER (WHERE s.name IS NOT NULL) as skills, u.subscription, u.created_at FROM users u LEFT JOIN user_skills us ON u.user_id = us.user_id LEFT JOIN skills s ON us.skill_id = s.skill_id WHERE u.user_id = ${userId} GROUP BY u.user_id`;

    return res.status(200).json({
        success : true,
        user : updatedUser
    });
})

export const applyForJob = tryCatch(async(req : AuthenticatedRequest, res, next) => {
    const user = req.user;

    if(!user){
       return next(new ErrorHandler(401, "Unauthorized"));
    }

    if(user.role !== "jobseeker"){
        return next(new ErrorHandler(403, "You are not allowed to apply"));
    }

    const applicant_id = user.user_id;
    const resume = user.resume;

    if(!resume){
        return next(new ErrorHandler(400, "Please upload your resume first"));
    }

    
    const {jobId} = req.params;

    if(!jobId){
        return next(new ErrorHandler(400, "Job is required"));
    }

    const [job] = await sql`SELECT is_active FROM jobs WHERE job_id = ${jobId}`;

    if(job.length === 0){
        return next(new ErrorHandler(404, "Job not found"));
    }

    if(!job.is_active){
        return next(new ErrorHandler(400, "Job is not active"));
    }

    // const now = Date.now();

    // const subTime = user.subscription ? new Date(user.subscription).getTime() : 0;

    // const daysDiff = Math.ceil((subTime - now) / (1000 * 60 * 60 * 24));

    // const isSubscribed = daysDiff <= 0 ? false : true;

    // if(!isSubscribed){
    //     return next(new ErrorHandler(400, "Your subscription has expired"));
    // }

    const isSubscribed = user.subscription && new Date(user.subscription).getTime() > Date.now();

    const existingApplication = await sql`SELECT application_id FROM applications WHERE job_id = ${jobId} AND applicant_id = ${applicant_id}`;

    if(existingApplication.length > 0){
        return next(new ErrorHandler(400, "You have already applied for this job"));
    }
    const [application] = await sql`INSERT INTO applications (job_id, applicant_id, applicant_email, resume, subscribed) VALUES (${jobId}, ${applicant_id}, ${user.email}, ${resume}, ${isSubscribed}) RETURNING *`;

    return res.status(200).json({
        success : true,
        application
    });
})

export const getAllApplications = tryCatch(async(req : AuthenticatedRequest, res, next) => {
    const user = req.user;

    if(!user){
       return next(new ErrorHandler(401, "Unauthorized"));
    }

    const applicant_id = user.user_id;

    const applications = await sql`SELECT a.* , j.title AS job_title, j.salary AS job_salary, j.city as job_city, j.state as job_state, c.name as company_name FROM applications a JOIN jobs j ON a.job_id = j.job_id JOIN companies c ON j.company_id = c.company_id WHERE applicant_id = ${applicant_id}`;

    return res.status(200).json({
        success : true,
        applications
    });
})