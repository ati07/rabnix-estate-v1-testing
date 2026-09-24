-- CreateTable
CREATE TABLE "Builder" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "logo" TEXT NOT NULL,
    "bannerImage" TEXT NOT NULL,
    "tagline" TEXT NOT NULL,
    "badge" TEXT NOT NULL,
    "experienceYears" INTEGER NOT NULL,
    "experienceText" TEXT NOT NULL,
    "establishedYear" INTEGER NOT NULL,
    "projectsDeliveredCount" INTEGER NOT NULL,
    "projectsDeliveredText" TEXT NOT NULL,
    "ongoingProjectsCount" INTEGER NOT NULL,
    "ongoingProjectsText" TEXT NOT NULL,
    "totalSqFtDelivered" TEXT NOT NULL,
    "rating" DOUBLE PRECISION NOT NULL,
    "reviewsCount" INTEGER NOT NULL,
    "headquarters" TEXT NOT NULL,
    "reraRegistrationNumber" TEXT NOT NULL,
    "citiesPresent" TEXT[],
    "about" TEXT NOT NULL,
    "specialties" TEXT[],
    "awards" TEXT[],
    "contactPhone" TEXT NOT NULL,
    "contactEmail" TEXT NOT NULL,
    "website" TEXT NOT NULL,
    "projects" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Builder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FeaturedProject" (
    "id" TEXT NOT NULL,
    "section" TEXT NOT NULL DEFAULT 'featured',
    "name" TEXT NOT NULL,
    "builderName" TEXT NOT NULL,
    "builderLogo" TEXT NOT NULL,
    "builderId" TEXT,
    "city" TEXT NOT NULL,
    "locality" TEXT NOT NULL,
    "address" TEXT,
    "marketedBy" TEXT NOT NULL,
    "bhkConfig" TEXT NOT NULL,
    "priceFormatted" TEXT NOT NULL,
    "minPrice" INTEGER NOT NULL,
    "maxPrice" INTEGER,
    "pricePerSqFt" TEXT,
    "image" TEXT NOT NULL,
    "galleryImages" TEXT[],
    "status" TEXT NOT NULL,
    "tag" TEXT,
    "reraNumber" TEXT,
    "possessionDate" TEXT,
    "launchDate" TEXT,
    "totalAreaAcres" TEXT,
    "totalTowers" INTEGER,
    "totalUnits" INTEGER,
    "openSpacePercent" TEXT,
    "description" TEXT,
    "highlights" TEXT[],
    "amenities" TEXT[],
    "floorPlans" JSONB,
    "nearbyLandmarks" JSONB,
    "builderExperience" TEXT,
    "builderDeliveredProjects" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FeaturedProject_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Agent" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "avatar" TEXT NOT NULL,
    "badge" TEXT NOT NULL,
    "agencyName" TEXT NOT NULL,
    "agencyLogo" TEXT NOT NULL,
    "operatingSince" INTEGER NOT NULL,
    "experienceYears" INTEGER,
    "buyersServed" TEXT NOT NULL,
    "propertiesForSaleCount" INTEGER NOT NULL,
    "propertiesForRentCount" INTEGER,
    "city" TEXT NOT NULL,
    "rating" DOUBLE PRECISION NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT,
    "reraId" TEXT,
    "address" TEXT,
    "about" TEXT,
    "specializations" TEXT[],
    "areasServed" TEXT[],
    "languages" TEXT[],
    "reviews" JSONB,
    "verifiedDocuments" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Agent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Collection" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "subtitle" TEXT NOT NULL,
    "tag" TEXT NOT NULL,
    "tagColor" TEXT NOT NULL,
    "iconName" TEXT NOT NULL,
    "heroImage" TEXT NOT NULL,
    "badge" TEXT NOT NULL,
    "actionText" TEXT NOT NULL,
    "avgPriceRange" TEXT NOT NULL,
    "avgYield" TEXT NOT NULL,
    "totalListingsText" TEXT NOT NULL,
    "overview" TEXT NOT NULL,
    "keyHighlights" JSONB NOT NULL,
    "filters" JSONB NOT NULL,
    "recommendedCities" TEXT[],
    "faqs" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Collection_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Builder_slug_key" ON "Builder"("slug");

-- CreateIndex
CREATE INDEX "FeaturedProject_city_idx" ON "FeaturedProject"("city");

-- CreateIndex
CREATE INDEX "FeaturedProject_section_idx" ON "FeaturedProject"("section");

-- CreateIndex
CREATE INDEX "Agent_city_idx" ON "Agent"("city");
