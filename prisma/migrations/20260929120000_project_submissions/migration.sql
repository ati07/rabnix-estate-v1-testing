-- Option C: builders submit projects, admins approve.
-- Add submission/moderation columns to FeaturedProject. Existing (seeded/curated)
-- rows default to 'approved' so the public catalog is unaffected by this change.

ALTER TABLE "FeaturedProject" ADD COLUMN "submissionStatus" TEXT NOT NULL DEFAULT 'approved';
ALTER TABLE "FeaturedProject" ADD COLUMN "rejectionReason" TEXT;
ALTER TABLE "FeaturedProject" ADD COLUMN "submittedByUserId" TEXT;

CREATE INDEX "FeaturedProject_submissionStatus_idx" ON "FeaturedProject"("submissionStatus");
CREATE INDEX "FeaturedProject_submittedByUserId_idx" ON "FeaturedProject"("submittedByUserId");

ALTER TABLE "FeaturedProject"
  ADD CONSTRAINT "FeaturedProject_submittedByUserId_fkey"
  FOREIGN KEY ("submittedByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
