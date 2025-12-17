/*
  Warnings:

  - You are about to drop the column `facultyId` on the `meetings` table. All the data in the column will be lost.
  - You are about to drop the column `hodId` on the `meetings` table. All the data in the column will be lost.
  - You are about to drop the column `hodReview` on the `meetings` table. All the data in the column will be lost.
  - You are about to drop the `_MeetingToStudent` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_StudentMentors` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `messages` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[currentMentorId]` on the table `students` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `mentorId` to the `meetings` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."_MeetingToStudent" DROP CONSTRAINT "_MeetingToStudent_A_fkey";

-- DropForeignKey
ALTER TABLE "public"."_MeetingToStudent" DROP CONSTRAINT "_MeetingToStudent_B_fkey";

-- DropForeignKey
ALTER TABLE "public"."_StudentMentors" DROP CONSTRAINT "_StudentMentors_A_fkey";

-- DropForeignKey
ALTER TABLE "public"."_StudentMentors" DROP CONSTRAINT "_StudentMentors_B_fkey";

-- DropForeignKey
ALTER TABLE "public"."meetings" DROP CONSTRAINT "meetings_facultyId_fkey";

-- DropForeignKey
ALTER TABLE "public"."meetings" DROP CONSTRAINT "meetings_hodId_fkey";

-- DropForeignKey
ALTER TABLE "public"."messages" DROP CONSTRAINT "messages_parentMessageId_fkey";

-- DropForeignKey
ALTER TABLE "public"."messages" DROP CONSTRAINT "messages_receiverId_fkey";

-- DropForeignKey
ALTER TABLE "public"."messages" DROP CONSTRAINT "messages_senderId_fkey";

-- AlterTable
ALTER TABLE "public"."meetings" DROP COLUMN "facultyId",
DROP COLUMN "hodId",
DROP COLUMN "hodReview",
ADD COLUMN     "mentorId" TEXT;

-- AlterTable
ALTER TABLE "public"."students" ADD COLUMN     "currentMentorId" TEXT;

-- DropTable
DROP TABLE "public"."_MeetingToStudent";

-- DropTable
DROP TABLE "public"."_StudentMentors";

-- DropTable
DROP TABLE "public"."messages";

-- CreateTable
CREATE TABLE "public"."mentors" (
    "id" TEXT NOT NULL,
    "facultyId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "semester" INTEGER NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endDate" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "comments" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "mentors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."_StudentPastMentors" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_StudentPastMentors_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "mentors_facultyId_idx" ON "public"."mentors"("facultyId");

-- CreateIndex
CREATE INDEX "mentors_studentId_idx" ON "public"."mentors"("studentId");

-- CreateIndex
CREATE INDEX "mentors_isActive_idx" ON "public"."mentors"("isActive");

-- CreateIndex
CREATE INDEX "mentors_year_idx" ON "public"."mentors"("year");

-- CreateIndex
CREATE INDEX "mentors_semester_idx" ON "public"."mentors"("semester");

-- CreateIndex
CREATE INDEX "_StudentPastMentors_B_index" ON "public"."_StudentPastMentors"("B");

-- CreateIndex
CREATE UNIQUE INDEX "students_currentMentorId_key" ON "public"."students"("currentMentorId");

-- Delete existing meetings since we can't migrate them properly
DELETE FROM "public"."meetings";

-- Now make mentorId required
ALTER TABLE "public"."meetings" ALTER COLUMN "mentorId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "public"."students" ADD CONSTRAINT "students_currentMentorId_fkey" FOREIGN KEY ("currentMentorId") REFERENCES "public"."mentors"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."meetings" ADD CONSTRAINT "meetings_mentorId_fkey" FOREIGN KEY ("mentorId") REFERENCES "public"."mentors"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."mentors" ADD CONSTRAINT "mentors_facultyId_fkey" FOREIGN KEY ("facultyId") REFERENCES "public"."faculty"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_StudentPastMentors" ADD CONSTRAINT "_StudentPastMentors_A_fkey" FOREIGN KEY ("A") REFERENCES "public"."mentors"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_StudentPastMentors" ADD CONSTRAINT "_StudentPastMentors_B_fkey" FOREIGN KEY ("B") REFERENCES "public"."students"("id") ON DELETE CASCADE ON UPDATE CASCADE;
