'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile, UserRole, SystemActivityLog } from '@/lib/types';

// Mock pre-configured demo users for quick testing
export const DEMO_USERS: Record<UserRole, UserProfile> = {
  buyer: {
    id: 'usr-buyer-101',
    name: 'Rahul Sharma',
    email: 'rahul.sharma@example.com',
    phone: '+91 98765 43210',
    role: 'buyer',
    city: 'Bangalore',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    isPhoneVerified: true,
    isEmailVerified: true,
    isBlocked: false,
    createdAt: '2025-01-15',
    lastActive: '10 mins ago',
    savedSearchesCount: 4,
    shortlistedCount: 3,
    postedListingsCount: 0,
    totalInquiriesReceived: 0
  },
  owner: {
    id: 'usr-owner-202',
    name: 'Priya Venkatesh',
    email: 'priya.venkatesh@example.com',
    phone: '+91 98450 11223',
    role: 'owner',
    city: 'Bangalore',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    isPhoneVerified: true,
    isEmailVerified: true,
    isBlocked: false,
    createdAt: '2024-11-20',
    lastActive: '2 hours ago',
    savedSearchesCount: 1,
    shortlistedCount: 5,
    postedListingsCount: 2,
    totalInquiriesReceived: 24
  },
  agent: {
    id: 'usr-agent-303',
    name: 'Vikram Deshmukh',
    email: 'vikram.deshmukh@prestigerealty.com',
    phone: '+91 98200 99887',
    role: 'agent',
    city: 'Mumbai',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    companyName: 'Prestige Realty Advisors',
    reraNumber: 'PRM/KA/RERA/1251/310/AG/210412/00189',
    isPhoneVerified: true,
    isEmailVerified: true,
    isBlocked: false,
    createdAt: '2024-06-10',
    lastActive: 'Just now',
    savedSearchesCount: 12,
    shortlistedCount: 18,
    postedListingsCount: 15,
    totalInquiriesReceived: 88
  },
  builder: {
    id: 'usr-builder-404',
    name: 'Amit Singhal',
    email: 'amit.singhal@godrejprop.com',
    phone: '+91 99110 55443',
    role: 'builder',
    city: 'Delhi NCR',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    companyName: 'Godrej Properties Ltd',
    reraNumber: 'DLRERA2019P0004',
    isPhoneVerified: true,
    isEmailVerified: true,
    isBlocked: false,
    createdAt: '2024-02-01',
    lastActive: '1 day ago',
    savedSearchesCount: 8,
    shortlistedCount: 22,
    postedListingsCount: 42,
    totalInquiriesReceived: 210
  },
  admin: {
    id: 'usr-admin-001',
    name: 'Rabnix Master Admin',
    email: 'admin@rabnixestate.com',
    phone: '+91 80000 99099',
    role: 'admin',
    city: 'National (HQ)',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
    companyName: 'Rabnix Estate Verification Division',
    reraNumber: 'RABNIX-ADMIN-VERIFIED-LEVEL1',
    isPhoneVerified: true,
    isEmailVerified: true,
    isBlocked: false,
    createdAt: '2024-01-01',
    lastActive: 'Active Now',
    savedSearchesCount: 0,
    shortlistedCount: 0,
    postedListingsCount: 0,
    totalInquiriesReceived: 0
  }
};

