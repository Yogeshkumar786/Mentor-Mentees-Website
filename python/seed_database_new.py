"""
Seed database with test data for CSE, ECE, EEE departments only:
- 3 HODs (one per department)
- 10 Faculty members
- 30 Students (18 CSE with up to 6 semesters, 6 ECE, 6 EEE)
- Subjects with faculty assignments
- Mentorship groups
- Sample grades and data
- Password for all users: 'password' (hashed using bcrypt)
"""
import os
import sys
import django
from datetime import datetime, timedelta
from decimal import Decimal
import random

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'mentormentee.settings')
django.setup()

import bcrypt
from django.utils import timezone
from django.contrib.contenttypes.models import ContentType
from core.models import (
    User, Faculty, HOD, Admin, Student, Mentorship, Meeting, GroupMeeting,
    Internship, Project, CoCurricular, Subject, Semester, StudentSubject,
    CareerDetails, PersonalProblem, Request, BacklogHistory, YearTopper,
    FacultySubjectHistory,
    UserRole, AccountStatus, Gender, Community, StudentStatus, Department,
    MeetingStatus, RequestStatus, RequestType, SubjectType, SemesterType,
    AttemptType, GradePoint, GRADE_POINTS
)

def hash_password(password):
    """Hash password using bcrypt - matches the auth login logic"""
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def clear_database():
    """Clear all existing data"""
    print("Clearing existing data...")
    models_to_clear = [
        YearTopper, FacultySubjectHistory, BacklogHistory,
        PersonalProblem, CareerDetails, Request, Meeting, GroupMeeting, Mentorship,
        StudentSubject, Semester, CoCurricular, Internship, Project,
        Student, HOD, Admin, Faculty, Subject, User
    ]
    for model in models_to_clear:
        model.objects.all().delete()
    print("Database cleared.")

def create_users():
    """Create all users with hashed password"""
    hashed_pw = hash_password('password')
    users = []
    
    # 3 HOD users (one per department: CSE, ECE, EEE)
    for i in range(1, 4):
        user = User.objects.create(
            email=f'hod{i}@college.edu',
            password=hashed_pw,
            role=UserRole.HOD,
            accountStatus=AccountStatus.ACTIVE
        )
        users.append(('hod', user))
    
    # 10 Faculty users
    for i in range(1, 11):
        user = User.objects.create(
            email=f'faculty{i}@college.edu',
            password=hashed_pw,
            role=UserRole.FACULTY,
            accountStatus=AccountStatus.ACTIVE
        )
        users.append(('faculty', user))
    
    # 1 Admin user
    user = User.objects.create(
        email=f'admin1@college.edu',
        password=hashed_pw,
        role=UserRole.ADMIN,
        accountStatus=AccountStatus.ACTIVE
    )
    users.append(('admin', user))
    
    # 30 Student users (more for CSE with 6 semesters)
    for i in range(1, 31):
        user = User.objects.create(
            email=f'student{i}@college.edu',
            password=hashed_pw,
            role=UserRole.STUDENT,
            accountStatus=AccountStatus.ACTIVE
        )
        users.append(('student', user))
    
    print(f"Created {len(users)} users")
    return users

