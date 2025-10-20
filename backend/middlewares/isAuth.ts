import jwt from 'jsonwebtoken';
import prisma from '../config/db';
import { Request, Response, NextFunction } from 'express';
import { AuthUser } from '../global';

const isAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const cookie = req.cookies.token;
    if (!cookie) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const decoded = jwt.verify(cookie, process.env.JWT_SECRET as string) as { id: string };
    const userId = decoded.id; // This is the User table ID

    // Find the user and include their entity relation
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        student: true,
        faculty: true,
        hod: true,
        admin: true
      }
    });

    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Determine which entity exists and get its ID
    let entityId: string;
    let entity: unknown;

    if (user.student) {
      entityId = user.student.id;
      entity = user.student;
    } else if (user.faculty) {
      entityId = user.faculty.id;
      entity = user.faculty;
    } else if (user.hod) {
      entityId = user.hod.id;
      entity = user.hod;
    } else if (user.admin) {
      entityId = user.admin.id;
      entity = user.admin;
    } else {
      return res.status(401).json({ message: "User has no associated entity" });
    }

    // Attach user information matching AuthUser interface
    const authUser: AuthUser = {
      id: user.id,
      email: user.email,
      role: user.role,
      entityId: entityId,
      entity: entity
    };

    req.user = authUser;
    next();
  }
  catch (error) {
    return res.status(401).json({ message: "Unauthorized" });
  }
}

export { isAuth };