"""
Comprehensive Seed Database Script for Testing
================================================
Creates:
- 1 Admin
- 10 Faculty (across CSE, ECE, EEE)
- 3 HODs (one per department: CSE, ECE, EEE)
- 20 Students (across CSE, ECE, EEE, mixed years 1-4)
- All related tables populated with realistic data
- Academic data with backlogs and makeup exams for some students
- Password for all users: 'password' (bcrypt hashed)
"""
import os
import sys
import django
from datetime import datetime, timedelta, date
from decimal import Decimal
import random

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'mentormentee.settings')
django.setup()

import bcrypt
from django.utils import timezone
from django.db import transaction
from core.models import (
    User, Faculty, HOD, Admin, Student, Mentorship, Meeting, GroupMeeting, GroupMeetingStudent,
    Internship, Project, CoCurricular, Subject, Semester, StudentSubject, BacklogHistory,
    CareerDetails, PersonalProblem, Request,
    UserRole, AccountStatus, Gender, Community, StudentStatus, Department, Programme,
    MeetingStatus, RequestStatus, RequestType, SubjectType, SemesterType, AttemptType, GradePoint,
    GRADE_POINTS
)


def hash_password(password):
    """Hash password using bcrypt"""
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')


def clear_database():
    """Delete all data from all tables"""
    print("Clearing all data from database...")
    
    # Delete in order to respect foreign key constraints
    models_to_clear = [
        BacklogHistory, StudentSubject, Semester, Subject,
        CoCurricular, Project, Internship,
        GroupMeetingStudent, GroupMeeting, Meeting, Mentorship,
        Request, PersonalProblem, CareerDetails,
        Student, HOD, Admin, Faculty, User
    ]
    
    for model in models_to_clear:
        count = model.objects.all().delete()[0]
        print(f"  Deleted {count} {model.__name__} records")
    
    print("Database cleared!\n")


# ========== SUBJECTS DATA ==========
SUBJECTS_BY_SEMESTER = {
    1: [
        ('MA101', 'Engineering Mathematics I', 4, 'BSC'),
        ('PH101', 'Engineering Physics', 3, 'BSC'),
        ('CH101', 'Engineering Chemistry', 3, 'BSC'),
        ('CS101', 'Programming in C', 4, 'ESC'),
        ('ME101', 'Engineering Graphics', 3, 'ESC'),
        ('HS101', 'English Communication', 2, 'HSC'),
    ],
    2: [
        ('MA102', 'Engineering Mathematics II', 4, 'BSC'),
        ('PH102', 'Applied Physics', 3, 'BSC'),
        ('CS102', 'Data Structures', 4, 'PCC'),
        ('EE101', 'Basic Electrical Engineering', 3, 'ESC'),
        ('EC101', 'Basic Electronics', 3, 'ESC'),
        ('HS102', 'Technical Writing', 2, 'HSC'),
    ],
    3: [
        ('MA201', 'Probability & Statistics', 4, 'BSC'),
        ('CS201', 'Object Oriented Programming', 4, 'PCC'),
        ('CS202', 'Digital Logic Design', 3, 'PCC'),
        ('CS203', 'Computer Organization', 4, 'PCC'),
        ('EC201', 'Signals & Systems', 3, 'PCC'),
        ('HS201', 'Economics for Engineers', 2, 'HSC'),
    ],
    4: [
        ('MA202', 'Discrete Mathematics', 4, 'BSC'),
        ('CS204', 'Database Management Systems', 4, 'PCC'),
        ('CS205', 'Operating Systems', 4, 'PCC'),
        ('CS206', 'Theory of Computation', 3, 'PCC'),
        ('CS207', 'Computer Networks', 3, 'PCC'),
        ('HS202', 'Management Principles', 2, 'HSC'),
    ],
    5: [
        ('CS301', 'Algorithms', 4, 'PCC'),
        ('CS302', 'Software Engineering', 3, 'PCC'),
        ('CS303', 'Compiler Design', 4, 'PCC'),
        ('CS304', 'Machine Learning', 4, 'DEC'),
        ('CS305', 'Web Technologies', 3, 'DEC'),
        ('HS301', 'Professional Ethics', 2, 'HSC'),
    ],
    6: [
        ('CS306', 'Artificial Intelligence', 4, 'PCC'),
        ('CS307', 'Distributed Systems', 3, 'PCC'),
        ('CS308', 'Information Security', 3, 'DEC'),
        ('CS309', 'Cloud Computing', 3, 'DEC'),
        ('CS310', 'Mobile App Development', 3, 'DEC'),
        ('PRC301', 'Mini Project', 2, 'PRC'),
    ],
}


