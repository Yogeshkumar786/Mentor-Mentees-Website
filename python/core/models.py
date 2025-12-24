from django.db import models
from django.contrib.postgres.fields import ArrayField


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


# --- Models ---
class User(models.Model):
    id = models.CharField(primary_key=True, max_length=40)
    email = models.EmailField(unique=True)
    password = models.CharField(max_length=255)
    role = models.CharField(max_length=20, choices=UserRole.choices)
    profilePicture = models.URLField(null=True, blank=True)
    accountStatus = models.CharField(max_length=20, default='ACTIVE')
    createdAt = models.DateTimeField(auto_now_add=True)
    updatedAt = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.email
    class Meta:
        db_table = 'users'


class Faculty(models.Model):
    id = models.CharField(primary_key=True, max_length=40)
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='faculty', null=True, db_column='userId')
    employeeId = models.CharField(max_length=50, unique=True)
    name = models.CharField(max_length=255)
    phone1 = models.BigIntegerField()
    phone2 = models.BigIntegerField(null=True, blank=True)
    personalEmail = models.EmailField(unique=True)
    collegeEmail = models.EmailField(unique=True)
    department = models.CharField(max_length=255)
    btech = models.CharField(max_length=255, null=True, blank=True)
    mtech = models.CharField(max_length=255, null=True, blank=True)
    phd = models.CharField(max_length=255, null=True, blank=True)
    office = models.CharField(max_length=255)
    officeHours = models.CharField(max_length=255)
    createdAt = models.DateTimeField(auto_now_add=True)
    updatedAt = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name
    class Meta:
        db_table = 'faculty'


class HOD(models.Model):
    id = models.CharField(primary_key=True, max_length=40)
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='hod', null=True, db_column='userId')
    faculty = models.OneToOneField(Faculty, on_delete=models.CASCADE, related_name='as_hod', null=True, db_column='facultyId')
    department = models.CharField(max_length=255)
    startDate = models.DateTimeField()
    endDate = models.DateTimeField(null=True, blank=True)
    createdAt = models.DateTimeField(auto_now_add=True)
    updatedAt = models.DateTimeField(auto_now=True)
    class Meta:
        db_table = 'hods'


class Admin(models.Model):
    id = models.CharField(primary_key=True, max_length=40)
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='admin', null=True, db_column='userId')
    employeeId = models.CharField(max_length=50, unique=True)
    name = models.CharField(max_length=255)
    phone = models.CharField(max_length=50)
    personalEmail = models.EmailField(unique=True)
    collegeEmail = models.EmailField(unique=True)
    department = models.CharField(max_length=255, null=True, blank=True)
    designation = models.CharField(max_length=255)
    office = models.CharField(max_length=255, null=True, blank=True)
    createdAt = models.DateTimeField(auto_now_add=True)
    updatedAt = models.DateTimeField(auto_now=True)
    class Meta:
        db_table = 'admins'


class Student(models.Model):
    id = models.CharField(primary_key=True, max_length=40)
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='student', null=True, db_column='userId')
    name = models.CharField(max_length=255)
    aadhar = models.BigIntegerField(unique=True)
    phoneNumber = models.CharField(max_length=50)
    phoneCode = models.IntegerField()
    registrationNumber = models.IntegerField(unique=True)
    rollNumber = models.IntegerField(unique=True)
    passPort = models.CharField(max_length=255, default='Not Available')
    emergencyContact = models.BigIntegerField()
    personalEmail = models.EmailField(unique=True)
    collegeEmail = models.EmailField(unique=True)
    dob = models.DateTimeField()
    address = models.TextField()
    program = models.CharField(max_length=255)
    branch = models.CharField(max_length=255)
    bloodGroup = models.CharField(max_length=10)
    dayScholar = models.BooleanField()
    fatherName = models.CharField(max_length=255)
    fatherOccupation = models.CharField(max_length=255, null=True, blank=True)
    fatherAadhar = models.BigIntegerField(null=True, blank=True)
    fatherNumber = models.BigIntegerField(null=True, blank=True)
    motherName = models.CharField(max_length=255)
    motherOccupation = models.CharField(max_length=255, null=True, blank=True)
    motherAadhar = models.BigIntegerField(null=True, blank=True)
    motherNumber = models.BigIntegerField(null=True, blank=True)
    gender = models.CharField(max_length=10, choices=Gender.choices)
    community = models.CharField(max_length=10, choices=Community.choices)
    xMarks = models.IntegerField()
    xiiMarks = models.IntegerField()
    jeeMains = models.IntegerField()
    jeeAdvanced = models.IntegerField(null=True, blank=True)
    status = models.CharField(max_length=20, choices=StudentStatus.choices, default=StudentStatus.PURSUING)
    createdAt = models.DateTimeField(auto_now_add=True)
    updatedAt = models.DateTimeField(auto_now=True)
    # current mentor reference (nullable)
    currentMentorId = models.CharField(max_length=40, null=True, blank=True)
    class Meta:
        db_table = 'students'


