import { NextFunction, Request, Response } from "express";
import jwt from 'jsonwebtoken';
import { sql } from "../utils/db.js";
import { ErrorHandler } from "../utils/errorHandler.js";
import dotenv from 'dotenv';

dotenv.config();

interface User {
    user_id : number,
    name : string,
    email : string,
    role : 'jobseeker' | 'recruiter',
    bio : string,
    phone_number : string,
    resume : string | null,
    resume_public_id :string | null,
    profile_pic : string | null,
    profile_pic_public_id : string | null,
    skills : string[] | null,
    subscription : string | null
}

export interface AuthenticatedRequest extends Request {
    user? : User;
}
export const isAuthenticated = async(req : AuthenticatedRequest, res : Response, next : NextFunction) : Promise<void> => {
    try {
        
   const authHeader = req.headers.authorization;

   if(!authHeader || !authHeader.startsWith('Bearer ')){
    console.log('inside first if block');
     next(new ErrorHandler(401, "Unauthorized"));

    return;
   }

   const token = authHeader.split(' ')[1];

   const decodedToken = jwt.verify(token, process.env.JWT_SECRET as string);

   if(typeof decodedToken !== 'object' || !decodedToken.id){
    console.log('inside second if block');
    next(new ErrorHandler(401, "Unauthorized"));
    return;
   }

   const users = await sql`SELECT u.user_id, u.name, u.email, u.role, u.bio, u.phone_number, u.resume, u.resume_public_id, u.profile_pic, u.profile_pic_public_id, u.subscription, ARRAY_AGG(s.name) FILTER (WHERE s.name IS NOT NULL) AS skills FROM users u LEFT JOIN user_skills us ON u.user_id = us.user_id LEFT JOIN skills s ON us.skill_id = s.skill_id WHERE u.user_id = ${decodedToken.id} GROUP BY u.user_id`;

   if(users.length === 0){
    next(new ErrorHandler(401, "Unauthorized"));
    return;
   }

   const user = users[0] as User;

   user.skills = user.skills || [];

   req.user = user;

   next();
    } catch (error) {
        console.log(error);
        next(new ErrorHandler(401, "Authentication failed please login again"));
    }
}