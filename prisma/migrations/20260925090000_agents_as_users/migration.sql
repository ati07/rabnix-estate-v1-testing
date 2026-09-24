-- Preferred agents become Users (role='agent', isPreferredAgent=true).
-- Add the directory-profile fields to User and drop the standalone Agent table.

-- AlterTable
ALTER TABLE "User" ADD COLUMN "isPreferredAgent" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "User" ADD COLUMN "agencyLogo" TEXT;
ALTER TABLE "User" ADD COLUMN "agentBadge" TEXT;
ALTER TABLE "User" ADD COLUMN "agentRating" DOUBLE PRECISION;
ALTER TABLE "User" ADD COLUMN "operatingSince" INTEGER;
ALTER TABLE "User" ADD COLUMN "experienceYears" INTEGER;
ALTER TABLE "User" ADD COLUMN "buyersServed" TEXT;
ALTER TABLE "User" ADD COLUMN "specializations" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];
ALTER TABLE "User" ADD COLUMN "areasServed" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];
ALTER TABLE "User" ADD COLUMN "languages" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];
ALTER TABLE "User" ADD COLUMN "agentAbout" TEXT;

-- CreateIndex
CREATE INDEX "User_isPreferredAgent_idx" ON "User"("isPreferredAgent");

-- DropTable
DROP TABLE "Agent";
