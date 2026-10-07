-- AlterTable
ALTER TABLE "users" ADD COLUMN     "twoFactorEnabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "twoFactorOtpAttempts" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "twoFactorOtpExpiry" TIMESTAMP(3),
ADD COLUMN     "twoFactorOtpHash" TEXT;