def create_faculty(users):
    """Create 10 faculty members across CSE, ECE, EEE"""
    faculty_users = [u for t, u in users if t == 'faculty']
    faculty_list = []
    
    # Distribute 10 faculty across 3 departments: 4 CSE, 3 ECE, 3 EEE
    departments = [
        Department.CSE, Department.CSE, Department.CSE, Department.CSE,
        Department.ECE, Department.ECE, Department.ECE,
        Department.EEE, Department.EEE, Department.EEE
    ]
    
    names = [
        'Dr. Rajesh Kumar', 'Dr. Priya Sharma', 'Dr. Amit Singh', 'Dr. Neha Gupta',
        'Dr. Suresh Reddy', 'Dr. Kavita Nair', 'Dr. Rakesh Patel',
        'Dr. Sunita Verma', 'Dr. Mohan Joshi', 'Dr. Anita Das'
    ]
    
    for i, user in enumerate(faculty_users):
        faculty = Faculty.objects.create(
            user=user,
            employeeId=f'FAC{i+1:03d}',
            name=names[i],
            phone1=f'98765432{i+1:02d}',
            phone2=f'91234567{i+1:02d}' if i % 2 == 0 else None,
            personalEmail=f'faculty{i+1}.personal@gmail.com',
            collegeEmail=f'faculty{i+1}@college.edu',
            department=departments[i],
            btech='IIT Delhi' if i < 4 else 'NIT Trichy',
            mtech='IIT Bombay' if i < 6 else 'IIT Madras',
            phd='IISc Bangalore' if i < 3 else None,
            office=f'Room {200 + i}',
            officeHours='10:00 AM - 5:00 PM'
        )
        faculty_list.append(faculty)
    
    print(f"Created {len(faculty_list)} faculty members")
    return faculty_list

def create_hods(users):
    """Create 3 HODs - one per department"""
    hod_users = [u for t, u in users if t == 'hod']
    hod_list = []
    departments = [Department.CSE, Department.ECE, Department.EEE]
    names = ['Prof. Vijay Iyer', 'Prof. Lakshmi Krishnan', 'Prof. Ravi Shankar']
    
    for i, user in enumerate(hod_users):
        # Create a faculty record for the HOD
        hod_faculty = Faculty.objects.create(
            user=user,
            employeeId=f'HOD{i+1:03d}',
            name=names[i],
            phone1=f'98000000{i+1:02d}',
            personalEmail=f'hod{i+1}.personal@gmail.com',
            collegeEmail=f'hod{i+1}@college.edu',
            department=departments[i],
            btech='IIT Kanpur',
            mtech='IIT Delhi',
            phd='Stanford University',
            office=f'HOD Office, {departments[i]} Block',
            officeHours='9:00 AM - 6:00 PM'
        )
        
        hod = HOD.objects.create(
            user=user,
            faculty=hod_faculty,
            department=departments[i],
            startDate=timezone.now() - timedelta(days=365*2)
        )
        hod_list.append(hod)
    
    print(f"Created {len(hod_list)} HODs")
    return hod_list

def create_admins(users):
    """Create admin"""
    admin_users = [u for t, u in users if t == 'admin']
    admin_list = []
    
    for i, user in enumerate(admin_users, 1):
        admin = Admin.objects.create(
            user=user,
            employeeId=f'ADM{i:03d}',
            name=f'Admin Staff {i}',
            phone=f'99999999{i:02d}',
            personalEmail=f'admin{i}.personal@gmail.com',
            collegeEmail=f'admin{i}@college.edu',
            department='Administration',
            designation='System Administrator',
            office=f'Admin Block Room {i}'
        )
        admin_list.append(admin)
    
    print(f"Created {len(admin_list)} admins")
    return admin_list

