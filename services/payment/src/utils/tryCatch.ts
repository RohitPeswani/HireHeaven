import { Request, Response, NextFunction, RequestHandler } from "express";
import { ErrorHandler } from "./errorHandler.js";

export const tryCatch = (controller : (req : Request, res : Response, next : NextFunction) => Promise<any>) : RequestHandler => {
    return async (req, res, next ) => {
        try {
            await controller(req, res, next);
        } catch (error : any) {

            console.log("from try catch block",error.message);
           next(error);
        }
    }
}
