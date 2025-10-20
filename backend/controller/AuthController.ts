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
    return res.status(200).json({ message: "Login successful" });
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
        if (!userId) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
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

export { login, logout, changePassword };