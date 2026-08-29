'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Property, PropertyInquiry, VerificationStatus } from '@/lib/types';
import { INITIAL_PROPERTIES as BASE_PROPERTIES } from '@/lib/realEstateData';

interface PropertyContextType {
  properties: Property[];
  inquiries: PropertyInquiry[];
  shortlistIds: string[];
  isLoading: boolean;
  toggleShortlist: (id: string) => void;
  isShortlisted: (id: string) => boolean;
  getPropertyById: (id: string) => Property | undefined;
  addProperty: (property: Partial<Property>) => Property;
  updateProperty: (id: string, updates: Partial<Property>) => void;
  updateVerificationStatus: (id: string, status: VerificationStatus, reason?: string) => void;
  deleteProperty: (id: string) => void;
  addInquiry: (inquiryData: {
    propertyId: string;
    propertyTitle: string;
    buyerName: string;
    buyerPhone: string;
    buyerEmail: string;
    message: string;
    preferredTime?: string;
    sellerUserId?: string;
    buyerUserId?: string;
  }) => PropertyInquiry;
  updateInquiryStatus: (id: string, status: PropertyInquiry['status']) => void;
  resetToDefaultData: () => void;
}

const PropertyContext = createContext<PropertyContextType | undefined>(undefined);

const PROPERTIES_STORAGE_KEY = 'rabnix_properties_store_v2';
const INQUIRIES_STORAGE_KEY = 'rabnix_inquiries_store_v2';
const SHORTLIST_STORAGE_KEY = 'rabnix_shortlists_store_v2';

// Seed initial properties with verification status and realistic metrics
const INITIAL_PROPERTIES: Property[] = BASE_PROPERTIES.map((p, idx) => {
  // Let's create a few pending / under-review listings for the admin dashboard
  let vStatus: VerificationStatus = 'approved';
  let isVer = true;
  if (idx === 1) {
    vStatus = 'pending';
    isVer = false;
  } else if (idx === 5) {
    vStatus = 'under_review';
    isVer = false;
  } else if (idx === 7) {
    vStatus = 'rejected';
    isVer = false;
  }

  return {
    ...p,
    verificationStatus: vStatus,
    isVerified: isVer,
    rejectionReason: vStatus === 'rejected' ? 'RERA registration number mismatch with state portal records. Please re-upload verified certificate.' : undefined,
    inquiriesCount: Math.floor(Math.random() * 18) + 2,
    viewsCount: Math.floor(Math.random() * 320) + 45,
    documentsSubmitted: [
      'Encumbrance Certificate (EC)',
      'Approved Floor Sanction Plan',
      'Property Tax Clearance Receipt'
    ]
  };
});

const INITIAL_INQUIRIES: PropertyInquiry[] = [
  {
    id: 'inq-101',
    propertyId: 'prop-blr-1',
    propertyTitle: '3 BHK Luxury Apartment in Prestige Falcon City',
    sellerUserId: 'usr-owner-202',
    buyerUserId: 'usr-buyer-101',
    buyerName: 'Rahul Sharma',
    buyerPhone: '+91 98765 43210',
    buyerEmail: 'rahul.sharma@example.com',
    message: 'Hello, I am interested in visiting this 3 BHK this Saturday morning. Is the price slightly negotiable?',
    preferredTime: 'Saturday 11:00 AM',
    status: 'new',
    createdAt: '2025-02-27 10:30 AM'
  },
  {
    id: 'inq-102',
    propertyId: 'prop-mum-1',
    propertyTitle: '2 BHK Sea View Apartment in Bandra West',
    sellerUserId: 'usr-agent-303',
    buyerUserId: 'usr-buyer-101',
    buyerName: 'Anita Menon',
    buyerPhone: '+91 98221 44332',
    buyerEmail: 'anita.menon@example.com',
    message: 'Hi, what is the maintenance fee per month and is covered parking allocated?',
    preferredTime: 'Sunday 4:00 PM',
    status: 'contacted',
    createdAt: '2025-02-26 04:15 PM'
  },
  {
    id: 'inq-103',
    propertyId: 'prop-del-1',
    propertyTitle: '4 BHK Luxury Builder Floor in Golf Course Extn',
    sellerUserId: 'usr-builder-404',
    buyerUserId: 'usr-buyer-101',
    buyerName: 'Deepak Chopra',
    buyerPhone: '+91 99880 11223',
    buyerEmail: 'deepak.chopra@example.com',
    message: 'Looking for prompt possession. Can we connect via WhatsApp for the layout brochure?',
    preferredTime: 'Immediate',
    status: 'scheduled',
    createdAt: '2025-02-25 02:00 PM'
  }
];

