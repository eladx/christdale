-- DropForeignKey
ALTER TABLE "PhoneVerification" DROP CONSTRAINT "PhoneVerification_userId_fkey";

-- AlterTable
ALTER TABLE "PhoneVerification" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
