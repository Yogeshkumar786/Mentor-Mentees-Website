import { prisma } from "../lib/prisma";
import TryCatch from "../utils/TryCatch";
import { Request, Response, NextFunction } from "express";
import bcrypt from "bcrypt";
import GenerateToken from "../utils/GenerateToken";

// Extend Request type to include authenticated user
interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email?: string;
  };
}

// Change password function
const changePassword = TryCatch(async (req: AuthenticatedRequest, res: Response) => {
  const { currentPassword, newPassword } = req.body;
  const studentId = req.user?.id;

  if (!studentId) {
    return res.status(401).json({ message: "User not authenticated" });
  }

  if (!currentPassword || !newPassword) {
    return res.status(400).json({ message: "Current password and new password are required" });
  }

  const student = await prisma.student.findUnique({
    where: { id: studentId }
  });

  if (!student) {
    return res.status(404).json({ message: "Student not found" });
  }

  // Verify current password
  const isCurrentPasswordValid = await bcrypt.compare(currentPassword, student.password);
  if (!isCurrentPasswordValid) {
    return res.status(400).json({ message: "Current password is incorrect" });
  }

  // Hash new password
  const hashedNewPassword = await bcrypt.hash(newPassword, 12);

  // Update password
  await prisma.student.update({
    where: { id: studentId },
    data: { password: hashedNewPassword }
  });

  return res.json({ message: "Password changed successfully" });
});

const signin = TryCatch(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const student = await prisma.student.findFirst({
    where: {
      OR: [
        { personalEmail: email },
        { collegeEmail: email }
      ]
    }
  });
  
  if (!student) return res.status(404).json({ message: "Student not found" });

  const isMatch = await bcrypt.compare(password, student.password);
  if (!isMatch) return res.status(401).json({ message: "Invalid password" });

  GenerateToken(student.id, res);
  return res.json({ message: "Signed in", studentId: student.id });
});

// Get current student's profile (authenticated)
const getMyProfile = TryCatch(async (req: AuthenticatedRequest, res: Response) => {
  const studentId = req.user?.id;
  if (!studentId) {
    return res.status(401).json({ message: "User not authenticated" });
  }

  const student = await prisma.student.findUnique({
    where: { id: studentId },
    include: {
      internships: true,
      personalProblem: true,
      projects: true,
      careerDetails: true,
      coCurriculars: true,
      semesters: {
        include: {
          subjects: true
        }
      },
      mentors: true,
      messages: true,
      meetings: true
    }
  });

  if (!student) {
    return res.status(404).json({ message: "Student not found" });
  }

  return res.json({
    message: "Student profile retrieved successfully",
    student
  });
});

// Search student by roll number (authenticated)
const getStudentByRollNo = TryCatch(async (req: AuthenticatedRequest, res: Response) => {
  const { rollNo } = req.params;
  
  if (!rollNo) {
    return res.status(400).json({ message: "Roll number is required" });
  }

  const student = await prisma.student.findUnique({
    where: { rollNumber: parseInt(rollNo) },
    include: {
      internships: true,
      personalProblem: true,
      projects: true,
      careerDetails: true,
      coCurriculars: true,
      semesters: {
        include: {
          subjects: true
        }
      },
      mentors: true,
      messages: true
      // meetings excluded as requested
    }
  });

  if (!student) {
    return res.status(404).json({ message: "Student not found with this roll number" });
  }

  return res.json({
    message: "Student found successfully",
    student
  });
});

export default { changePassword, signin, getMyProfile, getStudentByRollNo };