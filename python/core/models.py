import uuid
from django.db import models
from django.contrib.postgres.fields import ArrayField
from django.contrib.contenttypes.fields import GenericForeignKey
from django.contrib.contenttypes.models import ContentType


# --- Enums as Django choices ---
class UserRole(models.TextChoices):
    STUDENT = 'STUDENT'
    FACULTY = 'FACULTY'
    HOD = 'HOD'
    ADMIN = 'ADMIN'


class RequestStatus(models.TextChoices):
    PENDING = 'PENDING'
    APPROVED = 'APPROVED'
    REJECTED = 'REJECTED'


class RequestType(models.TextChoices):
    INTERNSHIP = 'INTERNSHIP'
    PROJECT = 'PROJECT'
    PERFORMANCE = 'PERFORMANCE'
    CO_CURRICULAR = 'CO_CURRICULAR'
    DELETE_INTERNSHIP = 'DELETE_INTERNSHIP'
    DELETE_PROJECT = 'DELETE_PROJECT'
    MEETING_REQUEST = 'MEETING_REQUEST'


class StudentStatus(models.TextChoices):
    PURSUING = 'PURSUING'
    PASSEDOUT = 'PASSEDOUT'


class Gender(models.TextChoices):
    MALE = 'Male'
    FEMALE = 'Female'


class Community(models.TextChoices):
    GENERAL = 'General'
    OBC = 'OBC'
    SC = 'SC'
    ST = 'ST'
    EWS = 'EWS'


class MeetingStatus(models.TextChoices):
    UPCOMING = 'UPCOMING'
    YET_TO_DONE = 'YET_TO_DONE'
    COMPLETED = 'COMPLETED'
    REQUESTED = 'REQUESTED'


class AccountStatus(models.TextChoices):
    ACTIVE = 'ACTIVE'
    INACTIVE = 'INACTIVE'
    SUSPENDED = 'SUSPENDED'


class Department(models.TextChoices):
    CSE = 'CSE', 'Computer Science & Engineering'
    ECE = 'ECE', 'Electronics & Communication Engineering'
    EEE = 'EEE', 'Electrical & Electronics Engineering'
    MECH = 'MECH', 'Mechanical Engineering'
    CIVIL = 'CIVIL', 'Civil Engineering'
    BIOTECH = 'BIO-TECH', 'Biotechnology'
    MME = 'MME', 'Metallurgical & Materials Engineering'
    CHEM = 'CHEM', 'Chemical Engineering'


class Programme(models.TextChoices):
    BTECH = 'B.Tech', 'Bachelor of Technology'
    MTECH = 'M.Tech', 'Master of Technology'
    PHD = 'PhD', 'Doctor of Philosophy'


# New Enums for Subject and Grade System
class SubjectType(models.TextChoices):
    BSC = 'BSC', 'Basic Science Core'
    ESC = 'ESC', 'Engineering Science Core'
    HSC = 'HSC', 'Humanities and Social Science Core'
    PCC = 'PCC', 'Program Core Courses'
    DEC = 'DEC', 'Departmental Elective Courses'
    OPC = 'OPC', 'Open Elective Courses'
    MSC = 'MSC', 'EAA: Games and Sports'
    MOE = 'MOE', 'MOOCs'
    PRC = 'PRC', 'Program Major Project/Skill Development/Foreign Languages'


class SemesterType(models.TextChoices):
    ODD = 'ODD', 'Odd Semester (1, 3, 5, 7)'
    EVEN = 'EVEN', 'Even Semester (2, 4, 6, 8)'


class AttemptType(models.TextChoices):
    REGULAR = 'REGULAR', 'Regular Exam'
    BACKLOG = 'BACKLOG', 'Backlog Exam'
    MAKEUP = 'MAKEUP', 'Makeup Exam'


class GradePoint(models.TextChoices):
    EX = 'EX', 'Excellent (10)'
    A = 'A', 'A Grade (9)'
    B = 'B', 'B Grade (8)'
    C = 'C', 'C Grade (7)'
    D = 'D', 'D Grade (6)'
    P = 'P', 'Pass (5)'
    F = 'F', 'Fail (0)'
    X = 'X', 'Absent (0)'


