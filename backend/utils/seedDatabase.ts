import prisma from '../config/db';
import bcrypt from 'bcryptjs';

export async function seedDatabase() {
  try {
    console.log('🌱 Starting database seeding...');

    // Check if data already exists
    const existingUsers = await prisma.user.count();
    if (existingUsers > 0) {
      console.log('⚠️  Database already contains data. Skipping seed.');
      return { success: true, message: 'Database already seeded' };
    }

    // Hash password for all users
    const hashedPassword = await bcrypt.hash('password123', 10);

    // 1. Create Admin User
    console.log('Creating Admin...');
    const adminUser = await prisma.user.create({
      data: {
        email: 'admin@nitandhra.ac.in',
        password: hashedPassword,
        role: 'ADMIN',
        accountStatus: 'ACTIVE',
        admin: {
          create: {
            employeeId: 'ADM001',
            name: 'Mr. Admin Singh',
            phone: '+919876543216',
            personalEmail: 'admin.singh@gmail.com',
            collegeEmail: 'admin@nitandhra.ac.in',
            department: 'Administration',
            designation: 'System Administrator',
            office: 'Admin Block, Room 101',
          },
        },
      },
    });

    // 2. Create Faculty Users
    console.log('Creating Faculty...');
    const facultyUser1 = await prisma.user.create({
      data: {
        email: 'ramesh.sharma@nitandhra.ac.in',
        password: hashedPassword,
        role: 'FACULTY',
        accountStatus: 'ACTIVE',
        profilePicture: 'https://avatar.iran.liara.run/public/boy',
        faculty: {
          create: {
            employeeId: 'FAC001',
            name: 'Dr. Ramesh Sharma',
            phone1: 919876543214,
            phone2: 919876543215,
            personalEmail: 'ramesh@gmail.com',
            collegeEmail: 'ramesh.sharma@nitandhra.ac.in',
            department: 'Computer Science',
            btech: 'NIT Andhra',
            mtech: 'IIT Delhi',
            phd: 'IIT Bombay',
            office: 'Block A, Room 301',
            officeHours: '10:00 AM - 5:00 PM',
          },
        },
      },
    });

    const facultyUser2 = await prisma.user.create({
      data: {
        email: 'priya.verma@nitandhra.ac.in',
        password: hashedPassword,
        role: 'FACULTY',
        accountStatus: 'ACTIVE',
        profilePicture: 'https://avatar.iran.liara.run/public/girl',
        faculty: {
          create: {
            employeeId: 'FAC002',
            name: 'Dr. Priya Verma',
            phone1: 919876543220,
            personalEmail: 'priya@gmail.com',
            collegeEmail: 'priya.verma@nitandhra.ac.in',
            department: 'Computer Science',
            btech: 'NIT Warangal',
            mtech: 'IIT Madras',
            phd: 'IIT Kanpur',
            office: 'Block A, Room 302',
            officeHours: '9:00 AM - 4:00 PM',
          },
        },
      },
    });

    // Get faculty IDs for HOD creation
    const faculty1 = await prisma.faculty.findUnique({
      where: { userId: facultyUser1.id },
    });

    // 3. Create HOD User
    console.log('Creating HOD...');
    const hodUser = await prisma.user.create({
      data: {
        email: 'hod.cs@nitandhra.ac.in',
        password: hashedPassword,
        role: 'HOD',
        accountStatus: 'ACTIVE',
        profilePicture: 'https://avatar.iran.liara.run/public/boy',
        hod: {
          create: {
            facultyId: faculty1!.id,
            department: 'Computer Science',
            startDate: new Date('2023-01-01'),
          },
        },
      },
    });

    // 4. Create Student Users
    console.log('Creating Students...');
    const studentUser1 = await prisma.user.create({
      data: {
        email: '22001@student.nitandhra.ac.in',
        password: hashedPassword,
        role: 'STUDENT',
        accountStatus: 'ACTIVE',
        profilePicture: 'https://avatar.iran.liara.run/public/1',
        student: {
          create: {
            name: 'Rahul Kumar',
            aadhar: 123456789012,
            phoneNumber: '+919876543210',
            phoneCode: 91,
            registrationNumber: 22001,
            rollNumber: 22001,
            passPort: 'Not Available',
            emergencyContact: 919876543211,
            personalEmail: 'rahul@gmail.com',
            collegeEmail: '22001@student.nitandhra.ac.in',
            dob: new Date('2004-05-15'),
            address: '123 Main Street, Hyderabad',
            program: 'B.Tech',
            branch: 'Computer Science',
            bloodGroup: 'O+',
            dayScholar: false,
            fatherName: 'Mr. Kumar',
            fatherOccupation: 'Engineer',
            fatherAadhar: 987654321098,
            fatherNumber: 919876543212,
            motherName: 'Mrs. Kumar',
            motherOccupation: 'Teacher',
            motherAadhar: 876543210987,
            motherNumber: 919876543213,
            gender: 'Male',
            community: 'General',
            xMarks: 95,
            xiiMarks: 92,
            jeeMains: 98,
            jeeAdvanced: 230,
            status: 'PURSUING',
          },
        },
      },
    });

    const studentUser2 = await prisma.user.create({
      data: {
        email: '22002@student.nitandhra.ac.in',
        password: hashedPassword,
        role: 'STUDENT',
        accountStatus: 'ACTIVE',
        profilePicture: 'https://avatar.iran.liara.run/public/2',
        student: {
          create: {
            name: 'Priya Sharma',
            aadhar: 123456789013,
            phoneNumber: '+919876543230',
            phoneCode: 91,
            registrationNumber: 22002,
            rollNumber: 22002,
            emergencyContact: 919876543231,
            personalEmail: 'priya.s@gmail.com',
            collegeEmail: '22002@student.nitandhra.ac.in',
            dob: new Date('2004-08-20'),
            address: '456 Park Avenue, Vijayawada',
            program: 'B.Tech',
            branch: 'Computer Science',
            bloodGroup: 'A+',
            dayScholar: true,
            fatherName: 'Mr. Sharma',
            motherName: 'Mrs. Sharma',
            gender: 'Female',
            community: 'OBC',
            xMarks: 93,
            xiiMarks: 90,
            jeeMains: 95,
            status: 'PURSUING',
          },
        },
      },
    });

    // Get created records for relations
    const student1 = await prisma.student.findUnique({
      where: { userId: studentUser1.id },
    });
    const student2 = await prisma.student.findUnique({
      where: { userId: studentUser2.id },
    });
    const hod = await prisma.hOD.findUnique({
      where: { userId: hodUser.id },
    });

    // 5. Create Internships
    console.log('Creating Internships...');
    const internship1 = await prisma.internship.create({
      data: {
        semester: 6,
        type: 'Summer Internship',
        organisation: 'Google',
        stipend: 50000,
        duration: '3 months',
        location: 'Bangalore',
        students: {
          connect: [{ id: student1!.id }],
        },
      },
    });

    const internship2 = await prisma.internship.create({
      data: {
        semester: 6,
        type: 'Winter Internship',
        organisation: 'Microsoft',
        stipend: 60000,
        duration: '2 months',
        location: 'Hyderabad',
        students: {
          connect: [{ id: student2!.id }],
        },
      },
    });

    // 6. Create Projects
    console.log('Creating Projects...');
    const project1 = await prisma.project.create({
      data: {
        semester: 7,
        title: 'AI-based Student Management System',
        description: 'A comprehensive system for managing student data',
        technologies: ['React', 'Node.js', 'PostgreSQL', 'Prisma'],
        mentor: 'Dr. Ramesh Sharma',
        students: {
          connect: [{ id: student1!.id }],
        },
      },
    });

    // 7. Create Co-curricular Activities
    console.log('Creating Co-curricular Activities...');
    const coCurricular1 = await prisma.coCurricular.create({
      data: {
        sem: 5,
        date: new Date('2024-03-15'),
        eventDetails: 'National Level Hackathon',
        participationDetails: 'Team Lead',
        awards: 'First Prize',
        students: {
          connect: [{ id: student1!.id }],
        },
      },
    });

    // 8. Create Semesters with Subjects
    console.log('Creating Semesters and Subjects...');
    const subject1 = await prisma.subject.create({
      data: {
        subjectName: 'Data Structures',
        subjectCode: 'CS201',
        grade: 'A+',
      },
    });

    const subject2 = await prisma.subject.create({
      data: {
        subjectName: 'Algorithms',
        subjectCode: 'CS202',
        grade: 'A',
      },
    });

    const semester1 = await prisma.semester.create({
      data: {
        semester: 1,
        sgpa: 8.5,
        cgpa: 8.5,
        students: {
          connect: [{ id: student1!.id }],
        },
        subjects: {
          connect: [{ id: subject1.id }, { id: subject2.id }],
        },
      },
    });

    // 9. Create Career Details
    console.log('Creating Career Details...');
    await prisma.careerDetails.create({
      data: {
        studentId: student1!.id,
        hobbies: ['Reading', 'Coding', 'Sports'],
        strengths: ['Problem Solving', 'Team Work'],
        areasToImprove: ['Public Speaking'],
        core: ['Core Engineering'],
        it: ['Software Development', 'Data Science'],
        higherEducation: ['MS in USA'],
        startup: [],
        familyBusiness: [],
        otherInterests: ['Teaching'],
      },
    });

    // 10. Create Personal Problems
    console.log('Creating Personal Problems...');
    await prisma.personalProblem.create({
      data: {
        studentId: student1!.id,
        stress: true,
        examinationAnxiety: true,
        timeManagementProblem: true,
        procrastination: true,
        worriesAboutFuture: true,
        fearOfPublicSpeaking: true,
      },
    });

    // 11. Create Requests
    console.log('Creating Requests...');
    await prisma.request.create({
      data: {
        studentId: student1!.id,
        type: 'INTERNSHIP',
        targetId: internship1.id,
        status: 'APPROVED',
        remarks: 'Please review my internship details',
        feedback: 'Looks good, approved!',
        hodId: hod!.id,
      },
    });

    await prisma.request.create({
      data: {
        studentId: student2!.id,
        type: 'INTERNSHIP',
        targetId: internship2.id,
        status: 'PENDING',
        remarks: 'Awaiting HOD approval',
        hodId: hod!.id,
      },
    });

    // 12. Create Messages
    console.log('Creating Messages...');
    await prisma.message.create({
      data: {
        senderId: studentUser1.id,
        receiverId: facultyUser1.id,
        subject: 'Meeting Request',
        content: 'Hello Sir, I would like to schedule a meeting to discuss my project.',
        read: false,
      },
    });

    await prisma.message.create({
      data: {
        senderId: facultyUser1.id,
        receiverId: studentUser1.id,
        subject: 'Re: Meeting Request',
        content: 'Sure, let\'s meet on Monday at 3 PM.',
        read: true,
      },
    });

    // 13. Create Meetings
    console.log('Creating Meetings...');
    await prisma.meeting.create({
      data: {
        hodId: hod!.id,
        facultyId: faculty1!.id,
        date: new Date('2024-10-25'),
        time: '10:00 AM',
        description: 'Monthly review meeting',
        facultyReview: 'Student is performing well',
        hodReview: 'Keep up the good work',
        students: {
          connect: [{ id: student1!.id }],
        },
      },
    });

    // 14. Connect Students to Faculty (Mentoring relationship)
    console.log('Creating Mentoring Relationships...');
    await prisma.student.update({
      where: { id: student1!.id },
      data: {
        mentors: {
          connect: [{ id: faculty1!.id }],
        },
      },
    });

    await prisma.student.update({
      where: { id: student2!.id },
      data: {
        mentors: {
          connect: [{ id: faculty1!.id }],
        },
      },
    });

    console.log('✅ Database seeding completed successfully!');
    console.log('\n📊 Summary:');
    console.log('- 1 Admin user created');
    console.log('- 2 Faculty users created');
    console.log('- 1 HOD user created');
    console.log('- 2 Student users created');
    console.log('- 2 Internships created');
    console.log('- 1 Project created');
    console.log('- 1 Co-curricular activity created');
    console.log('- 1 Semester with 2 Subjects created');
    console.log('- Career details and personal problems added');
    console.log('- 2 Requests created');
    console.log('- 2 Messages created');
    console.log('- 1 Meeting created');
    console.log('\n🔑 Login Credentials:');
    console.log('All users: password123');
    console.log('Admin: admin@nitandhra.ac.in');
    console.log('Faculty: ramesh.sharma@nitandhra.ac.in, priya.verma@nitandhra.ac.in');
    console.log('HOD: hod.cs@nitandhra.ac.in');
    console.log('Students: 22001@student.nitandhra.ac.in, 22002@student.nitandhra.ac.in');

    return {
      success: true,
      message: 'Database seeded successfully',
      stats: {
        users: 5,
        students: 2,
        faculty: 2,
        hod: 1,
        admin: 1,
      },
    };
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  }
}
