import type {
  Property as DbProperty,
  Inquiry as DbInquiry,
  ActivityLog as DbLog,
  Builder as DbBuilder,
  FeaturedProject as DbFeaturedProject,
  Agent as DbAgent,
  Collection as DbCollection,
} from '@prisma/client';
import type { Property, PropertyInquiry, SystemActivityLog } from '@/lib/types';
import type { Builder, BuilderProject } from '@/lib/buildersData';
import type { FeaturedProjectItem, PreferredAgentItem, AgentReview, ProjectFloorPlan, ProjectNearby } from '@/lib/homeSectionsData';
import type { CuratedCollection } from '@/lib/collectionsData';

/** Convert a DB Property row into the Property shape the UI components expect. */
export function serializeProperty(p: DbProperty): Property {
  return {
    id: p.id,
    title: p.title,
    tagline: p.tagline ?? undefined,
    listingType: p.listingType as Property['listingType'],
    category: p.category as Property['category'],
    city: p.city,
    locality: p.locality,
    subLocality: p.subLocality ?? undefined,
    price: p.price,
    priceFormatted: p.priceFormatted,
    pricePerSqFt: p.pricePerSqFt ?? undefined,
    maintenance: p.maintenance ?? undefined,
    bhk: p.bhk ?? undefined,
    bathrooms: p.bathrooms,
    balconies: p.balconies ?? undefined,
    carpetAreaSqFt: p.carpetAreaSqFt,
    superBuiltUpAreaSqFt: p.superBuiltUpAreaSqFt ?? undefined,
    furnishing: p.furnishing as Property['furnishing'],
    floor: p.floor ?? undefined,
    totalFloors: p.totalFloors ?? undefined,
    facing: (p.facing as Property['facing']) ?? undefined,
    constructionStatus: p.constructionStatus as Property['constructionStatus'],
    possessionDate: p.possessionDate ?? undefined,
    ageOfProperty: p.ageOfProperty ?? undefined,
    reraId: p.reraId ?? undefined,
    reraApproved: p.reraApproved,
    isVerified: p.isVerified,
    verificationStatus: p.verificationStatus as Property['verificationStatus'],
    rejectionReason: p.rejectionReason ?? undefined,
    postedByUserId: p.postedByUserId ?? undefined,
    inquiriesCount: p.inquiriesCount,
    viewsCount: p.viewsCount,
    documentsSubmitted: p.documentsSubmitted,
    isFeatured: p.isFeatured,
    isExclusiveOwner: p.isExclusiveOwner,
    priceDrop: p.priceDrop,
    images: p.images,
    floorPlanImage: p.floorPlanImage ?? undefined,
    description: p.description,
    amenities: p.amenities,
    postedBy: p.postedBy as Property['postedBy'],
    nearbyLandmarks: (p.nearbyLandmarks as Property['nearbyLandmarks']) ?? undefined,
    coordinates: (p.coordinates as Property['coordinates']) ?? undefined,
    createdAt: p.createdAt.toISOString().split('T')[0],
  };
}

export function serializeInquiry(i: DbInquiry): PropertyInquiry {
  return {
    id: i.id,
    propertyId: i.propertyId,
    propertyTitle: i.propertyTitle,
    sellerUserId: i.sellerUserId ?? undefined,
    buyerUserId: i.buyerUserId ?? undefined,
    buyerName: i.buyerName,
    buyerPhone: i.buyerPhone,
    buyerEmail: i.buyerEmail,
    message: i.message,
    preferredTime: i.preferredTime ?? undefined,
    status: i.status as PropertyInquiry['status'],
    createdAt: i.createdAt.toISOString(),
  };
}

/** DB Builder row -> the Builder shape the UI expects (from buildersData.ts). */
export function serializeBuilder(b: DbBuilder): Builder {
  return {
    id: b.id,
    name: b.name,
    slug: b.slug,
    logo: b.logo,
    bannerImage: b.bannerImage,
    tagline: b.tagline,
    badge: b.badge,
    experienceYears: b.experienceYears,
    experienceText: b.experienceText,
    establishedYear: b.establishedYear,
    projectsDeliveredCount: b.projectsDeliveredCount,
    projectsDeliveredText: b.projectsDeliveredText,
    ongoingProjectsCount: b.ongoingProjectsCount,
    ongoingProjectsText: b.ongoingProjectsText,
    totalSqFtDelivered: b.totalSqFtDelivered,
    rating: b.rating,
    reviewsCount: b.reviewsCount,
    headquarters: b.headquarters,
    reraRegistrationNumber: b.reraRegistrationNumber,
    citiesPresent: b.citiesPresent,
    about: b.about,
    specialties: b.specialties,
    awards: b.awards,
    contactPhone: b.contactPhone,
    contactEmail: b.contactEmail,
    website: b.website,
    projects: (b.projects as unknown as BuilderProject[]) ?? [],
  };
}