def create_subjects():
    """Create all subjects"""
    print("Creating subjects...")
    subject_list = []
    
    for semester, subjects in SUBJECTS_BY_SEMESTER.items():
        for code, name, credits, subject_type in subjects:
            subject = Subject.objects.create(
                subjectCode=code,
                subjectName=name,
                credits=credits,
                subject_type=subject_type,
                typical_semester=semester
            )
            subject_list.append(subject)
    
    print(f"  Created {len(subject_list)} subjects")
    return subject_list


def create_admin():
    """Create 1 admin"""
    print("Creating admin...")
    hashed_pw = hash_password('password')
    
    user = User.objects.create(
        email='admin1@college.edu',
        password=hashed_pw,
        role=UserRole.ADMIN,
        accountStatus=AccountStatus.ACTIVE
    )
    
    admin = Admin.objects.create(
        user=user,
        employeeId='ADM001',
        name='Dr. Rajesh Kumar',
        phone='9876543210',
        personalEmail='rajesh.kumar@gmail.com',
        collegeEmail='admin1@college.edu',
        department='CSE',
        designation='System Administrator',
        office='Admin Block Room 101'
    )
    
    print(f"  Created admin: {admin.name}")
    return admin


def create_faculty():
    """Create 10 faculty members across CSE, ECE, EEE"""
    print("Creating faculty...")
    hashed_pw = hash_password('password')
    faculty_list = []
    
    # Faculty data: (name, department, specialization)
    faculty_data = [
        ('Dr. Arun Sharma', 'CSE', 'Machine Learning'),
        ('Dr. Priya Menon', 'CSE', 'Database Systems'),
        ('Dr. Vikram Singh', 'CSE', 'Computer Networks'),
        ('Dr. Kavitha Rajan', 'CSE', 'Software Engineering'),
        ('Dr. Suresh Iyer', 'ECE', 'VLSI Design'),
        ('Dr. Lakshmi Narayanan', 'ECE', 'Signal Processing'),
        ('Dr. Manoj Kumar', 'ECE', 'Communication Systems'),
        ('Dr. Anitha Krishnan', 'EEE', 'Power Electronics'),
        ('Dr. Ramesh Babu', 'EEE', 'Control Systems'),
        ('Dr. Deepa Venkatesh', 'EEE', 'Renewable Energy'),
    ]
    
    for i, (name, dept, spec) in enumerate(faculty_data, 1):
        user = User.objects.create(
            email=f'faculty{i}@college.edu',
            password=hashed_pw,
            role=UserRole.FACULTY,
            accountStatus=AccountStatus.ACTIVE
        )
        
        faculty = Faculty.objects.create(
            user=user,
            employeeId=f'FAC{i:03d}',
            name=name,
            phone1=f'98765{i:05d}',
            phone2=f'87654{i:05d}' if i % 2 == 0 else None,
            personalEmail=f'{name.lower().replace(" ", ".").replace("dr.", "")}@gmail.com',
            collegeEmail=f'faculty{i}@college.edu',
            department=dept,
            isActive=True,
            startDate=timezone.now() - timedelta(days=365*random.randint(3, 10)),
            btech='IIT Delhi' if i <= 4 else 'IIT Madras',
            mtech='IIT Bombay' if i <= 6 else 'IIT Kharagpur',
            phd='IISc Bangalore' if i <= 5 else 'IIT Delhi',
            office=f'Room {100 + i}',
            officeHours='10:00 AM - 5:00 PM'
        )
        faculty_list.append(faculty)
    
    print(f"  Created {len(faculty_list)} faculty members")
    return faculty_list


