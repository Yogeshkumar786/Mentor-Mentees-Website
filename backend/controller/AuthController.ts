import Student from "../models/StudentModel";
import Faculty from "../models/FacultyModel";
import HOD from "../models/HODModel";
import TryCatch from "../utils/TryCatch";
import { Request, Response, NextFunction } from "express";
import bcrypt from "bcrypt";
import GenerateToken from "../utils/GenerateToken";

const StudentLogin = TryCatch(async (req: Request, res: Response) => {
    const { loginId, password } = req.body;

    const student = await Student.findOne({
        $or: [
            { roll_number: parseInt(loginId) },
            { college_email: loginId }
        ]
    });

    if (!student) {
        return res.status(404).json({ message: "Student not found" });
    }

    const isPasswordMatch = await bcrypt.compare(password, student.password);

    if (!isPasswordMatch) {
        return res.status(401).json({ message: "Invalid password" });
    }

    GenerateToken(student._id.toString(), res);

    return res.status(200).json({
        message: "Login successful",
        student
    });

});

const FacultyLogin = TryCatch(async (req: Request, res: Response) => {
    const { loginId, password } = req.body;

    const faculty = await Faculty.findOne({
        $or: [
            { employeeId: loginId },
            { collegeEmail: loginId }
        ]
    });

    if (!faculty) {
        return res.status(404).json({ message: "Faculty not found" });
    }

    const isPasswordMatch = await bcrypt.compare(password, faculty.password);

    if (!isPasswordMatch) {
        return res.status(401).json({ message: "Invalid password" });
    }

    GenerateToken(faculty._id.toString(), res);

    return res.status(200).json({
        message: "Login successful",
        faculty,
    });

});

const HODLogin = TryCatch(async (req: Request, res: Response) => {
    const { email, department, password } = req.body;

    const hod = await HOD.findOne({ email, department });

    if (!hod) {
        return res.status(404).json({ message: "HOD not found" });
    }

    const isMatch = await bcrypt.compare(password, hod.password);
    if (!isMatch) {
        return res.status(401).json({ message: "Invalid password" });
    }

    GenerateToken(hod._id.toString(), res);

    return res.status(200).json({
        message: "HOD login successful",
        hod,
    });
});

const logout = TryCatch(async (req: Request, res: Response) => {
    res.cookie("token", "", { maxAge: 0 });

    res.json({
        message: "Logged out successfully"
    });
});

export default { StudentLogin, FacultyLogin, HODLogin, logout };