def create_students(users):
    """Create 30 students across CSE, ECE, EEE (more CSE students with up to 6 semesters)"""
    student_users = [u for t, u in users if t == 'student']
    student_list = []
    
    # Distribute 30 students: 18 CSE (for 6 semester data), 6 ECE, 6 EEE
    # CSE: 6 students in year 3 (so they have 6 semesters complete), 4 in year 2, 4 in year 1, 4 in year 4
    # ECE: 2 each in years 1, 2, 3
    # EEE: 2 each in years 1, 2, 3
    departments = [
        # CSE - 18 students (more with 6 semesters)
        Department.CSE, Department.CSE, Department.CSE, Department.CSE, Department.CSE, Department.CSE,  # Year 3 - 6 sems
        Department.CSE, Department.CSE, Department.CSE, Department.CSE,  # Year 4 - 8 sems
        Department.CSE, Department.CSE, Department.CSE, Department.CSE,  # Year 2 - 4 sems
        Department.CSE, Department.CSE, Department.CSE, Department.CSE,  # Year 1 - 2 sems
        # ECE - 6 students
        Department.ECE, Department.ECE, Department.ECE, Department.ECE, Department.ECE, Department.ECE,
        # EEE - 6 students
        Department.EEE, Department.EEE, Department.EEE, Department.EEE, Department.EEE, Department.EEE
    ]
    
    years = [
        # CSE students
        3, 3, 3, 3, 3, 3,  # 6 students in year 3 (6 semesters complete)
        4, 4, 4, 4,        # 4 students in year 4 (8 semesters complete)
        2, 2, 2, 2,        # 4 students in year 2 (4 semesters complete)
        1, 1, 1, 1,        # 4 students in year 1 (2 semesters complete)
        # ECE students
        1, 2, 2, 3, 3, 4,  # 6 ECE students (mixed years)
        # EEE students
        1, 2, 2, 3, 3, 4   # 6 EEE students (mixed years)
    ]
    
    names = [
        # CSE Names (18)
        'Arjun Menon', 'Sneha Patel', 'Vikram Rao', 'Divya Nair', 'Karthik Iyer', 'Meera Sharma',
        'Rohit Gupta', 'Anjali Reddy', 'Pranav Kumar', 'Ishita Singh',
        'Aditya Verma', 'Pooja Krishnan', 'Siddharth Das', 'Nandini Joshi',
        'Rahul Menon', 'Kavya Pillai', 'Nikhil Sharma', 'Shreya Rao',
        # ECE Names (6)
        'Varun Nair', 'Aishwarya Patel', 'Deepak Sharma', 'Priyanka Reddy', 'Manish Kumar', 'Asha Devi',
        # EEE Names (6)
        'Suresh Babu', 'Lakshmi Priya', 'Ramesh Chandran', 'Ananya Das', 'Vijay Prakash', 'Sunitha Rao'
    ]
    
    blood_groups = ['A+', 'B+', 'O+', 'AB+', 'A-', 'B-', 'O-']
    
    for i, user in enumerate(student_users):
        roll_base = 21000 if years[i] == 4 else (22000 if years[i] == 3 else (23000 if years[i] == 2 else 24000))
        student = Student.objects.create(
            user=user,
            name=names[i],
            aadhar=f'{100000000000 + i + 1}',
            phoneNumber=f'70000000{i+1:02d}',
            phoneCode=91,
            registrationNumber=2021000 + i + 1,
            rollNumber=roll_base + i + 1,
            passPort='Not Available',
            emergencyContact=f'80000000{i+1:02d}',
            personalEmail=f'student{i+1}.personal@gmail.com',
            collegeEmail=f'student{i+1}@college.edu',
            dob=timezone.now() - timedelta(days=365*20 + i*30),
            address=f'{i+1} Main Street, City, State, 500001',
            program='B.Tech',
            branch=departments[i],
            year=years[i],
            bloodGroup=blood_groups[i % len(blood_groups)],
            dayScholar=i % 2 == 0,
            fatherName=f'Father of {names[i]}',
            fatherOccupation='Engineer' if i % 2 == 0 else 'Business',
            fatherAadhar=f'{200000000000 + i + 1}',
            fatherNumber=f'90000000{i+1:02d}',
            motherName=f'Mother of {names[i]}',
            motherOccupation='Teacher' if i % 3 == 0 else 'Homemaker',
            motherAadhar=f'{300000000000 + i + 1}',
            motherNumber=f'91000000{i+1:02d}',
            gender=Gender.MALE if i % 2 == 0 else Gender.FEMALE,
            community=[Community.GENERAL, Community.OBC, Community.SC, Community.ST, Community.EWS][i % 5],
            xMarks=85 + (i % 15),
            xiiMarks=80 + (i % 20),
            jeeMains=150 + (i * 5),
            jeeAdvanced=100 + (i * 3) if i <= 10 else None,
            status=StudentStatus.PURSUING
        )
        student_list.append(student)
    
    print(f"Created {len(student_list)} students")
    return student_list

