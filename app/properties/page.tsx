'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  Building2, 
  Search, 
  MapPin, 
  SlidersHorizontal, 
  ShieldCheck, 
  Heart, 
  Phone, 
  MessageSquare, 
  ArrowUpDown, 
  Check, 
  X, 
  Sparkles,
  Layers,
  ArrowRight,
  Filter,
  CheckCircle2
} from 'lucide-react';
import { useProperties } from '@/lib/propertyContext';
import { useAuth } from '@/lib/authContext';
import { ListingType, PropertyCategory, FurnishingStatus, ConstructionStatus, Property } from '@/lib/types';
import { CITIES_DATA } from '@/lib/realEstateData';

export default function PropertiesCatalogPage() {
  const { properties, isShortlisted, toggleShortlist } = useProperties();
  const { user } = useAuth();

  // Search & Filter State
  const [selectedCity, setSelectedCity] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [listingType, setListingType] = useState<ListingType | 'all'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedBhk, setSelectedBhk] = useState<number[]>([]);
  const [minPrice, setMinPrice] = useState<number>(0);
  const [maxPrice, setMaxPrice] = useState<number>(50000000);
  const [verifiedOnly, setVerifiedOnly] = useState<boolean>(false);
  const [ownerOnly, setOwnerOnly] = useState<boolean>(false);
  const [reraOnly, setReraOnly] = useState<boolean>(false);
  const [furnishing, setFurnishing] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'recommended' | 'price_asc' | 'price_desc' | 'area_desc'>('recommended');
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  // Toggle BHK
  const handleToggleBhk = (bhkVal: number) => {
    if (selectedBhk.includes(bhkVal)) {
      setSelectedBhk(selectedBhk.filter((b) => b !== bhkVal));
    } else {
      setSelectedBhk([...selectedBhk, bhkVal]);
    }
  };

  // Reset Filters
  const handleResetFilters = () => {
    setSelectedCity('All');
    setSearchQuery('');
    setListingType('all');
    setSelectedCategory('All');
    setSelectedBhk([]);
    setMinPrice(0);
    setMaxPrice(50000000);
    setVerifiedOnly(false);
    setOwnerOnly(false);
    setReraOnly(false);
    setFurnishing('All');
    setSortBy('recommended');
  };

  // Filter and Sort Logic
  const filteredProperties = useMemo(() => {
    return properties
      .filter((p) => {
        // City filter
        if (selectedCity !== 'All' && p.city.toLowerCase() !== selectedCity.toLowerCase()) {
          return false;
        }
        // Listing Type filter
        if (listingType !== 'all' && p.listingType !== listingType) {
          return false;
        }
        // Category filter
        if (selectedCategory !== 'All' && p.category !== selectedCategory) {
          return false;
        }
        // BHK filter
        if (selectedBhk.length > 0 && p.bhk && !selectedBhk.includes(p.bhk)) {
          return false;
        }
        // Price filter
        if (p.price < minPrice || p.price > maxPrice) {
          return false;
        }
        // Verified Only
        if (verifiedOnly && !p.isVerified) {
          return false;
        }
        // Owner Only (0% Brokerage)
        if (ownerOnly && p.postedBy.type !== 'Owner') {
          return false;
        }
        // RERA Only
        if (reraOnly && !p.reraApproved) {
          return false;
        }
        // Furnishing
        if (furnishing !== 'All' && p.furnishing !== furnishing) {
          return false;
        }
        // Search Query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchTitle = p.title.toLowerCase().includes(q);
          const matchLocality = p.locality.toLowerCase().includes(q);
          const matchCity = p.city.toLowerCase().includes(q);
          const matchCategory = p.category.toLowerCase().includes(q);
          if (!matchTitle && !matchLocality && !matchCity && !matchCategory) {
            return false;
          }
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'price_asc') return a.price - b.price;
        if (sortBy === 'price_desc') return b.price - a.price;
        if (sortBy === 'area_desc') return (b.carpetAreaSqFt || 0) - (a.carpetAreaSqFt || 0);
        return 0; // recommended default
      });
  }, [
    properties,
    selectedCity,
    listingType,
    selectedCategory,
    selectedBhk,
    minPrice,
    maxPrice,
    verifiedOnly,
    ownerOnly,
    reraOnly,
    furnishing,
    searchQuery,
    sortBy
  ]);

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-between">
      
      {/* Top Header */}
      <header className="w-full bg-white border-b border-[#E2E8F0] py-3.5 px-4 sm:px-8 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2 group select-none">
              <div className="w-8 h-8 bg-[#0F2A43] rounded-md flex items-center justify-center shadow-xs">
                <div className="w-3.5 h-3.5 border-2 border-[#18A67D] rotate-45"></div>
              </div>
              <span className="text-xl font-extrabold tracking-tight text-[#0F2A43]">
                Rabnix <span className="text-[#18A67D]">Estate</span>
              </span>
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="text-xs sm:text-sm font-bold text-[#0F2A43] hover:text-[#18A67D] px-3 py-1.5 rounded-lg border border-[#E2E8F0] hover:bg-[#F8FAFC] transition-colors"
            >
              My Dashboard
            </Link>
            <Link
              href="/post-property"
              className="px-3.5 py-2 bg-[#18A67D] hover:bg-[#0E7C5D] text-white text-xs sm:text-sm font-bold rounded-xl transition-all shadow-xs"
            >
              + Post Property Free
            </Link>
          </div>
        </div>
      </header>

      {/* Main Catalog Workspace */}
      <main className="max-w-7xl mx-auto w-full px-4 sm:px-8 py-6 space-y-6 flex-1">
        
        {/* Search & Listing Type Bar */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl shadow-xs border border-[#E2E8F0] space-y-4">
          
          {/* Listing Type Pills */}
          <div className="flex flex-wrap items-center gap-2 pb-2 border-b border-[#E2E8F0]">
            {[
              { id: 'all', label: 'All Properties' },
              { id: 'buy', label: 'Buy (Ready & Launch)' },
              { id: 'rent', label: 'Rentals & Leases' },
              { id: 'pg', label: 'PG / Co-Living' },
              { id: 'commercial', label: 'Commercial' },
              { id: 'plot', label: 'Plots & Land' }
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setListingType(tab.id as any)}
                className={`py-1.5 px-3.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  listingType === tab.id
                    ? 'bg-[#0F2A43] text-white shadow-xs'
                    : 'bg-[#F8FAFC] text-[#64748B] hover:text-[#0F2A43] hover:bg-[#F1F5F9]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search Inputs Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
            
            {/* City Dropdown */}
            <div className="sm:col-span-3">
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="w-full p-2.5 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl text-xs sm:text-sm font-bold text-[#0F2A43] outline-none"
              >
                <option value="All">All Indian Cities</option>
                {CITIES_DATA.map((c) => (
                  <option key={c.name} value={c.name}>{c.name}</option>
                ))}
              </select>
            </div>

            {/* Keyword Search */}
            <div className="sm:col-span-6 relative">
              <Search className="w-4 h-4 text-[#94A3B8] absolute left-3 top-3.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by locality, project name, landmark, or BHK..."
                className="w-full pl-9 pr-4 py-2.5 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl text-xs sm:text-sm font-medium text-[#0F2A43] outline-none focus:bg-white focus:border-[#18A67D]"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-3 text-[#94A3B8] hover:text-[#0F2A43]"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Sort Dropdown */}
            <div className="sm:col-span-3">
              <div className="flex items-center gap-1.5">
                <ArrowUpDown className="w-4 h-4 text-[#64748B] shrink-0" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="w-full p-2.5 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl text-xs sm:text-sm font-semibold text-[#0F2A43] outline-none"
                >
                  <option value="recommended">Recommended & Verified</option>
                  <option value="price_asc">Price: Low to High</option>
                  <option value="price_desc">Price: High to Low</option>
                  <option value="area_desc">Largest Area First</option>
                </select>
              </div>
            </div>

          </div>

          {/* Quick Filter Chips */}
          <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
            <span className="text-[11px] font-bold text-[#64748B] uppercase">Quick Filters:</span>
            
            <button
              onClick={() => setVerifiedOnly(!verifiedOnly)}
              className={`px-2.5 py-1 rounded-lg border font-bold flex items-center gap-1 transition-colors cursor-pointer ${
                verifiedOnly
                  ? 'bg-[#E7F6F1] border-[#18A67D] text-[#0E7C5D]'
                  : 'bg-white border-[#E2E8F0] text-[#64748B] hover:border-[#CBD5E1]'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5 text-[#18A67D]" />
              <span>Verified Only</span>
            </button>

            <button
              onClick={() => setOwnerOnly(!ownerOnly)}
              className={`px-2.5 py-1 rounded-lg border font-bold flex items-center gap-1 transition-colors cursor-pointer ${
                ownerOnly
                  ? 'bg-amber-50 border-amber-300 text-amber-900'
                  : 'bg-white border-[#E2E8F0] text-[#64748B] hover:border-[#CBD5E1]'
              }`}
            >
              <span>0% Brokerage (Owner)</span>
            </button>

            <button
              onClick={() => setReraOnly(!reraOnly)}
              className={`px-2.5 py-1 rounded-lg border font-bold flex items-center gap-1 transition-colors cursor-pointer ${
                reraOnly
                  ? 'bg-[#0F2A43] border-[#0F2A43] text-white'
                  : 'bg-white border-[#E2E8F0] text-[#64748B] hover:border-[#CBD5E1]'
              }`}
            >
              <span>RERA Registered</span>
            </button>

            {(verifiedOnly || ownerOnly || reraOnly || selectedBhk.length > 0 || selectedCity !== 'All' || searchQuery) && (
              <button
                onClick={handleResetFilters}
                className="text-xs text-rose-600 font-bold hover:underline ml-auto cursor-pointer"
              >
                Reset All Filters
              </button>
            )}
          </div>

        </div>

        {/* Results Info & Count */}
        <div className="flex items-center justify-between">
          <div className="text-sm font-extrabold text-[#0F2A43]">
            Showing <span className="text-[#18A67D]">{filteredProperties.length}</span> Verified Properties
            {selectedCity !== 'All' && ` in ${selectedCity}`}
          </div>

          <div className="text-xs text-[#64748B]">
            All prices in Indian Rupees (INR)
          </div>
        </div>

        {/* Property Grid */}
        {filteredProperties.length === 0 ? (
          <div className="bg-white p-12 rounded-2xl border border-[#E2E8F0] text-center space-y-4 shadow-xs">
            <Building2 className="w-12 h-12 text-[#94A3B8] mx-auto" />
            <h3 className="text-lg font-bold text-[#0F2A43]">No Properties Matched Your Criteria</h3>
            <p className="text-xs sm:text-sm text-[#64748B] max-w-md mx-auto">
              Try adjusting your price range, BHK configuration, or search in other prominent localities.
            </p>
            <button
              type="button"
              onClick={handleResetFilters}
              className="px-5 py-2.5 bg-[#18A67D] hover:bg-[#0E7C5D] text-white text-xs font-bold rounded-xl cursor-pointer"
            >
              Reset All Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProperties.map((prop) => {
              const favorite = isShortlisted(prop.id);
              return (
                <div
                  key={prop.id}
                  className="bg-white rounded-2xl border border-[#E2E8F0] overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col justify-between group"
                >
                  <div>
                    {/* Card Image Box */}
                    <div className="relative aspect-16/10 bg-slate-100 overflow-hidden">
                      <Image
                        src={prop.images[0]}
                        alt={prop.title}
                        fill
                        className="object-cover group-hover:scale-104 transition-transform duration-500"
                        referrerPolicy="no-referrer"
                      />

                      {/* Top Badges */}
                      <div className="absolute top-2.5 left-2.5 flex flex-wrap gap-1.5">
                        <span className="bg-[#0F2A43]/90 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded-md uppercase">
                          {prop.category}
                        </span>
                        {prop.isVerified && (
                          <span className="bg-[#18A67D] text-white text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1 shadow-xs">
                            <ShieldCheck className="w-3 h-3" />
                            Verified
                          </span>
                        )}
                        {prop.postedBy.type === 'Owner' && (
                          <span className="bg-amber-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-md">
                            0% Brokerage
                          </span>
                        )}
                      </div>

                      {/* Shortlist Heart Button */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          toggleShortlist(prop.id);
                        }}
                        className={`absolute top-2.5 right-2.5 p-2 rounded-full backdrop-blur-md transition-all cursor-pointer ${
                          favorite
                            ? 'bg-rose-500 text-white'
                            : 'bg-black/40 text-white hover:bg-black/60'
                        }`}
                      >
                        <Heart className={`w-4 h-4 ${favorite ? 'fill-white' : ''}`} />
                      </button>

                      {/* Bottom Image Strip */}
                      <div className="absolute bottom-2 left-2.5 bg-black/60 backdrop-blur-xs text-white text-[10px] font-medium px-2 py-0.5 rounded">
                        {prop.bhk ? `${prop.bhk} BHK • ` : ''}{prop.carpetAreaSqFt} sq.ft
                      </div>
                    </div>

                    {/* Card Content */}
                    <div className="p-5 space-y-3">
                      
                      {/* Price & Location */}
                      <div>
                        <div className="text-xl font-black text-[#0E7C5D]">
                          {prop.priceFormatted}
                        </div>
                        <h3 className="text-sm font-bold text-[#0F2A43] truncate mt-0.5" title={prop.title}>
                          {prop.title}
                        </h3>
                        <div className="flex items-center gap-1 text-xs text-[#64748B] mt-1">
                          <MapPin className="w-3.5 h-3.5 text-[#18A67D] shrink-0" />
                          <span className="truncate">{prop.locality}, {prop.city}</span>
                        </div>
                      </div>

                      {/* Spec Badges */}
                      <div className="grid grid-cols-3 gap-1.5 py-2 border-y border-[#F1F5F9] text-center text-[11px]">
                        <div className="space-y-0.5">
                          <span className="text-[#94A3B8] block text-[10px]">Furnishing</span>
                          <span className="font-bold text-[#0F2A43] truncate block">{prop.furnishing}</span>
                        </div>
                        <div className="space-y-0.5">
                          <span className="text-[#94A3B8] block text-[10px]">Status</span>
                          <span className="font-bold text-[#0F2A43] truncate block">{prop.constructionStatus}</span>
                        </div>
                        <div className="space-y-0.5">
                          <span className="text-[#94A3B8] block text-[10px]">Posted By</span>
                          <span className="font-bold text-[#0E7C5D] truncate block">{prop.postedBy.type}</span>
                        </div>
                      </div>

                    </div>
                  </div>

                  {/* Card Actions Footer */}
                  <div className="p-5 pt-0 flex items-center gap-2">
                    <Link
                      href={`/properties/${prop.id}`}
                      className="flex-1 py-2.5 bg-[#0F2A43] hover:bg-[#163b5c] text-white text-xs font-bold rounded-xl text-center transition-colors flex items-center justify-center gap-1"
                    >
                      <span>View Details</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                    <a
                      href={`tel:${prop.postedBy.phone}`}
                      className="p-2.5 bg-[#E7F6F1] hover:bg-[#d0f0e6] text-[#0E7C5D] rounded-xl border border-[#18A67D]/20 transition-colors"
                      title="Call Seller"
                    >
                      <Phone className="w-4 h-4" />
                    </a>
                  </div>

                </div>
              );
            })}
          </div>
        )}

      </main>

      {/* Footer */}
      <footer className="w-full border-t border-[#E2E8F0] bg-white py-4 px-4 text-center text-xs text-[#64748B] mt-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>&copy; {new Date().getFullYear()} Rabnix Estate. Verified Catalog.</span>
          <div className="flex items-center gap-4 text-xs font-medium">
            <Link href="/" className="hover:text-[#18A67D]">Home</Link>
            <span className="text-slate-300">•</span>
            <Link href="/post-property" className="hover:text-[#18A67D]">Post Property</Link>
            <span className="text-slate-300">•</span>
            <Link href="/dashboard" className="hover:text-[#18A67D]">Dashboard</Link>
            <span className="text-slate-300">•</span>
            <Link href="/admin" className="hover:text-[#18A67D]">Admin Verification</Link>
          </div>
        </div>
      </footer>

    </div>
  );
}