class Mentor(models.Model):
    id = models.CharField(primary_key=True, max_length=40)
    faculty = models.ForeignKey(Faculty, on_delete=models.CASCADE, related_name='mentorships', db_column='facultyId')
    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='mentors', db_column='studentId')
    year = models.IntegerField()
    semester = models.IntegerField()
    startDate = models.DateTimeField()
    endDate = models.DateTimeField(null=True, blank=True)
    isActive = models.BooleanField(default=True)
    comments = ArrayField(models.TextField(), default=list, blank=True)
    createdAt = models.DateTimeField(auto_now_add=True)
    updatedAt = models.DateTimeField(auto_now=True)
    class Meta:
        db_table = 'mentors'


class Meeting(models.Model):
    id = models.CharField(primary_key=True, max_length=40)
    mentor = models.ForeignKey(Mentor, on_delete=models.CASCADE, related_name='meetings', db_column='mentorId')
    date = models.DateTimeField()
    time = models.CharField(max_length=50)
    description = models.TextField(null=True, blank=True)
    facultyReview = models.TextField(null=True, blank=True)
    createdAt = models.DateTimeField(auto_now_add=True)
    updatedAt = models.DateTimeField(auto_now=True)
    class Meta:
        db_table = 'meetings'


class Internship(models.Model):
    id = models.CharField(primary_key=True, max_length=40)
    semester = models.IntegerField()
    type = models.CharField(max_length=255)
    organisation = models.CharField(max_length=255)
    stipend = models.IntegerField()
    duration = models.CharField(max_length=255)
    location = models.CharField(max_length=255)
    students = models.ManyToManyField(Student, related_name='internships')
    class Meta:
        db_table = 'internships'


class Project(models.Model):
    id = models.CharField(primary_key=True, max_length=40)
    semester = models.IntegerField()
    title = models.CharField(max_length=255)
    description = models.TextField()
    technologies = ArrayField(models.CharField(max_length=100), default=list, blank=True)
    mentor = models.CharField(max_length=255)
    students = models.ManyToManyField(Student, related_name='projects')
    class Meta:
        db_table = 'projects'


class CoCurricular(models.Model):
    id = models.CharField(primary_key=True, max_length=40)
    sem = models.IntegerField()
    date = models.DateTimeField()
    eventDetails = models.TextField()
    participationDetails = models.TextField()
    awards = models.CharField(max_length=255)
    students = models.ManyToManyField(Student, related_name='co_curriculars')
    class Meta:
        db_table = 'co_curriculars'


class Semester(models.Model):
    id = models.CharField(primary_key=True, max_length=40)
    semester = models.IntegerField()
    sgpa = models.FloatField()
    cgpa = models.FloatField()
    students = models.ManyToManyField(Student, related_name='semesters')
    subjects = models.ManyToManyField('Subject', related_name='semesters')
    class Meta:
        db_table = 'semesters'


class Subject(models.Model):
    id = models.CharField(primary_key=True, max_length=40)
    subjectName = models.CharField(max_length=255)
    subjectCode = models.CharField(max_length=50)
    grade = models.CharField(max_length=10)
    class Meta:
        db_table = 'subjects'


class CareerDetails(models.Model):
    id = models.CharField(primary_key=True, max_length=40)
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
    class Meta:
        db_table = 'career_details'


class PersonalProblem(models.Model):
    id = models.CharField(primary_key=True, max_length=40)
    student = models.OneToOneField(Student, on_delete=models.CASCADE, related_name='personalProblem', db_column='studentId')
    stress = models.BooleanField(null=True, blank=True)
    anger = models.BooleanField(null=True, blank=True)
    examinationAnxiety = models.BooleanField(null=True, blank=True)
    timeManagementProblem = models.BooleanField(null=True, blank=True)
    procrastination = models.BooleanField(null=True, blank=True)
    worriesAboutFuture = models.BooleanField(null=True, blank=True)
    fearOfPublicSpeaking = models.BooleanField(null=True, blank=True)
    class Meta:
        db_table = 'personal_problems'


class Request(models.Model):
    id = models.CharField(primary_key=True, max_length=40)
    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='requests', db_column='studentId')
    type = models.CharField(max_length=50, choices=RequestType.choices)
    targetId = models.CharField(max_length=255)
    status = models.CharField(max_length=20, choices=RequestStatus.choices, default=RequestStatus.PENDING)
    remarks = models.TextField(null=True, blank=True)
    feedback = models.TextField(null=True, blank=True)
    createdAt = models.DateTimeField(auto_now_add=True)
    updatedAt = models.DateTimeField(auto_now=True)
    class Meta:
        db_table = 'requests'
