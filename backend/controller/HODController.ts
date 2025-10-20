import prisma from "../config/db";
import { Request, Response } from "express";
import TryCatch from "../utils/TryCatch";
import bcrypt from "bcrypt";
import { sendMeetingNotificationsToAll } from "../utils/emailService";

// Extend Request type to include authenticated user
interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email?: string;
  };
}

const createNewMeeting = TryCatch(async (req: AuthenticatedRequest, res: Response) => {
  const { 
    studentIds, 
    date, 
    time, 
    description, 
    facultyId
  } = req.body;

  // Get hodId from authenticated user
  const hodId = req.user?.id;
  if (!hodId) {
    return res.status(401).json({ message: "User not authenticated" });
  }

  // Validate required fields
  if (!studentIds || !date || !time || !description || !facultyId) {
    return res.status(400).json({ 
      message: "Missing required fields: studentIds, date, time, description, facultyId" 
    });
  }

  // Get faculty details to find department
  const faculty = await prisma.faculty.findUnique({
    where: { id: facultyId },
    select: { department: true, name: true, collegeEmail: true, personalEmail: true }
  });

  if (!faculty) {
    return res.status(404).json({ message: "Faculty not found" });
  }

  // Get HOD for the faculty's department and verify it's the authenticated HOD
  const hod = await prisma.hOD.findFirst({
    where: {
      id: hodId,
      department: faculty.department,
      endDate: null // Only active HODs
    },
    include: {
      faculty: {
        select: { name: true, collegeEmail: true, personalEmail: true }
      }
    }
  });

  if (!hod) {
    return res.status(404).json({ 
      message: `HOD not found or not authorized for department: ${faculty.department}` 
    });
  }

  // Create the meeting with HOD included
  const meeting = await prisma.meeting.create({
    data: {
      facultyId,
      hodId: hod.id,
      date: new Date(date),
      time,
      description,
      students: {
        connect: studentIds.map((id: string) => ({ id }))
      }
    },
    include: {
      students: true,
      faculty: true,
      hod: {
        include: {
          faculty: true
        }
      }
    }
  });

  // Send email notifications to all participants
  try {
    const participants = [
      // Add faculty
      {
        name: faculty.name,
        role: 'Faculty',
        email: faculty.collegeEmail || faculty.personalEmail
      },
      // Add students
      ...meeting.students.map((student) => ({
        name: student.name,
        role: 'Student',
        email: student.collegeEmail || student.personalEmail
      })),
      // Add HOD
      {
        name: hod.faculty.name,
        role: 'HOD',
        email: hod.faculty.collegeEmail || hod.faculty.personalEmail
      }
    ];

    const emailData = {
      date: new Date(date).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }),
      time,
      description,
      organizerName: hod.faculty.name,
      hodName: hod.faculty.name,
      isHODIncluded: true,
      participants
    };

    // Send emails asynchronously (don't wait for completion)
    sendMeetingNotificationsToAll(emailData).catch(error => {
      console.error('Error sending meeting notifications:', error);
    });

  } catch (emailError) {
    console.error('Error preparing email notifications:', emailError);
    // Don't fail the meeting creation if emails fail
  }

  return res.status(201).json({ 
    message: "Meeting created successfully with HOD", 
    meeting,
    isHODIncluded: true
  });
});

// Add review to meeting
const addReview = TryCatch(async (req: AuthenticatedRequest, res: Response) => {
  const { meetingId, review } = req.body;
  const hodId = req.user?.id;
  if (!hodId) { return res.status(401).json({ message: "User not authenticated" }); }
  if (!meetingId || !review) { return res.status(400).json({ message: "Meeting ID and review are required" }); }

  try {
    // Check if HOD is part of this meeting
    const meeting = await prisma.meeting.findFirst({
      where: { id: meetingId, hodId }
    });
    if (!meeting) { return res.status(404).json({ message: "Meeting not found or you are not authorized to review it" }); }

    // Update the meeting with HOD review
    const updatedMeeting = await prisma.meeting.update({
      where: { id: meetingId },
      data: { hodReview: review },
      include: {
        students: { select: { name: true, rollNumber: true } },
        faculty: { select: { name: true, employeeId: true } },
        hod: { include: { faculty: { select: { name: true } } } }
      }
    });

    return res.json({ message: "Review added successfully", meeting: updatedMeeting });
  } catch (error) {
    console.error('Error adding review:', error);
    return res.status(500).json({ message: "Failed to add review" });
  }
});

// Add new faculty member (HOD only)
const addFaculty = TryCatch(async (req: AuthenticatedRequest, res: Response) => {
  const hodId = req.user?.id;
  if (!hodId) {
    return res.status(401).json({ message: "User not authenticated" });
  }

  // Verify the authenticated user is an active HOD
  const hod = await prisma.hOD.findUnique({
    where: { id: hodId },
    include: {
      faculty: {
        select: { department: true, name: true }
      }
    }
  });

  if (!hod) {
    return res.status(403).json({ message: "Access denied. Only HODs can add faculty members." });
  }

  // Check if HOD is active (endDate is null)
  if (hod.endDate) {
    return res.status(403).json({ message: "Access denied. Only active HODs can add faculty members." });
  }

  const {
    employeeId,
    password,
    name,
    phone1,
    phone2,
    personalEmail,
    collegeEmail,
    department,
    btech,
    mtech,
    phd,
    office,
    officeHours
  } = req.body;

  // Validate required fields based on schema
  if (!employeeId || !password || !name || !phone1 || !personalEmail || !collegeEmail || !department || !office || !officeHours) {
    return res.status(400).json({ 
      message: "Missing required fields: employeeId, password, name, phone1, personalEmail, collegeEmail, department, office, officeHours" 
    });
  }

  // Validate that HOD can only add faculty to their own department
  if (department !== hod.faculty.department) {
    return res.status(403).json({ 
      message: `You can only add faculty members to your own department: ${hod.faculty.department}` 
    });
  }

  try {
    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create User first, then Faculty
    const newUser = await prisma.user.create({
      data: {
        email: collegeEmail,
        password: hashedPassword,
        role: 'FACULTY',
        faculty: {
          create: {
            employeeId,
            name,
            phone1,
            phone2: phone2 || null,
            personalEmail,
            collegeEmail,
            department,
            btech: btech || null,
            mtech: mtech || null,
            phd: phd || null,
            office,
            officeHours,
          }
        }
      },
      include: {
        faculty: {
          select: {
            id: true,
            employeeId: true,
            name: true,
            phone1: true,
            phone2: true,
            personalEmail: true,
            collegeEmail: true,
            department: true,
            btech: true,
            mtech: true,
            phd: true,
            office: true,
            officeHours: true,
            createdAt: true
          }
        }
      }
    });

    return res.status(201).json({
      message: "Faculty member added successfully",
      faculty: newUser.faculty,
      addedBy: hod.faculty.name,
      department: hod.faculty.department
    });

  } catch (error) {
    if (error instanceof Error && 'code' in error && error.code === 'P2002') {
      return res.status(400).json({ 
        message: "Employee ID, personal email, or college email already exists" 
      });
    }
    
    return res.status(500).json({
      message: "Failed to add faculty member",
      error: error instanceof Error ? error.message : "Unknown error"
    });
  }
});

export default { 
  createNewMeeting, 
  addReview,
  addFaculty
};