def create_hods(faculty_list):
    """Create 3 HODs - one for each department (CSE, ECE, EEE)"""
    print("Creating HODs...")
    hashed_pw = hash_password('password')
    hod_list = []
    
    # HOD data: (name, department, linked faculty index)
    hod_data = [
        ('Prof. Sanjay Gupta', 'CSE', 0),  # Links to first CSE faculty
        ('Prof. Meera Nair', 'ECE', 4),    # Links to first ECE faculty
        ('Prof. Arvind Patel', 'EEE', 7),  # Links to first EEE faculty
    ]
    
    for i, (name, dept, faculty_idx) in enumerate(hod_data, 1):
        # Create HOD user with unique HOD email
        user = User.objects.create(
            email=f'hoduser{i}@college.edu',  # User login email
            password=hashed_pw,
            role=UserRole.HOD,
            accountStatus=AccountStatus.ACTIVE
        )
        
        # Create faculty profile for HOD
        hod_faculty = Faculty.objects.create(
            user=user,
            employeeId=f'HOD{i:03d}',
            name=name,
            phone1=f'98000{i:05d}',
            personalEmail=f'{name.lower().replace(" ", ".").replace("prof.", "")}@gmail.com',
            collegeEmail=f'hoduser{i}@college.edu',
            department=dept,
            isActive=True,
            startDate=timezone.now() - timedelta(days=365*5),
            btech='IIT Kanpur',
            mtech='IIT Delhi',
            phd='Stanford University',
            office=f'HOD Office - {dept}',
            officeHours='9:00 AM - 6:00 PM'
        )
        
        # Create HOD with unique HOD email
        hod = HOD.objects.create(
            email=f'hod{i}@college.edu',  # Unique HOD-specific email
            user=user,
            faculty=hod_faculty,
            department=dept,
            startDate=timezone.now() - timedelta(days=365*2)
        )
        hod_list.append(hod)
    
    print(f"  Created {len(hod_list)} HODs")
    return hod_list


