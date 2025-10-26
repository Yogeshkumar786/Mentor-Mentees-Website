import { Request, Response } from "express";
import bcryptjs from "bcryptjs";
import prisma from "../config/db";
import GenerateToken from "../utils/GenerateToken";

const login = async (req: Request, res: Response) => {
    try {

        const { email, password } = req.body;
        const user = await prisma.user.findUnique({ where: { email } });

        if (!user) {
            return res.status(401).json({ message: "Invalid email or password" });
        }
        const isPasswordValid = await bcryptjs.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: "Invalid email or password" });
        }
        GenerateToken(user.id, res); // Pass User ID to GenerateToken
        return res.status(200).json({ message: "Login successful" ,user});
    } catch (error) {
        return res.status(500).json({ message: "Server error" });
    }
};

const logout = async (req: Request, res: Response) => {
    res.clearCookie("token", {
        httpOnly: true,
        sameSite: "strict",
    });
    return res.status(200).json({ message: "Logout successful" });
};

const changePassword = async (req: Request, res: Response) => {
    try {
        const { oldPassword, newPassword } = req.body;
        const userId = req.user?.id;
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!userId) {
            return res.status(401).json({ message: "User not authenticated" });
        }
        if (!user) {
            return res.status(401).json({ message: "User not found" });
        }
        const isOldPasswordValid = await bcryptjs.compare(oldPassword, user.password);
        if (!isOldPasswordValid) {
            return res.status(400).json({ message: "Old password is incorrect" });
        }
        const hashedNewPassword = await bcryptjs.hash(newPassword, 10);
        await prisma.user.update({
            where: { id: userId },
            data: { password: hashedNewPassword },
        });
        return res.status(200).json({ message: "Password changed successfully" });
    } catch (error) {
        return res.status(500).json({ message: "Server error" });
    }
};

const register = async (req: Request, res: Response) => {
    try {
        const { email, password, role, ...entityData } = req.body;
        
        // Check if user already exists
        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ message: "Email already in use" });
        }

        // Hash password
        const hashedPassword = await bcryptjs.hash(password, 10);

        // Create user with appropriate entity based on role
        let newUser;
        
        if (role === "STUDENT") {
            newUser = await prisma.user.create({
                data: {
                    email,
                    password: hashedPassword,
                    role,
                    student: {
                        create: {
                            ...entityData, // Pass student-specific fields
                            personalProblem: {
                                create: {
                                    stress: false,
                                    anger: false,
                                    emotionalProblem: false,
                                    lowSelfEsteem: false,
                                    examinationAnxiety: false,
                                    negativeThoughts: false,
                                    examPhobia: false,
                                    stammering: false,
                                    financialProblem: false,
                                    moodSwings: false,
                                    disturbedRelationshipWithParents: false,
                                    disturbedRelationshipWithTeachers: false,
                                    disturbedRelationshipWithFriends: false,
                                    disciplinaryProblemsInCollege: false,
                                    poorCommandOfEnglish: false,
                                    tobaccoOrAlcoholUse: false,
                                    suicidalAttemptsOrThoughts: false,
                                    disappointmentWithCourses: false,
                                    timeManagementProblem: false,
                                    relationshipProblem: false,
                                    lowSelfMotivation: false,
                                    conflicts: false,
                                    procrastination: false,
                                    frustration: false,
                                    poorDecisivePower: false,
                                    adjustmentProblem: false,
                                    lackOfExpression: false,
                                    poorConcentration: false,
                                    stagePhobia: false,
                                    worriesAboutFuture: false,
                                    poorMemoryProblem: false,
                                    migraineHeadache: false,
                                    fearOfPublicSpeaking: false
                                }
                            }
                        }
                    }
                }
            });
        } else if (role === "FACULTY") {
            newUser = await prisma.user.create({
                data: {
                    email,
                    password: hashedPassword,
                    role,
                    faculty: {
                        create: entityData // Pass faculty-specific fields
                    }
                }
            });
        } else if (role === "ADMIN") {
            newUser = await prisma.user.create({
                data: {
                    email,
                    password: hashedPassword,
                    role,
                    admin: {
                        create: entityData // Pass admin-specific fields
                    }
                }
            });
        } else {
            return res.status(400).json({ message: "Invalid role specified" });
        }

        if (!newUser) {
            return res.status(500).json({ message: "User creation failed" });
        }

        return res.status(201).json({ 
            message: "User registered successfully",
            userId: newUser.id,
            email: newUser.email,
            role: newUser.role
        });
    }
    catch (error) {
        console.error("Registration error:", error);
        return res.status(500).json({ message: "Server error" });
    }
};

export { login, logout, changePassword, register };