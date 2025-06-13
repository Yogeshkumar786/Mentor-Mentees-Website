import jwt from 'jsonwebtoken';
import Student from '../models/StudentModel';
import Faculty from '../models/FacultyModel';
import HOD from '../models/HODModel';
import dotenv from 'dotenv';
import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';

dotenv.config();

// Declare user type union (basic example, adjust fields as needed)
type UserType = mongoose.Document & {
  _id: mongoose.Types.ObjectId;
  email?: string;
};

const isAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { id: string };

    let user: UserType | null = await Student.findById(decoded.id);

    if (!user) user = await Faculty.findById(decoded.id);
    if (!user) user = await HOD.findById(decoded.id);

    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    // Type-assert to safely extend req with user
    (req as Request & { user?: UserType }).user = user;
    next();
  } catch (err) {
    console.error('Auth error:', err);
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

export default isAuth;