def create_students():
    """Create 20 students across CSE, ECE, EEE with years 1-4"""
    print("Creating students...")
    hashed_pw = hash_password('password')
    student_list = []
    
    # Student distribution: 7 CSE, 7 ECE, 6 EEE
    # Years: 5 per year (1st, 2nd, 3rd, 4th)
    student_data = [
        # CSE Students (7)
        ('Rahul Verma', 'CSE', 1, 'Male'), ('Sneha Patil', 'CSE', 1, 'Female'),
        ('Amit Joshi', 'CSE', 2, 'Male'), ('Priya Sharma', 'CSE', 2, 'Female'),
        ('Karthik Reddy', 'CSE', 3, 'Male'), ('Divya Nair', 'CSE', 3, 'Female'),
        ('Rohit Kumar', 'CSE', 4, 'Male'),
        # ECE Students (7)
        ('Arjun Menon', 'ECE', 1, 'Male'), ('Anjali Singh', 'ECE', 1, 'Female'),
        ('Varun Gupta', 'ECE', 2, 'Male'), ('Kavya Iyer', 'ECE', 2, 'Female'),
        ('Siddharth Rao', 'ECE', 3, 'Male'), ('Meghana Das', 'ECE', 3, 'Female'),
        ('Nikhil Prasad', 'ECE', 4, 'Male'),
        # EEE Students (6)
        ('Aditya Sharma', 'EEE', 1, 'Male'), ('Pooja Reddy', 'EEE', 1, 'Female'),
        ('Harish Kumar', 'EEE', 2, 'Male'), ('Swathi Nair', 'EEE', 2, 'Female'),
        ('Ravi Teja', 'EEE', 3, 'Male'), ('Ananya Krishnan', 'EEE', 4, 'Female'),
    ]
    
    blood_groups = ['A+', 'B+', 'O+', 'AB+', 'A-', 'B-', 'O-', 'AB-']
    communities = [Community.GENERAL, Community.OBC, Community.SC, Community.ST, Community.EWS]
    
    for i, (name, branch, year, gender) in enumerate(student_data, 1):
        user = User.objects.create(
            email=f'student{i}@college.edu',
            password=hashed_pw,
            role=UserRole.STUDENT,
            accountStatus=AccountStatus.ACTIVE
        )
        
        # Registration and roll numbers based on year
        base_year = 2026 - year  # If year=1, base=2025; year=4, base=2022
        reg_num = int(f'{base_year}{i:04d}')
        roll_num = int(f'{base_year % 100}{i:03d}')
        
        student = Student.objects.create(
            user=user,
            name=name,
            aadhar=f'{100000000000 + i}',
            phoneNumber=f'70000{i:05d}',
            phoneCode=91,
            registrationNumber=reg_num,
            rollNumber=roll_num,
            passPort='Not Available' if i % 3 != 0 else f'P{i:07d}',
            emergencyContact=f'80000{i:05d}',
            personalEmail=f'{name.lower().replace(" ", ".")}@gmail.com',
            collegeEmail=f'student{i}@college.edu',
            dob=timezone.make_aware(datetime(2004 - year, random.randint(1, 12), random.randint(1, 28))),
            address=f'{i * 10} Main Street, Apartment {i}, Chennai, Tamil Nadu, 600{i:03d}',
            program='B.Tech',
            branch=branch,
            year=year,
            bloodGroup=blood_groups[i % len(blood_groups)],
            dayScholar=i % 2 == 0,
            fatherName=f'Mr. {name.split()[1]} Sr.' if len(name.split()) > 1 else f'Mr. Father {i}',
            fatherOccupation=['Engineer', 'Doctor', 'Business', 'Professor', 'Advocate'][i % 5],
            fatherAadhar=f'{200000000000 + i}',
            fatherNumber=f'90000{i:05d}',
            motherName=f'Mrs. {name.split()[1]}' if len(name.split()) > 1 else f'Mrs. Mother {i}',
            motherOccupation=['Teacher', 'Homemaker', 'Doctor', 'Banker', 'Professor'][i % 5],
            motherAadhar=f'{300000000000 + i}',
            motherNumber=f'91000{i:05d}',
            gender=Gender.MALE if gender == 'Male' else Gender.FEMALE,
            community=communities[i % len(communities)],
            xMarks=85 + random.randint(0, 14),
            xiiMarks=80 + random.randint(0, 19),
            jeeMains=150 + random.randint(0, 100),
            jeeAdvanced=100 + random.randint(0, 50) if i <= 12 else None,
            status=StudentStatus.PURSUING
        )
        student_list.append(student)
    
    print(f"  Created {len(student_list)} students")
    return student_list


