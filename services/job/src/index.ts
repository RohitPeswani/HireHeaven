import express, { NextFunction, Request, Response } from "express";
import dotenv from "dotenv";
import cors from "cors";
import { sql } from "./utils/db.js";
import { ErrorHandler } from "./utils/errorHandler.js";
import jobRoutes from './routes/job.js';



dotenv.config();

const app = express();

app.use(cors());
app.use(express.json({limit : "50mb"}));
app.use(express.urlencoded({extended: true, limit : "50mb"}));

app.use('/api/job', jobRoutes);

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
      IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'job_type') THEN
      CREATE TYPE job_type AS ENUM ('Full-time', 'Part-time', 'Contract', 'Internship');
      END IF;

      IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'work_location') THEN
      CREATE TYPE work_location AS ENUM ('On-site', 'Remote', 'Hybrid');
      END IF;

      IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'application_status') THEN
      CREATE TYPE application_status AS ENUM ('Submitted', 'Hired', 'Rejected');
      END IF;

      CREATE UNIQUE INDEX IF NOT EXISTS idx_companies_name ON companies(name);

      CREATE INDEX IF NOT EXISTS idx_jobs_company_id ON jobs(company_id);
      CREATE INDEX IF NOT EXISTS idx_jobs_recruiter_id ON jobs(posted_by_recruiter_id);
      CREATE INDEX IF NOT EXISTS idx_jobs_title ON jobs(title);
      CREATE INDEX IF NOT EXISTS idx_jobs_role ON jobs(role);

      CREATE INDEX IF NOT EXISTS idx_applications_job_id ON applications(job_id);
      CREATE INDEX IF NOT EXISTS idx_applications_applicant_id ON applications(applicant_id);
      CREATE INDEX IF NOT EXISTS idx_applications_status ON applications(status);
    END$$;`;

    await sql`
    CREATE TABLE IF NOT EXISTS companies (
     company_id SERIAL PRIMARY KEY,
     name VARCHAR(255) NOT NULL UNIQUE,
     description TEXT NOT NULL,
     website VARCHAR(255) NOT NULL,
     logo VARCHAR(255) NOT NULL,
     logo_public_id VARCHAR(255) NOT NULL,
     recruiter_id INTEGER NOT NULL,
     created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
    `;

    await sql`
    CREATE TABLE IF NOT EXISTS jobs (
     job_id SERIAL PRIMARY KEY,
     title VARCHAR(255) NOT NULL,
     description TEXT NOT NULL,
     salary NUMERIC(10, 2),
     city VARCHAR(100) NOT NULL,
     state VARCHAR(100) NOT NULL,
     job_type job_type NOT NULL,
     openings NUMERIC(3,1),
     role VARCHAR(255) NOT NULL,
     work_location work_location NOT NULL,
     company_id INTEGER NOT NULL REFERENCES companies(company_id) ON DELETE CASCADE,
     posted_by_recruiter_id INTEGER NOT NULL,
     created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
     is_active BOOLEAN DEFAULT TRUE,
     embedding halfvec(3072)
    )
    `;

    await sql`
    CREATE TABLE IF NOT EXISTS applications (
     application_id SERIAL PRIMARY KEY,
     job_id INTEGER NOT NULL REFERENCES jobs(job_id) ON DELETE CASCADE,
     applicant_id INTEGER NOT NULL,
     applicant_email VARCHAR(255) NOT NULL,
     status application_status NOT NULL DEFAULT 'Submitted',
     resume VARCHAR(255) NOT NULL,
     applied_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
     subscribed BOOLEAN NOT NULL DEFAULT FALSE,
     UNIQUE(job_id, applicant_id)
    )
    `;

    console.log('database initialized successfully');

    }catch(error){
        console.log('error initializing database', error)
    }
    


}



initDB().then(() => {
    app.listen(process.env.PORT, () => {
        console.log(`Job service is running on port ${process.env.PORT}`);
    });
})