def create_subjects(faculty_list, hod_list):
    """Create subjects for CSE, ECE, EEE departments"""
    subjects = []
    
    # Combined faculty list including HODs
    all_faculty = faculty_list + [h.faculty for h in hod_list]
    
    # Subject data: (code, name, credits, type, dept, semester, faculty_index)
    subject_data = [
        # CSE Subjects
        ('CS101', 'Programming Fundamentals', 4, SubjectType.PCC, Department.CSE, 1, 0),
        ('CS201', 'Data Structures', 4, SubjectType.PCC, Department.CSE, 3, 1),
        ('CS301', 'Database Systems', 3, SubjectType.PCC, Department.CSE, 5, 2),
        ('CS401', 'Machine Learning', 3, SubjectType.DEC, Department.CSE, 7, 3),
        ('CS102', 'Digital Logic Design', 3, SubjectType.PCC, Department.CSE, 2, 10),  # HOD CSE
        
        # ECE Subjects  
        ('EC101', 'Basic Electronics', 4, SubjectType.PCC, Department.ECE, 1, 4),
        ('EC201', 'Signals and Systems', 4, SubjectType.PCC, Department.ECE, 3, 5),
        ('EC301', 'Communication Systems', 3, SubjectType.PCC, Department.ECE, 5, 6),
        ('EC102', 'Analog Circuits', 3, SubjectType.PCC, Department.ECE, 2, 11),  # HOD ECE
        
        # EEE Subjects
        ('EE101', 'Circuit Theory', 4, SubjectType.PCC, Department.EEE, 1, 7),
        ('EE201', 'Power Systems', 4, SubjectType.PCC, Department.EEE, 3, 8),
        ('EE301', 'Control Systems', 3, SubjectType.PCC, Department.EEE, 5, 9),
        ('EE102', 'Electrical Machines', 3, SubjectType.PCC, Department.EEE, 2, 12),  # HOD EEE
        
        # Common subjects
        ('MA101', 'Engineering Mathematics I', 4, SubjectType.BSC, None, 1, None),
        ('MA102', 'Engineering Mathematics II', 4, SubjectType.BSC, None, 2, None),
        ('PH101', 'Engineering Physics', 3, SubjectType.BSC, None, 1, None),
        ('CH101', 'Engineering Chemistry', 3, SubjectType.BSC, None, 2, None),
        ('HS101', 'English Communication', 2, SubjectType.HSC, None, 1, None),
    ]
    
    for code, name, credits, stype, dept, sem, fac_idx in subject_data:
        subject = Subject.objects.create(
            subjectCode=code,
            subjectName=name,
            credits=credits,
            subject_type=stype,
            department=dept,
            typical_semester=sem,
            current_faculty=all_faculty[fac_idx] if fac_idx is not None else None
        )
        subjects.append(subject)
        
        # Create faculty subject history for assigned subjects
        if fac_idx is not None:
            FacultySubjectHistory.objects.create(
                faculty=all_faculty[fac_idx],
                subject=subject,
                academic_year=2025,
                semester_type=SemesterType.ODD if sem % 2 == 1 else SemesterType.EVEN,
                is_current=True
            )
    
    print(f"Created {len(subjects)} subjects")
    return subjects