def create_academic_data(student_list, subject_list):
    """Create semesters and grades for students based on their year"""
    print("Creating academic data (semesters, grades, backlogs)...")
    
    # Group subjects by semester
    subjects_by_sem = {}
    for subject in subject_list:
        sem = subject.typical_semester
        if sem not in subjects_by_sem:
            subjects_by_sem[sem] = []
        subjects_by_sem[sem].append(subject)
    
    # Students with backlogs (indices)
    backlog_students = [4, 10, 14, 18]  # 3rd year students mostly
    
    grades_normal = ['EX', 'A', 'A', 'B', 'B', 'C', 'C', 'D', 'P']  # Weighted towards good grades
    grades_weak = ['C', 'D', 'D', 'P', 'P', 'F']  # For students with backlogs
    
    total_semesters = 0
    total_grades = 0
    total_backlogs = 0
    
    for idx, student in enumerate(student_list):
        student_year = student.year
        num_semesters = student_year * 2  # Year 1 = 2 sems, Year 2 = 4 sems, etc.
        
        is_backlog_student = idx in backlog_students
        
        for sem_num in range(1, num_semesters + 1):
            # Create semester
            academic_year = 2026 - student_year + (sem_num - 1) // 2
            semester = Semester.objects.create(
                student=student,
                semester=sem_num,
                semester_type=SemesterType.ODD if sem_num % 2 == 1 else SemesterType.EVEN,
                academic_year=academic_year,
                sgpa=0.0,
                cgpa=0.0,
                total_credits=0
            )
            total_semesters += 1
            
            # Get subjects for this semester
            sem_subjects = subjects_by_sem.get(sem_num, [])
            
            for subject in sem_subjects:
                # Determine grade
                if is_backlog_student and sem_num in [3, 4] and random.random() < 0.3:
                    # Give F grade for backlog
                    grade = 'F'
                else:
                    grade = random.choice(grades_normal if not is_backlog_student else grades_weak)
                
                # Create student subject grade
                student_subject = StudentSubject.objects.create(
                    student=student,
                    subject=subject,
                    semester=semester,
                    grade=grade,
                    attempt_type=AttemptType.REGULAR,
                    exam_year=academic_year,
                    exam_month='May' if sem_num % 2 == 0 else 'November'
                )
                total_grades += 1
                
                # If failed, create backlog attempt for older students
                if grade == 'F' and student_year >= 3:
                    # Create makeup/backlog attempt in next semester
                    backlog_grade = random.choice(['P', 'D', 'C', 'F'])  # Some clear, some don't
                    backlog = BacklogHistory.objects.create(
                        student=student,
                        subject=subject,
                        original_semester=sem_num,
                        attempt_number=1,
                        attempt_type=AttemptType.BACKLOG,
                        semester_type=SemesterType.EVEN if sem_num % 2 == 1 else SemesterType.ODD,
                        exam_year=academic_year + 1,
                        exam_month='May' if sem_num % 2 == 1 else 'November',
                        grade=backlog_grade
                    )
                    total_backlogs += 1
                    
                    # If still failed, create makeup attempt
                    if backlog_grade == 'F' and random.random() < 0.5:
                        makeup = BacklogHistory.objects.create(
                            student=student,
                            subject=subject,
                            original_semester=sem_num,
                            attempt_number=2,
                            attempt_type=AttemptType.MAKEUP,
                            semester_type=SemesterType.ODD,
                            exam_year=academic_year + 1,
                            exam_month='December',
                            grade=random.choice(['P', 'D', 'C'])  # Usually clears in makeup
                        )
                        total_backlogs += 1
            
            # Calculate SGPA for this semester
            semester.calculate_sgpa()
    
    print(f"  Created {total_semesters} semesters, {total_grades} grades, {total_backlogs} backlog entries")


def create_mentorships(faculty_list, student_list):
    """Create mentorships - assign students to faculty in same department"""
    print("Creating mentorships...")
    mentorship_list = []
    
    # Group faculty by department
    faculty_by_dept = {}
    for f in faculty_list:
        if f.department not in faculty_by_dept:
            faculty_by_dept[f.department] = []
        faculty_by_dept[f.department].append(f)
    
    for student in student_list:
        # Find faculty in same department
        dept_faculty = faculty_by_dept.get(student.branch, faculty_list)
        faculty = random.choice(dept_faculty)
        
        mentorship = Mentorship.objects.create(
            faculty=faculty,
            student=student,
            department=student.branch,
            year=2026,
            semester=student.year * 2,
            start_date=timezone.now() - timedelta(days=90),
            is_active=True,
            comments=['Initial mentorship assigned', 'Regular progress reviews scheduled']
        )
        mentorship_list.append(mentorship)
    
    print(f"  Created {len(mentorship_list)} mentorships")
    return mentorship_list


def create_meetings(mentorship_list):
    """Create meetings for mentorships"""
    print("Creating meetings...")
    meeting_count = 0
    
    for mentorship in mentorship_list:
        # Create 2-3 past meetings (completed)
        for j in range(random.randint(2, 3)):
            Meeting.objects.create(
                mentorship=mentorship,
                date=date.today() - timedelta(days=30 * (j + 1)),
                time=datetime.strptime(f'{10 + j}:00', '%H:%M').time(),
                description=f'Monthly progress review - Month {j + 1}',
                facultyReview=f'Student is making {"good" if j % 2 == 0 else "excellent"} progress.',
                status=MeetingStatus.COMPLETED
            )
            meeting_count += 1
        
        # Create 1 upcoming meeting
        Meeting.objects.create(
            mentorship=mentorship,
            date=date.today() + timedelta(days=7),
            time=datetime.strptime('14:00', '%H:%M').time(),
            description='Upcoming progress review',
            status=MeetingStatus.UPCOMING
        )
        meeting_count += 1
    
    print(f"  Created {meeting_count} meetings")


