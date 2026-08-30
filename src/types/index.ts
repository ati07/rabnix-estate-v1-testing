export type PropertyType = 'apartment' | 'villa' | 'independent_house' | 'plot' | 'commercial' | 'pg_coliving';
export type ListingType = 'buy' | 'rent' | 'commercial' | 'pg' | 'new_projects';
export type FurnishingStatus = 'furnished' | 'semi-furnished' | 'unfurnished';

export interface Property {
  id: string;
  title: string;
  tagline: string;
  propertyType: PropertyType;
  listingType: ListingType;
  price: number; // in INR (e.g. 8500000 = 85 Lakhs)
  priceDisplay: string; // e.g. "₹85 Lakh" or "₹38,000 / mo"
  pricePerSqFt?: number;
  carpetArea: number; // in sq ft
  superArea?: number; // in sq ft
  bedrooms: number;
  bathrooms: number;
  balconies?: number;
  furnishing: FurnishingStatus;
  floor: string; // e.g. "4th of 14 Floors"
  facing?: string; // e.g. "East", "North-East"
  ageOfProperty?: string; // e.g. "0-1 year (Ready to Move)"
  reraId?: string;
  isVerified: boolean;
  isDirectOwner: boolean;
  isFeatured?: boolean;
  location: {
    locality: string;
    city: string;
    state: string;
    pincode: string;
    landmark?: string;
    coordinates?: { lat: number; lng: number };
  };
  images: string[];
  amenities: string[];
  ownerOrAgent: {
    name: string;
    type: 'Owner' | 'Verified Builder' | 'Prime Agent';
    phone: string;
    avatar?: string;
    rating?: number;
    responseTime?: string;
  };
  description: string;
  postedDate: string;
  aiInsights?: {
    estimatedFairValue: string;
    rentalYield: string;
    predicted5YearAppreciation: string;
    demandScore: number; // 1-100
    priceRating: 'Fair Price' | 'Great Deal' | 'Premium Pricing';
    summary: string;
  };
}

export interface ValuationQuery {
  city: string;
  locality: string;
  propertyType: PropertyType;
  bedrooms: number;
  carpetArea: number;
  furnishing: FurnishingStatus;
  age: string;
  floor: number;
  totalFloors: number;
  hasParking: boolean;
  isGatedSociety: boolean;
}

export interface ValuationResult {
  estimatedPriceMin: number;
  estimatedPriceMax: number;
  estimatedPriceDisplay: string;
  avgPricePerSqFt: number;
  rentalEstimateMonthly: string;
  appreciationRateYearly: string;
  confidenceScore: number;
  comparableLocalities: { name: string; avgRate: string }[];
  marketDemand: 'High' | 'Moderate' | 'Very High';
  aiAnalysisText: string;
}

export interface FilterState {
  searchQuery: string;
  listingType: ListingType;
  city: string;
  propertyType: string;
  bhk: string;
  priceRange: [number, number];
  verifiedOnly: boolean;
  directOwnerOnly: boolean;
  furnishing: string;
  sortBy: 'relevance' | 'price_low' | 'price_high' | 'newest';
}