export function PropertyProvider({ children }: { children: React.ReactNode }) {
  const [properties, setProperties] = useState<Property[]>(() => {
    if (typeof window === 'undefined') return INITIAL_PROPERTIES;
    try {
      const stored = localStorage.getItem(PROPERTIES_STORAGE_KEY);
      return stored ? JSON.parse(stored) : INITIAL_PROPERTIES;
    } catch {
      return INITIAL_PROPERTIES;
    }
  });

  const [inquiries, setInquiries] = useState<PropertyInquiry[]>(() => {
    if (typeof window === 'undefined') return INITIAL_INQUIRIES;
    try {
      const stored = localStorage.getItem(INQUIRIES_STORAGE_KEY);
      return stored ? JSON.parse(stored) : INITIAL_INQUIRIES;
    } catch {
      return INITIAL_INQUIRIES;
    }
  });

  const [shortlistIds, setShortlistIds] = useState<string[]>(() => {
    if (typeof window === 'undefined') return ['prop-blr-1', 'prop-mum-1'];
    try {
      const stored = localStorage.getItem(SHORTLIST_STORAGE_KEY);
      return stored ? JSON.parse(stored) : ['prop-blr-1', 'prop-mum-1'];
    } catch {
      return ['prop-blr-1', 'prop-mum-1'];
    }
  });

  const [isLoading, setIsLoading] = useState(false);

  const saveProperties = (newProps: Property[]) => {
    setProperties(newProps);
    if (typeof window !== 'undefined') {
      localStorage.setItem(PROPERTIES_STORAGE_KEY, JSON.stringify(newProps));
    }
  };

  const saveInquiries = (newInqs: PropertyInquiry[]) => {
    setInquiries(newInqs);
    if (typeof window !== 'undefined') {
      localStorage.setItem(INQUIRIES_STORAGE_KEY, JSON.stringify(newInqs));
    }
  };

  const saveShortlists = (newShortlist: string[]) => {
    setShortlistIds(newShortlist);
    if (typeof window !== 'undefined') {
      localStorage.setItem(SHORTLIST_STORAGE_KEY, JSON.stringify(newShortlist));
    }
  };

  const toggleShortlist = (id: string) => {
    const next = shortlistIds.includes(id)
      ? shortlistIds.filter((item) => item !== id)
      : [...shortlistIds, id];
    saveShortlists(next);
  };

  const isShortlisted = (id: string) => shortlistIds.includes(id);

  const getPropertyById = (id: string) => {
    return properties.find((p) => p.id === id);
  };

  const addProperty = (newProp: Partial<Property>): Property => {
    const id = `prop-${Date.now()}`;
    const price = newProp.price || 5000000;
    const formatted = price >= 10000000 
      ? `₹${(price / 10000000).toFixed(2)} Cr` 
      : price >= 100000 
      ? `₹${(price / 100000).toFixed(1)} L` 
      : `₹${price.toLocaleString('en-IN')}`;

    const created: Property = {
      id,
      title: newProp.title || 'Residential Property',
      tagline: newProp.tagline || 'Recently Posted Property',
      listingType: newProp.listingType || 'buy',
      category: newProp.category || 'Apartment',
      city: newProp.city || 'Bangalore',
      locality: newProp.locality || 'Prime Locality',
      subLocality: newProp.subLocality,
      price,
      priceFormatted: formatted,
      pricePerSqFt: newProp.carpetAreaSqFt ? Math.round(price / newProp.carpetAreaSqFt) : 6500,
      maintenance: newProp.maintenance || 3500,
      bhk: newProp.bhk || 2,
      bathrooms: newProp.bathrooms || 2,
      balconies: newProp.balconies || 1,
      carpetAreaSqFt: newProp.carpetAreaSqFt || 1150,
      superBuiltUpAreaSqFt: newProp.superBuiltUpAreaSqFt || 1350,
      furnishing: newProp.furnishing || 'Semi-Furnished',
      floor: newProp.floor || 4,
      totalFloors: newProp.totalFloors || 14,
      facing: newProp.facing || 'East',
      constructionStatus: newProp.constructionStatus || 'Ready to Move',
      possessionDate: newProp.possessionDate || 'Immediate',
      reraId: newProp.reraId || 'PRM/KA/RERA/APPLIED',
      reraApproved: !!newProp.reraId,
      isVerified: false,
      verificationStatus: 'pending',
      images: newProp.images && newProp.images.length > 0 
        ? newProp.images 
        : ['https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80'],
      description: newProp.description || 'Spacious and well-ventilated property located in a prime connectivity corridor.',
      amenities: newProp.amenities && newProp.amenities.length > 0 
        ? newProp.amenities 
        : ['Swimming Pool', 'Gymnasium', '24/7 Security', 'Power Backup', 'Club House', 'Covered Parking'],
      postedBy: newProp.postedBy || {
        name: 'Verified Owner',
        type: 'Owner',
        phone: '+91 98765 00000',
        responseTime: 'Within 2 hours',
        rating: 4.8
      },
      postedByUserId: newProp.postedByUserId || 'usr-owner-202',
      inquiriesCount: 0,
      viewsCount: 1,
      documentsSubmitted: [
        'Ownership Proof / Sale Deed Copy',
        'Electricity Bill / Utility Receipt',
        'Identity Document'
      ],
      createdAt: 'Just now'
    };

    const next = [created, ...properties];
    saveProperties(next);
    return created;
  };

  const updateProperty = (id: string, updates: Partial<Property>) => {
    const next = properties.map((p) => (p.id === id ? { ...p, ...updates } : p));
    saveProperties(next);
  };

  const updateVerificationStatus = (id: string, status: VerificationStatus, reason?: string) => {
    const next = properties.map((p) => {
      if (p.id === id) {
        return {
          ...p,
          verificationStatus: status,
          isVerified: status === 'approved',
          rejectionReason: status === 'rejected' ? reason : undefined
        };
      }
      return p;
    });
    saveProperties(next);
  };

  const deleteProperty = (id: string) => {
    const next = properties.filter((p) => p.id !== id);
    saveProperties(next);
  };

  const addInquiry = (inquiryData: {
    propertyId: string;
    propertyTitle: string;
    buyerName: string;
    buyerPhone: string;
    buyerEmail: string;
    message: string;
    preferredTime?: string;
    sellerUserId?: string;
    buyerUserId?: string;
  }): PropertyInquiry => {
    const newInq: PropertyInquiry = {
      id: `inq-${Date.now()}`,
      propertyId: inquiryData.propertyId,
      propertyTitle: inquiryData.propertyTitle,
      sellerUserId: inquiryData.sellerUserId,
      buyerUserId: inquiryData.buyerUserId,
      buyerName: inquiryData.buyerName,
      buyerPhone: inquiryData.buyerPhone,
      buyerEmail: inquiryData.buyerEmail,
      message: inquiryData.message,
      preferredTime: inquiryData.preferredTime,
      status: 'new',
      createdAt: 'Just now'
    };

    const next = [newInq, ...inquiries];
    saveInquiries(next);

    // Increment property inquiries count
    const prop = properties.find((p) => p.id === inquiryData.propertyId);
    if (prop) {
      updateProperty(prop.id, { inquiriesCount: (prop.inquiriesCount || 0) + 1 });
    }

    return newInq;
  };

  const updateInquiryStatus = (id: string, status: PropertyInquiry['status']) => {
    const next = inquiries.map((inq) => (inq.id === id ? { ...inq, status } : inq));
    saveInquiries(next);
  };

  const resetToDefaultData = () => {
    saveProperties(INITIAL_PROPERTIES);
    saveInquiries(INITIAL_INQUIRIES);
    saveShortlists(['prop-blr-1', 'prop-mum-1']);
  };

  return (
    <PropertyContext.Provider
      value={{
        properties,
        inquiries,
        shortlistIds,
        isLoading,
        toggleShortlist,
        isShortlisted,
        getPropertyById,
        addProperty,
        updateProperty,
        updateVerificationStatus,
        deleteProperty,
        addInquiry,
        updateInquiryStatus,
        resetToDefaultData
      }}
    >
      {children}
    </PropertyContext.Provider>
  );
}

export function useProperties() {
  const context = useContext(PropertyContext);
  if (!context) {
    throw new Error('useProperties must be used within a PropertyProvider');
  }
  return context;
}
