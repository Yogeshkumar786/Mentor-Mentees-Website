import { Request, Response } from "express";
import prisma from "../config/db";
import TryCatch from "../utils/TryCatch";

const getProfile = TryCatch(async (req: Request, res: Response) => {
  const studentId = req.user?.entityId;
  if (!studentId) {
    return res.status(401).json({ message: "User not authenticated" });
  }

  const student = await prisma.student.findUnique({
    where: { id: studentId },
    include: {
      personalProblem: true,
      careerDetails: true
    }
  });
  if (!student) {
    return res.status(404).json({ message: "Student not found" });
  }
  return res.status(200).json({ student });
});

export { getProfile };