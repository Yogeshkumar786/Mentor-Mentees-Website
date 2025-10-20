import prisma from "../config/db";
import { Request, Response } from "express";
import TryCatch from "../utils/TryCatch";
import bcrypt from "bcrypt";
import GenerateToken from "../utils/GenerateToken";
import { sendMeetingNotificationsToAll } from "../utils/emailService";

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
  const facultyId = req.user?.id;

  if (!facultyId) {
    return res.status(401).json({ message: "User not authenticated" });
  }

  if (!currentPassword || !newPassword) {
    return res.status(400).json({ message: "Current password and new password are required" });
  }

  const faculty = await prisma.faculty.findUnique({
    where: { id: facultyId }
  });

  if (!faculty) {
    return res.status(404).json({ message: "Faculty not found" });
  }

  // Verify current password
  const isCurrentPasswordValid = await bcrypt.compare(currentPassword, faculty.password);
  if (!isCurrentPasswordValid) {
    return res.status(400).json({ message: "Current password is incorrect" });
  }

  // Hash new password
  const hashedNewPassword = await bcrypt.hash(newPassword, 12);

  // Update password
  await prisma.faculty.update({
    where: { id: facultyId },
    data: { password: hashedNewPassword }
  });

  return res.json({ message: "Password changed successfully" });
});

const signin = TryCatch(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const faculty = await prisma.faculty.findFirst({
    where: {
      OR: [
        { personalEmail: email },
        { collegeEmail: email }
      ]
    }
  });
  
  if (!faculty) return res.status(404).json({ message: "Faculty not found" });

  const isMatch = await bcrypt.compare(password, faculty.password);
  if (!isMatch) return res.status(401).json({ message: "Invalid password" });

  GenerateToken(faculty.id, res);
  return res.json({ message: "Signed in", facultyId: faculty.id });
});

const createNewMeeting = TryCatch(async (req: AuthenticatedRequest, res: Response) => {
  const { 
    studentIds, 
    date, 
    time, 
    description, 
    isHOD = false 
  } = req.body;

  // Get facultyId from authenticated user
  const facultyId = req.user?.id;
  if (!facultyId) {
    return res.status(401).json({ message: "User not authenticated" });
  }

  // Validate required fields
  if (!studentIds || !date || !time || !description) {
    return res.status(400).json({ 
      message: "Missing required fields: studentIds, date, time, description" 
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

  let meetingData: any = {
    facultyId,
    date: new Date(date),
    time,
    description,
    students: {
      connect: studentIds.map((id: string) => ({ id }))
    }
  };

  let hod = null;
  // If HOD is required, find and add the HOD for the faculty's department
  if (isHOD) {
    hod = await prisma.hOD.findFirst({
      where: {
        department: faculty.department,
        endDate: null // Only active HODs
      },
      include: {
        faculty: true
      }
    });

    if (hod) {
      meetingData.hodId = hod.id;
    } else {
      return res.status(404).json({ 
        message: `No active HOD found for department: ${faculty.department}` 
      });
    }
  }

  // Create the meeting
  const meeting = await prisma.meeting.create({
    data: meetingData,
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
      ...meeting.students.map((student: any) => ({
        name: student.name,
        role: 'Student',
        email: student.collegeEmail || student.personalEmail
      }))
    ];

    // Add HOD if included
    if (hod && hod.faculty) {
      participants.push({
        name: hod.faculty.name,
        role: 'HOD',
        email: hod.faculty.collegeEmail || hod.faculty.personalEmail
      });
    }

    const emailData = {
      date: new Date(date).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }),
      time,
      description,
      organizerName: faculty.name,
      hodName: hod?.faculty?.name,
      isHODIncluded: isHOD,
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

  const responseMessage = isHOD 
    ? "Meeting created successfully with HOD" 
    : "Meeting created successfully (HOD is not there in meeting)";
    
  return res.status(201).json({ 
    message: responseMessage, 
    meeting,
    isHODIncluded: isHOD,
    hodStatus: isHOD ? "HOD included" : "HOD not included"
  });
});

// Add review to meeting
const addReview = TryCatch(async (req: AuthenticatedRequest, res: Response) => {
  const { meetingId, review } = req.body;
  const facultyId = req.user?.id;
  if (!facultyId) { return res.status(401).json({ message: "User not authenticated" }); }
  if (!meetingId || !review) { return res.status(400).json({ message: "Meeting ID and review are required" }); }

  try {
    // Check if faculty is the organizer of this meeting
    const meeting = await prisma.meeting.findFirst({
      where: { id: meetingId, facultyId }
    });
    if (!meeting) { return res.status(404).json({ message: "Meeting not found or you are not authorized to review it" }); }

    // Update the meeting with faculty review
    const updatedMeeting = await prisma.meeting.update({
      where: { id: meetingId },
      data: { facultyReview: review },
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

// Update faculty details
const updateFacultyDetails = TryCatch(async (req: AuthenticatedRequest, res: Response) => {
  const facultyId = req.user?.id;
  if (!facultyId) {
    return res.status(401).json({ message: "User not authenticated" });
  }

  const updateData = req.body;
  
  // Only allow specific fields to be updated
  const allowedFields = [
    'name', 'phone1', 'phone2', 'personalEmail', 'collegeEmail',
    'department', 'btech', 'mtech', 'phd', 'office', 'officeHours'
  ];
  
  const filteredData: any = {};
  allowedFields.forEach(field => {
    if (updateData[field] !== undefined) {
      filteredData[field] = updateData[field];
    }
  });

  // Validate required fields if they're being updated
  if (filteredData.phone1 !== undefined && !filteredData.phone1) {
    return res.status(400).json({ message: "Phone number is required" });
  }

  if (filteredData.personalEmail !== undefined && !filteredData.personalEmail) {
    return res.status(400).json({ message: "Personal email is required" });
  }

  if (filteredData.collegeEmail !== undefined && !filteredData.collegeEmail) {
    return res.status(400).json({ message: "College email is required" });
  }

  if (filteredData.department !== undefined && !filteredData.department) {
    return res.status(400).json({ message: "Department is required" });
  }

  if (filteredData.office !== undefined && !filteredData.office) {
    return res.status(400).json({ message: "Office is required" });
  }

  if (filteredData.officeHours !== undefined && !filteredData.officeHours) {
    return res.status(400).json({ message: "Office hours are required" });
  }

  try {
    const updatedFaculty = await prisma.faculty.update({
      where: { id: facultyId },
      data: filteredData,
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
        updatedAt: true
      }
    });

    return res.json({
      message: "Faculty details updated successfully",
      faculty: updatedFaculty
    });
  } catch (error) {
    if (error instanceof Error && 'code' in error && error.code === 'P2002') {
      return res.status(400).json({ 
        message: "Personal email or college email already exists" 
      });
    }
    return res.status(500).json({ 
      message: "Failed to update faculty details",
      error: error instanceof Error ? error.message : "Unknown error"
    });
  }
});

export default { 
  changePassword, 
  signin, 
  createNewMeeting, 
  addReview,
  updateFacultyDetails
};