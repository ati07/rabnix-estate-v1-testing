'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { 
  Building2, 
  User, 
  Home, 
  ShieldCheck, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Heart, 
  Phone, 
  Mail, 
  Plus, 
  Trash2, 
  Eye, 
  Calendar, 
  Sparkles, 
  Layers, 
  MapPin, 
  Edit3, 
  FileText, 
  ArrowRight,
  TrendingUp,
  MessageSquare,
  LogOut,
  Sliders,
  Check,
  X,
  PlusCircle,
  BarChart3,
  LineChart as LineChartIcon,
  PieChart as PieChartIcon,
  Palette,
  Compass,
  Upload,
  IndianRupee,
  Search,
  Filter,
  CheckCircle,
  Menu,
  ChevronRight,
  ExternalLink,
  Share2,
  Lock,
  ArrowUpRight,
  Zap,
  Tag,
  Key,
  UserX,
  Unlock,
  Activity,
  ShieldAlert,
  Shield,
  Users,
  Ban,
  FileCheck,
  RefreshCw
} from 'lucide-react';
import dynamic from 'next/dynamic';

const OverviewSnapshotChart = dynamic(
  () => import('@/components/DashboardCharts').then((mod) => mod.OverviewSnapshotChart),
  { ssr: false, loading: () => <div className="h-64 bg-slate-50 animate-pulse rounded-xl" /> }
);
const DetailedViewsAreaChart = dynamic(
  () => import('@/components/DashboardCharts').then((mod) => mod.DetailedViewsAreaChart),
  { ssr: false, loading: () => <div className="h-72 bg-slate-50 animate-pulse rounded-xl" /> }
);
const LeadsBarChart = dynamic(
  () => import('@/components/DashboardCharts').then((mod) => mod.LeadsBarChart),
  { ssr: false, loading: () => <div className="h-64 bg-slate-50 animate-pulse rounded-xl" /> }
);
const CategoryPieChart = dynamic(
  () => import('@/components/DashboardCharts').then((mod) => mod.CategoryPieChart),
  { ssr: false, loading: () => <div className="h-64 bg-slate-50 animate-pulse rounded-xl" /> }
);
const PriceBenchmarkBarChart = dynamic(
  () => import('@/components/DashboardCharts').then((mod) => mod.PriceBenchmarkBarChart),
  { ssr: false, loading: () => <div className="h-64 bg-slate-50 animate-pulse rounded-xl" /> }
);

// Dynamic Admin Charts
const AdminActivityTrendChart = dynamic(
  () => import('@/components/DashboardCharts').then((mod) => mod.AdminActivityTrendChart),
  { ssr: false, loading: () => <div className="h-72 bg-slate-50 animate-pulse rounded-xl" /> }
);
const AdminUserBreakdownPieChart = dynamic(
  () => import('@/components/DashboardCharts').then((mod) => mod.AdminUserBreakdownPieChart),
  { ssr: false, loading: () => <div className="h-64 bg-slate-50 animate-pulse rounded-xl" /> }
);
const AdminModerationStatusChart = dynamic(
  () => import('@/components/DashboardCharts').then((mod) => mod.AdminModerationStatusChart),
  { ssr: false, loading: () => <div className="h-64 bg-slate-50 animate-pulse rounded-xl" /> }
);
const AdminCityDistributionBarChart = dynamic(
  () => import('@/components/DashboardCharts').then((mod) => mod.AdminCityDistributionBarChart),
  { ssr: false, loading: () => <div className="h-64 bg-slate-50 animate-pulse rounded-xl" /> }
);

import { useAuth, DEMO_USERS } from '@/lib/authContext';
import { useProperties } from '@/lib/propertyContext';
import { 
  UserRole, 
  UserProfile,
  Property, 
  PropertyInquiry, 
  ListingType, 
  PropertyCategory, 
  FurnishingStatus, 
  ConstructionStatus, 
  FacingDirection,
  VerificationStatus,
  SystemActivityLog
} from '@/lib/types';
import { CITIES_DATA } from '@/lib/realEstateData';
import { formatIndianCurrency } from '@/lib/formatters';

const AMENITIES_LIST = [
  'Swimming Pool', 'Gymnasium', 'Clubhouse', 'Children Play Area',
  '24x7 Security', 'Power Backup', 'Covered Car Parking', 'Intercom Facility',
  'Jogging Track', 'Landscaped Gardens', 'EV Charging Station', 'Rainwater Harvesting',
  'Visitor Parking', 'CCTV Surveillance', 'Badminton Court', 'Squash Court',
  'Infinity Pool', 'Rooftop Lounge', 'Co-working Pods', 'Solar Panels'
];

const SAMPLE_PHOTO_PRESETS = [
  'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80'
];

