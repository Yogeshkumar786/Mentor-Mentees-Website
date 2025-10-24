import { Request, Response, NextFunction } from "express";

const isAdmin = (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;
    if (user && user.role === "ADMIN") {
        next();
    } else {
        res.status(403).json({ message: "Forbidden: Admins only" });
    }
}
export { isAdmin };