def create_mentorships(faculty_list, hod_list, student_list):
    """Create mentorship groups - any number of students per mentor"""
    mentorship_list = []
    
    # Get faculty by department
    cse_faculty = [f for f in faculty_list if f.department == Department.CSE] + [h.faculty for h in hod_list if h.department == Department.CSE]
    ece_faculty = [f for f in faculty_list if f.department == Department.ECE] + [h.faculty for h in hod_list if h.department == Department.ECE]
    eee_faculty = [f for f in faculty_list if f.department == Department.EEE] + [h.faculty for h in hod_list if h.department == Department.EEE]
    
    # Get students by department
    cse_students = [s for s in student_list if s.branch == Department.CSE]
    ece_students = [s for s in student_list if s.branch == Department.ECE]
    eee_students = [s for s in student_list if s.branch == Department.EEE]
    
    # Assign students to mentors in groups
    # CSE: 18 students across 5 faculty (4 faculty + 1 HOD)
    # faculty1: 5 students, faculty2: 4 students, faculty3: 4 students, faculty4: 3 students, HOD: 2 students
    cse_assignments = [
        (cse_faculty[0], cse_students[0:5]),   # 5 students
        (cse_faculty[1], cse_students[5:9]),   # 4 students
        (cse_faculty[2], cse_students[9:13]),  # 4 students
        (cse_faculty[3], cse_students[13:16]), # 3 students
        (cse_faculty[4], cse_students[16:18]), # 2 students (HOD)
    ]
    
    # ECE: 6 students across 4 faculty
    ece_assignments = [
        (ece_faculty[0], ece_students[0:2]),  # 2 students
        (ece_faculty[1], ece_students[2:4]),  # 2 students
        (ece_faculty[2], ece_students[4:5]),  # 1 student
        (ece_faculty[3], ece_students[5:6]),  # 1 student (HOD)
    ]
    
    # EEE: 6 students across 4 faculty
    eee_assignments = [
        (eee_faculty[0], eee_students[0:2]),  # 2 students
        (eee_faculty[1], eee_students[2:4]),  # 2 students
        (eee_faculty[2], eee_students[4:5]),  # 1 student
        (eee_faculty[3], eee_students[5:6]),  # 1 student (HOD)
    ]
    
    all_assignments = cse_assignments + ece_assignments + eee_assignments
    
    for faculty, students in all_assignments:
        for student in students:
            mentorship = Mentorship.objects.create(
                faculty=faculty,
                student=student,
                department=faculty.department,
                year=2025,
                semester=1 if student.year % 2 == 1 else 2,
                start_date=timezone.now() - timedelta(days=30),
                is_active=True,
                comments=[f'Mentorship assigned for {student.name}', 'Active mentorship']
            )
            mentorship_list.append(mentorship)
    
    print(f"Created {len(mentorship_list)} mentorships")
    return mentorship_list

