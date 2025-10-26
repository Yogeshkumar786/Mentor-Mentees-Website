import { Request, Response } from "express";
import prisma from "../config/db";
import TryCatch from "../utils/TryCatch";

// Helper function to convert BigInt to string in objects
const serializeBigInt = (obj: unknown): unknown => {
  if (obj === null || obj === undefined) return obj;
  
  if (typeof obj === 'bigint') {
    return obj.toString();
  }
  
  if (Array.isArray(obj)) {
    return obj.map(serializeBigInt);
  }
  
  if (typeof obj === 'object') {
    const serialized: Record<string, unknown> = {};
    for (const key in obj) {
      serialized[key] = serializeBigInt((obj as Record<string, unknown>)[key]);
    }
    return serialized;
  }
  
  return obj;
};

const getProfile = TryCatch(async (req: Request, res: Response) => {
  const studentId = req.user?.entityId;
  if (!studentId) {
    return res.status(401).json({ message: "User not authenticated" });
  }

  const student = await prisma.student.findUnique({
    where: { id: studentId },
    include: {
      personalProblem: true
    }
  });
  if (!student) {
    return res.status(404).json({ message: "Student not found" });
  }
  
  // Serialize BigInt fields to strings
  const serializedStudent = serializeBigInt(student);
  
  return res.status(200).json({ student: serializedStudent });
});

// Add Project with Request for HOD Approval
const addProject = TryCatch(async (req: Request, res: Response) => {
  const studentId = req.user?.entityId;
  
  if (!studentId) {
    return res.status(401).json({ message: "User not authenticated" });
  }

  const { semester, title, description, technologies, mentor, remarks } = req.body;

  // Validate required fields
  if (!semester || !title || !description || !mentor) {
    return res.status(400).json({ 
      message: "Missing required fields: semester, title, description, mentor" 
    });
  }

  // Create project and request in a transaction
  const result = await prisma.$transaction(async (tx) => {
    // Create the project
    const project = await tx.project.create({
      data: {
        semester,
        title,
        description,
        technologies: technologies || [],
        mentor,
        students: {
          connect: { id: studentId }
        }
      }
    });

    // Create a request for HOD approval
    const request = await tx.request.create({
      data: {
        studentId,
        type: "PROJECT",
        targetId: project.id,
        status: "PENDING",
        remarks: remarks || "Please review my project submission"
      }
    });

    return { project, request };
  });

  return res.status(201).json({ 
    message: "Project submitted for approval",
    project: result.project,
    request: result.request
  });
});

// Get all projects for the authenticated student
const getProjects = TryCatch(async (req: Request, res: Response) => {
  const studentId = req.user?.entityId;
  
  if (!studentId) {
    return res.status(401).json({ message: "User not authenticated" });
  }

  // Get student with all their projects and associated requests
  const student = await prisma.student.findUnique({
    where: { id: studentId },
    include: {
      projects: {
        orderBy: {
          createdAt: 'desc'
        }
      }
    }
  });

  if (!student) {
    return res.status(404).json({ message: "Student not found" });
  }

  // Get all requests for these projects
  const projectIds = student.projects.map(p => p.id);
  const requests = await prisma.request.findMany({
    where: {
      studentId,
      type: "PROJECT",
      targetId: {
        in: projectIds
      }
    },
    include: {
      hod: {
        include: {
          faculty: {
            select: {
              name: true,
              collegeEmail: true
            }
          }
        }
      }
    }
  });

  // Map projects with their approval status
  const projectsWithStatus = student.projects.map(project => {
    const request = requests.find(r => r.targetId === project.id);
    return {
      ...project,
      requestStatus: request?.status || "NOT_SUBMITTED",
      requestFeedback: request?.feedback,
      requestRemarks: request?.remarks,
      approvedBy: request?.hod?.faculty?.name
    };
  });

  return res.status(200).json({ 
    projects: projectsWithStatus,
    totalProjects: projectsWithStatus.length
  });
});

// Add Internship with Request for HOD Approval
const addInternship = TryCatch(async (req: Request, res: Response) => {
  const studentId = req.user?.entityId;
  
  if (!studentId) {
    return res.status(401).json({ message: "User not authenticated" });
  }

  const { semester, type, organisation, stipend, duration, location, remarks } = req.body;

  // Validate required fields
  if (!semester || !type || !organisation || !stipend || !duration || !location) {
    return res.status(400).json({ 
      message: "Missing required fields: semester, type, organisation, stipend, duration, location" 
    });
  }

  // Create internship and request in a transaction
  const result = await prisma.$transaction(async (tx) => {
    const internship = await tx.internship.create({
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
      }
    });

    const request = await tx.request.create({
      data: {
        studentId,
        type: "INTERNSHIP",
        targetId: internship.id,
        status: "PENDING",
        remarks: remarks || "Please review my internship submission"
      }
    });

    return { internship, request };
  });

  return res.status(201).json({ 
    message: "Internship submitted for approval",
    internship: result.internship,
    request: result.request
  });
});