// Initial realistic database of registered users for Admin view
export const INITIAL_REGISTERED_USERS: UserProfile[] = [
  DEMO_USERS.admin,
  DEMO_USERS.agent,
  DEMO_USERS.builder,
  DEMO_USERS.owner,
  DEMO_USERS.buyer,
  {
    id: 'usr-agent-501',
    name: 'Rajeshwari Iyer',
    email: 'rajeshwari.iyer@sobhaelite.com',
    phone: '+91 97412 88776',
    role: 'agent',
    city: 'Bangalore',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
    companyName: 'Sobha Elite Realty',
    reraNumber: 'PRM/KA/RERA/1251/308/AG/171124/000244',
    isPhoneVerified: true,
    isEmailVerified: true,
    isBlocked: false,
    createdAt: '2024-08-14',
    lastActive: '3 hours ago',
    savedSearchesCount: 6,
    shortlistedCount: 14,
    postedListingsCount: 8,
    totalInquiriesReceived: 45
  },
  {
    id: 'usr-owner-502',
    name: 'Suresh Menon',
    email: 'suresh.menon@gmail.com',
    phone: '+91 94471 22334',
    role: 'owner',
    city: 'Hyderabad',
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
    isPhoneVerified: true,
    isEmailVerified: false,
    isBlocked: false,
    createdAt: '2024-12-05',
    lastActive: '5 hours ago',
    savedSearchesCount: 2,
    shortlistedCount: 4,
    postedListingsCount: 1,
    totalInquiriesReceived: 12
  },
  {
    id: 'usr-builder-503',
    name: 'Brigade Prime Developer',
    email: 'contact@brigadeprime.com',
    phone: '+91 80404 00000',
    role: 'builder',
    city: 'Bangalore',
    avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&auto=format&fit=crop&q=80',
    companyName: 'Brigade Enterprises',
    reraNumber: 'PRM/KA/RERA/1251/310/PR/170916/000900',
    isPhoneVerified: true,
    isEmailVerified: true,
    isBlocked: false,
    createdAt: '2024-04-18',
    lastActive: '12 mins ago',
    savedSearchesCount: 15,
    shortlistedCount: 30,
    postedListingsCount: 28,
    totalInquiriesReceived: 180
  },
  {
    id: 'usr-spam-504',
    name: 'Suspicious Tele-Lead Bot',
    email: 'fastleads@cheapdata.in',
    phone: '+91 91234 00000',
    role: 'agent',
    city: 'Delhi NCR',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    companyName: 'Unverified Data Scraper',
    reraNumber: 'INVALID-RERA-999',
    isPhoneVerified: false,
    isEmailVerified: false,
    isBlocked: true,
    blockedReason: 'Multiple fake listings and unsolicited commercial SMS complaints.',
    blockedAt: '2025-02-25',
    createdAt: '2025-02-20',
    lastActive: '3 days ago',
    savedSearchesCount: 0,
    shortlistedCount: 0,
    postedListingsCount: 4,
    totalInquiriesReceived: 0
  }
];

// Initial realistic activity stream
export const INITIAL_ACTIVITY_LOGS: SystemActivityLog[] = [
  {
    id: 'log-101',
    timestamp: '2 mins ago',
    action: 'property_verified',
    actorName: 'Rabnix Master Admin',
    actorRole: 'Admin',
    details: 'Verified RERA certificate PRM/KA/RERA/1251/310/PR/170916/000900 and awarded Green Verified Seal.',
    targetTitle: '3 BHK Luxury Apartment in Prestige Falcon City',
    targetId: 'prop-blr-1',
    severity: 'success'
  },
  {
    id: 'log-102',
    timestamp: '14 mins ago',
    action: 'inquiry_received',
    actorName: 'Rahul Sharma (Buyer)',
    actorRole: 'Buyer',
    details: 'Submitted tour booking inquiry for Saturday 11:00 AM with message.',
    targetTitle: '3 BHK Luxury Apartment in Prestige Falcon City',
    targetId: 'prop-blr-1',
    severity: 'info'
  },
  {
    id: 'log-103',
    timestamp: '45 mins ago',
    action: 'property_created',
    actorName: 'Priya Venkatesh',
    actorRole: 'Owner',
    details: 'Submitted new listing with Encumbrance Certificate and Sanction Plan.',
    targetTitle: '4 BHK Luxury Penthouse in Indiranagar',
    targetId: 'prop-blr-2',
    severity: 'info'
  },
  {
    id: 'log-104',
    timestamp: '2 hours ago',
    action: 'user_blocked',
    actorName: 'Rabnix Master Admin',
    actorRole: 'Admin',
    details: 'Blocked suspicious broker account for duplicate unverified listings.',
    targetTitle: 'Suspicious Tele-Lead Bot (fastleads@cheapdata.in)',
    targetId: 'usr-spam-504',
    severity: 'danger'
  },
  {
    id: 'log-105',
    timestamp: '4 hours ago',
    action: 'property_rejected',
    actorName: 'Rabnix Master Admin',
    actorRole: 'Admin',
    details: 'Rejected listing due to unreadable title document copy. Feedback sent to seller.',
    targetTitle: '2 BHK Builder Floor in Greater Kailash',
    targetId: 'prop-del-2',
    severity: 'warning'
  },
  {
    id: 'log-106',
    timestamp: '6 hours ago',
    action: 'user_registered',
    actorName: 'Rajeshwari Iyer',
    actorRole: 'Agent',
    details: 'Completed RERA-verified agent profile registration for Bangalore South zone.',
    targetTitle: 'Sobha Elite Realty',
    targetId: 'usr-agent-501',
    severity: 'success'
  }
];

interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  users: UserProfile[];
  activityLogs: SystemActivityLog[];
  loginWithPassword: (emailOrPhone: string, password: string) => Promise<{ success: boolean; error?: string }>;
  loginWithOtp: (phone: string, otp: string) => Promise<{ success: boolean; error?: string }>;
  signup: (userData: {
    name: string;
    email: string;
    phone: string;
    role: UserRole;
    city?: string;
    companyName?: string;
    reraNumber?: string;
    password?: string;
  }) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  quickDemoLogin: (role: UserRole) => void;
  updateProfile: (data: Partial<UserProfile>) => void;
  toggleBlockUser: (userId: string, reason?: string) => void;
  deleteUser: (userId: string) => void;
  updateUserRole: (userId: string, role: UserRole) => void;
  logActivity: (log: Omit<SystemActivityLog, 'id' | 'timestamp'>) => void;
  clearActivityLogs: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_STORAGE_KEY = 'rabnix_auth_user_v2';
const USERS_STORAGE_KEY = 'rabnix_registered_users_v2';
const LOGS_STORAGE_KEY = 'rabnix_system_activity_logs_v2';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(() => {
    if (typeof window === 'undefined') return null;
    try {
      const stored = localStorage.getItem(AUTH_STORAGE_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const [users, setUsers] = useState<UserProfile[]>(() => {
    if (typeof window === 'undefined') return INITIAL_REGISTERED_USERS;
    try {
      const stored = localStorage.getItem(USERS_STORAGE_KEY);
      return stored ? JSON.parse(stored) : INITIAL_REGISTERED_USERS;
    } catch {
      return INITIAL_REGISTERED_USERS;
    }
  });

  const [activityLogs, setActivityLogs] = useState<SystemActivityLog[]>(() => {
    if (typeof window === 'undefined') return INITIAL_ACTIVITY_LOGS;
    try {
      const stored = localStorage.getItem(LOGS_STORAGE_KEY);
      return stored ? JSON.parse(stored) : INITIAL_ACTIVITY_LOGS;
    } catch {
      return INITIAL_ACTIVITY_LOGS;
    }
  });

  const [isLoading, setIsLoading] = useState(false);

  // Sync users to storage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
    }
  }, [users]);

  // Sync activity logs to storage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(LOGS_STORAGE_KEY, JSON.stringify(activityLogs));
    }
  }, [activityLogs]);

  const saveUserSession = (newUser: UserProfile | null) => {
    setUser(newUser);
    if (typeof window !== 'undefined') {
      if (newUser) {
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(newUser));
      } else {
        localStorage.removeItem(AUTH_STORAGE_KEY);
      }
    }
  };

  const logActivity = (log: Omit<SystemActivityLog, 'id' | 'timestamp'>) => {
    const newEntry: SystemActivityLog = {
      ...log,
      id: `log-${Date.now()}`,
      timestamp: 'Just now'
    };
    setActivityLogs((prev) => [newEntry, ...prev.slice(0, 49)]); // Keep last 50
  };

  const clearActivityLogs = () => {
    setActivityLogs([]);
  };

  const toggleBlockUser = (userId: string, reason?: string) => {
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === userId) {
          const nextBlocked = !u.isBlocked;
          const updated: UserProfile = {
            ...u,
            isBlocked: nextBlocked,
            blockedReason: nextBlocked ? reason || 'Suspended by Admin for policy violation.' : undefined,
            blockedAt: nextBlocked ? new Date().toISOString().split('T')[0] : undefined
          };

          // If current logged-in user is this user, update active session too
          if (user?.id === userId) {
            saveUserSession(updated);
          }

          // Record activity log
          logActivity({
            action: nextBlocked ? 'user_blocked' : 'user_unblocked',
            actorName: user?.name || 'Admin',
            actorRole: 'Admin',
            details: nextBlocked
              ? `Suspended user "${u.name}" (${u.email}). Reason: ${reason || 'Policy violation'}`
              : `Reinstated user "${u.name}" (${u.email}) to active status.`,
            targetTitle: u.name,
            targetId: u.id,
            severity: nextBlocked ? 'danger' : 'success'
          });

          return updated;
        }
        return u;
      })
    );
  };

  const deleteUser = (userId: string) => {
    const target = users.find((u) => u.id === userId);
    setUsers((prev) => prev.filter((u) => u.id !== userId));

    if (user?.id === userId) {
      saveUserSession(null);
    }

    if (target) {
      logActivity({
        action: 'user_blocked',
        actorName: user?.name || 'Admin',
        actorRole: 'Admin',
        details: `Deleted user profile "${target.name}" (${target.email}) permanently from the platform.`,
        targetTitle: target.name,
        targetId: target.id,
        severity: 'danger'
      });
    }
  };

  const updateUserRole = (userId: string, role: UserRole) => {
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === userId) {
          const updated = { ...u, role };
          if (user?.id === userId) {
            saveUserSession(updated);
          }
          return updated;
        }
        return u;
      })
    );
  };

  const loginWithPassword = async (emailOrPhone: string, _password: string) => {
    setIsLoading(true);
    await new Promise((res) => setTimeout(res, 400));

    if (!emailOrPhone || !_password) {
      setIsLoading(false);
      return { success: false, error: 'Please enter both credentials' };
    }

    // Check if user exists in registered users list
    const existingUser = users.find(
      (u) =>
        u.email.toLowerCase() === emailOrPhone.toLowerCase() ||
        u.phone.replace(/\D/g, '') === emailOrPhone.replace(/\D/g, '')
    );

    if (existingUser) {
      if (existingUser.isBlocked) {
        setIsLoading(false);
        return {
          success: false,
          error: `Your account has been suspended by Rabnix Admin. Reason: ${existingUser.blockedReason || 'Policy violation. Contact support.'}`
        };
      }
      saveUserSession(existingUser);
      setIsLoading(false);
      return { success: true };
    }

    // Fallback: Match demo role
    const matchedRole: UserRole = emailOrPhone.includes('admin')
      ? 'admin'
      : emailOrPhone.includes('owner') 
      ? 'owner' 
      : emailOrPhone.includes('agent') 
      ? 'agent' 
      : emailOrPhone.includes('builder') 
      ? 'builder' 
      : 'buyer';

    const baseProfile = DEMO_USERS[matchedRole];
    const loggedInUser: UserProfile = {
      ...baseProfile,
      id: `usr-${Date.now()}`,
      email: emailOrPhone.includes('@') ? emailOrPhone : `${emailOrPhone.replace(/\D/g, '')}@rabnixestate.com`,
      phone: emailOrPhone.includes('@') ? baseProfile.phone : emailOrPhone,
      name: emailOrPhone.split('@')[0]?.replace(/[._]/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || baseProfile.name,
      isBlocked: false
    };

    saveUserSession(loggedInUser);
    setUsers((prev) => [loggedInUser, ...prev.filter((p) => p.email !== loggedInUser.email)]);
    setIsLoading(false);
    return { success: true };
  };

  const loginWithOtp = async (phone: string, otp: string) => {
    setIsLoading(true);
    await new Promise((res) => setTimeout(res, 400));

    if (!phone || phone.length < 10) {
      setIsLoading(false);
      return { success: false, error: 'Please enter a valid 10-digit mobile number' };
    }

    if (otp !== '1234' && otp.length !== 4 && otp.length !== 6) {
      setIsLoading(false);
      return { success: false, error: 'Invalid OTP code. Please enter 1234 or the code sent to your phone.' };
    }

    const cleanPhone = phone.replace(/\D/g, '');
    const existing = users.find((u) => u.phone.replace(/\D/g, '') === cleanPhone);

    if (existing) {
      if (existing.isBlocked) {
        setIsLoading(false);
        return {
          success: false,
          error: `Your account has been suspended by Rabnix Admin. Reason: ${existing.blockedReason || 'Policy violation.'}`
        };
      }
      saveUserSession(existing);
      setIsLoading(false);
      return { success: true };
    }

    const loggedInUser: UserProfile = {
      id: `usr-${Date.now()}`,
      name: 'Verified User',
      email: `user.${cleanPhone.slice(-4)}@rabnixestate.com`,
      phone: phone.startsWith('+91') ? phone : `+91 ${phone}`,
      role: 'buyer',
      city: 'Bangalore',
      isPhoneVerified: true,
      isEmailVerified: false,
      isBlocked: false,
      createdAt: new Date().toISOString().split('T')[0],
      savedSearchesCount: 2,
      shortlistedCount: 1,
      postedListingsCount: 0
    };

    saveUserSession(loggedInUser);
    setUsers((prev) => [loggedInUser, ...prev]);
    setIsLoading(false);
    return { success: true };
  };

  const signup = async (userData: {
    name: string;
    email: string;
    phone: string;
    role: UserRole;
    city?: string;
    companyName?: string;
    reraNumber?: string;
    password?: string;
  }) => {
    setIsLoading(true);
    await new Promise((res) => setTimeout(res, 500));

    if (!userData.name || !userData.email || !userData.phone) {
      setIsLoading(false);
      return { success: false, error: 'Name, email, and phone number are required' };
    }

    const newUser: UserProfile = {
      id: `usr-${Date.now()}`,
      name: userData.name,
      email: userData.email,
      phone: userData.phone.startsWith('+91') ? userData.phone : `+91 ${userData.phone}`,
      role: userData.role,
      city: userData.city || 'Bangalore',
      companyName: userData.companyName,
      reraNumber: userData.reraNumber,
      isPhoneVerified: true,
      isEmailVerified: true,
      isBlocked: false,
      createdAt: new Date().toISOString().split('T')[0],
      savedSearchesCount: 0,
      shortlistedCount: 0,
      postedListingsCount: 0
    };

    saveUserSession(newUser);
    setUsers((prev) => [newUser, ...prev]);

    logActivity({
      action: 'user_registered',
      actorName: newUser.name,
      actorRole: newUser.role.toUpperCase(),
      details: `New account registered as ${newUser.role.toUpperCase()} in ${newUser.city}.`,
      targetTitle: newUser.name,
      targetId: newUser.id,
      severity: 'success'
    });

    setIsLoading(false);
    return { success: true };
  };

  const logout = () => {
    saveUserSession(null);
  };

  const quickDemoLogin = (role: UserRole) => {
    const target = DEMO_USERS[role];
    saveUserSession(target);
  };

  const updateProfile = (data: Partial<UserProfile>) => {
    if (!user) return;
    const updated = { ...user, ...data };
    saveUserSession(updated);
    setUsers((prev) => prev.map((u) => (u.id === user.id ? updated : u)));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        users,
        activityLogs,
        loginWithPassword,
        loginWithOtp,
        signup,
        logout,
        quickDemoLogin,
        updateProfile,
        toggleBlockUser,
        deleteUser,
        updateUserRole,
        logActivity,
        clearActivityLogs
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
