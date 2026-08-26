/*
  Warnings:

  - You are about to drop the column `provider` on the `Sender` table. All the data in the column will be lost.
  - You are about to drop the `Campaign` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `EmailJob` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `smtpHost` to the `Sender` table without a default value. This is not possible if the table is not empty.
  - Added the required column `smtpPassword` to the `Sender` table without a default value. This is not possible if the table is not empty.
  - Added the required column `smtpPort` to the `Sender` table without a default value. This is not possible if the table is not empty.
  - Added the required column `smtpUser` to the `Sender` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "BatchStatus" AS ENUM ('SCHEDULED', 'PROCESSING', 'COMPLETED', 'FAILED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "EmailStatus" AS ENUM ('SCHEDULED', 'PROCESSING', 'SENT', 'FAILED');

-- DropForeignKey
ALTER TABLE "Campaign" DROP CONSTRAINT "Campaign_senderId_fkey";

-- DropForeignKey
ALTER TABLE "Campaign" DROP CONSTRAINT "Campaign_userId_fkey";

-- DropForeignKey
ALTER TABLE "EmailJob" DROP CONSTRAINT "EmailJob_campaignId_fkey";

-- DropIndex
DROP INDEX "Sender_userId_email_key";

-- AlterTable
ALTER TABLE "Sender" DROP COLUMN "provider",
ADD COLUMN     "smtpHost" TEXT NOT NULL,
ADD COLUMN     "smtpPassword" TEXT NOT NULL,
ADD COLUMN     "smtpPort" INTEGER NOT NULL,
ADD COLUMN     "smtpUser" TEXT NOT NULL;

-- DropTable
DROP TABLE "Campaign";

-- DropTable
DROP TABLE "EmailJob";

-- DropEnum
DROP TYPE "EmailJobStatus";

-- CreateTable
CREATE TABLE "EmailBatch" (
    "id" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "startTime" TIMESTAMP(3) NOT NULL,
    "delayBetweenEmails" INTEGER NOT NULL,
    "hourlyLimit" INTEGER NOT NULL,
    "status" "BatchStatus" NOT NULL DEFAULT 'SCHEDULED',
    "userId" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EmailBatch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Email" (
    "id" TEXT NOT NULL,
    "recipient" TEXT NOT NULL,
    "status" "EmailStatus" NOT NULL DEFAULT 'SCHEDULED',
    "scheduledAt" TIMESTAMP(3) NOT NULL,
    "sentAt" TIMESTAMP(3),
    "failedAt" TIMESTAMP(3),
    "errorMessage" TEXT,
    "bullJobId" TEXT,
    "batchId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Email_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "EmailBatch_userId_idx" ON "EmailBatch"("userId");

-- CreateIndex
CREATE INDEX "EmailBatch_senderId_idx" ON "EmailBatch"("senderId");

-- CreateIndex
CREATE INDEX "EmailBatch_startTime_idx" ON "EmailBatch"("startTime");

-- CreateIndex
CREATE UNIQUE INDEX "Email_bullJobId_key" ON "Email"("bullJobId");

-- CreateIndex
CREATE INDEX "Email_status_idx" ON "Email"("status");

-- CreateIndex
CREATE INDEX "Email_scheduledAt_idx" ON "Email"("scheduledAt");

-- CreateIndex
CREATE INDEX "Email_batchId_idx" ON "Email"("batchId");

-- AddForeignKey
ALTER TABLE "EmailBatch" ADD CONSTRAINT "EmailBatch_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmailBatch" ADD CONSTRAINT "EmailBatch_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "Sender"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Email" ADD CONSTRAINT "Email_batchId_fkey" FOREIGN KEY ("batchId") REFERENCES "EmailBatch"("id") ON DELETE CASCADE ON UPDATE CASCADE;
