/*
  Warnings:

  - A unique constraint covering the columns `[phone]` on the table `users` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "users" ADD COLUMN     "phone" TEXT,
ADD COLUMN     "resetOtpAttempts" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "resetOtpExpiry" TIMESTAMP(3),
ADD COLUMN     "resetOtpHash" TEXT,
ADD COLUMN     "resetOtpLastSentAt" TIMESTAMP(3);

-- CreateIndex
CREATE UNIQUE INDEX "users_phone_key" ON "users"("phone");
