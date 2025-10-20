import prisma from "../config/db";
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

// Add a new project for the authenticated student
const addProject = TryCatch(async (req: AuthenticatedRequest, res: Response) => {
  const studentId = req.user?.id;
  if (!studentId) {
    return res.status(401).json({ message: "User not authenticated" });
  }

  const { semester, title, description, technologies, mentor } = req.body;

  // Validate required fields
  if (!semester || !title || !description || !technologies || !mentor) {
    return res.status(400).json({ 
      message: "All fields are required: semester, title, description, technologies, mentor" 
    });
  }

  // Validate semester is a positive integer
  if (!Number.isInteger(semester) || semester <= 0) {
    return res.status(400).json({ message: "Semester must be a positive integer" });
  }

  // Validate technologies is an array
  if (!Array.isArray(technologies)) {
    return res.status(400).json({ message: "Technologies must be an array" });
  }

  // Create the project and connect it to the student
  const project = await prisma.project.create({
    data: {
      semester,
      title,
      description,
      technologies,
      mentor,
      students: {
        connect: { id: studentId }
      }
    },
    include: {
      students: {
        select: {
          id: true,
          name: true,
          rollNumber: true
        }
      }
    }
  });

  return res.status(201).json({
    message: "Project added successfully",
    project
  });
});