def create_semesters_and_grades(student_list, subjects):
    """Create semester records and grades for students"""
    
    # Get subjects by department
    def get_dept_subjects(dept, sem):
        dept_subjects = [s for s in subjects if s.department == dept and s.typical_semester == sem]
        common_subjects = [s for s in subjects if s.department is None and s.typical_semester == sem]
        return dept_subjects + common_subjects
    
    grades = [GradePoint.EX, GradePoint.A, GradePoint.B, GradePoint.C, GradePoint.D, GradePoint.P]
    
    for student in student_list:
        student_year = student.year
        completed_sems = (student_year - 1) * 2 + 1  # e.g., year 2 = sems 1,2,3
        
        for sem_num in range(1, min(completed_sems + 1, 9)):
            sem_type = SemesterType.ODD if sem_num % 2 == 1 else SemesterType.EVEN
            academic_year = 2025 - (student_year - (sem_num + 1) // 2)
            
            semester = Semester.objects.create(
                student=student,
                semester=sem_num,
                semester_type=sem_type,
                academic_year=academic_year,
                sgpa=0.0,
                cgpa=0.0,
                total_credits=0
            )
            
            # Get subjects for this semester
            sem_subjects = get_dept_subjects(student.branch, sem_num)
            
            total_points = 0
            total_credits = 0
            
            for subject in sem_subjects:
                # Assign random grade (weighted towards higher grades)
                grade = random.choices(
                    grades,
                    weights=[15, 25, 25, 20, 10, 5],  # Weight distribution
                    k=1
                )[0]
                
                grade_point = GRADE_POINTS.get(grade, 0)
                is_passed = grade_point >= 5
                
                StudentSubject.objects.create(
                    student=student,
                    subject=subject,
                    semester=semester,
                    grade=grade,
                    grade_point=grade_point,
                    attempt_type=AttemptType.REGULAR,
                    exam_year=academic_year,
                    exam_month='May' if sem_type == SemesterType.EVEN else 'November',
                    passing_year=academic_year if is_passed else None,
                    is_passed=is_passed
                )
                
                total_points += grade_point * subject.credits
                total_credits += subject.credits
            
            # Update semester SGPA
            if total_credits > 0:
                semester.sgpa = round(total_points / total_credits, 2)
                semester.total_credits = total_credits
                semester.save()
        
        # Calculate CGPA for all semesters
        Semester.calculate_cgpa_for_student(student)
    
    print("Created semesters and grades for all students")

def create_meetings(mentorship_list):
    """Create group meetings for each mentorship group"""
    meetings = []
    
    # Group mentorships by faculty
    faculty_mentorships = {}
    for m in mentorship_list:
        if m.faculty.id not in faculty_mentorships:
            faculty_mentorships[m.faculty.id] = {
                'faculty': m.faculty, 
                'mentorships': [],
                'year': m.year,
                'semester': m.semester
            }
        faculty_mentorships[m.faculty.id]['mentorships'].append(m)
    
    for fac_id, data in faculty_mentorships.items():
        faculty = data['faculty']
        mentorships = data['mentorships']
        
        # Create 2 group meetings per mentoring group
        for meeting_num in range(1, 3):
            meeting_date = timezone.now() - timedelta(days=30 * meeting_num)
            
            # Create group meeting
            group_meeting = GroupMeeting.objects.create(
                faculty=faculty,
                department=faculty.department,
                year=data['year'],
                semester=data['semester'],
                date=meeting_date.date(),
                time=meeting_date.time(),
                description=f'Monthly review meeting {meeting_num} with {len(mentorships)} students',
                status=MeetingStatus.COMPLETED if meeting_num == 2 else MeetingStatus.UPCOMING
            )
            meetings.append(group_meeting)
            
            # Also create individual Meeting records for each student in the group
            for m in mentorships:
                Meeting.objects.create(
                    mentorship=m,
                    date=meeting_date.date(),
                    time=meeting_date.time(),
                    description=f'Group meeting {meeting_num}',
                    facultyReview=f'Student attended the group meeting' if meeting_num == 2 else None,
                    status=MeetingStatus.COMPLETED if meeting_num == 2 else MeetingStatus.UPCOMING
                )
    
    print(f"Created {len(meetings)} group meetings")
    return meetings

def update_year_toppers():
    """Calculate and update year toppers for each department"""
    for dept in [Department.CSE, Department.ECE, Department.EEE]:
        YearTopper.update_toppers(dept)
    print("Updated year toppers")

def main():
    """Main function to seed the database"""
    print("="*50)
    print("Starting database seeding...")
    print("="*50)
    
    # Clear existing data
    clear_database()
    
    # Create users
    users = create_users()
    
    # Create profiles
    faculty_list = create_faculty(users)
    hod_list = create_hods(users)
    admin_list = create_admins(users)
    student_list = create_students(users)
    
    # Create subjects
    subjects = create_subjects(faculty_list, hod_list)
    
    # Create mentorships
    mentorship_list = create_mentorships(faculty_list, hod_list, student_list)
    
    # Create semesters and grades
    create_semesters_and_grades(student_list, subjects)
    
    # Create meetings
    create_meetings(mentorship_list)
    
    # Update year toppers
    update_year_toppers()
    
    print("="*50)
    print("Database seeding completed!")
    print("="*50)
    print("\nTest Credentials:")
    print("-" * 30)
    print("HODs: hod1@college.edu, hod2@college.edu, hod3@college.edu")
    print("Faculty: faculty1@college.edu to faculty10@college.edu")
    print("Admin: admin1@college.edu")
    print("Students: student1@college.edu to student30@college.edu")
    print("  - CSE: student1-18 (6 students year 3, 4 year 4, 4 year 2, 4 year 1)")
    print("  - ECE: student19-24 (mixed years)")
    print("  - EEE: student25-30 (mixed years)")
    print("Password for all: password")
    print("-" * 30)

if __name__ == '__main__':
    main()
