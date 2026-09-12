import express, { NextFunction, Request, Response } from "express";
import dotenv from 'dotenv';
dotenv.config();
import {sql} from './utils/db.js';
import authRoutes from './routes/auth.js';
import { ErrorHandler } from "./utils/errorHandler.js";
import { createClient } from 'redis';
import cors from 'cors';

const PORT = process.env.PORT || 8000;
const app = express();

app.use(cors({
    origin: process.env.FRONTEND_URL,
    credentials: true
}));
app.use(express.json());

export const redisClient = createClient({
    url : process.env.REDIS_URL
});

redisClient.connect().then(() => {
    console.log("Redis connected");
}).catch((error) => {
    console.log("Failed to connect to Redis", error);
});


app.use('/api/auth', authRoutes);

app.use((error: any, req : Request, res : Response, next : NextFunction) => {

   if(error instanceof ErrorHandler){
      return res.status(error.statusCode).json({
         message: error.message
      });
   }

   return res.status(500).json({
      message: "Internal Server Error"
   });

});

async function initDB(){

    try{
        await sql`
    DO $$
    BEGIN 
      IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
      CREATE TYPE user_role AS ENUM ('jobseeker', 'recruiter');
      END IF;
    END$$;`;

    await sql`
    CREATE TABLE IF NOT EXISTS users(
     user_id SERIAL PRIMARY KEY,
     name VARCHAR(255) NOT NULL,
     email VARCHAR(255) NOT NULL UNIQUE,
     password VARCHAR(255) NOT NULL,
     phone_number VARCHAR(20) NOT NULL,
     role user_role NOT NULL,
     bio TEXT,
     resume VARCHAR(255),
     resume_public_id VARCHAR(255),
     profile_pic VARCHAR(255),
     profile_pic_public_id VARCHAR(255),
     created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
     subscription TIMESTAMPTZ
    )
    `;

    await sql`
    CREATE TABLE IF NOT EXISTS skills (
    skill_id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE
    )
    `;

    await sql`
    CREATE TABLE IF NOT EXISTS user_skills(
     user_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
     skill_id INTEGER NOT NULL REFERENCES skills(skill_id) ON DELETE CASCADE,
     PRIMARY KEY (user_id, skill_id)
    )
    `;
    await sql`CREATE TABLE IF NOT EXISTS resume_embeddings (
        user_id INTEGER NOT NULL UNIQUE REFERENCES users(user_id) ON DELETE CASCADE,
        embedding halfvec(3072) NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
    );`;
    console.log('database initialized successfully');

    }catch(error){
        console.log('error initializing database', error)
    }
    


}

initDB().then(()=> {
    app.listen(PORT, () => {
    console.log(`auth service is running on port ${PORT}`);
})

})

