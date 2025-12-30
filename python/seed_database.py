"""
Seed database with test data:
- 20 students
- 5 faculty
- 3 HODs
- 2 admins
- All related tables populated
- Password for all users: 'password'
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
    User, Faculty, HOD, Admin, Student, Mentorship, Meeting,
    Internship, Project, CoCurricular, Subject, Semester, StudentSubject,
    CareerDetails, PersonalProblem, Request,
    UserRole, AccountStatus, Gender, Community, StudentStatus,
    MeetingStatus, RequestStatus, RequestType
)

def hash_password(password):
    """Hash password using bcrypt"""
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def create_users():
    """Create all users with hashed password"""
    hashed_pw = hash_password('password')
    users = []
    
    # 5 Faculty users
    for i in range(1, 6):
        user = User.objects.create(
            email=f'faculty{i}@college.edu',
            password=hashed_pw,
            role=UserRole.FACULTY,
            accountStatus=AccountStatus.ACTIVE
        )
        users.append(('faculty', user))
    
    # 3 HOD users (separate from faculty users)
    for i in range(1, 4):
        user = User.objects.create(
            email=f'hod{i}@college.edu',
            password=hashed_pw,
            role=UserRole.HOD,
            accountStatus=AccountStatus.ACTIVE
        )
        users.append(('hod', user))
    
    # 2 Admin users
    for i in range(1, 3):
        user = User.objects.create(
            email=f'admin{i}@college.edu',
            password=hashed_pw,
            role=UserRole.ADMIN,
            accountStatus=AccountStatus.ACTIVE
        )
        users.append(('admin', user))
    
    # 20 Student users
    for i in range(1, 21):
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
    """Create 5 faculty members"""
    departments = ['Computer Science', 'Electronics', 'Mechanical', 'Civil', 'Electrical']
    faculty_users = [u for t, u in users if t == 'faculty']
    faculty_list = []
    
    for i, user in enumerate(faculty_users, 1):
        faculty = Faculty.objects.create(
            user=user,
            employeeId=f'FAC{i:03d}',
            name=f'Dr. Faculty Member {i}',
            phone1=f'98765432{i:02d}',
            phone2=f'91234567{i:02d}' if i % 2 == 0 else None,
            personalEmail=f'faculty{i}.personal@gmail.com',
            collegeEmail=f'faculty{i}@college.edu',
            department=departments[i-1],
            btech='IIT Delhi' if i <= 2 else 'NIT Trichy',
            mtech='IIT Bombay' if i <= 3 else 'IIT Madras',
            phd='IISc Bangalore' if i <= 2 else None,
            office=f'Room {100 + i}',
            officeHours='10:00 AM - 5:00 PM'
        )
        faculty_list.append(faculty)
    
    print(f"Created {len(faculty_list)} faculty members")
    return faculty_list

def create_hods(users, faculty_list):
    """Create 3 HODs (linked to first 3 faculty)"""
    hod_users = [u for t, u in users if t == 'hod']
    hod_list = []
    departments = ['Computer Science', 'Electronics', 'Mechanical']
    
    for i, user in enumerate(hod_users):
        # Create a faculty record for the HOD
        hod_faculty = Faculty.objects.create(
            user=user,
            employeeId=f'HOD{i+1:03d}',
            name=f'Prof. HOD {i+1}',
            phone1=f'98000000{i+1:02d}',
            personalEmail=f'hod{i+1}.personal@gmail.com',
            collegeEmail=f'hod{i+1}@college.edu',
            department=departments[i],
            btech='IIT Kanpur',
            mtech='IIT Delhi',
            phd='Stanford University',
            office=f'HOD Office {i+1}',
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
    """Create 2 admins"""
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
            designation='System Administrator' if i == 1 else 'Data Manager',
            office=f'Admin Block Room {i}'
        )
        admin_list.append(admin)
    
    print(f"Created {len(admin_list)} admins")
    return admin_list

def create_students(users):
    """Create 20 students"""
    student_users = [u for t, u in users if t == 'student']
    student_list = []
    branches = ['CSE', 'ECE', 'ME', 'CE', 'EE']
    blood_groups = ['A+', 'B+', 'O+', 'AB+', 'A-', 'B-', 'O-']
    
    for i, user in enumerate(student_users, 1):
        student = Student.objects.create(
            user=user,
            name=f'Student Name {i}',
            aadhar=f'{100000000000 + i}',
            phoneNumber=f'70000000{i:02d}',
            phoneCode=91,
            registrationNumber=2021000 + i,
            rollNumber=21000 + i,
            passPort='Not Available',
            emergencyContact=f'80000000{i:02d}',
            personalEmail=f'student{i}.personal@gmail.com',
            collegeEmail=f'student{i}@college.edu',
            dob=timezone.now() - timedelta(days=365*20 + i*30),
            address=f'{i} Main Street, City {i}, State, 500001',
            program='B.Tech',
            branch=branches[(i-1) % len(branches)],
            bloodGroup=blood_groups[(i-1) % len(blood_groups)],
            dayScholar=i % 2 == 0,
            fatherName=f'Father of Student {i}',
            fatherOccupation='Engineer' if i % 2 == 0 else 'Business',
            fatherAadhar=f'{200000000000 + i}',
            fatherNumber=f'90000000{i:02d}',
            motherName=f'Mother of Student {i}',
            motherOccupation='Teacher' if i % 3 == 0 else 'Homemaker',
            motherAadhar=f'{300000000000 + i}',
            motherNumber=f'91000000{i:02d}',
            gender=Gender.MALE if i % 2 == 1 else Gender.FEMALE,
            community=[Community.GENERAL, Community.OBC, Community.SC, Community.ST, Community.EWS][(i-1) % 5],
            xMarks=85 + (i % 15),
            xiiMarks=80 + (i % 20),
            jeeMains=150 + (i * 5),
            jeeAdvanced=100 + (i * 3) if i <= 10 else None,
            status=StudentStatus.PURSUING
        )
        student_list.append(student)
    
    print(f"Created {len(student_list)} students")
    return student_list

def create_mentorships(faculty_list, student_list):
    """Create mentorships - assign students to faculty"""
    mentorship_list = []
    
    # Distribute 20 students among 5 faculty (4 students each)
    for i, student in enumerate(student_list):
        faculty = faculty_list[i % len(faculty_list)]
        mentorship = Mentorship.objects.create(
            faculty=faculty,
            student=student,
            department=faculty.department,
            year=2024,
            semester=1 if i < 10 else 2,
            start_date=timezone.now() - timedelta(days=90),
            is_active=True,
            comments=['Initial mentorship assigned', 'Student shows good progress']
        )
        mentorship_list.append(mentorship)
    
    # Create some past mentorships for variety
    for i in range(5):
        student = student_list[i]
        # Assign a different faculty as past mentor
        past_faculty = faculty_list[(i + 2) % len(faculty_list)]
        past_mentorship = Mentorship.objects.create(
            faculty=past_faculty,
            student=student,
            department=past_faculty.department,
            year=2023,
            semester=2,
            start_date=timezone.now() - timedelta(days=365),
            end_date=timezone.now() - timedelta(days=180),
            is_active=False,
            comments=['Previous year mentorship', 'Completed successfully']
        )
        mentorship_list.append(past_mentorship)
    
    print(f"Created {len(mentorship_list)} mentorships")
    return mentorship_list

def create_meetings(mentorship_list):
    """Create meetings for mentorships"""
    meeting_list = []
    
    for mentorship in mentorship_list[:15]:  # Create meetings for first 15 mentorships
        # Past meeting (completed)
        meeting1 = Meeting.objects.create(
            mentorship=mentorship,
            date=timezone.now().date() - timedelta(days=30),
            time=datetime.strptime('10:00', '%H:%M').time(),
            description='Monthly progress review',
            facultyReview='Student is making good progress. Keep up the good work!',
            status=MeetingStatus.COMPLETED
        )
        meeting_list.append(meeting1)
        
        # Upcoming meeting
        meeting2 = Meeting.objects.create(
            mentorship=mentorship,
            date=timezone.now().date() + timedelta(days=7),
            time=datetime.strptime('14:00', '%H:%M').time(),
            description='Next month planning session',
            status=MeetingStatus.UPCOMING
        )
        meeting_list.append(meeting2)
    
    print(f"Created {len(meeting_list)} meetings")
    return meeting_list

def create_subjects():
    """Create subjects"""
    subjects_data = [
        ('CS101', 'Data Structures', 4),
        ('CS102', 'Algorithms', 4),
        ('CS103', 'Database Systems', 3),
        ('CS104', 'Operating Systems', 4),
        ('CS105', 'Computer Networks', 3),
        ('MA101', 'Engineering Mathematics I', 4),
        ('MA102', 'Engineering Mathematics II', 4),
        ('PH101', 'Engineering Physics', 3),
        ('CH101', 'Engineering Chemistry', 3),
        ('EC101', 'Basic Electronics', 3),
    ]
    
    subject_list = []
    for code, name, credits in subjects_data:
        subject = Subject.objects.create(
            subjectCode=code,
            subjectName=name,
            credits=credits
        )
        subject_list.append(subject)
    
    print(f"Created {len(subject_list)} subjects")
    return subject_list

def create_semesters_and_grades(student_list, subject_list):
    """Create semesters and student subject grades"""
    semester_list = []
    grade_list = []
    grades = ['S', 'A', 'B', 'C', 'D', 'E']
    
    for student in student_list:
        # Create 2 semesters for each student
        for sem_num in [1, 2]:
            semester = Semester.objects.create(
                student=student,
                semester=sem_num,
                sgpa=7.0 + random.random() * 3,
                cgpa=7.0 + random.random() * 3
            )
            semester_list.append(semester)
            
            # Assign grades for 5 subjects per semester
            for j, subject in enumerate(subject_list[:5]):
                grade = StudentSubject.objects.create(
                    student=student,
                    subject=subject,
                    semester=semester,
                    grade=grades[j % len(grades)]
                )
                grade_list.append(grade)
    
    print(f"Created {len(semester_list)} semesters and {len(grade_list)} grades")
    return semester_list, grade_list

def create_internships(student_list):
    """Create internships"""
    internship_list = []
    companies = ['Google', 'Microsoft', 'Amazon', 'Meta', 'Apple']
    
    for i in range(5):
        internship = Internship.objects.create(
            semester=i % 2 + 1,
            type='Summer Internship' if i < 3 else 'Winter Internship',
            organisation=companies[i],
            stipend=50000 + i * 10000,
            duration='2 months',
            location='Bangalore' if i < 3 else 'Hyderabad'
        )
        # Assign 4 students to each internship
        internship.students.set(student_list[i*4:(i+1)*4])
        internship_list.append(internship)
    
    print(f"Created {len(internship_list)} internships")
    return internship_list

def create_projects(student_list, faculty_list):
    """Create projects"""
    project_list = []
    project_titles = [
        ('AI Chatbot', ['Python', 'TensorFlow', 'NLP']),
        ('E-commerce Platform', ['React', 'Node.js', 'MongoDB']),
        ('IoT Home Automation', ['Arduino', 'Python', 'MQTT']),
        ('Blockchain Voting', ['Solidity', 'Ethereum', 'React']),
        ('ML Image Classifier', ['Python', 'PyTorch', 'OpenCV']),
    ]
    
    for i, (title, techs) in enumerate(project_titles):
        project = Project.objects.create(
            semester=i % 2 + 1,
            title=title,
            description=f'This is a detailed description for the project: {title}. It involves cutting-edge technologies.',
            technologies=techs,
            mentor=faculty_list[i % len(faculty_list)]
        )
        # Assign 4 students to each project
        project.students.set(student_list[i*4:(i+1)*4])
        project_list.append(project)
    
    print(f"Created {len(project_list)} projects")
    return project_list

def create_co_curriculars(student_list):
    """Create co-curricular activities"""
    activities = []
    events = [
        ('Tech Fest 2024', 'First Prize in Coding Competition'),
        ('Sports Day', 'Gold Medal in Athletics'),
        ('Cultural Festival', 'Best Performance Award'),
        ('Hackathon', 'Runner Up'),
        ('Paper Presentation', 'Best Paper Award'),
    ]
    
    for i, (event, award) in enumerate(events):
        activity = CoCurricular.objects.create(
            sem=i % 2 + 1,
            date=timezone.now() - timedelta(days=30*i),
            eventDetails=f'{event} - Annual college event',
            participationDetails=f'Participated in {event} organized by the college',
            awards=award
        )
        # Assign 4 students to each activity
        activity.students.set(student_list[i*4:(i+1)*4])
        activities.append(activity)
    
    print(f"Created {len(activities)} co-curricular activities")
    return activities

def create_career_details(student_list):
    """Create career details for students"""
    career_list = []
    
    for i, student in enumerate(student_list):
        career = CareerDetails.objects.create(
            student=student,
            hobbies=['Reading', 'Coding', 'Music'][:((i % 3) + 1)],
            strengths=['Problem Solving', 'Communication', 'Leadership'][:((i % 3) + 1)],
            areasToImprove=['Public Speaking', 'Time Management'][:((i % 2) + 1)],
            core=['VLSI', 'Embedded Systems'] if i % 3 == 0 else [],
            it=['Web Development', 'Machine Learning', 'Cloud Computing'][:((i % 3) + 1)],
            higherEducation=['MS in USA', 'MBA'] if i % 4 == 0 else [],
            startup=['EdTech', 'FinTech'] if i % 5 == 0 else [],
            familyBusiness=['Manufacturing'] if i % 10 == 0 else [],
            otherInterests=['Research', 'Teaching'] if i % 2 == 0 else []
        )
        career_list.append(career)
    
    print(f"Created {len(career_list)} career details")
    return career_list

def create_personal_problems(student_list):
    """Create personal problems for students"""
    problem_list = []
    
    for i, student in enumerate(student_list):
        problem = PersonalProblem.objects.create(
            student=student,
            stress=i % 3 == 0,
            anger=i % 5 == 0,
            examinationAnxiety=i % 2 == 0,
            timeManagementProblem=i % 4 == 0,
            procrastination=i % 3 == 1,
            worriesAboutFuture=i % 2 == 1,
            fearOfPublicSpeaking=i % 4 == 1
        )
        problem_list.append(problem)
    
    print(f"Created {len(problem_list)} personal problem records")
    return problem_list

def create_requests(student_list, faculty_list, internship_list, project_list):
    """Create requests"""
    request_list = []
    
    # Internship requests
    for i in range(5):
        internship_ct = ContentType.objects.get_for_model(Internship)
        request = Request.objects.create(
            student=student_list[i],
            assigned_to=faculty_list[i % len(faculty_list)],
            type=RequestType.INTERNSHIP,
            content_type=internship_ct,
            object_id=internship_list[i % len(internship_list)].id,
            status=[RequestStatus.PENDING, RequestStatus.APPROVED, RequestStatus.REJECTED][i % 3],
            remarks='Please approve my internship request' if i % 3 == 0 else 'Request processed',
            feedback='Approved. Good luck!' if i % 3 == 1 else None
        )
        request_list.append(request)
    
    # Project requests
    for i in range(5):
        project_ct = ContentType.objects.get_for_model(Project)
        request = Request.objects.create(
            student=student_list[i + 5],
            assigned_to=faculty_list[i % len(faculty_list)],
            type=RequestType.PROJECT,
            content_type=project_ct,
            object_id=project_list[i % len(project_list)].id,
            status=[RequestStatus.PENDING, RequestStatus.APPROVED, RequestStatus.REJECTED][i % 3],
            remarks='Project submission for review',
            feedback='Great work!' if i % 3 == 1 else None
        )
        request_list.append(request)
    
    # Performance requests (no target)
    for i in range(5):
        request = Request.objects.create(
            student=student_list[i + 10],
            assigned_to=faculty_list[i % len(faculty_list)],
            type=RequestType.PERFORMANCE,
            status=RequestStatus.PENDING,
            remarks='Request for performance review'
        )
        request_list.append(request)
    
    print(f"Created {len(request_list)} requests")
    return request_list

def seed_database():
    """Main function to seed all data"""
    print("\n" + "="*50)
    print("Starting database seeding...")
    print("="*50 + "\n")
    
    # Clear existing data
    print("Clearing existing data...")
    Request.objects.all().delete()
    PersonalProblem.objects.all().delete()
    CareerDetails.objects.all().delete()
    StudentSubject.objects.all().delete()
    Semester.objects.all().delete()
    CoCurricular.objects.all().delete()
    Project.objects.all().delete()
    Internship.objects.all().delete()
    Subject.objects.all().delete()
    Meeting.objects.all().delete()
    Mentorship.objects.all().delete()
    HOD.objects.all().delete()
    Admin.objects.all().delete()
    Student.objects.all().delete()
    Faculty.objects.all().delete()
    User.objects.all().delete()
    print("Cleared!\n")
    
    # Create all data
    users = create_users()
    faculty_list = create_faculty(users)
    hod_list = create_hods(users, faculty_list)
    admin_list = create_admins(users)
    student_list = create_students(users)
    mentorship_list = create_mentorships(faculty_list, student_list)
    meeting_list = create_meetings(mentorship_list)
    subject_list = create_subjects()
    semester_list, grade_list = create_semesters_and_grades(student_list, subject_list)
    internship_list = create_internships(student_list)
    project_list = create_projects(student_list, faculty_list)
    activities = create_co_curriculars(student_list)
    career_list = create_career_details(student_list)
    problem_list = create_personal_problems(student_list)
    request_list = create_requests(student_list, faculty_list, internship_list, project_list)
    
    print("\n" + "="*50)
    print("Database seeding complete!")
    print("="*50)
    print("\nSummary:")
    print(f"  - Users: {User.objects.count()}")
    print(f"  - Faculty: {Faculty.objects.count()}")
    print(f"  - HODs: {HOD.objects.count()}")
    print(f"  - Admins: {Admin.objects.count()}")
    print(f"  - Students: {Student.objects.count()}")
    print(f"  - Mentorships: {Mentorship.objects.count()}")
    print(f"  - Meetings: {Meeting.objects.count()}")
    print(f"  - Subjects: {Subject.objects.count()}")
    print(f"  - Semesters: {Semester.objects.count()}")
    print(f"  - Student Subjects: {StudentSubject.objects.count()}")
    print(f"  - Internships: {Internship.objects.count()}")
    print(f"  - Projects: {Project.objects.count()}")
    print(f"  - Co-curriculars: {CoCurricular.objects.count()}")
    print(f"  - Career Details: {CareerDetails.objects.count()}")
    print(f"  - Personal Problems: {PersonalProblem.objects.count()}")
    print(f"  - Requests: {Request.objects.count()}")
    print("\nAll users have password: 'password'")

if __name__ == '__main__':
    seed_database()