/** DB FeaturedProject row -> FeaturedProjectItem (from homeSectionsData.ts). */
export function serializeFeaturedProject(p: DbFeaturedProject): FeaturedProjectItem {
  return {
    id: p.id,
    name: p.name,
    builderName: p.builderName,
    builderLogo: p.builderLogo,
    city: p.city,
    locality: p.locality,
    address: p.address ?? undefined,
    marketedBy: p.marketedBy,
    bhkConfig: p.bhkConfig,
    priceFormatted: p.priceFormatted,
    minPrice: p.minPrice,
    maxPrice: p.maxPrice ?? undefined,
    pricePerSqFt: p.pricePerSqFt ?? undefined,
    image: p.image,
    galleryImages: p.galleryImages,
    status: p.status as FeaturedProjectItem['status'],
    builderId: p.builderId ?? undefined,
    tag: p.tag ?? undefined,
    reraNumber: p.reraNumber ?? undefined,
    possessionDate: p.possessionDate ?? undefined,
    launchDate: p.launchDate ?? undefined,
    totalAreaAcres: p.totalAreaAcres ?? undefined,
    totalTowers: p.totalTowers ?? undefined,
    totalUnits: p.totalUnits ?? undefined,
    openSpacePercent: p.openSpacePercent ?? undefined,
    description: p.description ?? undefined,
    highlights: p.highlights,
    amenities: p.amenities,
    floorPlans: (p.floorPlans as unknown as ProjectFloorPlan[]) ?? undefined,
    nearbyLandmarks: (p.nearbyLandmarks as unknown as ProjectNearby[]) ?? undefined,
    builderExperience: p.builderExperience ?? undefined,
    builderDeliveredProjects: p.builderDeliveredProjects ?? undefined,
  };
}

/** DB Agent row -> PreferredAgentItem (from homeSectionsData.ts). */
export function serializeAgent(a: DbAgent): PreferredAgentItem {
  return {
    id: a.id,
    name: a.name,
    avatar: a.avatar,
    badge: a.badge,
    agencyName: a.agencyName,
    agencyLogo: a.agencyLogo,
    operatingSince: a.operatingSince,
    experienceYears: a.experienceYears ?? undefined,
    buyersServed: a.buyersServed,
    propertiesForSaleCount: a.propertiesForSaleCount,
    propertiesForRentCount: a.propertiesForRentCount ?? undefined,
    city: a.city,
    rating: a.rating,
    phone: a.phone,
    email: a.email ?? undefined,
    reraId: a.reraId ?? undefined,
    address: a.address ?? undefined,
    about: a.about ?? undefined,
    specializations: a.specializations,
    areasServed: a.areasServed,
    languages: a.languages,
    reviews: (a.reviews as unknown as AgentReview[]) ?? undefined,
    verifiedDocuments: a.verifiedDocuments,
  };
}

/** DB Collection row -> CuratedCollection (from collectionsData.ts). */
export function serializeCollection(c: DbCollection): CuratedCollection {
  return {
    id: c.id,
    title: c.title,
    subtitle: c.subtitle,
    tag: c.tag,
    tagColor: c.tagColor,
    iconName: c.iconName,
    heroImage: c.heroImage,
    badge: c.badge,
    actionText: c.actionText,
    avgPriceRange: c.avgPriceRange,
    avgYield: c.avgYield,
    totalListingsText: c.totalListingsText,
    overview: c.overview,
    keyHighlights: c.keyHighlights as unknown as CuratedCollection['keyHighlights'],
    filters: c.filters as unknown as CuratedCollection['filters'],
    recommendedCities: c.recommendedCities,
    faqs: c.faqs as unknown as CuratedCollection['faqs'],
  };
}

export function serializeLog(l: DbLog): SystemActivityLog {
  return {
    id: l.id,
    timestamp: l.createdAt.toISOString(),
    action: l.action as SystemActivityLog['action'],
    actorName: l.actorName,
    actorRole: l.actorRole,
    details: l.details,
    targetTitle: l.targetTitle ?? undefined,
    targetId: l.targetId ?? undefined,
    severity: l.severity as SystemActivityLog['severity'],
  };
}
