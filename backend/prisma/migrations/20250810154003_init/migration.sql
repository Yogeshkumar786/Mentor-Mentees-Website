-- CreateEnum
CREATE TYPE "public"."Gender" AS ENUM ('Male', 'Female');

-- CreateEnum
CREATE TYPE "public"."Community" AS ENUM ('General', 'OBC', 'SC', 'ST', 'EWS');

-- CreateTable
CREATE TABLE "public"."students" (
    "id" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "aadhar" INTEGER NOT NULL,
    "phoneNumber" TEXT NOT NULL,
    "phoneCode" INTEGER NOT NULL,
    "registrationNumber" INTEGER NOT NULL,
    "rollNumber" INTEGER NOT NULL,
    "passPort" TEXT NOT NULL DEFAULT 'Not Available',
    "emergencyContact" INTEGER NOT NULL,
    "personalEmail" TEXT NOT NULL,
    "collegeEmail" TEXT NOT NULL,
    "dob" TIMESTAMP(3) NOT NULL,
    "address" TEXT NOT NULL,
    "program" TEXT NOT NULL,
    "branch" TEXT NOT NULL,
    "bloodGroup" TEXT NOT NULL,
    "dayScholar" BOOLEAN NOT NULL,
    "fatherName" TEXT NOT NULL,
    "fatherOccupation" TEXT,
    "fatherAadhar" INTEGER,
    "fatherNumber" INTEGER,
    "motherName" TEXT NOT NULL,
    "motherOccupation" TEXT,
    "motherAadhar" INTEGER,
    "motherNumber" INTEGER,
    "gender" "public"."Gender" NOT NULL,
    "community" "public"."Community" NOT NULL,
    "xMarks" INTEGER NOT NULL,
    "xiiMarks" INTEGER NOT NULL,
    "jeeMains" INTEGER NOT NULL,
    "jeeAdvanced" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "students_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."faculty" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone1" INTEGER NOT NULL,
    "phone2" INTEGER,
    "personalEmail" TEXT NOT NULL,
    "collegeEmail" TEXT NOT NULL,
    "department" TEXT NOT NULL,
    "mtech" TEXT,
    "phd" TEXT,
    "office" TEXT NOT NULL,
    "officeHours" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "faculty_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."hods" (
    "id" TEXT NOT NULL,
    "facultyId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "department" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "hods_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."meetings" (
    "id" TEXT NOT NULL,
    "hodId" TEXT,
    "facultyId" TEXT,
    "date" TIMESTAMP(3) NOT NULL,
    "time" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "meetings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."messages" (
    "id" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,
    "receiverId" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."career_details" (
    "id" TEXT NOT NULL,
    "hobbies" TEXT[],
    "strengths" TEXT[],
    "areasToImprove" TEXT[],
    "core" TEXT[],
    "it" TEXT[],
    "higherEducation" TEXT[],
    "startup" TEXT[],
    "familyBusiness" TEXT[],
    "otherInterests" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "studentId" TEXT NOT NULL,

    CONSTRAINT "career_details_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."personal_problems" (
    "id" TEXT NOT NULL,
    "stress" BOOLEAN,
    "anger" BOOLEAN,
    "emotionalProblem" BOOLEAN,
    "lowSelfEsteem" BOOLEAN,
    "examinationAnxiety" BOOLEAN,
    "negativeThoughts" BOOLEAN,
    "examPhobia" BOOLEAN,
    "stammering" BOOLEAN,
    "financialProblem" BOOLEAN,
    "moodSwings" BOOLEAN,
    "disturbedRelationshipWithParents" BOOLEAN,
    "disturbedRelationshipWithTeachers" BOOLEAN,
    "disturbedRelationshipWithFriends" BOOLEAN,
    "disciplinaryProblemsInCollege" BOOLEAN,
    "poorCommandOfEnglish" BOOLEAN,
    "tobaccoOrAlcoholUse" BOOLEAN,
    "suicidalAttemptsOrThoughts" BOOLEAN,
    "disappointmentWithCourses" BOOLEAN,
    "timeManagementProblem" BOOLEAN,
    "relationshipProblem" BOOLEAN,
    "lowSelfMotivation" BOOLEAN,
    "conflicts" BOOLEAN,
    "procrastination" BOOLEAN,
    "frustration" BOOLEAN,
    "poorDecisivePower" BOOLEAN,
    "adjustmentProblem" BOOLEAN,
    "lackOfExpression" BOOLEAN,
    "poorConcentration" BOOLEAN,
    "stagePhobia" BOOLEAN,
    "worriesAboutFuture" BOOLEAN,
    "poorMemoryProblem" BOOLEAN,
    "migraineHeadache" BOOLEAN,
    "fearOfPublicSpeaking" BOOLEAN,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "studentId" TEXT NOT NULL,

    CONSTRAINT "personal_problems_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."internships" (
    "id" TEXT NOT NULL,
    "semester" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "organisation" TEXT NOT NULL,
    "stipend" INTEGER NOT NULL,
    "duration" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "internships_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."projects" (
    "id" TEXT NOT NULL,
    "semester" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "technologies" TEXT[],
    "mentor" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "projects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."co_curriculars" (
    "id" TEXT NOT NULL,
    "sem" INTEGER NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "eventDetails" TEXT NOT NULL,
    "participationDetails" TEXT NOT NULL,
    "awards" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "co_curriculars_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."semesters" (
    "id" TEXT NOT NULL,
    "semester" INTEGER NOT NULL,
    "sgpa" DOUBLE PRECISION NOT NULL,
    "cgpa" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "semesters_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."subjects" (
    "id" TEXT NOT NULL,
    "subjectName" TEXT NOT NULL,
    "subjectCode" TEXT NOT NULL,
    "minor1" DOUBLE PRECISION NOT NULL,
    "midExam" DOUBLE PRECISION NOT NULL,
    "minor2" DOUBLE PRECISION NOT NULL,
    "endExam" DOUBLE PRECISION NOT NULL,
    "total" DOUBLE PRECISION NOT NULL,
    "conductedHours" INTEGER NOT NULL,
    "attendedHours" INTEGER NOT NULL,
    "attendancePercentage" DOUBLE PRECISION NOT NULL,
    "remarks" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "subjects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."_StudentMentors" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_StudentMentors_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "public"."_MeetingToStudent" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_MeetingToStudent_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "public"."_InternshipToStudent" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_InternshipToStudent_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "public"."_ProjectToStudent" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_ProjectToStudent_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "public"."_CoCurricularToStudent" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_CoCurricularToStudent_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "public"."_SemesterToStudent" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_SemesterToStudent_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "public"."_SemesterToSubject" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_SemesterToSubject_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "students_aadhar_key" ON "public"."students"("aadhar");

-- CreateIndex
CREATE UNIQUE INDEX "students_registrationNumber_key" ON "public"."students"("registrationNumber");

-- CreateIndex
CREATE UNIQUE INDEX "students_rollNumber_key" ON "public"."students"("rollNumber");

-- CreateIndex
CREATE UNIQUE INDEX "students_personalEmail_key" ON "public"."students"("personalEmail");

-- CreateIndex
CREATE UNIQUE INDEX "students_collegeEmail_key" ON "public"."students"("collegeEmail");

-- CreateIndex
CREATE UNIQUE INDEX "faculty_employeeId_key" ON "public"."faculty"("employeeId");

-- CreateIndex
CREATE UNIQUE INDEX "faculty_personalEmail_key" ON "public"."faculty"("personalEmail");

-- CreateIndex
CREATE UNIQUE INDEX "faculty_collegeEmail_key" ON "public"."faculty"("collegeEmail");

-- CreateIndex
CREATE UNIQUE INDEX "hods_facultyId_key" ON "public"."hods"("facultyId");

-- CreateIndex
CREATE UNIQUE INDEX "hods_email_key" ON "public"."hods"("email");

-- CreateIndex
CREATE UNIQUE INDEX "career_details_studentId_key" ON "public"."career_details"("studentId");

-- CreateIndex
CREATE UNIQUE INDEX "personal_problems_studentId_key" ON "public"."personal_problems"("studentId");

-- CreateIndex
CREATE INDEX "_StudentMentors_B_index" ON "public"."_StudentMentors"("B");

-- CreateIndex
CREATE INDEX "_MeetingToStudent_B_index" ON "public"."_MeetingToStudent"("B");

-- CreateIndex
CREATE INDEX "_InternshipToStudent_B_index" ON "public"."_InternshipToStudent"("B");

-- CreateIndex
CREATE INDEX "_ProjectToStudent_B_index" ON "public"."_ProjectToStudent"("B");

-- CreateIndex
CREATE INDEX "_CoCurricularToStudent_B_index" ON "public"."_CoCurricularToStudent"("B");

-- CreateIndex
CREATE INDEX "_SemesterToStudent_B_index" ON "public"."_SemesterToStudent"("B");

-- CreateIndex
CREATE INDEX "_SemesterToSubject_B_index" ON "public"."_SemesterToSubject"("B");

-- AddForeignKey
ALTER TABLE "public"."hods" ADD CONSTRAINT "hods_facultyId_fkey" FOREIGN KEY ("facultyId") REFERENCES "public"."faculty"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."meetings" ADD CONSTRAINT "meetings_hodId_fkey" FOREIGN KEY ("hodId") REFERENCES "public"."hods"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."meetings" ADD CONSTRAINT "meetings_facultyId_fkey" FOREIGN KEY ("facultyId") REFERENCES "public"."faculty"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."messages" ADD CONSTRAINT "messages_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "public"."faculty"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."messages" ADD CONSTRAINT "messages_receiverId_fkey" FOREIGN KEY ("receiverId") REFERENCES "public"."students"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."career_details" ADD CONSTRAINT "career_details_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "public"."students"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."personal_problems" ADD CONSTRAINT "personal_problems_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "public"."students"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_StudentMentors" ADD CONSTRAINT "_StudentMentors_A_fkey" FOREIGN KEY ("A") REFERENCES "public"."faculty"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_StudentMentors" ADD CONSTRAINT "_StudentMentors_B_fkey" FOREIGN KEY ("B") REFERENCES "public"."students"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_MeetingToStudent" ADD CONSTRAINT "_MeetingToStudent_A_fkey" FOREIGN KEY ("A") REFERENCES "public"."meetings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_MeetingToStudent" ADD CONSTRAINT "_MeetingToStudent_B_fkey" FOREIGN KEY ("B") REFERENCES "public"."students"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_InternshipToStudent" ADD CONSTRAINT "_InternshipToStudent_A_fkey" FOREIGN KEY ("A") REFERENCES "public"."internships"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_InternshipToStudent" ADD CONSTRAINT "_InternshipToStudent_B_fkey" FOREIGN KEY ("B") REFERENCES "public"."students"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_ProjectToStudent" ADD CONSTRAINT "_ProjectToStudent_A_fkey" FOREIGN KEY ("A") REFERENCES "public"."projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_ProjectToStudent" ADD CONSTRAINT "_ProjectToStudent_B_fkey" FOREIGN KEY ("B") REFERENCES "public"."students"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_CoCurricularToStudent" ADD CONSTRAINT "_CoCurricularToStudent_A_fkey" FOREIGN KEY ("A") REFERENCES "public"."co_curriculars"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_CoCurricularToStudent" ADD CONSTRAINT "_CoCurricularToStudent_B_fkey" FOREIGN KEY ("B") REFERENCES "public"."students"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_SemesterToStudent" ADD CONSTRAINT "_SemesterToStudent_A_fkey" FOREIGN KEY ("A") REFERENCES "public"."semesters"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_SemesterToStudent" ADD CONSTRAINT "_SemesterToStudent_B_fkey" FOREIGN KEY ("B") REFERENCES "public"."students"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_SemesterToSubject" ADD CONSTRAINT "_SemesterToSubject_A_fkey" FOREIGN KEY ("A") REFERENCES "public"."semesters"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_SemesterToSubject" ADD CONSTRAINT "_SemesterToSubject_B_fkey" FOREIGN KEY ("B") REFERENCES "public"."subjects"("id") ON DELETE CASCADE ON UPDATE CASCADE;
