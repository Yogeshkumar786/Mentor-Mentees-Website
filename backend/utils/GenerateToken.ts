import jwt from "jsonwebtoken";
import { Response } from "express";

const GenerateToken = (id: string, res: Response): void => {
    try {
        const token = jwt.sign({ id }, process.env.JWT_SECRET!, {
            expiresIn: "15d"
        });
        res.cookie("token", token, {
            expires: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
            httpOnly: true,
            sameSite: "strict"
        })
    } catch (error) {
        const err = error as Error;
        console.error(err.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
}

export default GenerateToken;