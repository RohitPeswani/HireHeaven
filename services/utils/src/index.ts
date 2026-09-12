import express, { NextFunction, Request, Response } from 'express';
import dotenv from 'dotenv';
import routes from './routes/index.js';
import {v2 as cloudinary} from 'cloudinary';
import { ErrorHandler } from './utils/errorHandler.js';
import cors from 'cors';
import { EmbeddingService } from './services/embeddings/EmbeddingService.js';


dotenv.config();


cloudinary.config({
    cloud_name : process.env.CLOUDINARY_CLOUD_NAME,
    api_key : process.env.CLOUDINARY_API_KEY,
    api_secret : process.env.CLOUDINARY_API_SECRET
})

const app = express();

app.use(cors({
    origin : "http://localhost:3000",
    credentials : true
}));
app.use(express.json({limit : "50mb"}));
app.use(express.urlencoded({extended: true, limit : "50mb"}));

app.use('/api/utils', routes);

app.use((error: any, req : Request, res : Response, next : NextFunction) => {

   if(error instanceof ErrorHandler){
      return res.status(error.statusCode).json({
         message: error.message
      });
   }

   console.error("from utils index.ts", error.message);

   return res.status(500).json({
      message: "Internal server error"
   });

});

app.listen(process.env.PORT, async () => {
    console.log(`utils service is running on port ${process.env.PORT}`);

})
