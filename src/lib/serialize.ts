import type { Property as DbProperty, Inquiry as DbInquiry, ActivityLog as DbLog } from '@prisma/client';
import type { Property, PropertyInquiry, SystemActivityLog } from '@/lib/types';

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
