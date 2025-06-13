import Student from "../models/StudentModel";
import TryCatch from "../utils/TryCatch";
import { Request, Response, NextFunction } from "express";
import bcrypt from "bcrypt";
import GenerateToken from "../utils/GenerateToken";

const signin = TryCatch(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const student = await Student.findOne({
    $or: [{ personal_email: email }, { college_email: email }],
  });
  if (!student) return res.status(404).json({ message: "Student not found" });

  const isMatch = await bcrypt.compare(password, student.password);
  if (!isMatch) return res.status(401).json({ message: "Invalid password" });

  GenerateToken(student._id.toString(), res);
  return res.json({ message: "Signed in", studentId: student._id });
});

export default { signin };