# Grade Point Mapping
GRADE_POINTS = {
    'EX': 10,
    'A': 9,
    'B': 8,
    'C': 7,
    'D': 6,
    'P': 5,
    'F': 0,
    'X': 0,
}


# --- Models ---
class User(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    email = models.EmailField(unique=True)
    password = models.CharField(max_length=255)
    role = models.CharField(max_length=20, choices=UserRole.choices)
    profilePicture = models.URLField(null=True, blank=True)
    accountStatus = models.CharField(max_length=20, choices=AccountStatus.choices, default=AccountStatus.ACTIVE)
    createdAt = models.DateTimeField(auto_now_add=True)
    updatedAt = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.email
    class Meta:
        db_table = 'users'


class Faculty(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='faculty', db_column='userId')
    employeeId = models.CharField(max_length=50, unique=True)
    name = models.CharField(max_length=255)
    phone1 = models.CharField(max_length=20)
    phone2 = models.CharField(max_length=20, null=True, blank=True)
    personalEmail = models.EmailField(unique=True)
    collegeEmail = models.EmailField(unique=True)
    department = models.CharField(max_length=20, choices=Department.choices)
    isActive = models.BooleanField(default=True)
    startDate = models.DateTimeField(null=True, blank=True)
    endDate = models.DateTimeField(null=True, blank=True)
    btech = models.CharField(max_length=255, null=True, blank=True)
    mtech = models.CharField(max_length=255, null=True, blank=True)
    phd = models.CharField(max_length=255, null=True, blank=True)
    office = models.CharField(max_length=255)
    officeHours = models.CharField(max_length=255)
    createdAt = models.DateTimeField(auto_now_add=True)
    updatedAt = models.DateTimeField(auto_now=True)

    @property
    def current_mentorships(self):
        """Returns all current/active mentorships for this faculty"""
        return self.mentorships.filter(is_active=True)
    
    @property
    def past_mentorships(self):
        """Returns all past/inactive mentorships for this faculty"""
        return self.mentorships.filter(is_active=False)

    def __str__(self):
        return self.name
    class Meta:
        db_table = 'faculty'


class HOD(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='hod', db_column='userId')
    faculty = models.OneToOneField(Faculty, on_delete=models.CASCADE, related_name='as_hod', db_column='facultyId')
    department = models.CharField(max_length=20, choices=Department.choices)
    startDate = models.DateTimeField()
    endDate = models.DateTimeField(null=True, blank=True)
    createdAt = models.DateTimeField(auto_now_add=True)
    updatedAt = models.DateTimeField(auto_now=True)
    class Meta:
        db_table = 'hods'


class Admin(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='admin', db_column='userId')
    employeeId = models.CharField(max_length=50, unique=True)
    name = models.CharField(max_length=255)
    phone = models.CharField(max_length=50)
    personalEmail = models.EmailField(unique=True)
    collegeEmail = models.EmailField(unique=True)
    department = models.CharField(max_length=20, choices=Department.choices, null=True, blank=True)
    designation = models.CharField(max_length=255)
    office = models.CharField(max_length=255, null=True, blank=True)
    createdAt = models.DateTimeField(auto_now_add=True)
    updatedAt = models.DateTimeField(auto_now=True)
    class Meta:
        db_table = 'admins'


class Student(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='student', db_column='userId')
    name = models.CharField(max_length=255)
    aadhar = models.CharField(max_length=12, unique=True)
    phoneNumber = models.CharField(max_length=20)
    phoneCode = models.IntegerField()
    registrationNumber = models.IntegerField(unique=True)
    rollNumber = models.IntegerField(unique=True)
    passPort = models.CharField(max_length=255, default='Not Available')
    emergencyContact = models.CharField(max_length=20)
    personalEmail = models.EmailField(unique=True)
    collegeEmail = models.EmailField(unique=True)
    dob = models.DateTimeField()
    address = models.TextField()
    program = models.CharField(max_length=20, choices=Programme.choices)
    branch = models.CharField(max_length=20, choices=Department.choices)
    year = models.IntegerField(default=1)
    bloodGroup = models.CharField(max_length=10)
    dayScholar = models.BooleanField()
    fatherName = models.CharField(max_length=255)
    fatherOccupation = models.CharField(max_length=255, null=True, blank=True)
    fatherAadhar = models.CharField(max_length=12, null=True, blank=True)
    fatherNumber = models.CharField(max_length=20, null=True, blank=True)
    motherName = models.CharField(max_length=255)
    motherOccupation = models.CharField(max_length=255, null=True, blank=True)
    motherAadhar = models.CharField(max_length=12, null=True, blank=True)
    motherNumber = models.CharField(max_length=20, null=True, blank=True)
    gender = models.CharField(max_length=10, choices=Gender.choices)
    community = models.CharField(max_length=10, choices=Community.choices)
    xMarks = models.IntegerField()
    xiiMarks = models.IntegerField()
    jeeMains = models.IntegerField()
    jeeAdvanced = models.IntegerField(null=True, blank=True)
    status = models.CharField(max_length=20, choices=StudentStatus.choices, default=StudentStatus.PURSUING)
    createdAt = models.DateTimeField(auto_now_add=True)
    updatedAt = models.DateTimeField(auto_now=True)
    
    @property
    def current_mentor(self):
        mentorship = self.mentorships.filter(is_active=True).first()
        return mentorship.faculty if mentorship else None
    
    @property
    def past_mentors(self):
        return Faculty.objects.filter(mentorships__student=self, mentorships__is_active=False).distinct()
    
    class Meta:
        db_table = 'students'


class Mentorship(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    faculty = models.ForeignKey(Faculty, on_delete=models.CASCADE, related_name='mentorships', db_column='facultyId')
    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='mentorships', db_column='studentId')
    department = models.CharField(max_length=20, choices=Department.choices)
    year = models.IntegerField()
    semester = models.IntegerField()
    start_date = models.DateTimeField()
    end_date = models.DateTimeField(null=True, blank=True)
    is_active = models.BooleanField(default=True)
    comments = ArrayField(models.TextField(), default=list, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'mentorships'
        unique_together = [['faculty', 'student', 'year', 'semester']]
        indexes = [
            models.Index(fields=['faculty', 'is_active']),
            models.Index(fields=['student', 'is_active']),
            models.Index(fields=['department']),
        ]


# Legacy Meeting model (kept for backward compatibility - to be deprecated)
class Meeting(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    mentorship = models.ForeignKey(Mentorship, on_delete=models.CASCADE, related_name='meetings', db_column='mentorshipId')
    date = models.DateField()
    time = models.TimeField()
    description = models.TextField(null=True, blank=True)
    facultyReview = models.TextField(null=True, blank=True)
    status = models.CharField(max_length=20, choices=MeetingStatus.choices, default=MeetingStatus.UPCOMING)
    createdAt = models.DateTimeField(auto_now_add=True)
    updatedAt = models.DateTimeField(auto_now=True)
    class Meta:
        db_table = 'meetings'


# New Group Meeting model - One meeting for all students in a faculty's group
class GroupMeeting(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    faculty = models.ForeignKey(Faculty, on_delete=models.CASCADE, related_name='group_meetings', db_column='facultyId')
    department = models.CharField(max_length=20, choices=Department.choices, null=True, blank=True)
    year = models.IntegerField()  # Academic year
    semester = models.IntegerField()  # Semester (1-8)
    date = models.DateField()
    time = models.TimeField()
    description = models.TextField(null=True, blank=True)
    status = models.CharField(max_length=20, choices=MeetingStatus.choices, default=MeetingStatus.UPCOMING)
    createdAt = models.DateTimeField(auto_now_add=True)
    updatedAt = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'group_meetings'
        indexes = [
            models.Index(fields=['faculty', 'year', 'semester']),
            models.Index(fields=['date', 'status']),
        ]


# Individual student review for a group meeting
class GroupMeetingStudent(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    group_meeting = models.ForeignKey(GroupMeeting, on_delete=models.CASCADE, related_name='student_reviews', db_column='groupMeetingId')
    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='group_meeting_reviews', db_column='studentId')
    review = models.TextField(null=True, blank=True)
    attended = models.BooleanField(default=True)  # Track attendance
    createdAt = models.DateTimeField(auto_now_add=True)
    updatedAt = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'group_meeting_students'
        unique_together = [['group_meeting', 'student']]


class MeetingStudentReview(models.Model):
    """Individual review for each student in a group meeting - Legacy model"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    meeting = models.ForeignKey(Meeting, on_delete=models.CASCADE, related_name='student_reviews', db_column='meetingId')
    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='meeting_reviews', db_column='studentId')
    review = models.TextField(null=True, blank=True)
    createdAt = models.DateTimeField(auto_now_add=True)
    updatedAt = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'meeting_student_reviews'
        unique_together = [['meeting', 'student']]


class Internship(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='internships', db_column='studentId', null=True, blank=True)
    semester = models.IntegerField()
    type = models.CharField(max_length=255)
    organisation = models.CharField(max_length=255)
    stipend = models.IntegerField()
    duration = models.CharField(max_length=255)
    location = models.CharField(max_length=255)
    class Meta:
        db_table = 'internships'


class Project(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='projects', db_column='studentId', null=True, blank=True)
    semester = models.IntegerField()
    title = models.CharField(max_length=255)
    description = models.TextField()
    technologies = ArrayField(models.CharField(max_length=100), default=list, blank=True)
    mentor = models.ForeignKey(Faculty, on_delete=models.SET_NULL, null=True, blank=True, related_name='projects_mentored')
    class Meta:
        db_table = 'projects'


class CoCurricular(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='co_curriculars', db_column='studentId', null=True, blank=True)
    sem = models.IntegerField()
    date = models.DateField()
    eventDetails = models.TextField()
    participationDetails = models.TextField()
    awards = models.CharField(max_length=255)
    class Meta:
        db_table = 'co_curriculars'


class Subject(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    subjectName = models.CharField(max_length=255)
    subjectCode = models.CharField(max_length=50, unique=True)
    credits = models.IntegerField(default=3)
    subject_type = models.CharField(max_length=10, choices=SubjectType.choices, null=True, blank=True)
    department = models.CharField(max_length=20, choices=Department.choices, null=True, blank=True)
    # For which semester this subject is typically offered (1-8)
    typical_semester = models.IntegerField(null=True, blank=True)
    # Faculty currently teaching this subject (one faculty per subject at a time)
    current_faculty = models.ForeignKey(
        'Faculty', 
        on_delete=models.SET_NULL,
        related_name='current_subjects',
        null=True,
        blank=True
    )
    # Faculty who taught this subject in the past
    past_faculty = models.ManyToManyField(
        'Faculty',
        related_name='past_subjects',
        blank=True
    )
    createdAt = models.DateTimeField(auto_now_add=True, null=True, blank=True)
    updatedAt = models.DateTimeField(auto_now=True, null=True, blank=True)
    
    class Meta:
        db_table = 'subjects'
    
    def __str__(self):
        return f"{self.subjectCode} - {self.subjectName}"


class Semester(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='semesters')
    semester = models.IntegerField()
    semester_type = models.CharField(max_length=10, choices=SemesterType.choices, null=True, blank=True)
    academic_year = models.IntegerField(null=True, blank=True)  # e.g., 2024 for 2024-25
    sgpa = models.FloatField(default=0.0)
    cgpa = models.FloatField(default=0.0)
    total_credits = models.IntegerField(default=0)
    createdAt = models.DateTimeField(auto_now_add=True, null=True, blank=True)
    updatedAt = models.DateTimeField(auto_now=True, null=True, blank=True)
    
    class Meta:
        db_table = 'semesters'
        unique_together = [['student', 'semester']]
    
    def calculate_sgpa(self):
        """Calculate SGPA for this semester: Σ(grade_point * credits) / Σ(total_credits)
        Note: SGPA uses total credits, not just passed credits (even F/X grades count)"""
        subject_grades = self.subject_grades.all()
        total_points = 0
        total_credits = 0
        
        for sg in subject_grades:
            grade_point = GRADE_POINTS.get(sg.grade.upper(), 0)
            credits = sg.subject.credits
            total_points += grade_point * credits
            total_credits += credits
        
        self.total_credits = total_credits
        self.sgpa = round(total_points / total_credits, 2) if total_credits > 0 else 0.0
        self.save()
        return self.sgpa
    
    @staticmethod
    def calculate_cgpa_for_student(student):
        """Calculate CGPA: average of all SGPAs weighted by credits"""
        semesters = Semester.objects.filter(student=student).order_by('semester')
        total_weighted_sgpa = 0
        total_credits = 0
        
        for sem in semesters:
            if sem.sgpa > 0 and sem.total_credits > 0:
                total_weighted_sgpa += sem.sgpa * sem.total_credits
                total_credits += sem.total_credits
        
        cgpa = round(total_weighted_sgpa / total_credits, 2) if total_credits > 0 else 0.0
        
        # Update CGPA for all semesters
        for sem in semesters:
            sem.cgpa = cgpa
            sem.save(update_fields=['cgpa'])
        
        return cgpa


class StudentSubject(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='subject_grades')
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE, related_name='student_grades')
    semester = models.ForeignKey(Semester, on_delete=models.CASCADE, related_name='subject_grades')
    grade = models.CharField(max_length=5, choices=GradePoint.choices)
    grade_point = models.IntegerField(default=0)  # Calculated from grade
    attempt_type = models.CharField(max_length=10, choices=AttemptType.choices, default=AttemptType.REGULAR)
    exam_year = models.IntegerField(null=True, blank=True)  # Year when exam was held
    exam_month = models.CharField(max_length=20, null=True, blank=True)  # Month when exam was held
    passing_year = models.IntegerField(null=True, blank=True)  # Year when passed (null if failed)
    is_passed = models.BooleanField(default=False)  # Whether student passed this subject
    createdAt = models.DateTimeField(auto_now_add=True, null=True, blank=True)
    updatedAt = models.DateTimeField(auto_now=True, null=True, blank=True)
    
    class Meta:
        db_table = 'student_subjects'
        indexes = [
            models.Index(fields=['student', 'semester']),
            models.Index(fields=['student', 'subject']),
            models.Index(fields=['attempt_type']),
        ]
    
    def save(self, *args, **kwargs):
        # Auto-calculate grade point
        self.grade_point = GRADE_POINTS.get(self.grade.upper(), 0)
        # Check if passed (grade P or above = 5 or more points)
        self.is_passed = self.grade_point >= 5
        if self.is_passed and not self.passing_year:
            self.passing_year = self.exam_year
        super().save(*args, **kwargs)
    
    def __str__(self):
        return f"{self.student.name} - {self.subject.subjectCode} - {self.grade}"


class BacklogHistory(models.Model):
    """Track backlog attempt history for a student's subject"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='backlog_history')
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE, related_name='backlog_attempts')
    original_semester = models.IntegerField()  # Semester when subject was originally taken
    attempt_number = models.IntegerField(default=1)  # 1st backlog, 2nd backlog, etc.
    attempt_type = models.CharField(max_length=10, choices=AttemptType.choices)
    semester_type = models.CharField(max_length=10, choices=SemesterType.choices)
    exam_year = models.IntegerField()
    exam_month = models.CharField(max_length=20)
    grade = models.CharField(max_length=5, choices=GradePoint.choices)
    grade_point = models.IntegerField(default=0)
    is_cleared = models.BooleanField(default=False)  # Whether backlog was cleared in this attempt
    createdAt = models.DateTimeField(auto_now_add=True, null=True, blank=True)
    updatedAt = models.DateTimeField(auto_now=True, null=True, blank=True)
    
    class Meta:
        db_table = 'backlog_history'
        ordering = ['attempt_number']
        indexes = [
            models.Index(fields=['student', 'subject']),
            models.Index(fields=['is_cleared']),
        ]
    
    def save(self, *args, **kwargs):
        self.grade_point = GRADE_POINTS.get(self.grade.upper(), 0)
        self.is_cleared = self.grade_point >= 5
        super().save(*args, **kwargs)
    
    def __str__(self):
        return f"{self.student.name} - {self.subject.subjectCode} - Attempt {self.attempt_number}"


class YearTopper(models.Model):
    """Store top 3 students by CGPA for each year in each department"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    department = models.CharField(max_length=20, choices=Department.choices)
    academic_year = models.IntegerField()  # e.g., 1, 2, 3, 4 for year of study
    rank = models.IntegerField()  # 1, 2, or 3
    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='topper_ranks')
    cgpa = models.FloatField()
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'year_toppers'
        unique_together = [['department', 'academic_year', 'rank']]
        ordering = ['department', 'academic_year', 'rank']
    
    @staticmethod
    def update_toppers(department):
        """Update top 3 students for each year in the department"""
        from django.db.models import Max
        
        for year in range(1, 5):  # Years 1-4
            # Get students in this year with their latest CGPA
            students = Student.objects.filter(
                branch=department,
                year=year,
                status=StudentStatus.PURSUING
            ).annotate(
                latest_cgpa=Max('semesters__cgpa')
            ).filter(
                latest_cgpa__isnull=False,
                latest_cgpa__gt=0
            ).order_by('-latest_cgpa')[:3]
            
            # Clear existing toppers for this year
            YearTopper.objects.filter(department=department, academic_year=year).delete()
            
            # Create new topper entries
            for rank, student in enumerate(students, 1):
                YearTopper.objects.create(
                    department=department,
                    academic_year=year,
                    rank=rank,
                    student=student,
                    cgpa=student.latest_cgpa
                )


class FacultySubjectHistory(models.Model):
    """Track when faculty taught which subject"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    faculty = models.ForeignKey('Faculty', on_delete=models.CASCADE, related_name='subject_history')
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE, related_name='faculty_history')
    academic_year = models.IntegerField()  # e.g., 2024 for 2024-25
    semester_type = models.CharField(max_length=10, choices=SemesterType.choices)
    is_current = models.BooleanField(default=True)
    createdAt = models.DateTimeField(auto_now_add=True, null=True, blank=True)
    updatedAt = models.DateTimeField(auto_now=True, null=True, blank=True)
    
    class Meta:
        db_table = 'faculty_subject_history'
        unique_together = [['faculty', 'subject', 'academic_year', 'semester_type']]
        ordering = ['-academic_year', '-semester_type']
    
    def __str__(self):
        return f"{self.faculty.name} - {self.subject.subjectCode} ({self.academic_year})"


class CareerDetails(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    student = models.OneToOneField(Student, on_delete=models.CASCADE, related_name='careerDetails', db_column='studentId')
    hobbies = ArrayField(models.CharField(max_length=255), default=list, blank=True)
    strengths = ArrayField(models.CharField(max_length=255), default=list, blank=True)
    areasToImprove = ArrayField(models.CharField(max_length=255), default=list, blank=True)
    core = ArrayField(models.CharField(max_length=255), default=list, blank=True)
    it = ArrayField(models.CharField(max_length=255), default=list, blank=True)
    higherEducation = ArrayField(models.CharField(max_length=255), default=list, blank=True)
    startup = ArrayField(models.CharField(max_length=255), default=list, blank=True)
    familyBusiness = ArrayField(models.CharField(max_length=255), default=list, blank=True)
    otherInterests = ArrayField(models.CharField(max_length=255), default=list, blank=True)
    govt_sector_rank = models.IntegerField(default=1)
    core_rank = models.IntegerField(default=2)
    it_rank = models.IntegerField(default=3)
    higher_education_rank = models.IntegerField(default=4)
    startup_rank = models.IntegerField(default=5)
    family_business_rank = models.IntegerField(default=6)
    class Meta:
        db_table = 'career_details'


class PersonalProblem(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    student = models.OneToOneField(Student, on_delete=models.CASCADE, related_name='personalProblem', db_column='studentId')
    stress = models.BooleanField(null=True, blank=True)
    anger = models.BooleanField(null=True, blank=True)
    emotional_problem = models.BooleanField(null=True, blank=True)
    low_self_esteem = models.BooleanField(null=True, blank=True)
    examination_anxiety = models.BooleanField(null=True, blank=True)
    negative_thoughts = models.BooleanField(null=True, blank=True)
    exam_phobia = models.BooleanField(null=True, blank=True)
    stammering = models.BooleanField(null=True, blank=True)
    financial_problems = models.BooleanField(null=True, blank=True)
    disturbed_relationship_with_teachers = models.BooleanField(null=True, blank=True)
    disturbed_relationship_with_parents = models.BooleanField(null=True, blank=True)
    mood_swings = models.BooleanField(null=True, blank=True)
    stage_phobia = models.BooleanField(null=True, blank=True)
    poor_concentration = models.BooleanField(null=True, blank=True)
    poor_memory_problem = models.BooleanField(null=True, blank=True)
    adjustment_problem = models.BooleanField(null=True, blank=True)
    frustration = models.BooleanField(null=True, blank=True)
    migraine_headache = models.BooleanField(null=True, blank=True)
    relationship_problems = models.BooleanField(null=True, blank=True)
    fear_of_public_speaking = models.BooleanField(null=True, blank=True)
    disciplinary_problems_in_college = models.BooleanField(null=True, blank=True)
    disturbed_peer_relationship_with_friends = models.BooleanField(null=True, blank=True)
    worries_about_future = models.BooleanField(null=True, blank=True)
    disappointment_with_course = models.BooleanField(null=True, blank=True)
    time_management_problem = models.BooleanField(null=True, blank=True)
    lack_of_expression = models.BooleanField(null=True, blank=True)
    poor_decisive_power = models.BooleanField(null=True, blank=True)
    conflicts = models.BooleanField(null=True, blank=True)
    low_self_motivation = models.BooleanField(null=True, blank=True)
    procrastination = models.BooleanField(null=True, blank=True)
    suicidal_attempt_or_thought = models.BooleanField(null=True, blank=True)
    tobacco_or_alcohol_use = models.BooleanField(null=True, blank=True)
    poor_command_of_english = models.BooleanField(null=True, blank=True)
    
    # Special Issues Section - Student writes issue, Mentor/HOD/Admin writes suggestion & outcome
    economic_issues = models.TextField(null=True, blank=True)
    economic_issues_suggestion = models.TextField(null=True, blank=True)
    economic_issues_outcome = models.TextField(null=True, blank=True)
    
    teenage_issues = models.TextField(null=True, blank=True)
    teenage_issues_suggestion = models.TextField(null=True, blank=True)
    teenage_issues_outcome = models.TextField(null=True, blank=True)
    
    health_issues = models.TextField(null=True, blank=True)
    health_issues_suggestion = models.TextField(null=True, blank=True)
    health_issues_outcome = models.TextField(null=True, blank=True)
    
    emotional_issues = models.TextField(null=True, blank=True)
    emotional_issues_suggestion = models.TextField(null=True, blank=True)
    emotional_issues_outcome = models.TextField(null=True, blank=True)
    
    psychological_issues = models.TextField(null=True, blank=True)
    psychological_issues_suggestion = models.TextField(null=True, blank=True)
    psychological_issues_outcome = models.TextField(null=True, blank=True)
    
    additional_comments = models.TextField(null=True, blank=True)
    
    class Meta:
        db_table = 'personal_problems'


class Request(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='requests', db_column='studentId')
    assigned_to = models.ForeignKey('Faculty', on_delete=models.SET_NULL, null=True, blank=True, 
                                     related_name='assigned_requests', db_column='assignedToId')
    type = models.CharField(max_length=50, choices=RequestType.choices)
    request_data = models.JSONField(null=True, blank=True)
    content_type = models.ForeignKey(ContentType, on_delete=models.CASCADE, null=True, blank=True)
    object_id = models.UUIDField(null=True, blank=True)
    target = GenericForeignKey('content_type', 'object_id')
    status = models.CharField(max_length=20, choices=RequestStatus.choices, default=RequestStatus.PENDING)
    remarks = models.TextField(null=True, blank=True)
    feedback = models.TextField(null=True, blank=True)
    createdAt = models.DateTimeField(auto_now_add=True)
    updatedAt = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'requests'
        indexes = [
            models.Index(fields=['content_type', 'object_id']),
            models.Index(fields=['student', 'status']),
            models.Index(fields=['assigned_to', 'status']),
        ]

