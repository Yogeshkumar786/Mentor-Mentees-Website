import { Request, Response, NextFunction, RequestHandler } from "express";

const TryCatch = (handler: (req: Request, res: Response, next: NextFunction) => Promise<unknown>):
    RequestHandler => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            await handler(req, res, next);
        } catch (error) {
            next(error);
        }
    };
};

export default TryCatch;