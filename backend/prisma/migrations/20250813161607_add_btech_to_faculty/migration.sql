/*
  Warnings:

  - You are about to drop the `messages` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."messages" DROP CONSTRAINT "messages_receiverId_fkey";

-- DropForeignKey
ALTER TABLE "public"."messages" DROP CONSTRAINT "messages_senderId_fkey";

-- AlterTable
ALTER TABLE "public"."career_details" ALTER COLUMN "hobbies" SET DEFAULT ARRAY[]::TEXT[],
ALTER COLUMN "strengths" SET DEFAULT ARRAY[]::TEXT[],
ALTER COLUMN "areasToImprove" SET DEFAULT ARRAY[]::TEXT[],
ALTER COLUMN "core" SET DEFAULT ARRAY[]::TEXT[],
ALTER COLUMN "it" SET DEFAULT ARRAY[]::TEXT[],
ALTER COLUMN "higherEducation" SET DEFAULT ARRAY[]::TEXT[],
ALTER COLUMN "startup" SET DEFAULT ARRAY[]::TEXT[],
ALTER COLUMN "familyBusiness" SET DEFAULT ARRAY[]::TEXT[],
ALTER COLUMN "otherInterests" SET DEFAULT ARRAY[]::TEXT[];

-- AlterTable
ALTER TABLE "public"."faculty" ADD COLUMN     "btech" TEXT;

-- AlterTable
ALTER TABLE "public"."projects" ALTER COLUMN "technologies" SET DEFAULT ARRAY[]::TEXT[];

-- DropTable
DROP TABLE "public"."messages";

-- CreateIndex
CREATE INDEX "students_registrationNumber_idx" ON "public"."students"("registrationNumber");

-- CreateIndex
CREATE INDEX "students_rollNumber_idx" ON "public"."students"("rollNumber");
