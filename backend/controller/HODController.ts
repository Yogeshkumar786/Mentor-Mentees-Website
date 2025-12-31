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

const assignMentor = TryCatch(async (req: AuthenticatedRequest, res: Response) => {
  const { 
    studentRollNumber, 
    facultyEmployeeId,
    year,
    semester
  } = req.body;

  // Get hodId from authenticated user
  const hodId = req.user?.id;
  if (!hodId) {
    return res.status(401).json({ message: "User not authenticated" });
  }

  // Validate required fields
  if (!studentRollNumber || !facultyEmployeeId || !year || !semester) {
    return res.status(400).json({ 
      message: "Missing required fields: studentRollNumber, facultyEmployeeId, year, semester" 
    });
  }

  // Find the student by roll number
  const student = await prisma.student.findUnique({
    where: { rollNumber: parseInt(studentRollNumber) },
    select: {
      id: true,
      name: true,
      rollNumber: true,
      branch: true,
      currentMentorId: true,
      currentMentor: {
        select: {
          faculty: {
            select: { name: true }
          }
        }
      }
    }
  });

  if (!student) {
    return res.status(404).json({ message: "Student not found with the provided roll number" });
  }

  // Find the faculty by employee ID
  const faculty = await prisma.faculty.findUnique({
    where: { employeeId: facultyEmployeeId },
    select: {
      id: true,
      name: true,
      employeeId: true,
      department: true
    }
  });

  if (!faculty) {
    return res.status(404).json({ message: "Faculty not found with the provided employee ID" });
  }

  // Verify that the HOD is authorized for this department
  const hod = await prisma.hOD.findFirst({
    where: {
      id: hodId,
      department: faculty.department,
      endDate: null // Only active HODs
    },
    include: {
      faculty: {
        select: { name: true, department: true }
      }
    }
  });

  if (!hod) {
    return res.status(403).json({ 
      message: `You are not authorized to assign mentors in the ${faculty.department} department` 
    });
  }

  // If student already has an active mentor, deactivate it and add to past mentors
  if (student.currentMentorId) {
    await prisma.mentor.update({
      where: { id: student.currentMentorId },
      data: {
        isActive: false,
        endDate: new Date(),
        pastStudents: {
          connect: { id: student.id }
        }
      }
    });
  }

  // Create new mentor assignment
  const mentorAssignment = await prisma.mentor.create({
    data: {
      facultyId: faculty.id,
      studentId: student.id,
      year: parseInt(year),
      semester: parseInt(semester),
      isActive: true,
      startDate: new Date()
    },
    include: {
      faculty: {
        select: {
          id: true,
          name: true,
          employeeId: true,
          department: true,
          collegeEmail: true
        }
      }
    }
  });

  // Update student's currentMentorId
  await prisma.student.update({
    where: { id: student.id },
    data: { currentMentorId: mentorAssignment.id }
  });

  return res.status(201).json({
    message: "Mentor assigned successfully",
    assignment: {
      id: mentorAssignment.id,
      student: {
        name: student.name,
        rollNumber: student.rollNumber,
        branch: student.branch
      },
      mentor: {
        name: faculty.name,
        employeeId: faculty.employeeId,
        department: faculty.department
      },
      year: mentorAssignment.year,
      semester: mentorAssignment.semester,
      startDate: mentorAssignment.startDate,
      assignedBy: hod.faculty.name
    },
    previousMentor: student.currentMentor ? student.currentMentor.faculty.name : null
  });
});

const assignMentorToMultipleStudents = TryCatch(async (req: AuthenticatedRequest, res: Response) => {
  const { 
    studentRollNumbers, 
    facultyEmployeeId,
    year,
    semester
  } = req.body;

  // Get hodId from authenticated user
  const hodId = req.user?.id;
  if (!hodId) {
    return res.status(401).json({ message: "User not authenticated" });
  }

  // Validate required fields
  if (!studentRollNumbers || !Array.isArray(studentRollNumbers) || studentRollNumbers.length === 0) {
    return res.status(400).json({ 
      message: "studentRollNumbers must be a non-empty array" 
    });
  }

  if (!facultyEmployeeId || !year || !semester) {
    return res.status(400).json({ 
      message: "Missing required fields: facultyEmployeeId, year, semester" 
    });
  }

  // Find the faculty by employee ID
  const faculty = await prisma.faculty.findUnique({
    where: { employeeId: facultyEmployeeId },
    select: {
      id: true,
      name: true,
      employeeId: true,
      department: true
    }
  });

  if (!faculty) {
    return res.status(404).json({ message: "Faculty not found with the provided employee ID" });
  }

  // Verify that the HOD is authorized for this department
  const hod = await prisma.hOD.findFirst({
    where: {
      id: hodId,
      department: faculty.department,
      endDate: null // Only active HODs
    },
    include: {
      faculty: {
        select: { name: true, department: true }
      }
    }
  });

  if (!hod) {
    return res.status(403).json({ 
      message: `You are not authorized to assign mentors in the ${faculty.department} department` 
    });
  }

  // Process each student
  const results = {
    successful: [] as any[],
    failed: [] as any[]
  };

  for (const rollNumber of studentRollNumbers) {
    try {
      // Find the student by roll number
      const student = await prisma.student.findUnique({
        where: { rollNumber: parseInt(rollNumber) },
        select: {
          id: true,
          name: true,
          rollNumber: true,
          branch: true,
          currentMentorId: true,
          currentMentor: {
            select: {
              id: true,
              faculty: {
                select: { name: true }
              }
            }
          }
        }
      });

      if (!student) {
        results.failed.push({
          rollNumber,
          reason: "Student not found"
        });
        continue;
      }

      // If student already has an active mentor, deactivate it and add to past mentors
      let previousMentorName = null;
      if (student.currentMentorId && student.currentMentor) {
        // Deactivate current mentor and add to past mentors
        await prisma.mentor.update({
          where: { id: student.currentMentorId },
          data: {
            isActive: false,
            endDate: new Date(),
            pastStudents: {
              connect: { id: student.id }
            }
          }
        });
        
        previousMentorName = student.currentMentor.faculty.name;
      }

      // Create new mentor assignment
      const mentorAssignment = await prisma.mentor.create({
        data: {
          facultyId: faculty.id,
          studentId: student.id,
          year: parseInt(year),
          semester: parseInt(semester),
          isActive: true,
          startDate: new Date()
        }
      });

      // Update student's currentMentorId
      await prisma.student.update({
        where: { id: student.id },
        data: { currentMentorId: mentorAssignment.id }
      });

      results.successful.push({
        student: {
          name: student.name,
          rollNumber: student.rollNumber,
          branch: student.branch
        },
        previousMentor: previousMentorName,
        newMentorAssignmentId: mentorAssignment.id
      });

    } catch (error) {
      results.failed.push({
        rollNumber,
        reason: error instanceof Error ? error.message : "Unknown error"
      });
    }
  }

  return res.status(201).json({
    message: `Assigned ${results.successful.length} student(s) to ${faculty.name}`,
    mentor: {
      name: faculty.name,
      employeeId: faculty.employeeId,
      department: faculty.department
    },
    year: parseInt(year),
    semester: parseInt(semester),
    assignedBy: hod.faculty.name,
    results: {
      successful: results.successful,
      failed: results.failed,
      totalProcessed: studentRollNumbers.length,
      successCount: results.successful.length,
      failedCount: results.failed.length
    }
  });
});

export default { 
  createNewMeeting, 
  addReview,
  addFaculty,
  assignMentor,
  assignMentorToMultipleStudents
};