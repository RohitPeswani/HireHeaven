import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import userRoutes from './routes/user.js';
import { ErrorHandler } from './utils/errorHandler.js';

dotenv.config();

const app = express();

app.use(cors({
    origin : process.env.FRONTEND_URL,
    credentials : true
}));
app.use(express.json());
app.use(express.urlencoded({extended : true}));
app.use('/api/user', userRoutes);

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


app.listen(process.env.PORT, () => {
    console.log(`User service is running on port ${process.env.PORT}`);
});
