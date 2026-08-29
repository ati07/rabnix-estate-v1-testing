-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'buyer',
    "city" TEXT,
    "avatar" TEXT,
    "companyName" TEXT,
    "reraNumber" TEXT,
    "isPhoneVerified" BOOLEAN NOT NULL DEFAULT false,
    "isEmailVerified" BOOLEAN NOT NULL DEFAULT false,
    "isBlocked" BOOLEAN NOT NULL DEFAULT false,
    "blockedReason" TEXT,
    "blockedAt" TEXT,
    "lastActive" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Property" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "tagline" TEXT,
    "listingType" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "locality" TEXT NOT NULL,
    "subLocality" TEXT,
    "price" INTEGER NOT NULL,
    "priceFormatted" TEXT NOT NULL,
    "pricePerSqFt" INTEGER,
    "maintenance" INTEGER,
    "bhk" INTEGER,
    "bathrooms" INTEGER NOT NULL DEFAULT 1,
    "balconies" INTEGER,
    "carpetAreaSqFt" INTEGER NOT NULL DEFAULT 0,
    "superBuiltUpAreaSqFt" INTEGER,
    "furnishing" TEXT NOT NULL DEFAULT 'Unfurnished',
    "floor" INTEGER,
    "totalFloors" INTEGER,
    "facing" TEXT,
    "constructionStatus" TEXT NOT NULL DEFAULT 'Ready to Move',
    "possessionDate" TEXT,
    "ageOfProperty" TEXT,
    "reraId" TEXT,
    "reraApproved" BOOLEAN NOT NULL DEFAULT false,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "verificationStatus" TEXT NOT NULL DEFAULT 'pending',
    "rejectionReason" TEXT,
    "inquiriesCount" INTEGER NOT NULL DEFAULT 0,
    "viewsCount" INTEGER NOT NULL DEFAULT 0,
    "documentsSubmitted" TEXT[],
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "isExclusiveOwner" BOOLEAN NOT NULL DEFAULT false,
    "priceDrop" BOOLEAN NOT NULL DEFAULT false,
    "images" TEXT[],
    "floorPlanImage" TEXT,
    "description" TEXT NOT NULL,
    "amenities" TEXT[],
    "postedBy" JSONB NOT NULL,
    "nearbyLandmarks" JSONB,
    "coordinates" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "postedByUserId" TEXT,

    CONSTRAINT "Property_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Inquiry" (
    "id" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "propertyTitle" TEXT NOT NULL,
    "sellerUserId" TEXT,
    "buyerUserId" TEXT,
    "buyerName" TEXT NOT NULL,
    "buyerPhone" TEXT NOT NULL,
    "buyerEmail" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "preferredTime" TEXT,
    "status" TEXT NOT NULL DEFAULT 'new',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Inquiry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ActivityLog" (
    "id" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "actorName" TEXT NOT NULL,
    "actorRole" TEXT NOT NULL,
    "details" TEXT NOT NULL,
    "targetTitle" TEXT,
    "targetId" TEXT,
    "severity" TEXT NOT NULL DEFAULT 'info',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ActivityLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_role_idx" ON "User"("role");

-- CreateIndex
CREATE INDEX "Property_city_idx" ON "Property"("city");

-- CreateIndex
CREATE INDEX "Property_listingType_idx" ON "Property"("listingType");

-- CreateIndex
CREATE INDEX "Property_verificationStatus_idx" ON "Property"("verificationStatus");

-- CreateIndex
CREATE INDEX "Property_postedByUserId_idx" ON "Property"("postedByUserId");

-- CreateIndex
CREATE INDEX "Inquiry_sellerUserId_idx" ON "Inquiry"("sellerUserId");

-- CreateIndex
CREATE INDEX "Inquiry_buyerUserId_idx" ON "Inquiry"("buyerUserId");

-- CreateIndex
CREATE INDEX "Inquiry_propertyId_idx" ON "Inquiry"("propertyId");

-- CreateIndex
CREATE INDEX "ActivityLog_createdAt_idx" ON "ActivityLog"("createdAt");

-- AddForeignKey
ALTER TABLE "Property" ADD CONSTRAINT "Property_postedByUserId_fkey" FOREIGN KEY ("postedByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Inquiry" ADD CONSTRAINT "Inquiry_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Inquiry" ADD CONSTRAINT "Inquiry_buyerUserId_fkey" FOREIGN KEY ("buyerUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Inquiry" ADD CONSTRAINT "Inquiry_sellerUserId_fkey" FOREIGN KEY ("sellerUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