def create_internships(student_list, faculty_list):
    """Create internships for 3rd and 4th year students"""
    print("Creating internships...")
    internship_count = 0
    
    companies = [
        ('Google', 'Bangalore', 80000),
        ('Microsoft', 'Hyderabad', 75000),
        ('Amazon', 'Chennai', 70000),
        ('TCS', 'Chennai', 40000),
        ('Infosys', 'Bangalore', 35000),
        ('Wipro', 'Hyderabad', 30000),
    ]
    
    for student in student_list:
        if student.year >= 3:  # Only 3rd and 4th year
            company = random.choice(companies)
            Internship.objects.create(
                student=student,
                semester=student.year * 2 - 1,
                type='Summer Internship',
                organisation=company[0],
                stipend=company[2],
                duration='2 months',
                location=company[1]
            )
            internship_count += 1
            
            # 4th year students get additional internship
            if student.year == 4:
                company2 = random.choice(companies)
                Internship.objects.create(
                    student=student,
                    semester=student.year * 2,
                    type='Winter Internship',
                    organisation=company2[0],
                    stipend=company2[2] + 10000,
                    duration='6 months',
                    location=company2[1]
                )
                internship_count += 1
    
    print(f"  Created {internship_count} internships")


def create_projects(student_list, faculty_list):
    """Create projects for students"""
    print("Creating projects...")
    project_count = 0
    
    project_ideas = [
        ('AI-based Chatbot', 'Intelligent chatbot using NLP and ML', ['Python', 'TensorFlow', 'Flask']),
        ('E-commerce Platform', 'Full-stack online shopping platform', ['React', 'Node.js', 'MongoDB']),
        ('IoT Smart Home', 'Home automation using IoT sensors', ['Arduino', 'Python', 'MQTT']),
        ('Blockchain Voting', 'Secure voting system using blockchain', ['Solidity', 'Ethereum', 'React']),
        ('ML Image Classifier', 'Image classification using deep learning', ['Python', 'PyTorch', 'OpenCV']),
        ('Mobile Health App', 'Health tracking mobile application', ['React Native', 'Firebase']),
        ('Data Analytics Dashboard', 'Real-time data visualization dashboard', ['Python', 'Pandas', 'D3.js']),
        ('Smart Traffic System', 'AI-based traffic management system', ['Python', 'TensorFlow', 'OpenCV']),
    ]
    
    for i, student in enumerate(student_list):
        if student.year >= 2:  # 2nd year onwards
            project = random.choice(project_ideas)
            mentor = random.choice(faculty_list)
            
            Project.objects.create(
                student=student,
                semester=student.year * 2,
                title=f'{project[0]} - {student.name}',
                description=project[1],
                technologies=project[2],
                mentor=mentor
            )
            project_count += 1
    
    print(f"  Created {project_count} projects")


def create_co_curriculars(student_list):
    """Create co-curricular activities"""
    print("Creating co-curricular activities...")
    activity_count = 0
    
    events = [
        ('Tech Fest 2024', 'Coding Competition', 'First Prize'),
        ('Sports Day', 'Athletics 100m', 'Gold Medal'),
        ('Cultural Festival', 'Dance Performance', 'Best Performance'),
        ('Hackathon', 'Team Lead', 'Runner Up'),
        ('Paper Presentation', 'Research Paper', 'Best Paper Award'),
        ('Robotics Competition', 'Team Member', 'Second Prize'),
        ('Debate Competition', 'Speaker', 'Best Speaker'),
        ('Music Festival', 'Vocalist', 'Appreciation Award'),
    ]
    
    for student in student_list:
        # Each student has 1-3 activities
        num_activities = random.randint(1, 3)
        for _ in range(num_activities):
            event = random.choice(events)
            CoCurricular.objects.create(
                student=student,
                sem=random.randint(1, student.year * 2),
                date=date.today() - timedelta(days=random.randint(30, 365)),
                eventDetails=event[0],
                participationDetails=event[1],
                awards=event[2]
            )
            activity_count += 1
    
    print(f"  Created {activity_count} co-curricular activities")