// Get all internships for the authenticated student
const getInternships = TryCatch(async (req: Request, res: Response) => {
  const studentId = req.user?.entityId;
  
  if (!studentId) {
    return res.status(401).json({ message: "User not authenticated" });
  }

  const student = await prisma.student.findUnique({
    where: { id: studentId },
    include: {
      internships: {
        orderBy: {
          createdAt: 'desc'
        }
      }
    }
  });

  if (!student) {
    return res.status(404).json({ message: "Student not found" });
  }

  const internshipIds = student.internships.map(i => i.id);
  const requests = await prisma.request.findMany({
    where: {
      studentId,
      type: "INTERNSHIP",
      targetId: {
        in: internshipIds
      }
    },
    include: {
      hod: {
        include: {
          faculty: {
            select: {
              name: true,
              collegeEmail: true
            }
          }
        }
      }
    }
  });

  const internshipsWithStatus = student.internships.map(internship => {
    const request = requests.find(r => r.targetId === internship.id);
    return {
      ...internship,
      requestStatus: request?.status || "NOT_SUBMITTED",
      requestFeedback: request?.feedback,
      requestRemarks: request?.remarks,
      approvedBy: request?.hod?.faculty?.name
    };
  });

  return res.status(200).json({ 
    internships: internshipsWithStatus,
    totalInternships: internshipsWithStatus.length
  });
});

// Add CoCurricular with Request for HOD Approval
const addCoCurricular = TryCatch(async (req: Request, res: Response) => {
  const studentId = req.user?.entityId;
  
  if (!studentId) {
    return res.status(401).json({ message: "User not authenticated" });
  }

  const { sem, date, eventDetails, participationDetails, awards, remarks } = req.body;

  if (!sem || !date || !eventDetails || !participationDetails) {
    return res.status(400).json({ 
      message: "Missing required fields: sem, date, eventDetails, participationDetails" 
    });
  }

  const result = await prisma.$transaction(async (tx) => {
    const coCurricular = await tx.coCurricular.create({
      data: {
        sem,
        date: new Date(date),
        eventDetails,
        participationDetails,
        awards: awards || "",
        students: {
          connect: { id: studentId }
        }
      }
    });

    const request = await tx.request.create({
      data: {
        studentId,
        type: "CO_CURRICULAR",
        targetId: coCurricular.id,
        status: "PENDING",
        remarks: remarks || "Please review my co-curricular activity submission"
      }
    });

    return { coCurricular, request };
  });

  return res.status(201).json({ 
    message: "Co-curricular activity submitted for approval",
    coCurricular: result.coCurricular,
    request: result.request
  });
});

// Get all co-curricular activities for the authenticated student
const getCoCurriculars = TryCatch(async (req: Request, res: Response) => {
  const studentId = req.user?.entityId;
  
  if (!studentId) {
    return res.status(401).json({ message: "User not authenticated" });
  }

  const student = await prisma.student.findUnique({
    where: { id: studentId },
    include: {
      coCurriculars: {
        orderBy: {
          date: 'desc'
        }
      }
    }
  });

  if (!student) {
    return res.status(404).json({ message: "Student not found" });
  }

  const coCurricularIds = student.coCurriculars.map(c => c.id);
  const requests = await prisma.request.findMany({
    where: {
      studentId,
      type: "CO_CURRICULAR",
      targetId: {
        in: coCurricularIds
      }
    },
    include: {
      hod: {
        include: {
          faculty: {
            select: {
              name: true,
              collegeEmail: true
            }
          }
        }
      }
    }
  });

  const coCurricularsWithStatus = student.coCurriculars.map(coCurricular => {
    const request = requests.find(r => r.targetId === coCurricular.id);
    return {
      ...coCurricular,
      requestStatus: request?.status || "NOT_SUBMITTED",
      requestFeedback: request?.feedback,
      requestRemarks: request?.remarks,
      approvedBy: request?.hod?.faculty?.name
    };
  });

  return res.status(200).json({ 
    coCurriculars: coCurricularsWithStatus,
    totalCoCurriculars: coCurricularsWithStatus.length
  });
});

// Get career details (education interests)
const getCareerDetails = TryCatch(async (req: Request, res: Response) => {
  const studentId = req.user?.entityId;
  
  if (!studentId) {
    return res.status(401).json({ message: "User not authenticated" });
  }

  const student = await prisma.student.findUnique({
    where: { id: studentId },
    include: {
      careerDetails: true
    }
  });

  if (!student) {
    return res.status(404).json({ message: "Student not found" });
  }

  return res.status(200).json({ 
    careerDetails: student.careerDetails
  });
});

export { 
  getProfile, 
  addProject, 
  getProjects,
  addInternship,
  getInternships,
  addCoCurricular,
  getCoCurriculars,
  getCareerDetails
};