export default function UserDashboardPage() {
  const router = useRouter();
  const { 
    user, 
    isAuthenticated, 
    logout, 
    quickDemoLogin, 
    updateProfile,
    users,
    activityLogs,
    toggleBlockUser,
    deleteUser,
    updateUserRole,
    logActivity
  } = useAuth();

  const { 
    properties, 
    inquiries, 
    shortlistIds, 
    toggleShortlist, 
    deleteProperty, 
    updateInquiryStatus, 
    addProperty,
    updateProperty,
    updateVerificationStatus
  } = useProperties();

  // Sidebar navigation tabs
  const [activeTab, setActiveTab] = useState<
    'overview' | 'upload' | 'listings' | 'graphs' | 'appearance' | 'inquiries' | 'shortlist' |
    'admin_moderation' | 'admin_users' | 'admin_activity' | 'admin_trends'
  >('overview');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Admin filter states
  const [adminUserSearch, setAdminUserSearch] = useState('');
  const [adminRoleFilter, setAdminRoleFilter] = useState<string>('all');
  const [adminUserStatusFilter, setAdminUserStatusFilter] = useState<'all' | 'active' | 'blocked'>('all');
  
  const [adminModerationFilter, setAdminModerationFilter] = useState<string>('pending');
  const [adminModerationSearch, setAdminModerationSearch] = useState('');
  
  const [adminActivitySearch, setAdminActivitySearch] = useState('');
  const [adminActivityCategoryFilter, setAdminActivityCategoryFilter] = useState<string>('all');

  // Block modal state
  const [blockModalTarget, setBlockModalTarget] = useState<UserProfile | null>(null);
  const [blockReasonText, setBlockReasonText] = useState('Suspicious activity / Listing Policy violation');

  // Rejection modal state
  const [rejectModalProperty, setRejectModalProperty] = useState<Property | null>(null);
  const [rejectFeedbackText, setRejectFeedbackText] = useState('Invalid or unverified RERA registration details');

  // Filter and search inside "My Listings"
  const [listingStatusFilter, setListingStatusFilter] = useState<'all' | 'approved' | 'pending' | 'under_review' | 'rejected'>('all');
  const [listingSearchQuery, setListingSearchQuery] = useState('');

  // Graph Timeframe filter
  const [graphTimeframe, setGraphTimeframe] = useState<'7d' | '30d' | '6m'>('30d');

  // Inline Upload Form States
  const [uploadStep, setUploadStep] = useState<number>(1);
  const [uploadListingType, setUploadListingType] = useState<ListingType>('buy');
  const [uploadCategory, setUploadCategory] = useState<PropertyCategory>('Apartment');
  const [uploadCity, setUploadCity] = useState<string>(user?.city || 'Bangalore');
  const [uploadLocality, setUploadLocality] = useState<string>('');
  const [uploadSubLocality, setUploadSubLocality] = useState<string>('');
  const [uploadTitle, setUploadTitle] = useState<string>('');
  const [uploadBhk, setUploadBhk] = useState<number>(2);
  const [uploadBathrooms, setUploadBathrooms] = useState<number>(2);
  const [uploadBalconies, setUploadBalconies] = useState<number>(1);
  const [uploadCarpetArea, setUploadCarpetArea] = useState<number>(1200);
  const [uploadSuperArea, setUploadSuperArea] = useState<number>(1450);
  const [uploadPrice, setUploadPrice] = useState<number>(8500000);
  const [uploadMaintenance, setUploadMaintenance] = useState<number>(3500);
  const [uploadFurnishing, setUploadFurnishing] = useState<FurnishingStatus>('Semi-Furnished');
  const [uploadFloor, setUploadFloor] = useState<number>(4);
  const [uploadTotalFloors, setUploadTotalFloors] = useState<number>(14);
  const [uploadFacing, setUploadFacing] = useState<FacingDirection>('East');
  const [uploadConstruction, setUploadConstruction] = useState<ConstructionStatus>('Ready to Move');
  const [uploadPossession, setUploadPossession] = useState<string>('Immediate');
  const [uploadReraId, setUploadReraId] = useState<string>('PRM/KA/RERA/1251/310/PR/200115/003188');
  const [uploadDescription, setUploadDescription] = useState<string>(
    'Well ventilated, Vastu compliant home with premium fittings, spacious modular kitchen, and panoramic skyline views in a prime gated community.'
  );
  const [uploadAmenities, setUploadAmenities] = useState<string[]>([
    'Swimming Pool',
    'Gymnasium',
    '24/7 Security',
    'Power Backup',
    'Club House',
    'Covered Parking'
  ]);
  const [uploadImages, setUploadImages] = useState<string[]>([
    SAMPLE_PHOTO_PRESETS[0],
    SAMPLE_PHOTO_PRESETS[1]
  ]);
  const [customPhotoInput, setCustomPhotoInput] = useState<string>('');
  const [hasEncumbranceDoc, setHasEncumbranceDoc] = useState(true);
  const [hasPlanDoc, setHasPlanDoc] = useState(true);
  const [hasTaxDoc, setHasTaxDoc] = useState(true);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccessId, setUploadSuccessId] = useState<string | null>(null);

  // Appearance & Branding Form States
  const [brandName, setBrandName] = useState(user?.name || 'Rahul Sharma');
  const [brandCompany, setBrandCompany] = useState(user?.companyName || 'Prime Realty Partners');
  const [brandRera, setBrandRera] = useState(user?.reraNumber || 'PRM/KA/RERA/1251/310/AG/210412/00189');
  const [brandPhone, setBrandPhone] = useState(user?.phone || '+91 98765 43210');
  const [brandEmail, setBrandEmail] = useState(user?.email || 'rahul.sharma@example.com');
  const [brandCity, setBrandCity] = useState(user?.city || 'Bangalore');
  const [brandThemeColor, setBrandThemeColor] = useState<string>('emerald');
  const [showVerifiedBadge, setShowVerifiedBadge] = useState(true);
  const [appearanceSavedToast, setAppearanceSavedToast] = useState(false);

  // Current user role
  const currentRole: UserRole = user?.role || 'owner';

  // Shortlisted properties
  const shortlistedProperties = useMemo(() => {
    return properties.filter((p) => shortlistIds.includes(p.id));
  }, [properties, shortlistIds]);

  // User posted properties
  const myPostedProperties = useMemo(() => {
    return properties.filter((p) => {
      if (user?.id && p.postedByUserId === user.id) return true;
      if (currentRole === 'owner' && p.postedBy.type === 'Owner') return true;
      if (currentRole === 'agent' && p.postedBy.type === 'Verified Agent') return true;
      if (currentRole === 'builder' && p.postedBy.type === 'Builder') return true;
      return false;
    });
  }, [properties, user, currentRole]);

  // Filtered listings
  const filteredListings = useMemo(() => {
    return myPostedProperties.filter((p) => {
      if (listingStatusFilter !== 'all' && p.verificationStatus !== listingStatusFilter) {
        return false;
      }
      if (listingSearchQuery.trim()) {
        const query = listingSearchQuery.toLowerCase();
        const matchesTitle = p.title.toLowerCase().includes(query);
        const matchesLocality = p.locality.toLowerCase().includes(query);
        const matchesCategory = p.category.toLowerCase().includes(query);
        return matchesTitle || matchesLocality || matchesCategory;
      }
      return true;
    });
  }, [myPostedProperties, listingStatusFilter, listingSearchQuery]);

  // Received inquiries
  const receivedInquiries = useMemo(() => {
    return inquiries.filter((inq) => {
      if (currentRole === 'buyer') {
        return inq.buyerEmail === user?.email || inq.buyerName === user?.name;
      }
      return true;
    });
  }, [inquiries, user, currentRole]);

  // Aggregate Metrics for Analytics
  const totalViews = useMemo(() => {
    return myPostedProperties.reduce((acc, p) => acc + (p.viewsCount || 48), 0);
  }, [myPostedProperties]);

  const totalInquiriesCount = useMemo(() => {
    return myPostedProperties.reduce((acc, p) => acc + (p.inquiriesCount || 3), 0) + receivedInquiries.length;
  }, [myPostedProperties, receivedInquiries]);

  // Chart Data Calculations
  const viewsTrendData = useMemo(() => {
    if (graphTimeframe === '7d') {
      return [
        { day: 'Mon', views: 45, uniqueVisitors: 32, inquiries: 4 },
        { day: 'Tue', views: 72, uniqueVisitors: 51, inquiries: 6 },
        { day: 'Wed', views: 98, uniqueVisitors: 68, inquiries: 9 },
        { day: 'Thu', views: 84, uniqueVisitors: 59, inquiries: 5 },
        { day: 'Fri', views: 130, uniqueVisitors: 92, inquiries: 14 },
        { day: 'Sat', views: 195, uniqueVisitors: 142, inquiries: 22 },
        { day: 'Sun', views: 220, uniqueVisitors: 165, inquiries: 28 }
      ];
    } else if (graphTimeframe === '6m') {
      return [
        { day: 'Oct', views: 680, uniqueVisitors: 490, inquiries: 48 },
        { day: 'Nov', views: 820, uniqueVisitors: 610, inquiries: 62 },
        { day: 'Dec', views: 1140, uniqueVisitors: 840, inquiries: 94 },
        { day: 'Jan', views: 1450, uniqueVisitors: 1050, inquiries: 118 },
        { day: 'Feb', views: 1780, uniqueVisitors: 1290, inquiries: 142 },
        { day: 'Mar', views: 2150, uniqueVisitors: 1560, inquiries: 185 }
      ];
    }
    // 30 days
    return [
      { day: 'Week 1', views: 320, uniqueVisitors: 240, inquiries: 24 },
      { day: 'Week 2', views: 480, uniqueVisitors: 360, inquiries: 38 },
      { day: 'Week 3', views: 620, uniqueVisitors: 450, inquiries: 52 },
      { day: 'Week 4', views: 790, uniqueVisitors: 580, inquiries: 71 }
    ];
  }, [graphTimeframe]);

  const propertyLeadsData = useMemo(() => {
    if (myPostedProperties.length === 0) {
      return [
        { name: 'Prestige Falcon', views: 140, leads: 18 },
        { name: 'Sea View Bandra', views: 195, leads: 26 },
        { name: 'Golf Course Villa', views: 220, leads: 31 }
      ];
    }
    return myPostedProperties.slice(0, 5).map((p) => ({
      name: p.title.length > 18 ? p.title.substring(0, 18) + '...' : p.title,
      views: p.viewsCount || 85,
      leads: p.inquiriesCount || 8
    }));
  }, [myPostedProperties]);

  const categoryDistributionData = useMemo(() => {
    const counts: Record<string, number> = {};
    const dataset = myPostedProperties.length > 0 ? myPostedProperties : properties.slice(0, 8);
    dataset.forEach((p) => {
      counts[p.category] = (counts[p.category] || 0) + 1;
    });
    return Object.keys(counts).map((cat) => ({
      name: cat,
      value: counts[cat]
    }));
  }, [myPostedProperties, properties]);

  const PIE_COLORS = ['#18A67D', '#0F2A43', '#3B82F6', '#F59E0B', '#8B5CF6', '#EC4899'];

  const priceBenchmarkData = useMemo(() => {
    return [
      { locality: 'Whitefield', myRate: 7800, marketAvg: 7200 },
      { locality: 'Indiranagar', myRate: 14500, marketAvg: 13800 },
      { locality: 'Bandra West', myRate: 48000, marketAvg: 46500 },
      { locality: 'Golf Course Rd', myRate: 19200, marketAvg: 18500 }
    ];
  }, []);

  // Admin Memoized Lists & Computations
  const adminPendingProperties = useMemo(() => {
    return properties.filter((p) => p.verificationStatus === 'pending' || p.verificationStatus === 'under_review');
  }, [properties]);

  const adminBlockedUsers = useMemo(() => {
    return (users || []).filter((u) => u.isBlocked);
  }, [users]);

  const adminFilteredUsers = useMemo(() => {
    return (users || []).filter((u) => {
      if (adminRoleFilter !== 'all' && u.role !== adminRoleFilter) return false;
      if (adminUserStatusFilter === 'active' && u.isBlocked) return false;
      if (adminUserStatusFilter === 'blocked' && !u.isBlocked) return false;
      if (adminUserSearch.trim()) {
        const query = adminUserSearch.toLowerCase();
        const matchesName = u.name.toLowerCase().includes(query);
        const matchesEmail = u.email.toLowerCase().includes(query);
        const matchesCity = (u.city || '').toLowerCase().includes(query);
        const matchesPhone = (u.phone || '').toLowerCase().includes(query);
        return matchesName || matchesEmail || matchesCity || matchesPhone;
      }
      return true;
    });
  }, [users, adminRoleFilter, adminUserStatusFilter, adminUserSearch]);

  const adminFilteredModerationList = useMemo(() => {
    return properties.filter((p) => {
      if (adminModerationFilter !== 'all' && p.verificationStatus !== adminModerationFilter) return false;
      if (adminModerationSearch.trim()) {
        const query = adminModerationSearch.toLowerCase();
        const matchesTitle = p.title.toLowerCase().includes(query);
        const matchesLocality = p.locality.toLowerCase().includes(query);
        const matchesCity = p.city.toLowerCase().includes(query);
        const matchesRera = (p.reraId || '').toLowerCase().includes(query);
        const matchesSeller = (p.postedBy?.name || '').toLowerCase().includes(query);
        return matchesTitle || matchesLocality || matchesCity || matchesRera || matchesSeller;
      }
      return true;
    });
  }, [properties, adminModerationFilter, adminModerationSearch]);

  const adminFilteredActivityLogs = useMemo(() => {
    return (activityLogs || []).filter((log) => {
      if (adminActivityCategoryFilter !== 'all') {
        if (adminActivityCategoryFilter === 'moderation' && !['property_verified', 'property_rejected'].includes(log.action)) return false;
        if (adminActivityCategoryFilter === 'user_management' && !['user_blocked', 'user_unblocked', 'user_registered'].includes(log.action)) return false;
        if (adminActivityCategoryFilter === 'property' && !['property_created', 'property_deleted', 'inquiry_received'].includes(log.action)) return false;
      }
      if (adminActivitySearch.trim()) {
        const query = adminActivitySearch.toLowerCase();
        const matchesDesc = (log.details || '').toLowerCase().includes(query) || (log.targetTitle || '').toLowerCase().includes(query);
        const matchesUser = (log.actorName || '').toLowerCase().includes(query);
        const matchesAction = (log.action || '').toLowerCase().includes(query);
        return matchesDesc || matchesUser || matchesAction;
      }
      return true;
    });
  }, [activityLogs, adminActivityCategoryFilter, adminActivitySearch]);

  const adminActivityTrendData = useMemo(() => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    return days.map((d, i) => ({
      date: d,
      newUploads: 4 + (i * 3) % 7 + Math.floor(properties.length / 4),
      verifiedCount: 3 + (i * 2) % 5 + Math.floor(properties.filter(p => p.verificationStatus === 'approved').length / 5),
      inquiriesCount: 8 + (i * 5) % 12 + Math.floor(inquiries.length / 2),
      blockedAttempts: i === 3 ? 2 : i === 6 ? 1 : 0
    }));
  }, [properties, inquiries]);

  const adminUserRoleDistribution = useMemo(() => {
    const counts: Record<string, number> = { owner: 0, agent: 0, builder: 0, buyer: 0, admin: 0 };
    (users || []).forEach((u) => {
      counts[u.role] = (counts[u.role] || 0) + 1;
    });
    return [
      { name: 'Owners', value: counts.owner || 1 },
      { name: 'Agents', value: counts.agent || 1 },
      { name: 'Builders', value: counts.builder || 1 },
      { name: 'Buyers', value: counts.buyer || 1 },
      { name: 'Admins', value: counts.admin || 1 }
    ];
  }, [users]);

  const adminModerationDistribution = useMemo(() => {
    const counts: Record<string, number> = { approved: 0, pending: 0, under_review: 0, rejected: 0 };
    properties.forEach((p) => {
      counts[p.verificationStatus || 'approved'] = (counts[p.verificationStatus || 'approved'] || 0) + 1;
    });
    return [
      { name: 'Approved (Green Seal)', value: counts.approved },
      { name: 'Under Review', value: counts.under_review },
      { name: 'Pending Initial Check', value: counts.pending },
      { name: 'Rejected / Flagged', value: counts.rejected }
    ];
  }, [properties]);

  const adminCityDistribution = useMemo(() => {
    const counts: Record<string, { listings: number; inquiries: number }> = {};
    properties.forEach((p) => {
      if (!counts[p.city]) counts[p.city] = { listings: 0, inquiries: 0 };
      counts[p.city].listings += 1;
      counts[p.city].inquiries += p.inquiriesCount || 2;
    });
    return Object.keys(counts).slice(0, 6).map((city) => ({
      city,
      listings: counts[city].listings,
      inquiries: counts[city].inquiries
    }));
  }, [properties]);

  // Admin Action Handlers
  const handleAdminApproveProperty = (prop: Property) => {
    updateVerificationStatus(prop.id, 'approved');
    logActivity({
      action: 'property_verified',
      actorName: user?.name || 'Rabnix Master Admin',
      actorRole: 'Admin',
      details: `RERA & Document Verification Approved for "${prop.title}" in ${prop.locality}, ${prop.city}`,
      targetTitle: prop.title,
      targetId: prop.id,
      severity: 'success'
    });
  };

  const handleAdminSetUnderReview = (prop: Property) => {
    updateVerificationStatus(prop.id, 'under_review');
    logActivity({
      action: 'property_created',
      actorName: user?.name || 'Rabnix Master Admin',
      actorRole: 'Admin',
      details: `Dispatched field surveyor for physical document validation: "${prop.title}"`,
      targetTitle: prop.title,
      targetId: prop.id,
      severity: 'warning'
    });
  };

  const handleAdminOpenRejectModal = (prop: Property) => {
    setRejectModalProperty(prop);
    setRejectFeedbackText('Invalid or unverified RERA registration details / Discrepancies in title deed');
  };

  const handleAdminConfirmReject = () => {
    if (!rejectModalProperty) return;
    updateVerificationStatus(rejectModalProperty.id, 'rejected', rejectFeedbackText);
    logActivity({
      action: 'property_rejected',
      actorName: user?.name || 'Rabnix Master Admin',
      actorRole: 'Admin',
      details: `Rejected listing "${rejectModalProperty.title}". Reason: ${rejectFeedbackText}`,
      targetTitle: rejectModalProperty.title,
      targetId: rejectModalProperty.id,
      severity: 'warning'
    });
    setRejectModalProperty(null);
  };

  const handleAdminOpenBlockModal = (targetUser: UserProfile) => {
    setBlockModalTarget(targetUser);
    setBlockReasonText('Suspicious activity / Listing Policy violation');
  };

  const handleAdminConfirmBlock = () => {
    if (!blockModalTarget) return;
    toggleBlockUser(blockModalTarget.id, blockReasonText);
    setBlockModalTarget(null);
  };

  const handleAdminUnblockUser = (targetUser: UserProfile) => {
    toggleBlockUser(targetUser.id);
  };

  // Upload Property Helpers
  const handleToggleAmenity = (name: string) => {
    if (uploadAmenities.includes(name)) {
      setUploadAmenities(uploadAmenities.filter((a) => a !== name));
    } else {
      setUploadAmenities([...uploadAmenities, name]);
    }
  };

  const handleAddCustomPhoto = () => {
    if (customPhotoInput.trim()) {
      setUploadImages([...uploadImages, customPhotoInput.trim()]);
      setCustomPhotoInput('');
    }
  };

  const handleAddPresetPhoto = (url: string) => {
    if (!uploadImages.includes(url)) {
      setUploadImages([...uploadImages, url]);
    }
  };

  const handleRemovePhoto = (idx: number) => {
    setUploadImages(uploadImages.filter((_, i) => i !== idx));
  };

  const handleInlineUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setUploadError(null);

    if (!uploadLocality.trim()) {
      setUploadError('Please enter a valid locality / neighborhood');
      return;
    }
    if (uploadPrice <= 0) {
      setUploadError('Please enter a valid price / rent amount');
      return;
    }
    if (uploadImages.length === 0) {
      setUploadError('Please include at least 1 property photograph');
      return;
    }

    const finalTitle = uploadTitle.trim() || `${uploadBhk} BHK ${uploadCategory} in ${uploadLocality}, ${uploadCity}`;
    const docs: string[] = [];
    if (hasEncumbranceDoc) docs.push('Encumbrance Certificate (EC)');
    if (hasPlanDoc) docs.push('Approved Sanction Plan');
    if (hasTaxDoc) docs.push('Property Tax Clearance');

    const newProp = addProperty({
      title: finalTitle,
      tagline: `${uploadBhk} BHK • ${uploadCarpetArea} sq.ft • ${uploadFurnishing}`,
      listingType: uploadListingType,
      category: uploadCategory,
      city: uploadCity,
      locality: uploadLocality,
      subLocality: uploadSubLocality,
      price: uploadPrice,
      carpetAreaSqFt: uploadCarpetArea,
      superBuiltUpAreaSqFt: uploadSuperArea || Math.round(uploadCarpetArea * 1.25),
      bhk: uploadBhk,
      bathrooms: uploadBathrooms,
      balconies: uploadBalconies,
      furnishing: uploadFurnishing,
      floor: uploadFloor,
      totalFloors: uploadTotalFloors,
      facing: uploadFacing,
      constructionStatus: uploadConstruction,
      possessionDate: uploadPossession,
      maintenance: uploadMaintenance,
      reraId: uploadReraId,
      reraApproved: !!uploadReraId,
      images: uploadImages,
      description: uploadDescription,
      amenities: uploadAmenities,
      documentsSubmitted: docs,
      postedByUserId: user?.id || 'usr-owner-202',
      postedBy: {
        name: user?.name || brandName,
        type: currentRole === 'builder' ? 'Builder' : currentRole === 'agent' ? 'Verified Agent' : 'Owner',
        phone: user?.phone || brandPhone,
        companyName: user?.companyName || brandCompany,
        responseTime: 'Within 2 hours',
        rating: 5.0
      }
    });

    setUploadSuccessId(newProp.id);
  };

  const handleSaveAppearance = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({
      name: brandName,
      companyName: brandCompany,
      reraNumber: brandRera,
      phone: brandPhone,
      email: brandEmail,
      city: brandCity
    });
    setAppearanceSavedToast(true);
    setTimeout(() => setAppearanceSavedToast(false), 3000);
  };

  // If user is not authenticated, show sign-in gatekeeper with 1-click test logins
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-between">
        <header className="w-full bg-white border-b border-[#E2E8F0] py-4 px-4 sm:px-8">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2 group select-none">
              <div className="w-8 h-8 bg-[#0F2A43] rounded-md flex items-center justify-center shadow-xs">
                <div className="w-3.5 h-3.5 border-2 border-[#18A67D] rotate-45"></div>
              </div>
              <span className="text-xl font-extrabold tracking-tight text-[#0F2A43]">
                Rabnix <span className="text-[#18A67D]">Estate</span>
              </span>
            </Link>
            <Link href="/" className="text-xs font-bold text-[#64748B] hover:text-[#0F2A43]">
              &larr; Return to Home
            </Link>
          </div>
        </header>

        <main className="max-w-xl mx-auto w-full px-4 py-12">
          <div className="bg-white rounded-3xl shadow-xl border border-[#E2E8F0] p-8 sm:p-10 space-y-6 text-center animate-in zoom-in-95">
            <div className="w-16 h-16 rounded-full bg-[#E7F6F1] text-[#18A67D] flex items-center justify-center mx-auto border-2 border-[#18A67D]/20 shadow-xs">
              <ShieldCheck className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <span className="bg-[#E7F6F1] text-[#0E7C5D] text-[11px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                Seller & Buyer Dashboard
              </span>
              <h1 className="text-2xl sm:text-3xl font-black text-[#0F2A43]">
                Access Your Property Dashboard
              </h1>
              <p className="text-xs sm:text-sm text-[#64748B] max-w-md mx-auto leading-relaxed">
                Manage your posted listings, upload new properties, review performance graphs, and respond to verified buyer inquiries.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <Link
                href="/auth?mode=signin"
                className="w-full py-3 px-4 bg-[#0F2A43] hover:bg-[#163b5c] text-white font-bold text-sm rounded-xl transition-all shadow-sm flex items-center justify-center gap-2"
              >
                <Key className="w-4 h-4" />
                <span>Sign In</span>
              </Link>
              <Link
                href="/auth?mode=signup"
                className="w-full py-3 px-4 bg-[#18A67D] hover:bg-[#0E7C5D] text-white font-bold text-sm rounded-xl transition-all shadow-sm flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" />
                <span>Register Free</span>
              </Link>
            </div>

            <div className="pt-4 border-t border-[#E2E8F0]">
              <p className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider mb-3">
                1-Click Quick Demo Login:
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <button
                  onClick={() => quickDemoLogin('owner')}
                  className="p-2.5 bg-[#F8FAFC] hover:bg-[#F1F5F9] border border-[#CBD5E1] rounded-xl text-xs font-bold text-[#0F2A43] transition-all cursor-pointer"
                >
                  🏡 Owner
                </button>
                <button
                  onClick={() => quickDemoLogin('agent')}
                  className="p-2.5 bg-[#F8FAFC] hover:bg-[#F1F5F9] border border-[#CBD5E1] rounded-xl text-xs font-bold text-[#0F2A43] transition-all cursor-pointer"
                >
                  🏢 Agent
                </button>
                <button
                  onClick={() => quickDemoLogin('builder')}
                  className="p-2.5 bg-[#F8FAFC] hover:bg-[#F1F5F9] border border-[#CBD5E1] rounded-xl text-xs font-bold text-[#0F2A43] transition-all cursor-pointer"
                >
                  🏗️ Builder
                </button>
                <button
                  onClick={() => quickDemoLogin('buyer')}
                  className="p-2.5 bg-[#F8FAFC] hover:bg-[#F1F5F9] border border-[#CBD5E1] rounded-xl text-xs font-bold text-[#0F2A43] transition-all cursor-pointer"
                >
                  🔍 Buyer
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-between">
      
      {/* Top Main Navigation */}
      <header className="w-full bg-white border-b border-[#E2E8F0] py-3 px-4 sm:px-8 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
              className="lg:hidden p-2 text-[#0F2A43] hover:bg-[#F1F5F9] rounded-lg cursor-pointer"
            >
              <Menu className="w-5 h-5" />
            </button>

            <Link href="/" className="flex items-center gap-2 group select-none">
              <div className="w-8 h-8 bg-[#0F2A43] rounded-md flex items-center justify-center shadow-xs">
                <div className="w-3.5 h-3.5 border-2 border-[#18A67D] rotate-45"></div>
              </div>
              <span className="text-xl font-extrabold tracking-tight text-[#0F2A43]">
                Rabnix <span className="text-[#18A67D]">Estate</span>
              </span>
            </Link>
            
            <div className="hidden md:flex items-center gap-2 pl-3 border-l border-[#E2E8F0]">
              <span className="text-xs font-bold text-[#64748B]">Dashboard:</span>
              <span className="text-xs font-black text-[#0F2A43]">{user?.name}</span>
              <span className="bg-[#E7F6F1] text-[#0E7C5D] text-[10px] font-extrabold uppercase px-2 py-0.5 rounded">
                {currentRole}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              id="dashboard-upload-cta-btn"
              onClick={() => {
                setActiveTab('upload');
                setUploadSuccessId(null);
              }}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#18A67D] hover:bg-[#0E7C5D] text-white text-xs sm:text-sm font-bold transition-all shadow-xs cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Upload Property</span>
            </button>

            <Link
              href="/properties"
              className="hidden sm:inline-block px-3 py-1.5 rounded-xl border border-[#CBD5E1] bg-white text-xs font-bold text-[#0F2A43] hover:bg-[#F8FAFC]"
            >
              Browse Catalog
            </Link>

            <button
              onClick={() => {
                logout();
                router.push('/');
              }}
              className="p-2 text-[#64748B] hover:text-rose-600 rounded-lg hover:bg-[#F1F5F9] transition-colors cursor-pointer"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Dashboard Layout with Sidebar */}
      <div className="max-w-7xl mx-auto w-full px-4 sm:px-8 py-6 flex-1 flex flex-col lg:flex-row gap-6">
        
        {/* SIDEBAR NAVIGATION */}
        <aside
          className={`${
            mobileSidebarOpen ? 'block' : 'hidden'
          } lg:block w-full lg:w-64 bg-white rounded-2xl border border-[#E2E8F0] shadow-xs p-4 shrink-0 self-start sticky lg:top-20 z-30`}
        >
          {/* User Profile Mini Card */}
          <div className="p-3.5 bg-[#0F2A43] text-white rounded-xl mb-4 space-y-2">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-full overflow-hidden border-2 border-[#18A67D] relative shrink-0">
                <Image
                  src={user?.avatar || DEMO_USERS[currentRole]?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                  alt={user?.name || 'User'}
                  fill
                  className="object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="min-w-0">
                <div className="font-bold text-xs truncate">{user?.name}</div>
                <div className="text-[10px] text-slate-300 truncate">{user?.email}</div>
                <span className="inline-block mt-0.5 text-[9px] font-extrabold uppercase px-1.5 py-0.2 bg-[#18A67D] text-white rounded">
                  {currentRole.toUpperCase()}
                </span>
              </div>
            </div>

            {user?.isPhoneVerified && (
              <div className="flex items-center gap-1 text-[10px] text-[#22C39A] font-semibold pt-1 border-t border-white/10">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Verified Seller Identity</span>
              </div>
            )}
          </div>

          {/* Sidebar Nav Items */}
          <nav className="space-y-1 text-xs font-bold text-[#172033]">
            
            <button
              id="sidebar-tab-overview"
              onClick={() => {
                setActiveTab('overview');
                setMobileSidebarOpen(false);
              }}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all cursor-pointer ${
                activeTab === 'overview'
                  ? 'bg-[#E7F6F1] text-[#0E7C5D] font-black'
                  : 'hover:bg-[#F8FAFC] text-[#64748B] hover:text-[#0F2A43]'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Layers className="w-4 h-4 text-[#18A67D]" />
                <span>Overview</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-[#94A3B8]" />
            </button>

            <button
              id="sidebar-tab-upload"
              onClick={() => {
                setActiveTab('upload');
                setUploadSuccessId(null);
                setMobileSidebarOpen(false);
              }}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all cursor-pointer ${
                activeTab === 'upload'
                  ? 'bg-[#18A67D] text-white font-black shadow-xs'
                  : 'hover:bg-[#F8FAFC] text-[#64748B] hover:text-[#0F2A43]'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <PlusCircle className={`w-4 h-4 ${activeTab === 'upload' ? 'text-white' : 'text-[#18A67D]'}`} />
                <span>Upload Property</span>
              </div>
              <span className={`text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded ${activeTab === 'upload' ? 'bg-white/20 text-white' : 'bg-[#E7F6F1] text-[#0E7C5D]'}`}>
                FREE
              </span>
            </button>

            <button
              id="sidebar-tab-listings"
              onClick={() => {
                setActiveTab('listings');
                setMobileSidebarOpen(false);
              }}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all cursor-pointer ${
                activeTab === 'listings'
                  ? 'bg-[#E7F6F1] text-[#0E7C5D] font-black'
                  : 'hover:bg-[#F8FAFC] text-[#64748B] hover:text-[#0F2A43]'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Building2 className="w-4 h-4 text-[#18A67D]" />
                <span>My Listings</span>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] bg-slate-100 text-[#0F2A43]">
                {myPostedProperties.length}
              </span>
            </button>

            <button
              id="sidebar-tab-graphs"
              onClick={() => {
                setActiveTab('graphs');
                setMobileSidebarOpen(false);
              }}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all cursor-pointer ${
                activeTab === 'graphs'
                  ? 'bg-[#E7F6F1] text-[#0E7C5D] font-black'
                  : 'hover:bg-[#F8FAFC] text-[#64748B] hover:text-[#0F2A43]'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <BarChart3 className="w-4 h-4 text-[#18A67D]" />
                <span>Analytics & Graphs</span>
              </div>
              <TrendingUp className="w-3.5 h-3.5 text-[#18A67D]" />
            </button>

            <button
              id="sidebar-tab-inquiries"
              onClick={() => {
                setActiveTab('inquiries');
                setMobileSidebarOpen(false);
              }}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all cursor-pointer ${
                activeTab === 'inquiries'
                  ? 'bg-[#E7F6F1] text-[#0E7C5D] font-black'
                  : 'hover:bg-[#F8FAFC] text-[#64748B] hover:text-[#0F2A43]'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <MessageSquare className="w-4 h-4 text-[#18A67D]" />
                <span>Inquiries & Leads</span>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] bg-[#E7F6F1] text-[#0E7C5D]">
                {receivedInquiries.length}
              </span>
            </button>

            <button
              id="sidebar-tab-appearance"
              onClick={() => {
                setActiveTab('appearance');
                setMobileSidebarOpen(false);
              }}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all cursor-pointer ${
                activeTab === 'appearance'
                  ? 'bg-[#E7F6F1] text-[#0E7C5D] font-black'
                  : 'hover:bg-[#F8FAFC] text-[#64748B] hover:text-[#0F2A43]'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Palette className="w-4 h-4 text-[#18A67D]" />
                <span>Appearance & Profile</span>
              </div>
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            </button>

            <button
              id="sidebar-tab-shortlist"
              onClick={() => {
                setActiveTab('shortlist');
                setMobileSidebarOpen(false);
              }}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all cursor-pointer ${
                activeTab === 'shortlist'
                  ? 'bg-[#E7F6F1] text-[#0E7C5D] font-black'
                  : 'hover:bg-[#F8FAFC] text-[#64748B] hover:text-[#0F2A43]'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Heart className="w-4 h-4 text-rose-500" />
                <span>Shortlisted</span>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] bg-rose-50 text-rose-600">
                {shortlistedProperties.length}
              </span>
            </button>

            {/* Admin Management Section */}
            <div className="pt-3 pb-1 border-t border-slate-200 mt-3">
              <div className="flex items-center justify-between px-3 mb-1.5">
                <span className="text-[10px] font-extrabold text-[#0F2A43] uppercase tracking-wider flex items-center gap-1">
                  <Shield className="w-3 h-3 text-[#18A67D]" />
                  Admin Controls
                </span>
                {adminPendingProperties.length > 0 && (
                  <span className="bg-amber-100 text-amber-800 text-[9px] font-extrabold px-1.5 py-0.2 rounded-full animate-pulse">
                    {adminPendingProperties.length} Pending
                  </span>
                )}
              </div>

              <button
                id="sidebar-tab-admin-moderation"
                onClick={() => {
                  setActiveTab('admin_moderation');
                  setMobileSidebarOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl transition-all cursor-pointer ${
                  activeTab === 'admin_moderation'
                    ? 'bg-[#0F2A43] text-white font-black'
                    : 'hover:bg-[#F8FAFC] text-[#64748B] hover:text-[#0F2A43]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <ShieldCheck className={`w-4 h-4 ${activeTab === 'admin_moderation' ? 'text-[#22C39A]' : 'text-emerald-600'}`} />
                  <span>RERA Verification</span>
                </div>
                <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                  activeTab === 'admin_moderation' ? 'bg-white/20 text-white' : 'bg-amber-100 text-amber-800'
                }`}>
                  {adminPendingProperties.length}
                </span>
              </button>

              <button
                id="sidebar-tab-admin-users"
                onClick={() => {
                  setActiveTab('admin_users');
                  setMobileSidebarOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl transition-all cursor-pointer ${
                  activeTab === 'admin_users'
                    ? 'bg-[#0F2A43] text-white font-black'
                    : 'hover:bg-[#F8FAFC] text-[#64748B] hover:text-[#0F2A43]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Users className={`w-4 h-4 ${activeTab === 'admin_users' ? 'text-[#22C39A]' : 'text-blue-600'}`} />
                  <span>User & Block Control</span>
                </div>
                <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                  activeTab === 'admin_users' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-700'
                }`}>
                  {users.length}
                </span>
              </button>

              <button
                id="sidebar-tab-admin-activity"
                onClick={() => {
                  setActiveTab('admin_activity');
                  setMobileSidebarOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl transition-all cursor-pointer ${
                  activeTab === 'admin_activity'
                    ? 'bg-[#0F2A43] text-white font-black'
                    : 'hover:bg-[#F8FAFC] text-[#64748B] hover:text-[#0F2A43]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Activity className={`w-4 h-4 ${activeTab === 'admin_activity' ? 'text-[#22C39A]' : 'text-indigo-600'}`} />
                  <span>All Activity Stream</span>
                </div>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
              </button>

              <button
                id="sidebar-tab-admin-trends"
                onClick={() => {
                  setActiveTab('admin_trends');
                  setMobileSidebarOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl transition-all cursor-pointer ${
                  activeTab === 'admin_trends'
                    ? 'bg-[#0F2A43] text-white font-black'
                    : 'hover:bg-[#F8FAFC] text-[#64748B] hover:text-[#0F2A43]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <BarChart3 className={`w-4 h-4 ${activeTab === 'admin_trends' ? 'text-[#22C39A]' : 'text-amber-600'}`} />
                  <span>Platform Trends</span>
                </div>
                <TrendingUp className="w-3.5 h-3.5 text-amber-500" />
              </button>

              <Link
                href="/admin"
                className="mt-2 w-full flex items-center justify-between px-3 py-2 rounded-xl bg-gradient-to-r from-[#0F2A43] to-[#163b5c] text-white text-[11px] font-bold shadow-xs hover:opacity-95 transition-opacity"
              >
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#18A67D]" />
                  Master Admin Portal
                </span>
                <ExternalLink className="w-3 h-3 text-slate-300" />
              </Link>
            </div>
          </nav>

          {/* Quick Demo Switcher */}
          <div className="mt-4 pt-3 border-t border-[#E2E8F0] space-y-2">
            <div className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider flex items-center justify-between">
              <span>Switch Test Persona:</span>
            </div>
            <div className="grid grid-cols-2 gap-1.5 text-[11px]">
              {(['admin', 'owner', 'agent', 'builder', 'buyer'] as UserRole[]).map((r) => (
                <button
                  key={r}
                  id={`demo-role-${r}`}
                  onClick={() => quickDemoLogin(r)}
                  className={`p-1.5 rounded-lg font-bold border transition-all cursor-pointer ${
                    currentRole === r
                      ? 'bg-[#0F2A43] text-white border-[#0F2A43]'
                      : 'bg-[#F8FAFC] text-[#64748B] border-[#E2E8F0] hover:text-[#0F2A43]'
                  }`}
                >
                  {r.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* MAIN DASHBOARD CONTENT AREA */}
        <main className="flex-1 min-w-0 space-y-6">
          
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6 animate-in fade-in">
              
              {/* Admin Special Notification Card if role is Admin */}
              {currentRole === 'admin' && (
                <div className="p-4 bg-gradient-to-r from-amber-500/10 via-emerald-500/10 to-blue-500/10 border border-amber-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#0F2A43] text-white flex items-center justify-center shrink-0">
                      <ShieldCheck className="w-5 h-5 text-[#18A67D]" />
                    </div>
                    <div>
                      <div className="text-xs font-black text-[#0F2A43] flex items-center gap-2">
                        <span>Platform Administrator Mode</span>
                        <span className="bg-amber-100 text-amber-900 text-[10px] font-extrabold px-2 py-0.5 rounded-md">
                          {adminPendingProperties.length} Verifications Pending
                        </span>
                      </div>
                      <p className="text-[11px] text-[#64748B]">
                        {users.length} registered accounts, {adminBlockedUsers.length} blocked users, {properties.length} active listings.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      onClick={() => setActiveTab('admin_moderation')}
                      className="px-3 py-1.5 rounded-lg bg-[#0F2A43] text-white text-xs font-bold hover:bg-[#163b5c] transition-colors cursor-pointer"
                    >
                      Verify Queue ({adminPendingProperties.length})
                    </button>
                    <button
                      onClick={() => setActiveTab('admin_users')}
                      className="px-3 py-1.5 rounded-lg bg-white border border-slate-300 text-xs font-bold text-[#0F2A43] hover:bg-slate-50 transition-colors cursor-pointer"
                    >
                      User Controls
                    </button>
                    <Link
                      href="/admin"
                      className="px-3 py-1.5 rounded-lg bg-[#18A67D] text-white text-xs font-bold hover:bg-[#0E7C5D] transition-colors flex items-center gap-1"
                    >
                      Full Admin Portal &rarr;
                    </Link>
                  </div>
                </div>
              )}

              {/* Header Hero Banner */}
              <div className="bg-gradient-to-r from-[#0F2A43] to-[#163b5c] text-white rounded-2xl p-6 shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h1 className="text-xl sm:text-2xl font-extrabold">Welcome back, {user?.name.split(' ')[0]}!</h1>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#18A67D] text-white uppercase">
                      {currentRole}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300">
                    Here is the live performance of your listings, leads, and audience engagement across India.
                  </p>
                </div>

                <button
                  onClick={() => {
                    setActiveTab('upload');
                    setUploadSuccessId(null);
                  }}
                  className="px-4 py-2.5 bg-[#18A67D] hover:bg-[#0E7C5D] text-white font-bold rounded-xl text-xs transition-all shadow-sm flex items-center gap-2 cursor-pointer shrink-0"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Upload Property</span>
                </button>
              </div>

              {/* 4 Core KPI Stat Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-[#E2E8F0] shadow-xs space-y-1">
                  <span className="text-[11px] font-bold text-[#64748B] uppercase">Active Listings</span>
                  <div className="text-2xl font-black text-[#0F2A43]">
                    {myPostedProperties.length}
                  </div>
                  <span className="text-[11px] text-[#18A67D] font-semibold flex items-center gap-0.5">
                    <ShieldCheck className="w-3.5 h-3.5" /> 100% RERA Verified
                  </span>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-[#E2E8F0] shadow-xs space-y-1">
                  <span className="text-[11px] font-bold text-[#64748B] uppercase">Total Impressions / Views</span>
                  <div className="text-2xl font-black text-[#0F2A43]">{totalViews}</div>
                  <span className="text-[11px] text-[#18A67D] font-semibold flex items-center gap-0.5">
                    <TrendingUp className="w-3.5 h-3.5" /> +24% this week
                  </span>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-[#E2E8F0] shadow-xs space-y-1">
                  <span className="text-[11px] font-bold text-[#64748B] uppercase">Inquiries & Leads</span>
                  <div className="text-2xl font-black text-[#0E7C5D]">{totalInquiriesCount}</div>
                  <span className="text-[11px] text-[#64748B]">Direct Buyer Phone & Visits</span>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-[#E2E8F0] shadow-xs space-y-1">
                  <span className="text-[11px] font-bold text-[#64748B] uppercase">Saved & Shortlisted</span>
                  <div className="text-2xl font-black text-rose-600">{shortlistedProperties.length}</div>
                  <span className="text-[11px] text-[#64748B]">Buyer Comparisons</span>
                </div>
              </div>

              {/* Quick Snapshot Graph */}
              <div className="bg-white rounded-2xl p-5 sm:p-6 border border-[#E2E8F0] shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-base font-extrabold text-[#0F2A43]">Property Views & Lead Traffic (Last 30 Days)</h2>
                    <p className="text-xs text-[#64748B]">Real-time engagement recorded across mobile & web viewers</p>
                  </div>
                  <button
                    onClick={() => setActiveTab('graphs')}
                    className="text-xs font-bold text-[#18A67D] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <span>Detailed Graphs</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <OverviewSnapshotChart data={viewsTrendData} />
              </div>

              {/* Quick Actions & Recent Listings Preview */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Recent Inquiries List */}
                <div className="bg-white rounded-2xl p-5 border border-[#E2E8F0] shadow-xs space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-extrabold text-sm text-[#0F2A43]">Recent Buyer Inquiries</h3>
                    <button onClick={() => setActiveTab('inquiries')} className="text-xs font-bold text-[#18A67D] hover:underline">
                      View All ({receivedInquiries.length})
                    </button>
                  </div>

                  {receivedInquiries.length === 0 ? (
                    <p className="text-xs text-[#64748B] py-6 text-center">No inquiries yet.</p>
                  ) : (
                    <div className="space-y-2.5">
                      {receivedInquiries.slice(0, 3).map((inq) => (
                        <div key={inq.id} className="p-3 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-1 text-xs">
                          <div className="flex justify-between items-start">
                            <span className="font-bold text-[#0F2A43]">{inq.buyerName}</span>
                            <span className="text-[10px] font-semibold text-[#18A67D]">{inq.status.toUpperCase()}</span>
                          </div>
                          <p className="text-[#64748B] line-clamp-1 italic">&ldquo;{inq.message}&rdquo;</p>
                          <div className="text-[10px] text-[#94A3B8] flex items-center gap-2">
                            <span>{inq.buyerPhone}</span> • <span>{inq.createdAt}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Upload Callout Card */}
                <div className="bg-[#E7F6F1] rounded-2xl p-5 border border-[#18A67D]/20 shadow-xs flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-[#0E7C5D] font-extrabold text-sm">
                      <Sparkles className="w-4 h-4 text-[#18A67D]" />
                      <span>Post Unlimited Properties 100% Free</span>
                    </div>
                    <p className="text-xs text-[#0F2A43] leading-relaxed">
                      Upload directly from your dashboard. Our AI automatically optimizes keywords, price comparisons, and formats your verified badges.
                    </p>
                    <ul className="text-xs space-y-1 text-[#0E7C5D] font-medium">
                      <li className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Direct inquiries without middlemen
                      </li>
                      <li className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Live performance & impressions tracking
                      </li>
                    </ul>
                  </div>

                  <button
                    onClick={() => {
                      setActiveTab('upload');
                      setUploadSuccessId(null);
                    }}
                    className="w-full py-2.5 bg-[#18A67D] hover:bg-[#0E7C5D] text-white font-bold rounded-xl text-xs transition-colors shadow-xs flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <PlusCircle className="w-4 h-4" />
                    <span>Upload Property Now</span>
                  </button>
                </div>

              </div>
            </div>
          )}

          {/* TAB 2: UPLOAD PROPERTY IN DASHBOARD */}
          {activeTab === 'upload' && (
            <div className="bg-white rounded-2xl p-6 sm:p-8 border border-[#E2E8F0] shadow-xs space-y-6 animate-in fade-in">
              
              {uploadSuccessId ? (
                <div className="text-center py-8 space-y-4 animate-in zoom-in-95 max-w-lg mx-auto">
                  <div className="w-16 h-16 rounded-full bg-[#E7F6F1] text-[#18A67D] flex items-center justify-center mx-auto ring-8 ring-[#E7F6F1]/50">
                    <CheckCircle className="w-10 h-10" />
                  </div>
                  <h2 className="text-2xl font-extrabold text-[#0F2A43]">
                    Property Uploaded Successfully!
                  </h2>
                  <p className="text-xs sm:text-sm text-[#64748B]">
                    Your property has been submitted and is currently in the verification queue. It is now visible under <strong>My Listings</strong>.
                  </p>
                  
                  <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
                    <button
                      onClick={() => setActiveTab('listings')}
                      className="px-5 py-2.5 bg-[#0F2A43] hover:bg-[#163b5c] text-white font-bold rounded-xl text-xs transition-colors cursor-pointer"
                    >
                      View in My Listings
                    </button>
                    <button
                      onClick={() => {
                        setUploadSuccessId(null);
                        setUploadStep(1);
                        setUploadTitle('');
                        setUploadLocality('');
                      }}
                      className="px-5 py-2.5 bg-[#18A67D] hover:bg-[#0E7C5D] text-white font-bold rounded-xl text-xs transition-colors cursor-pointer"
                    >
                      + Upload Another Property
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleInlineUploadSubmit} className="space-y-6">
                  
                  {/* Upload Header */}
                  <div className="border-b border-[#E2E8F0] pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="bg-[#E7F6F1] text-[#0E7C5D] text-[10px] font-black uppercase px-2 py-0.5 rounded">
                          Direct Dashboard Upload
                        </span>
                        <h2 className="text-lg sm:text-xl font-extrabold text-[#0F2A43]">
                          Upload a New Property Listing
                        </h2>
                      </div>
                      <p className="text-xs text-[#64748B]">
                        Fill the specifications below. Once submitted, your property will be indexed for verified buyers.
                      </p>
                    </div>
                  </div>

                  {uploadError && (
                    <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-bold flex items-center gap-2">
                      <AlertCircle className="w-4 h-4" />
                      <span>{uploadError}</span>
                    </div>
                  )}

                  {/* STEP 1: Type & Category */}
                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-[#172033] uppercase tracking-wider">
                        1. Intent:
                      </label>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {[
                          { id: 'buy', label: 'Sell Property' },
                          { id: 'rent', label: 'Rent Out' },
                          { id: 'pg', label: 'PG / Co-Living' },
                          { id: 'commercial', label: 'Commercial' }
                        ].map((item) => (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => setUploadListingType(item.id as ListingType)}
                            className={`p-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                              uploadListingType === item.id
                                ? 'border-[#18A67D] bg-[#E7F6F1] text-[#0E7C5D]'
                                : 'border-[#E2E8F0] bg-[#F8FAFC] text-[#172033] hover:bg-white'
                            }`}
                          >
                            {item.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-[#172033] uppercase tracking-wider">
                        2. Property Category:
                      </label>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
                        {['Apartment', 'Villa', 'Builder Floor', 'Penthouse', 'Residential Plot', 'Commercial Office'].map((cat) => (
                          <button
                            key={cat}
                            type="button"
                            onClick={() => setUploadCategory(cat as PropertyCategory)}
                            className={`p-2 rounded-lg border text-xs font-semibold transition-all cursor-pointer ${
                              uploadCategory === cat
                                ? 'border-[#0F2A43] bg-[#0F2A43] text-white font-bold'
                                : 'border-[#E2E8F0] bg-white text-[#172033] hover:bg-[#F8FAFC]'
                            }`}
                          >
                            {cat}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* City & Locality */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-[#172033]">City</label>
                        <select
                          value={uploadCity}
                          onChange={(e) => setUploadCity(e.target.value)}
                          className="w-full text-xs font-semibold bg-[#F8FAFC] border border-[#CBD5E1] rounded-lg p-2.5 outline-none focus:border-[#18A67D] text-[#172033]"
                        >
                          {CITIES_DATA.map((c) => (
                            <option key={c.name} value={c.name}>{c.name}</option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-1 sm:col-span-2">
                        <label className="text-xs font-bold text-[#172033]">Locality / Neighborhood *</label>
                        <input
                          type="text"
                          required
                          value={uploadLocality}
                          onChange={(e) => setUploadLocality(e.target.value)}
                          placeholder="e.g. Indiranagar, Whitefield, Bandra West"
                          className="w-full text-xs font-semibold bg-[#F8FAFC] border border-[#CBD5E1] rounded-lg p-2.5 outline-none focus:border-[#18A67D] text-[#172033]"
                        />
                      </div>
                    </div>

                    {/* Listing Title */}
                    <div className="space-y-1">
                      <div className="flex justify-between">
                        <label className="text-xs font-bold text-[#172033]">Property Headline / Title</label>
                        <button
                          type="button"
                          onClick={() => {
                            if (uploadLocality) {
                              setUploadTitle(`${uploadBhk} BHK ${uploadCategory} in ${uploadLocality}, ${uploadCity}`);
                            }
                          }}
                          className="text-[11px] font-bold text-[#18A67D] hover:underline"
                        >
                          Auto-generate title
                        </button>
                      </div>
                      <input
                        type="text"
                        value={uploadTitle}
                        onChange={(e) => setUploadTitle(e.target.value)}
                        placeholder="e.g. 3 BHK Luxury Gated Highrise Apartment with Sea View"
                        className="w-full text-xs font-semibold bg-[#F8FAFC] border border-[#CBD5E1] rounded-lg p-2.5 outline-none focus:border-[#18A67D] text-[#172033]"
                      />
                    </div>
                  </div>

                  {/* STEP 2: Specs & Pricing */}
                  <div className="pt-4 border-t border-[#E2E8F0] space-y-4">
                    <h3 className="text-xs font-bold text-[#0F2A43] uppercase tracking-wider">
                      3. Area, Pricing & Configuration
                    </h3>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-[#172033]">BHK</label>
                        <select
                          value={uploadBhk}
                          onChange={(e) => setUploadBhk(Number(e.target.value))}
                          className="w-full text-xs font-semibold bg-[#F8FAFC] border border-[#CBD5E1] rounded-lg p-2.5 outline-none focus:border-[#18A67D]"
                        >
                          <option value={1}>1 BHK</option>
                          <option value={2}>2 BHK</option>
                          <option value={3}>3 BHK</option>
                          <option value={4}>4 BHK</option>
                          <option value={5}>5+ BHK</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-bold text-[#172033]">Bathrooms</label>
                        <select
                          value={uploadBathrooms}
                          onChange={(e) => setUploadBathrooms(Number(e.target.value))}
                          className="w-full text-xs font-semibold bg-[#F8FAFC] border border-[#CBD5E1] rounded-lg p-2.5 outline-none focus:border-[#18A67D]"
                        >
                          <option value={1}>1 Bath</option>
                          <option value={2}>2 Baths</option>
                          <option value={3}>3 Baths</option>
                          <option value={4}>4 Baths</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-bold text-[#172033]">Carpet Area (sq.ft)</label>
                        <input
                          type="number"
                          required
                          value={uploadCarpetArea}
                          onChange={(e) => setUploadCarpetArea(Number(e.target.value))}
                          className="w-full text-xs font-semibold bg-[#F8FAFC] border border-[#CBD5E1] rounded-lg p-2.5 outline-none focus:border-[#18A67D]"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-bold text-[#172033]">Furnishing</label>
                        <select
                          value={uploadFurnishing}
                          onChange={(e) => setUploadFurnishing(e.target.value as FurnishingStatus)}
                          className="w-full text-xs font-semibold bg-[#F8FAFC] border border-[#CBD5E1] rounded-lg p-2.5 outline-none focus:border-[#18A67D]"
                        >
                          <option value="Furnished">Furnished</option>
                          <option value="Semi-Furnished">Semi-Furnished</option>
                          <option value="Unfurnished">Unfurnished</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-[#172033]">
                          {uploadListingType === 'rent' || uploadListingType === 'pg' ? 'Expected Monthly Rent (₹)' : 'Expected Total Price (₹)'}
                        </label>
                        <input
                          type="number"
                          required
                          value={uploadPrice}
                          onChange={(e) => setUploadPrice(Number(e.target.value))}
                          className="w-full text-xs font-semibold bg-[#F8FAFC] border border-[#CBD5E1] rounded-lg p-2.5 outline-none focus:border-[#18A67D]"
                        />
                        <span className="text-[11px] font-bold text-[#18A67D]">
                          Formatted: {formatIndianCurrency(uploadPrice)}
                        </span>
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-bold text-[#172033]">Monthly Maintenance (₹)</label>
                        <input
                          type="number"
                          value={uploadMaintenance}
                          onChange={(e) => setUploadMaintenance(Number(e.target.value))}
                          className="w-full text-xs font-semibold bg-[#F8FAFC] border border-[#CBD5E1] rounded-lg p-2.5 outline-none focus:border-[#18A67D]"
                        />
                      </div>
                    </div>
                  </div>

                  {/* STEP 3: Photos & Amenities */}
                  <div className="pt-4 border-t border-[#E2E8F0] space-y-4">
                    <h3 className="text-xs font-bold text-[#0F2A43] uppercase tracking-wider">
                      4. Photos & Amenities
                    </h3>

                    <div className="space-y-2">
                      <label className="text-xs font-bold text-[#172033]">Selected Photographs ({uploadImages.length})</label>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {uploadImages.map((img, idx) => (
                          <div key={idx} className="relative h-24 rounded-xl overflow-hidden border border-[#E2E8F0] group">
                            <Image src={img} alt="Preview" fill className="object-cover" referrerPolicy="no-referrer" />
                            <button
                              type="button"
                              onClick={() => handleRemovePhoto(idx)}
                              className="absolute top-1 right-1 p-1 bg-black/60 hover:bg-rose-600 text-white rounded-md transition-colors cursor-pointer"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>

                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={customPhotoInput}
                          onChange={(e) => setCustomPhotoInput(e.target.value)}
                          placeholder="Paste image link URL or pick presets below"
                          className="flex-1 text-xs bg-[#F8FAFC] border border-[#CBD5E1] rounded-lg p-2 outline-none focus:border-[#18A67D]"
                        />
                        <button
                          type="button"
                          onClick={handleAddCustomPhoto}
                          className="px-4 py-2 bg-[#0F2A43] hover:bg-[#163b5c] text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
                        >
                          Add URL
                        </button>
                      </div>

                      {/* Preset Sample Thumbnails */}
                      <div className="pt-1 flex items-center gap-2 overflow-x-auto">
                        <span className="text-[11px] text-[#64748B] shrink-0">Quick Presets:</span>
                        {SAMPLE_PHOTO_PRESETS.map((url, i) => (
                          <button
                            key={i}
                            type="button"
                            onClick={() => handleAddPresetPhoto(url)}
                            className="w-12 h-9 rounded-lg overflow-hidden border border-[#CBD5E1] shrink-0 hover:opacity-80 cursor-pointer relative"
                          >
                            <Image src={url} alt="Preset" fill className="object-cover" referrerPolicy="no-referrer" />
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Amenities List */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-[#172033]">Select Amenities</label>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 max-h-40 overflow-y-auto p-1 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0]">
                        {AMENITIES_LIST.map((am) => {
                          const isSel = uploadAmenities.includes(am);
                          return (
                            <div
                              key={am}
                              onClick={() => handleToggleAmenity(am)}
                              className={`p-2 rounded-lg text-xs cursor-pointer transition-colors flex items-center gap-1.5 ${
                                isSel
                                  ? 'bg-[#E7F6F1] text-[#0E7C5D] font-bold'
                                  : 'text-[#64748B] hover:bg-white'
                              }`}
                            >
                              <div className={`w-3.5 h-3.5 rounded border flex items-center justify-center ${isSel ? 'bg-[#18A67D] border-[#18A67D] text-white' : 'border-[#CBD5E1]'}`}>
                                {isSel && <Check className="w-3 h-3" />}
                              </div>
                              <span className="truncate">{am}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Description */}
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-[#172033]">Description</label>
                      <textarea
                        rows={3}
                        value={uploadDescription}
                        onChange={(e) => setUploadDescription(e.target.value)}
                        className="w-full text-xs bg-[#F8FAFC] border border-[#CBD5E1] rounded-lg p-2.5 outline-none focus:border-[#18A67D]"
                      />
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="pt-4 border-t border-[#E2E8F0] flex justify-end">
                    <button
                      type="submit"
                      className="px-8 py-3 bg-[#18A67D] hover:bg-[#0E7C5D] text-white font-bold rounded-xl text-sm transition-all shadow-md flex items-center gap-2 cursor-pointer"
                    >
                      <Sparkles className="w-4 h-4 text-amber-300" />
                      <span>Publish Listing to Marketplace</span>
                    </button>
                  </div>

                </form>
              )}

            </div>
          )}

          {/* TAB 3: MY LISTINGS */}
          {activeTab === 'listings' && (
            <div className="space-y-6 animate-in fade-in">
              
              <div className="bg-white rounded-2xl p-6 border border-[#E2E8F0] shadow-xs space-y-4">
                
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h2 className="text-lg sm:text-xl font-extrabold text-[#0F2A43]">
                      My Properties ({myPostedProperties.length})
                    </h2>
                    <p className="text-xs text-[#64748B]">
                      Manage, edit, or track views and direct buyer inquiries for your properties.
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      setActiveTab('upload');
                      setUploadSuccessId(null);
                    }}
                    className="px-4 py-2 bg-[#18A67D] hover:bg-[#0E7C5D] text-white text-xs font-bold rounded-xl transition-all shadow-xs flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Upload New Property</span>
                  </button>
                </div>

                {/* Filter & Search Bar */}
                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 absolute left-3 top-3 text-[#94A3B8]" />
                    <input
                      type="text"
                      value={listingSearchQuery}
                      onChange={(e) => setListingSearchQuery(e.target.value)}
                      placeholder="Search by title, locality, or category..."
                      className="w-full pl-9 pr-3 py-2 text-xs bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl outline-none focus:border-[#18A67D]"
                    />
                  </div>

                  <div className="flex gap-1.5 overflow-x-auto pb-1 text-xs font-semibold">
                    {[
                      { id: 'all', label: 'All Status' },
                      { id: 'approved', label: 'Active & Verified' },
                      { id: 'pending', label: 'Pending Review' },
                      { id: 'under_review', label: 'Under Review' },
                      { id: 'rejected', label: 'Action Required' }
                    ].map((f) => (
                      <button
                        key={f.id}
                        onClick={() => setListingStatusFilter(f.id as any)}
                        className={`px-3 py-1.5 rounded-lg border transition-all whitespace-nowrap cursor-pointer ${
                          listingStatusFilter === f.id
                            ? 'bg-[#0F2A43] text-white border-[#0F2A43]'
                            : 'bg-white text-[#64748B] border-[#CBD5E1] hover:bg-[#F8FAFC]'
                        }`}
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>
                </div>

              </div>

              {/* Listings Grid */}
              {filteredListings.length === 0 ? (
                <div className="bg-white rounded-2xl p-12 text-center border border-[#E2E8F0] space-y-4">
                  <div className="w-14 h-14 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto">
                    <Building2 className="w-7 h-7" />
                  </div>
                  <h3 className="font-extrabold text-base text-[#0F2A43]">No Properties Found</h3>
                  <p className="text-xs text-[#64748B] max-w-sm mx-auto">
                    You have not uploaded any properties matching this filter. Get started by posting your listing for free.
                  </p>
                  <button
                    onClick={() => {
                      setActiveTab('upload');
                      setUploadSuccessId(null);
                    }}
                    className="px-5 py-2.5 bg-[#18A67D] hover:bg-[#0E7C5D] text-white font-bold rounded-xl text-xs transition-colors cursor-pointer"
                  >
                    Upload Property
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredListings.map((p) => {
                    const status = p.verificationStatus || (p.isVerified ? 'approved' : 'pending');
                    return (
                      <div
                        key={p.id}
                        className="bg-white rounded-2xl border border-[#E2E8F0] shadow-xs overflow-hidden flex flex-col justify-between hover:border-[#CBD5E1] transition-all"
                      >
                        <div>
                          {/* Card Thumbnail */}
                          <div className="relative h-44 w-full bg-slate-100">
                            <Image
                              src={p.images[0] || SAMPLE_PHOTO_PRESETS[0]}
                              alt={p.title}
                              fill
                              className="object-cover"
                              referrerPolicy="no-referrer"
                            />
                            
                            {/* Verification Badge */}
                            <div className="absolute top-3 left-3">
                              {status === 'approved' && (
                                <span className="bg-[#18A67D] text-white text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider flex items-center gap-1 shadow-xs">
                                  <ShieldCheck className="w-3.5 h-3.5" /> Verified Live
                                </span>
                              )}
                              {status === 'pending' && (
                                <span className="bg-amber-500 text-white text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider flex items-center gap-1 shadow-xs">
                                  <Clock className="w-3.5 h-3.5" /> Pending Review
                                </span>
                              )}
                              {status === 'under_review' && (
                                <span className="bg-blue-600 text-white text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider flex items-center gap-1 shadow-xs">
                                  <AlertCircle className="w-3.5 h-3.5" /> Under Audit
                                </span>
                              )}
                              {status === 'rejected' && (
                                <span className="bg-rose-600 text-white text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider flex items-center gap-1 shadow-xs">
                                  <X className="w-3.5 h-3.5" /> Action Required
                                </span>
                              )}
                            </div>

                            <div className="absolute bottom-3 right-3 bg-black/75 text-white text-xs font-bold px-2.5 py-1 rounded-lg backdrop-blur-xs">
                              {p.priceFormatted}
                            </div>
                          </div>

                          {/* Card Details */}
                          <div className="p-4 space-y-2">
                            <div className="flex items-center gap-2 text-[11px] font-bold text-[#64748B]">
                              <span className="text-[#0E7C5D] font-extrabold uppercase">{p.listingType.toUpperCase()}</span>
                              <span>•</span>
                              <span>{p.category}</span>
                              <span>•</span>
                              <span className="flex items-center gap-0.5"><MapPin className="w-3 h-3 text-[#18A67D]" /> {p.locality}, {p.city}</span>
                            </div>

                            <h4 className="font-extrabold text-sm text-[#0F2A43] line-clamp-1">{p.title}</h4>

                            <div className="flex items-center gap-4 text-xs font-medium text-[#64748B] pt-1">
                              <div><strong>{p.bhk || 2}</strong> BHK</div>
                              <div><strong>{p.carpetAreaSqFt}</strong> sq.ft</div>
                              <div><strong>{p.furnishing}</strong></div>
                            </div>

                            {/* Views and Leads counter bar */}
                            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#E2E8F0] text-xs">
                              <div className="flex items-center gap-1.5 text-[#0F2A43] font-bold">
                                <Eye className="w-4 h-4 text-[#18A67D]" />
                                <span>{p.viewsCount || 64} Views</span>
                              </div>
                              <div className="flex items-center gap-1.5 text-[#0E7C5D] font-bold">
                                <MessageSquare className="w-4 h-4 text-[#18A67D]" />
                                <span>{p.inquiriesCount || 3} Inquiries</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Card Actions */}
                        <div className="p-3 bg-[#F8FAFC] border-t border-[#E2E8F0] flex items-center justify-between gap-2">
                          <Link
                            href={`/properties/${p.id}`}
                            className="flex items-center gap-1 text-xs font-bold text-[#0F2A43] hover:text-[#18A67D] px-2.5 py-1.5 rounded-lg border border-[#CBD5E1] bg-white hover:bg-[#F8FAFC]"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                            <span>Preview</span>
                          </Link>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => {
                                deleteProperty(p.id);
                              }}
                              className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                              title="Delete Property"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                      </div>
                    );
                  })}
                </div>
              )}

            </div>
          )}

          {/* TAB 4: ANALYTICS & GRAPHS */}
          {activeTab === 'graphs' && (
            <div className="space-y-6 animate-in fade-in">
              
              {/* Header with Timeframe filters */}
              <div className="bg-white rounded-2xl p-6 border border-[#E2E8F0] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg sm:text-xl font-extrabold text-[#0F2A43]">
                    Visual Analytics & Performance Graphs
                  </h2>
                  <p className="text-xs text-[#64748B]">
                    Interactive tracking for listing impressions, visitor conversions, and locality benchmark prices.
                  </p>
                </div>

                <div className="flex bg-[#F8FAFC] p-1 rounded-xl border border-[#CBD5E1] text-xs font-bold self-start sm:self-auto">
                  {(['7d', '30d', '6m'] as const).map((tf) => (
                    <button
                      key={tf}
                      onClick={() => setGraphTimeframe(tf)}
                      className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                        graphTimeframe === tf
                          ? 'bg-[#0F2A43] text-white shadow-xs'
                          : 'text-[#64748B] hover:text-[#0F2A43]'
                      }`}
                    >
                      {tf === '7d' ? '7 Days' : tf === '30d' ? '30 Days' : '6 Months'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Graph 1: Area Chart Views & Visitors */}
              <div className="bg-white rounded-2xl p-6 border border-[#E2E8F0] shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-extrabold text-sm text-[#0F2A43]">
                      Listing Impressions & Unique Viewers
                    </h3>
                    <p className="text-[11px] text-[#64748B]">Audience engagement over selected timeframe</p>
                  </div>
                  <span className="text-xs font-bold text-[#18A67D] bg-[#E7F6F1] px-2.5 py-1 rounded-full">
                    +18.4% vs last period
                  </span>
                </div>

                <DetailedViewsAreaChart data={viewsTrendData} />
              </div>

              {/* Graph 2 & 3: Leads per Property & Category Allocation */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Bar Chart: Leads Generated by Listing */}
                <div className="bg-white rounded-2xl p-6 border border-[#E2E8F0] shadow-xs space-y-3">
                  <div>
                    <h3 className="font-extrabold text-sm text-[#0F2A43]">Inquiries Generated by Listing</h3>
                    <p className="text-[11px] text-[#64748B]">Comparison of direct contact requests</p>
                  </div>

                  <LeadsBarChart data={propertyLeadsData} />
                </div>

                {/* Pie Chart: Category Distribution */}
                <div className="bg-white rounded-2xl p-6 border border-[#E2E8F0] shadow-xs space-y-3">
                  <div>
                    <h3 className="font-extrabold text-sm text-[#0F2A43]">Portfolio Allocation by Category</h3>
                    <p className="text-[11px] text-[#64748B]">Breakdown of property inventory types</p>
                  </div>

                  <CategoryPieChart data={categoryDistributionData} />
                </div>

              </div>

              {/* Graph 4: Benchmark Rate vs Locality Average */}
              <div className="bg-white rounded-2xl p-6 border border-[#E2E8F0] shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-extrabold text-sm text-[#0F2A43]">
                      Price per Sq.Ft vs Market Locality Benchmark (₹/sq.ft)
                    </h3>
                    <p className="text-[11px] text-[#64748B]">Assessing whether listings are priced competitively for fast conversion</p>
                  </div>
                  <span className="text-xs font-bold text-[#0F2A43] bg-slate-100 px-3 py-1 rounded-full">
                    AI Market Grounding
                  </span>
                </div>

                <PriceBenchmarkBarChart data={priceBenchmarkData} />
              </div>

            </div>
          )}

          {/* TAB 5: APPEARANCE & BRANDING */}
          {activeTab === 'appearance' && (
            <div className="bg-white rounded-2xl p-6 sm:p-8 border border-[#E2E8F0] shadow-xs space-y-6 animate-in fade-in">
              
              <div className="border-b border-[#E2E8F0] pb-4">
                <h2 className="text-lg sm:text-xl font-extrabold text-[#0F2A43]">
                  Seller Appearance & Profile Branding
                </h2>
                <p className="text-xs text-[#64748B]">
                  Customize how your verified seller identity, contact seals, and agency profile appear to prospective buyers.
                </p>
              </div>

              {appearanceSavedToast && (
                <div className="p-3 rounded-xl bg-[#E7F6F1] border border-[#18A67D] text-[#0E7C5D] text-xs font-bold flex items-center gap-2 animate-in fade-in">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Profile appearance settings updated successfully!</span>
                </div>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* Form Inputs */}
                <form onSubmit={handleSaveAppearance} className="lg:col-span-2 space-y-4">
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-[#172033]">Display Name</label>
                      <input
                        type="text"
                        value={brandName}
                        onChange={(e) => setBrandName(e.target.value)}
                        className="w-full text-xs font-semibold bg-[#F8FAFC] border border-[#CBD5E1] rounded-lg p-2.5 outline-none focus:border-[#18A67D]"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-[#172033]">Company / Firm Name</label>
                      <input
                        type="text"
                        value={brandCompany}
                        onChange={(e) => setBrandCompany(e.target.value)}
                        className="w-full text-xs font-semibold bg-[#F8FAFC] border border-[#CBD5E1] rounded-lg p-2.5 outline-none focus:border-[#18A67D]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-[#172033]">Contact Phone (+91)</label>
                      <input
                        type="text"
                        value={brandPhone}
                        onChange={(e) => setBrandPhone(e.target.value)}
                        className="w-full text-xs font-semibold bg-[#F8FAFC] border border-[#CBD5E1] rounded-lg p-2.5 outline-none focus:border-[#18A67D]"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-[#172033]">Public Email</label>
                      <input
                        type="email"
                        value={brandEmail}
                        onChange={(e) => setBrandEmail(e.target.value)}
                        className="w-full text-xs font-semibold bg-[#F8FAFC] border border-[#CBD5E1] rounded-lg p-2.5 outline-none focus:border-[#18A67D]"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-[#172033]">RERA Registration ID</label>
                    <input
                      type="text"
                      value={brandRera}
                      onChange={(e) => setBrandRera(e.target.value)}
                      placeholder="e.g. PRM/KA/RERA/1251/..."
                      className="w-full text-xs font-semibold bg-[#F8FAFC] border border-[#CBD5E1] rounded-lg p-2.5 outline-none focus:border-[#18A67D]"
                    />
                  </div>

                  {/* Brand Theme Accent Selector */}
                  <div className="space-y-2 pt-2">
                    <label className="text-xs font-bold text-[#172033] uppercase tracking-wider">
                      Badge Accent Theme:
                    </label>
                    <div className="flex gap-3">
                      {[
                        { id: 'emerald', bg: 'bg-[#18A67D]', label: 'Emerald Green' },
                        { id: 'navy', bg: 'bg-[#0F2A43]', label: 'Deep Navy' },
                        { id: 'blue', bg: 'bg-blue-600', label: 'Royal Blue' },
                        { id: 'amber', bg: 'bg-amber-600', label: 'Amber Gold' }
                      ].map((th) => (
                        <button
                          key={th.id}
                          type="button"
                          onClick={() => setBrandThemeColor(th.id)}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-bold cursor-pointer transition-all ${
                            brandThemeColor === th.id
                              ? 'border-[#0F2A43] bg-slate-100 ring-2 ring-[#0F2A43]'
                              : 'border-[#CBD5E1] bg-white'
                          }`}
                        >
                          <span className={`w-3.5 h-3.5 rounded-full ${th.bg}`} />
                          <span>{th.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="pt-3">
                    <button
                      type="submit"
                      className="px-6 py-2.5 bg-[#18A67D] hover:bg-[#0E7C5D] text-white font-bold rounded-xl text-xs transition-colors shadow-xs cursor-pointer"
                    >
                      Save Appearance Settings
                    </button>
                  </div>

                </form>

                {/* Live Public Profile Card Preview */}
                <div className="bg-[#F8FAFC] p-5 rounded-2xl border border-[#E2E8F0] space-y-4 self-start">
                  <div className="text-[11px] font-extrabold text-[#64748B] uppercase tracking-wider">
                    Buyer View Preview:
                  </div>

                  <div className="bg-white rounded-xl p-4 border border-[#CBD5E1] shadow-xs space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-[#18A67D] relative shrink-0">
                        <Image
                          src={user?.avatar || DEMO_USERS[currentRole]?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                          alt={brandName}
                          fill
                          className="object-cover"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                      <div>
                        <div className="font-extrabold text-sm text-[#0F2A43]">{brandName}</div>
                        <div className="text-xs text-[#64748B] font-semibold">{brandCompany}</div>
                        <span className="inline-block mt-0.5 text-[9px] font-extrabold uppercase px-1.5 py-0.2 bg-[#18A67D] text-white rounded">
                          {currentRole.toUpperCase()}
                        </span>
                      </div>
                    </div>

                    <div className="text-xs space-y-1.5 pt-2 border-t border-[#E2E8F0] text-[#64748B]">
                      <div className="flex items-center gap-1.5 text-[#0F2A43] font-semibold">
                        <Phone className="w-3.5 h-3.5 text-[#18A67D]" />
                        <span>{brandPhone}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-[#0F2A43] font-semibold">
                        <Mail className="w-3.5 h-3.5 text-[#18A67D]" />
                        <span className="truncate">{brandEmail}</span>
                      </div>
                      {brandRera && (
                        <div className="text-[10px] text-[#0E7C5D] font-bold flex items-center gap-1 bg-[#E7F6F1] p-1.5 rounded">
                          <ShieldCheck className="w-3.5 h-3.5" />
                          <span className="truncate">RERA: {brandRera}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* TAB 6: INQUIRIES & LEADS */}
          {activeTab === 'inquiries' && (
            <div className="bg-white rounded-2xl p-6 border border-[#E2E8F0] shadow-xs space-y-6 animate-in fade-in">
              
              <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-4">
                <div>
                  <h2 className="text-lg sm:text-xl font-extrabold text-[#0F2A43]">
                    Inquiries & Leads Tracker ({receivedInquiries.length})
                  </h2>
                  <p className="text-xs text-[#64748B]">
                    Direct contact requests and site visit scheduling from buyers.
                  </p>
                </div>
              </div>

              {receivedInquiries.length === 0 ? (
                <div className="py-12 text-center text-[#64748B] text-xs">
                  No inquiries received yet. Once buyers contact your listings, they will appear here.
                </div>
              ) : (
                <div className="space-y-3">
                  {receivedInquiries.map((inq) => (
                    <div
                      key={inq.id}
                      className="p-4 rounded-xl bg-[#F8FAFC] border border-[#CBD5E1] space-y-3 text-xs hover:border-[#18A67D] transition-colors"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
                          <span className="font-extrabold text-sm text-[#0F2A43]">{inq.buyerName}</span>
                          <span className="text-[#64748B] text-xs ml-2">({inq.propertyTitle})</span>
                        </div>
                        
                        {/* Status Switcher */}
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-bold text-[#64748B]">Status:</span>
                          <select
                            value={inq.status}
                            onChange={(e) => updateInquiryStatus(inq.id, e.target.value as any)}
                            className="bg-white border border-[#CBD5E1] rounded-lg px-2 py-1 text-xs font-bold text-[#0F2A43] outline-none focus:border-[#18A67D]"
                          >
                            <option value="new">🟢 New Lead</option>
                            <option value="contacted">📞 Contacted</option>
                            <option value="scheduled">📅 Scheduled Visit</option>
                            <option value="closed">✅ Closed Deal</option>
                          </select>
                        </div>
                      </div>

                      <div className="p-3 bg-white rounded-lg border border-[#E2E8F0] text-[#172033] italic">
                        &ldquo;{inq.message}&rdquo;
                      </div>

                      <div className="flex flex-wrap items-center justify-between gap-3 text-[#64748B]">
                        <div className="flex items-center gap-4">
                          <span className="font-semibold flex items-center gap-1">
                            <Phone className="w-3.5 h-3.5 text-[#18A67D]" /> {inq.buyerPhone}
                          </span>
                          <span className="font-semibold flex items-center gap-1">
                            <Mail className="w-3.5 h-3.5 text-[#18A67D]" /> {inq.buyerEmail}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <a
                            href={`tel:${inq.buyerPhone}`}
                            className="px-3 py-1 bg-[#18A67D] hover:bg-[#0E7C5D] text-white font-bold rounded-lg transition-colors text-[11px]"
                          >
                            Call Buyer
                          </a>
                          <a
                            href={`https://wa.me/${inq.buyerPhone.replace(/\D/g, '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3 py-1 bg-[#0F2A43] hover:bg-[#163b5c] text-white font-bold rounded-lg transition-colors text-[11px]"
                          >
                            WhatsApp
                          </a>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

            </div>
          )}

          {/* TAB 7: SHORTLISTED */}
          {activeTab === 'shortlist' && (
            <div className="bg-white rounded-2xl p-6 border border-[#E2E8F0] shadow-xs space-y-6 animate-in fade-in">
              
              <div className="border-b border-[#E2E8F0] pb-4">
                <h2 className="text-lg sm:text-xl font-extrabold text-[#0F2A43]">
                  Shortlisted Properties ({shortlistedProperties.length})
                </h2>
                <p className="text-xs text-[#64748B]">
                  Properties you have saved for price comparisons and site visits.
                </p>
              </div>

              {shortlistedProperties.length === 0 ? (
                <div className="py-12 text-center text-[#64748B] text-xs">
                  No properties shortlisted yet. Click the heart icon on any property in the catalog to save it here.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {shortlistedProperties.map((p) => (
                    <div key={p.id} className="p-4 rounded-xl bg-[#F8FAFC] border border-[#CBD5E1] space-y-2 flex flex-col justify-between">
                      <div className="space-y-1">
                        <div className="font-extrabold text-sm text-[#0F2A43] line-clamp-1">{p.title}</div>
                        <div className="text-xs text-[#18A67D] font-bold">{p.priceFormatted}</div>
                        <div className="text-xs text-[#64748B]">{p.locality}, {p.city} • {p.bhk} BHK</div>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-[#E2E8F0]">
                        <Link href={`/properties/${p.id}`} className="text-xs font-bold text-[#0F2A43] hover:text-[#18A67D]">
                          View Details &rarr;
                        </Link>
                        <button
                          onClick={() => toggleShortlist(p.id)}
                          className="text-xs text-rose-600 hover:underline font-bold cursor-pointer"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

            </div>
          )}

          {/* TAB 8: ADMIN RERA MODERATION QUEUE */}
          {activeTab === 'admin_moderation' && (
            <div className="space-y-6 animate-in fade-in">
              {/* Header */}
              <div className="bg-white rounded-2xl p-6 border border-[#E2E8F0] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg sm:text-xl font-extrabold text-[#0F2A43]">
                      RERA & Property Verification Queue
                    </h2>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-amber-100 text-amber-900">
                      {adminPendingProperties.length} Pending Actions
                    </span>
                  </div>
                  <p className="text-xs text-[#64748B] mt-1">
                    Audit state RERA registration numbers, title deeds, encumbrance certificates, and assign official Green Seals.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <Link
                    href="/admin"
                    className="px-3.5 py-2 rounded-xl bg-[#0F2A43] text-white text-xs font-bold hover:bg-[#163b5c] transition-colors flex items-center gap-1.5"
                  >
                    <ExternalLink className="w-3.5 h-3.5 text-[#18A67D]" />
                    <span>Open Master Portal</span>
                  </Link>
                </div>
              </div>

              {/* Moderation Controls: Search & Filters */}
              <div className="bg-white rounded-2xl p-4 border border-[#E2E8F0] shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="relative w-full sm:w-80">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={adminModerationSearch}
                    onChange={(e) => setAdminModerationSearch(e.target.value)}
                    placeholder="Search by title, RERA ID, city, seller..."
                    className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-[#CBD5E1] rounded-xl outline-none focus:border-[#18A67D] focus:bg-white text-[#0F2A43]"
                  />
                </div>

                <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
                  {[
                    { key: 'all', label: 'All Listings' },
                    { key: 'pending', label: 'Pending' },
                    { key: 'under_review', label: 'Under Review' },
                    { key: 'approved', label: 'Approved' },
                    { key: 'rejected', label: 'Rejected' }
                  ].map((tab) => (
                    <button
                      key={tab.key}
                      onClick={() => setAdminModerationFilter(tab.key)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                        adminModerationFilter === tab.key
                          ? 'bg-[#0F2A43] text-white shadow-xs'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Property Verification List */}
              {adminFilteredModerationList.length === 0 ? (
                <div className="bg-white rounded-2xl p-12 text-center border border-[#E2E8F0] space-y-2">
                  <ShieldCheck className="w-12 h-12 text-slate-300 mx-auto" />
                  <div className="font-bold text-sm text-[#0F2A43]">No listings found matching filter</div>
                  <p className="text-xs text-slate-500">All properties in this category have been processed.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {adminFilteredModerationList.map((prop) => (
                    <div
                      key={prop.id}
                      className="bg-white rounded-2xl p-5 border border-[#E2E8F0] shadow-xs space-y-4 hover:border-slate-300 transition-all"
                    >
                      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                        <div className="flex items-start gap-4">
                          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden relative shrink-0 bg-slate-100 border border-slate-200">
                            <Image
                              src={prop.images[0] || SAMPLE_PHOTO_PRESETS[0]}
                              alt={prop.title}
                              fill
                              className="object-cover"
                              referrerPolicy="no-referrer"
                            />
                          </div>

                          <div className="space-y-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                                prop.verificationStatus === 'approved'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : prop.verificationStatus === 'under_review'
                                  ? 'bg-blue-100 text-blue-800'
                                  : prop.verificationStatus === 'rejected'
                                  ? 'bg-rose-100 text-rose-800'
                                  : 'bg-amber-100 text-amber-900'
                              }`}>
                                {prop.verificationStatus?.replace('_', ' ').toUpperCase() || 'PENDING'}
                              </span>

                              <span className="text-xs font-bold text-slate-400">ID: {prop.id}</span>
                              <span className="text-xs font-bold text-[#18A67D]">{prop.priceFormatted}</span>
                            </div>

                            <h3 className="font-extrabold text-sm sm:text-base text-[#0F2A43]">{prop.title}</h3>
                            <div className="text-xs text-[#64748B] flex items-center gap-2">
                              <MapPin className="w-3.5 h-3.5 text-slate-400" />
                              <span>{prop.locality}, {prop.city} • {prop.bhk} BHK ({prop.carpetAreaSqFt} sq.ft.)</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 self-end lg:self-center flex-wrap">
                          <Link
                            href={`/properties/${prop.id}`}
                            target="_blank"
                            className="px-3 py-1.5 rounded-xl border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-50 transition-colors flex items-center gap-1"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Preview</span>
                          </Link>

                          {prop.verificationStatus !== 'approved' && (
                            <button
                              onClick={() => handleAdminApproveProperty(prop)}
                              className="px-3.5 py-1.5 rounded-xl bg-[#18A67D] hover:bg-[#0E7C5D] text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
                            >
                              <ShieldCheck className="w-3.5 h-3.5" />
                              <span>Approve & Green Seal</span>
                            </button>
                          )}

                          {prop.verificationStatus !== 'under_review' && prop.verificationStatus !== 'approved' && (
                            <button
                              onClick={() => handleAdminSetUnderReview(prop)}
                              className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                            >
                              <Clock className="w-3.5 h-3.5" />
                              <span>Dispatch Field Review</span>
                            </button>
                          )}

                          {prop.verificationStatus !== 'rejected' && (
                            <button
                              onClick={() => handleAdminOpenRejectModal(prop)}
                              className="px-3 py-1.5 rounded-xl bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                            >
                              <Ban className="w-3.5 h-3.5" />
                              <span>Reject Listing</span>
                            </button>
                          )}
                        </div>
                      </div>

                      {/* RERA & Compliance Details */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs">
                        <div>
                          <span className="text-slate-400 font-bold block text-[10px] uppercase">RERA Registration ID</span>
                          <span className="font-extrabold text-[#0F2A43] font-mono select-all">
                            {prop.reraId || 'NOT_DECLARED'}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-400 font-bold block text-[10px] uppercase">Seller Persona / Agency</span>
                          <span className="font-extrabold text-[#0F2A43]">
                            {prop.postedBy?.name} ({prop.postedBy?.type})
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-400 font-bold block text-[10px] uppercase">Compliance Checklist</span>
                          <div className="flex items-center gap-3 pt-0.5 text-[11px]">
                            <span className="flex items-center gap-1 text-emerald-700 font-bold">
                              <CheckCircle className="w-3 h-3 text-emerald-600" /> Title Deed
                            </span>
                            <span className="flex items-center gap-1 text-emerald-700 font-bold">
                              <CheckCircle className="w-3 h-3 text-emerald-600" /> Encumbrance
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 9: ADMIN USER MANAGEMENT & BLOCK CONTROL */}
          {activeTab === 'admin_users' && (
            <div className="space-y-6 animate-in fade-in">
              {/* Header */}
              <div className="bg-white rounded-2xl p-6 border border-[#E2E8F0] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg sm:text-xl font-extrabold text-[#0F2A43]">
                      User Management & Anti-Fraud Center
                    </h2>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-blue-100 text-blue-900">
                      {users.length} Total Accounts
                    </span>
                  </div>
                  <p className="text-xs text-[#64748B] mt-1">
                    Manage permissions, view contact verifications, change roles, and block abusive accounts instantly.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-500">
                    Suspended Accounts: <strong className="text-rose-600 font-black">{adminBlockedUsers.length}</strong>
                  </span>
                </div>
              </div>

              {/* User Search and Filters */}
              <div className="bg-white rounded-2xl p-4 border border-[#E2E8F0] shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="relative w-full sm:w-80">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={adminUserSearch}
                    onChange={(e) => setAdminUserSearch(e.target.value)}
                    placeholder="Search by name, email, phone, city..."
                    className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-[#CBD5E1] rounded-xl outline-none focus:border-[#18A67D] focus:bg-white text-[#0F2A43]"
                  />
                </div>

                <div className="flex items-center gap-2 flex-wrap w-full sm:w-auto">
                  <select
                    value={adminRoleFilter}
                    onChange={(e) => setAdminRoleFilter(e.target.value)}
                    className="px-3 py-2 bg-slate-50 border border-[#CBD5E1] rounded-xl text-xs font-bold text-[#0F2A43] outline-none focus:border-[#18A67D]"
                  >
                    <option value="all">All Roles</option>
                    <option value="owner">Owners</option>
                    <option value="agent">Agents</option>
                    <option value="builder">Builders</option>
                    <option value="buyer">Buyers</option>
                    <option value="admin">Admins</option>
                  </select>

                  <select
                    value={adminUserStatusFilter}
                    onChange={(e) => setAdminUserStatusFilter(e.target.value as any)}
                    className="px-3 py-2 bg-slate-50 border border-[#CBD5E1] rounded-xl text-xs font-bold text-[#0F2A43] outline-none focus:border-[#18A67D]"
                  >
                    <option value="all">All Status</option>
                    <option value="active">Active Only</option>
                    <option value="blocked">Blocked / Suspended Only</option>
                  </select>
                </div>
              </div>

              {/* Users Table */}
              <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-xs overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 border-b border-[#E2E8F0] text-slate-500 font-extrabold uppercase text-[10px]">
                      <tr>
                        <th className="py-3 px-4">User</th>
                        <th className="py-3 px-4">Role & Verification</th>
                        <th className="py-3 px-4">Location</th>
                        <th className="py-3 px-4">Contact</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4 text-right">Admin Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {adminFilteredUsers.map((u) => (
                        <tr key={u.id} className={`hover:bg-slate-50/80 transition-colors ${u.isBlocked ? 'bg-rose-50/30' : ''}`}>
                          {/* User Name & Avatar */}
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-full overflow-hidden relative shrink-0 border border-slate-200">
                                <Image
                                  src={u.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                                  alt={u.name}
                                  fill
                                  className="object-cover"
                                  referrerPolicy="no-referrer"
                                />
                              </div>
                              <div>
                                <div className="font-extrabold text-[#0F2A43] flex items-center gap-1.5">
                                  <span>{u.name}</span>
                                  {u.isBlocked && (
                                    <span className="px-1.5 py-0.2 rounded bg-rose-100 text-rose-800 text-[9px] font-black uppercase">
                                      BLOCKED
                                    </span>
                                  )}
                                </div>
                                <div className="text-[11px] text-slate-400 font-mono">{u.email}</div>
                              </div>
                            </div>
                          </td>

                          {/* Role & Verification */}
                          <td className="py-3 px-4">
                            <div className="space-y-1">
                              <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                                u.role === 'admin'
                                  ? 'bg-purple-100 text-purple-800'
                                  : u.role === 'builder'
                                  ? 'bg-amber-100 text-amber-800'
                                  : u.role === 'agent'
                                  ? 'bg-blue-100 text-blue-800'
                                  : 'bg-emerald-100 text-emerald-800'
                              }`}>
                                {u.role}
                              </span>
                              {u.isPhoneVerified ? (
                                <div className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
                                  <CheckCircle2 className="w-3 h-3" /> OTP Verified
                                </div>
                              ) : (
                                <div className="text-[10px] text-slate-400">Unverified Phone</div>
                              )}
                            </div>
                          </td>

                          {/* Location */}
                          <td className="py-3 px-4 font-semibold text-slate-600">
                            {u.city || 'India'}
                          </td>

                          {/* Contact */}
                          <td className="py-3 px-4">
                            <div className="text-slate-700 font-bold">{u.phone}</div>
                          </td>

                          {/* Status */}
                          <td className="py-3 px-4">
                            {u.isBlocked ? (
                              <div className="space-y-0.5">
                                <span className="inline-flex items-center gap-1 text-rose-700 font-extrabold bg-rose-100 px-2 py-0.5 rounded-full text-[10px]">
                                  <UserX className="w-3 h-3" /> Suspended
                                </span>
                                {u.blockedReason && (
                                  <div className="text-[10px] text-rose-600 truncate max-w-[140px]" title={u.blockedReason}>
                                    {u.blockedReason}
                                  </div>
                                )}
                              </div>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-full text-[10px]">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                                Active
                              </span>
                            )}
                          </td>

                          {/* Actions */}
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              {u.isBlocked ? (
                                <button
                                  onClick={() => handleAdminUnblockUser(u)}
                                  className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-[11px] border border-emerald-200 transition-colors flex items-center gap-1 cursor-pointer"
                                >
                                  <Unlock className="w-3 h-3" />
                                  <span>Unblock</span>
                                </button>
                              ) : (
                                <button
                                  onClick={() => handleAdminOpenBlockModal(u)}
                                  className="px-2.5 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-[11px] border border-rose-200 transition-colors flex items-center gap-1 cursor-pointer"
                                >
                                  <Ban className="w-3 h-3" />
                                  <span>Block User</span>
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 10: ADMIN ALL ACTIVITY STREAM */}
          {activeTab === 'admin_activity' && (
            <div className="space-y-6 animate-in fade-in">
              {/* Header */}
              <div className="bg-white rounded-2xl p-6 border border-[#E2E8F0] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg sm:text-xl font-extrabold text-[#0F2A43]">
                      Platform Activity Audit Stream
                    </h2>
                    <span className="flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                      Live Audit Feed
                    </span>
                  </div>
                  <p className="text-xs text-[#64748B] mt-1">
                    Immutable chronological record of all property uploads, moderation decisions, user registrations, and security blocks.
                  </p>
                </div>
              </div>

              {/* Activity Controls */}
              <div className="bg-white rounded-2xl p-4 border border-[#E2E8F0] shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="relative w-full sm:w-80">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={adminActivitySearch}
                    onChange={(e) => setAdminActivitySearch(e.target.value)}
                    placeholder="Search logs by keyword, user, or action..."
                    className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-[#CBD5E1] rounded-xl outline-none focus:border-[#18A67D] focus:bg-white text-[#0F2A43]"
                  />
                </div>

                <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
                  {[
                    { key: 'all', label: 'All Categories' },
                    { key: 'moderation', label: 'Moderation' },
                    { key: 'user_management', label: 'User & Security' },
                    { key: 'property', label: 'Property Listings' },
                    { key: 'auth', label: 'Auth & Login' }
                  ].map((tab) => (
                    <button
                      key={tab.key}
                      onClick={() => setAdminActivityCategoryFilter(tab.key)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                        adminActivityCategoryFilter === tab.key
                          ? 'bg-[#0F2A43] text-white shadow-xs'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Activity Feed List */}
              <div className="bg-white rounded-2xl p-6 border border-[#E2E8F0] shadow-xs space-y-4">
                {adminFilteredActivityLogs.length === 0 ? (
                  <div className="py-12 text-center text-slate-400 text-xs">
                    No activity records found matching this filter.
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100">
                    {adminFilteredActivityLogs.map((log) => (
                      <div key={log.id} className="py-3.5 flex items-start gap-3.5">
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                          log.severity === 'danger'
                            ? 'bg-rose-100 text-rose-700'
                            : log.severity === 'warning'
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-emerald-100 text-emerald-700'
                        }`}>
                          {log.action.includes('verified') ? (
                            <ShieldCheck className="w-4 h-4" />
                          ) : log.action.includes('blocked') ? (
                            <UserX className="w-4 h-4" />
                          ) : (
                            <Activity className="w-4 h-4" />
                          )}
                        </div>

                        <div className="flex-1 min-w-0 space-y-1">
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-extrabold text-xs text-[#0F2A43] capitalize">
                                {log.action.replace(/_/g, ' ')}
                              </span>
                              <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 uppercase">
                                {log.actorRole}
                              </span>
                              <span className="text-xs font-semibold text-slate-500">by {log.actorName}</span>
                            </div>
                            <span className="text-[10px] text-slate-400 shrink-0 font-medium">
                              {log.timestamp}
                            </span>
                          </div>

                          <p className="text-xs text-slate-700">{log.details}</p>
                          {log.targetTitle && (
                            <div className="text-[11px] text-slate-500 font-semibold flex items-center gap-1">
                              <span>Target:</span>
                              <span className="text-[#0F2A43] font-bold">{log.targetTitle}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 11: ADMIN PLATFORM TRENDS & GRAPHS */}
          {activeTab === 'admin_trends' && (
            <div className="space-y-6 animate-in fade-in">
              {/* Header */}
              <div className="bg-white rounded-2xl p-6 border border-[#E2E8F0] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg sm:text-xl font-extrabold text-[#0F2A43]">
                    Platform Growth, Moderation Trends & Regional Activity
                  </h2>
                  <p className="text-xs text-[#64748B] mt-1">
                    Holistic analytics comparing user acquisition, RERA approvals, active inventory, and buyer inquiries.
                  </p>
                </div>
              </div>

              {/* 4 Core Admin Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* 1. Activity Trend */}
                <div className="bg-white rounded-2xl p-6 border border-[#E2E8F0] shadow-xs space-y-4">
                  <div>
                    <h3 className="font-extrabold text-sm text-[#0F2A43]">Weekly Platform Throughput</h3>
                    <p className="text-xs text-slate-500">New listings uploaded vs. verifications vs. buyer leads</p>
                  </div>
                  <AdminActivityTrendChart data={adminActivityTrendData} />
                </div>

                {/* 2. City Distribution */}
                <div className="bg-white rounded-2xl p-6 border border-[#E2E8F0] shadow-xs space-y-4">
                  <div>
                    <h3 className="font-extrabold text-sm text-[#0F2A43]">Top Tier-1 Real Estate Hubs</h3>
                    <p className="text-xs text-slate-500">Listing supply volume vs. buyer inquiries generated</p>
                  </div>
                  <AdminCityDistributionBarChart data={adminCityDistribution} />
                </div>

                {/* 3. User Distribution */}
                <div className="bg-white rounded-2xl p-6 border border-[#E2E8F0] shadow-xs space-y-4">
                  <div>
                    <h3 className="font-extrabold text-sm text-[#0F2A43]">User Persona Distribution</h3>
                    <p className="text-xs text-slate-500">Breakdown of registered owners, agents, builders & buyers</p>
                  </div>
                  <AdminUserBreakdownPieChart data={adminUserRoleDistribution} />
                </div>

                {/* 4. Moderation Breakdown */}
                <div className="bg-white rounded-2xl p-6 border border-[#E2E8F0] shadow-xs space-y-4">
                  <div>
                    <h3 className="font-extrabold text-sm text-[#0F2A43]">Listing Verification Status</h3>
                    <p className="text-xs text-slate-500">Distribution of approved green seals vs pending vs flagged</p>
                  </div>
                  <AdminModerationStatusChart data={adminModerationDistribution} />
                </div>
              </div>
            </div>
          )}

        </main>
      </div>

      {/* Block User Reason Modal */}
      {blockModalTarget && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in zoom-in-95">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center shrink-0">
                <Ban className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-base text-[#0F2A43]">Confirm Account Suspension</h3>
                <p className="text-xs text-slate-500">Block {blockModalTarget.name} ({blockModalTarget.email})</p>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700">Reason for Suspension / Block:</label>
              <textarea
                value={blockReasonText}
                onChange={(e) => setBlockReasonText(e.target.value)}
                rows={3}
                className="w-full p-3 text-xs bg-slate-50 border border-slate-300 rounded-xl outline-none focus:border-rose-500 focus:bg-white text-slate-800"
                placeholder="Enter suspension explanation..."
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setBlockModalTarget(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleAdminConfirmBlock}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white transition-colors cursor-pointer"
              >
                Confirm & Suspend User
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Listing Reason Modal */}
      {rejectModalProperty && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in zoom-in-95">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center shrink-0">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-base text-[#0F2A43]">Reject Property Verification</h3>
                <p className="text-xs text-slate-500">&quot;{rejectModalProperty.title}&quot;</p>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700">Reason / Missing Documents for Seller:</label>
              <textarea
                value={rejectFeedbackText}
                onChange={(e) => setRejectFeedbackText(e.target.value)}
                rows={3}
                className="w-full p-3 text-xs bg-slate-50 border border-slate-300 rounded-xl outline-none focus:border-rose-500 focus:bg-white text-slate-800"
                placeholder="Provide details to help seller rectify..."
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setRejectModalProperty(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleAdminConfirmReject}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white transition-colors cursor-pointer"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
