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
    class Meta:
        db_table = 'subjects'


class Semester(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='semesters')
    semester = models.IntegerField()
    sgpa = models.FloatField()
    cgpa = models.FloatField()
    class Meta:
        db_table = 'semesters'
        unique_together = [['student', 'semester']]


class StudentSubject(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='subject_grades')
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE, related_name='student_grades')
    semester = models.ForeignKey(Semester, on_delete=models.CASCADE, related_name='subject_grades')
    grade = models.CharField(max_length=5)
    class Meta:
        db_table = 'student_subjects'
        unique_together = [['student', 'subject', 'semester']]
        indexes = [
            models.Index(fields=['student', 'semester']),
        ]


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