def create_career_details(student_list):
    """Create career details for students"""
    print("Creating career details...")
    
    hobbies_list = ['Coding', 'Reading', 'Gaming', 'Sports', 'Music', 'Photography', 'Traveling']
    strengths_list = ['Problem Solving', 'Team Work', 'Communication', 'Leadership', 'Creativity', 'Time Management']
    areas_to_improve = ['Public Speaking', 'Technical Writing', 'Networking', 'Stress Management']
    
    for student in student_list:
        CareerDetails.objects.create(
            student=student,
            hobbies=random.sample(hobbies_list, k=3),
            strengths=random.sample(strengths_list, k=3),
            areasToImprove=random.sample(areas_to_improve, k=2),
            core=['VLSI', 'Embedded Systems'] if student.branch == 'ECE' else ['Software Development', 'AI/ML'],
            it=['Web Development', 'Cloud Computing', 'Data Science'],
            higherEducation=['MS in USA', 'MTech in IIT'] if random.random() > 0.5 else [],
            startup=['EdTech', 'FinTech'] if random.random() > 0.7 else [],
            familyBusiness=[],
            otherInterests=['Civil Services', 'MBA'] if random.random() > 0.8 else [],
            govt_sector_rank=random.randint(1, 6),
            core_rank=random.randint(1, 6),
            it_rank=random.randint(1, 6),
            higher_education_rank=random.randint(1, 6),
            startup_rank=random.randint(1, 6),
            family_business_rank=random.randint(1, 6)
        )
    
    print(f"  Created {len(student_list)} career details")


def create_personal_problems(student_list):
    """Create personal problems data for some students"""
    print("Creating personal problems data...")
    count = 0
    
    for i, student in enumerate(student_list):
        if i % 3 == 0:  # Only some students have reported problems
            PersonalProblem.objects.create(
                student=student,
                stress=random.choice([True, False, None]),
                anger=random.choice([True, False, None]),
                emotional_problem=random.choice([True, False, None]),
                low_self_esteem=random.choice([True, False, None]),
                examination_anxiety=random.choice([True, False, None]),
                negative_thoughts=random.choice([True, False, None]),
                exam_phobia=random.choice([True, False, None]),
                poor_concentration=random.choice([True, False, None]),
                time_management_problem=random.choice([True, False, None]),
                worries_about_future=random.choice([True, False, None]),
                economic_issues='Minor financial concerns' if random.random() > 0.7 else None,
                health_issues='Regular health checkup needed' if random.random() > 0.8 else None,
            )
            count += 1
    
    print(f"  Created {count} personal problem records")


@transaction.atomic
def seed_database():
    """Main function to seed the database"""
    print("=" * 60)
    print("SEEDING DATABASE WITH TEST DATA")
    print("=" * 60 + "\n")
    
    # Clear existing data
    clear_database()
    
    # Create all data
    subjects = create_subjects()
    admin = create_admin()
    faculty_list = create_faculty()
    hod_list = create_hods(faculty_list)
    student_list = create_students()
    
    # Create academic data
    create_academic_data(student_list, subjects)
    
    # Create relationships and activities
    mentorship_list = create_mentorships(faculty_list, student_list)
    create_meetings(mentorship_list)
    create_internships(student_list, faculty_list)
    create_projects(student_list, faculty_list)
    create_co_curriculars(student_list)
    create_career_details(student_list)
    create_personal_problems(student_list)
    
    print("\n" + "=" * 60)
    print("DATABASE SEEDING COMPLETE!")
    print("=" * 60)
    print("\nSummary:")
    print(f"  - 1 Admin (admin1@college.edu)")
    print(f"  - 10 Faculty (faculty1@college.edu ... faculty10@college.edu)")
    print(f"  - 3 HODs (hod1@college.edu, hod2@college.edu, hod3@college.edu)")
    print(f"  - 20 Students (student1@college.edu ... student20@college.edu)")
    print(f"\nPassword for all users: password")
    print(f"\nDepartments: CSE, ECE, EEE")


if __name__ == '__main__':
    seed_database()