// Get all projects for the authenticated student
const getMyProjects = TryCatch(async (req: AuthenticatedRequest, res: Response) => {
  const studentId = req.user?.id;
  if (!studentId) {
    return res.status(401).json({ message: "User not authenticated" });
  }

  const projects = await prisma.project.findMany({
    where: {
      students: {
        some: { id: studentId }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  });

  return res.json({
    message: "Projects retrieved successfully",
    projects
  });
});

// Update a project (only if the student owns it)
const updateProject = TryCatch(async (req: AuthenticatedRequest, res: Response) => {
  const studentId = req.user?.id;
  const { projectId } = req.params;
  
  if (!studentId) {
    return res.status(401).json({ message: "User not authenticated" });
  }

  if (!projectId) {
    return res.status(400).json({ message: "Project ID is required" });
  }

  const { semester, title, description, technologies, mentor } = req.body;

  // Check if the project exists and belongs to the student
  const existingProject = await prisma.project.findFirst({
    where: {
      id: projectId,
      students: {
        some: { id: studentId }
      }
    }
  });

  if (!existingProject) {
    return res.status(404).json({ message: "Project not found or access denied" });
  }

  // Update the project
  const updatedProject = await prisma.project.update({
    where: { id: projectId },
    data: {
      ...(semester !== undefined && { semester }),
      ...(title !== undefined && { title }),
      ...(description !== undefined && { description }),
      ...(technologies !== undefined && { technologies }),
      ...(mentor !== undefined && { mentor })
    },
    include: {
      students: {
        select: {
          id: true,
          name: true,
          rollNumber: true
        }
      }
    }
  });

  return res.json({
    message: "Project updated successfully",
    project: updatedProject
  });
});

// Delete a project (only if the student owns it)
const deleteProject = TryCatch(async (req: AuthenticatedRequest, res: Response) => {
  const studentId = req.user?.id;
  const { projectId } = req.params;
  
  if (!studentId) {
    return res.status(401).json({ message: "User not authenticated" });
  }

  if (!projectId) {
    return res.status(400).json({ message: "Project ID is required" });
  }

  // Check if the project exists and belongs to the student
  const existingProject = await prisma.project.findFirst({
    where: {
      id: projectId,
      students: {
        some: { id: studentId }
      }
    }
  });

  if (!existingProject) {
    return res.status(404).json({ message: "Project not found or access denied" });
  }

  // Delete the project
  await prisma.project.delete({
    where: { id: projectId }
  });

  return res.json({
    message: "Project deleted successfully"
  });
});

// Add a new internship for the authenticated student
const addInternship = TryCatch(async (req: AuthenticatedRequest, res: Response) => {
  const studentId = req.user?.id;
  if (!studentId) {
    return res.status(401).json({ message: "User not authenticated" });
  }

  const { semester, type, organisation, stipend, duration, location } = req.body;

  // Validate required fields
  if (!semester || !type || !organisation || stipend === undefined || !duration || !location) {
    return res.status(400).json({ 
      message: "All fields are required: semester, type, organisation, stipend, duration, location" 
    });
  }

  // Validate semester is a positive integer
  if (!Number.isInteger(semester) || semester <= 0) {
    return res.status(400).json({ message: "Semester must be a positive integer" });
  }

  // Validate stipend is a non-negative integer
  if (!Number.isInteger(stipend) || stipend < 0) {
    return res.status(400).json({ message: "Stipend must be a non-negative integer" });
  }

  // Create the internship and connect it to the student
  const internship = await prisma.internship.create({
    data: {
      semester,
      type,
      organisation,
      stipend,
      duration,
      location,
      students: {
        connect: { id: studentId }
      }
    },
    include: {
      students: {
        select: {
          id: true,
          name: true,
          rollNumber: true
        }
      }
    }
  });

  return res.status(201).json({
    message: "Internship added successfully",
    internship
  });
});

// Get all internships for the authenticated student
const getMyInternships = TryCatch(async (req: AuthenticatedRequest, res: Response) => {
  const studentId = req.user?.id;
  if (!studentId) {
    return res.status(401).json({ message: "User not authenticated" });
  }

  const internships = await prisma.internship.findMany({
    where: {
      students: {
        some: { id: studentId }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  });

  return res.json({
    message: "Internships retrieved successfully",
    internships
  });
});

// Update an internship (only if the student owns it)
const updateInternship = TryCatch(async (req: AuthenticatedRequest, res: Response) => {
  const studentId = req.user?.id;
  const { internshipId } = req.params;
  
  if (!studentId) {
    return res.status(401).json({ message: "User not authenticated" });
  }

  if (!internshipId) {
    return res.status(400).json({ message: "Internship ID is required" });
  }

  const { semester, type, organisation, stipend, duration, location } = req.body;

  // Check if the internship exists and belongs to the student
  const existingInternship = await prisma.internship.findFirst({
    where: {
      id: internshipId,
      students: {
        some: { id: studentId }
      }
    }
  });

  if (!existingInternship) {
    return res.status(404).json({ message: "Internship not found or access denied" });
  }

  // Update the internship
  const updatedInternship = await prisma.internship.update({
    where: { id: internshipId },
    data: {
      ...(semester !== undefined && { semester }),
      ...(type !== undefined && { type }),
      ...(organisation !== undefined && { organisation }),
      ...(stipend !== undefined && { stipend }),
      ...(duration !== undefined && { duration }),
      ...(location !== undefined && { location })
    },
    include: {
      students: {
        select: {
          id: true,
          name: true,
          rollNumber: true
        }
      }
    }
  });

  return res.json({
    message: "Internship updated successfully",
    internship: updatedInternship
  });
});

// Delete an internship (only if the student owns it)
const deleteInternship = TryCatch(async (req: AuthenticatedRequest, res: Response) => {
  const studentId = req.user?.id;
  const { internshipId } = req.params;
  
  if (!studentId) {
    return res.status(401).json({ message: "User not authenticated" });
  }

  if (!internshipId) {
    return res.status(400).json({ message: "Internship ID is required" });
  }

  // Check if the internship exists and belongs to the student
  const existingInternship = await prisma.internship.findFirst({
    where: {
      id: internshipId,
      students: {
        some: { id: studentId }
      }
    }
  });

  if (!existingInternship) {
    return res.status(404).json({ message: "Internship not found or access denied" });
  }

  // Delete the internship
  await prisma.internship.delete({
    where: { id: internshipId }
  });

  return res.json({
    message: "Internship deleted successfully"
  });
});

export default { 
  changePassword, 
  signin, 
  getMyProfile, 
  getStudentByRollNo,
  addProject,
  getMyProjects,
  updateProject,
  deleteProject,
  addInternship,
  getMyInternships,
  updateInternship,
  deleteInternship
};