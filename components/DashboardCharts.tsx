'use client';

import React from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';

export interface ViewsTrendPoint {
  day: string;
  views: number;
  uniqueVisitors: number;
  inquiries: number;
}

export interface PropertyLeadPoint {
  name: string;
  views: number;
  leads: number;
}

export interface CategoryPoint {
  name: string;
  value: number;
}

export interface BenchmarkPoint {
  locality: string;
  myRate: number;
  marketAvg: number;
}

export interface AdminActivityTrendPoint {
  date: string;
  newUploads: number;
  verifiedCount: number;
  inquiriesCount: number;
  blockedAttempts?: number;
}

export interface AdminCityVolumePoint {
  city: string;
  listings: number;
  inquiries: number;
}

const PIE_COLORS = ['#18A67D', '#0F2A43', '#3B82F6', '#F59E0B', '#8B5CF6', '#EC4899'];
const ADMIN_STATUS_COLORS = ['#10B981', '#3B82F6', '#F59E0B', '#EF4444'];
const USER_ROLE_COLORS = ['#3B82F6', '#18A67D', '#8B5CF6', '#F59E0B', '#0F2A43'];

export function OverviewSnapshotChart({ data }: { data: ViewsTrendPoint[] }) {
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="colorViewsOverview" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#18A67D" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#18A67D" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="colorVisitorsOverview" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#0F2A43" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#0F2A43" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
          <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#64748B' }} />
          <YAxis tick={{ fontSize: 11, fill: '#64748B' }} />
          <Tooltip 
            contentStyle={{ backgroundColor: '#0F2A43', borderRadius: '12px', color: '#fff', border: 'none', fontSize: '12px' }}
          />
          <Area type="monotone" dataKey="views" name="Total Views" stroke="#18A67D" strokeWidth={2.5} fillOpacity={1} fill="url(#colorViewsOverview)" />
          <Area type="monotone" dataKey="uniqueVisitors" name="Unique Buyers" stroke="#0F2A43" strokeWidth={2} fillOpacity={1} fill="url(#colorVisitorsOverview)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export function DetailedViewsAreaChart({ data }: { data: ViewsTrendPoint[] }) {
  return (
    <div className="h-72 w-full pt-2">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="areaViewsDetailed" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#18A67D" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#18A67D" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="areaVisitorsDetailed" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
          <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#64748B' }} />
          <YAxis tick={{ fontSize: 11, fill: '#64748B' }} />
          <Tooltip contentStyle={{ backgroundColor: '#0F2A43', borderRadius: '12px', color: '#fff', border: 'none', fontSize: '12px' }} />
          <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
          <Area type="monotone" dataKey="views" name="Page Views" stroke="#18A67D" strokeWidth={2.5} fillOpacity={1} fill="url(#areaViewsDetailed)" />
          <Area type="monotone" dataKey="uniqueVisitors" name="Unique Buyers" stroke="#3B82F6" strokeWidth={2} fillOpacity={1} fill="url(#areaVisitorsDetailed)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export function LeadsBarChart({ data }: { data: PropertyLeadPoint[] }) {
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
          <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#64748B' }} />
          <YAxis tick={{ fontSize: 11, fill: '#64748B' }} />
          <Tooltip contentStyle={{ backgroundColor: '#0F2A43', borderRadius: '12px', color: '#fff', border: 'none', fontSize: '12px' }} />
          <Bar dataKey="leads" name="Inquiries" fill="#18A67D" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function CategoryPieChart({ data }: { data: CategoryPoint[] }) {
  return (
    <div className="h-64 w-full flex items-center justify-center">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={55}
            outerRadius={80}
            paddingAngle={4}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
            ))}
          </Pie>
          <Tooltip contentStyle={{ backgroundColor: '#0F2A43', borderRadius: '12px', color: '#fff', border: 'none', fontSize: '12px' }} />
          <Legend wrapperStyle={{ fontSize: '11px' }} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

export function PriceBenchmarkBarChart({ data }: { data: BenchmarkPoint[] }) {
  return (
    <div className="h-64 w-full pt-2">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
          <XAxis dataKey="locality" tick={{ fontSize: 11, fill: '#64748B' }} />
          <YAxis tick={{ fontSize: 11, fill: '#64748B' }} />
          <Tooltip contentStyle={{ backgroundColor: '#0F2A43', borderRadius: '12px', color: '#fff', border: 'none', fontSize: '12px' }} />
          <Legend wrapperStyle={{ fontSize: '12px' }} />
          <Bar dataKey="myRate" name="Your Listing Rate (₹/sq.ft)" fill="#18A67D" radius={[6, 6, 0, 0]} />
          <Bar dataKey="marketAvg" name="Locality Market Average" fill="#94A3B8" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

// ----------------------------------------------------
// ADMIN-SPECIFIC POWERFUL VISUALIZATIONS
// ----------------------------------------------------

export function AdminActivityTrendChart({ data }: { data: AdminActivityTrendPoint[] }) {
  return (
    <div className="h-72 w-full pt-2">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
          <defs>
            <linearGradient id="adminGradUploads" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="adminGradVerified" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10B981" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="adminGradInquiries" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#F59E0B" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
          <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#64748B' }} />
          <YAxis tick={{ fontSize: 11, fill: '#64748B' }} />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#0F2A43', 
              borderRadius: '12px', 
              color: '#fff', 
              border: 'none', 
              fontSize: '12px',
              boxShadow: '0 10px 25px -5px rgba(0,0,0,0.3)'
            }} 
          />
          <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
          <Area 
            type="monotone" 
            dataKey="newUploads" 
            name="New Property Uploads" 
            stroke="#3B82F6" 
            strokeWidth={2.5} 
            fillOpacity={1} 
            fill="url(#adminGradUploads)" 
          />
          <Area 
            type="monotone" 
            dataKey="verifiedCount" 
            name="Admin Verifications (Green Seal)" 
            stroke="#10B981" 
            strokeWidth={2.5} 
            fillOpacity={1} 
            fill="url(#adminGradVerified)" 
          />
          <Area 
            type="monotone" 
            dataKey="inquiriesCount" 
            name="Buyer Tour Leads" 
            stroke="#F59E0B" 
            strokeWidth={2} 
            fillOpacity={1} 
            fill="url(#adminGradInquiries)" 
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export function AdminUserBreakdownPieChart({ data }: { data: CategoryPoint[] }) {
  return (
    <div className="h-64 w-full flex items-center justify-center">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={50}
            outerRadius={78}
            paddingAngle={4}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`admin-user-cell-${index}`} fill={USER_ROLE_COLORS[index % USER_ROLE_COLORS.length]} />
            ))}
          </Pie>
          <Tooltip 
            contentStyle={{ backgroundColor: '#0F2A43', borderRadius: '12px', color: '#fff', border: 'none', fontSize: '12px' }} 
          />
          <Legend wrapperStyle={{ fontSize: '11px' }} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

export function AdminModerationStatusChart({ data }: { data: CategoryPoint[] }) {
  return (
    <div className="h-64 w-full flex items-center justify-center">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={52}
            outerRadius={80}
            paddingAngle={3}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`admin-mod-cell-${index}`} fill={ADMIN_STATUS_COLORS[index % ADMIN_STATUS_COLORS.length]} />
            ))}
          </Pie>
          <Tooltip 
            contentStyle={{ backgroundColor: '#0F2A43', borderRadius: '12px', color: '#fff', border: 'none', fontSize: '12px' }} 
          />
          <Legend wrapperStyle={{ fontSize: '11px' }} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

export function AdminCityDistributionBarChart({ data }: { data: AdminCityVolumePoint[] }) {
  return (
    <div className="h-64 w-full pt-2">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
          <XAxis dataKey="city" tick={{ fontSize: 11, fill: '#64748B' }} />
          <YAxis tick={{ fontSize: 11, fill: '#64748B' }} />
          <Tooltip 
            contentStyle={{ backgroundColor: '#0F2A43', borderRadius: '12px', color: '#fff', border: 'none', fontSize: '12px' }} 
          />
          <Legend wrapperStyle={{ fontSize: '12px' }} />
          <Bar dataKey="listings" name="Active Inventory" fill="#18A67D" radius={[6, 6, 0, 0]} />
          <Bar dataKey="inquiries" name="Buyer Leads Generated" fill="#3B82F6" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
