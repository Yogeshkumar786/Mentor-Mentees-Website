import jwt from 'jsonwebtoken';
import { prisma } from '../lib/prisma';
import dotenv from 'dotenv';
import { Request, Response, NextFunction } from 'express';

dotenv.config();

// Declare user type union (basic example, adjust fields as needed)
type UserType = {
  id: string;
  email?: string;
};

// Helper function to extract token from cookies only
const extractTokenFromCookie = (req: Request): string | null => {
  // Only check cookies
  if (req.cookies && req.cookies.token) {
    return req.cookies.token;
  }
  
  return null;
};

// Student Auth Middleware
const isStudentAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = extractTokenFromCookie(req);
    if (!token) {
      return res.status(401).json({ message: 'No token provided in cookies' });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { id: string };
    const student = await prisma.student.findUnique({
      where: { id: decoded.id }
    });
    if (!student) {
      return res.status(401).json({ message: 'Student not found' });
    }
    (req as Request & { user?: UserType }).user = student;
    next();
  } catch (err) {
    console.error('Student Auth error:', err);
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

// Faculty Auth Middleware
const isFacultyAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = extractTokenFromCookie(req);
    if (!token) {
      return res.status(401).json({ message: 'No token provided in cookies' });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { id: string };
    const faculty = await prisma.faculty.findUnique({
      where: { id: decoded.id }
    });
    if (!faculty) {
      return res.status(401).json({ message: 'Faculty not found' });
    }
    (req as Request & { user?: UserType }).user = faculty;
    next();
  } catch (err) {
    console.error('Faculty Auth error:', err);
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

// HOD Auth Middleware
const isHODAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = extractTokenFromCookie(req);
    if (!token) {
      return res.status(401).json({ message: 'No token provided in cookies' });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { id: string };
    const hod = await prisma.hOD.findUnique({
      where: { id: decoded.id }
    });
    if (!hod) {
      return res.status(401).json({ message: 'HOD not found' });
    }
    (req as Request & { user?: UserType }).user = hod;
    next();
  } catch (err) {
    console.error('HOD Auth error:', err);
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

export default { isStudentAuth, isFacultyAuth, isHODAuth };