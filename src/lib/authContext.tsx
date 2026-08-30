'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { UserProfile, UserRole, SystemActivityLog } from '@/lib/types';

// Lightweight demo avatars per role (used as UI fallbacks in dashboards).
export const DEMO_USERS: Record<UserRole, { name: string; avatar: string }> = {
  buyer:   { name: 'Rahul Sharma',        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80' },
  owner:   { name: 'Priya Venkatesh',     avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80' },
  agent:   { name: 'Vikram Deshmukh',     avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80' },
  builder: { name: 'Amit Singhal',        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80' },
  admin:   { name: 'Rabnix Master Admin', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80' },
};

// Demo login credentials (seeded in the database via prisma/seed.ts).
// Used by the "Quick Demo Login" buttons.
const DEMO_CREDENTIALS: Record<UserRole, { email: string; password: string }> = {
  admin:   { email: 'admin@rabnixestate.com', password: 'admin123' },
  owner:   { email: 'owner@rabnix.com',       password: 'password123' },
  buyer:   { email: 'buyer@rabnix.com',       password: 'password123' },
  agent:   { email: 'agent@rabnix.com',       password: 'password123' },
  builder: { email: 'builder@rabnix.com',     password: 'password123' },
};

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
  quickDemoLogin: (role: UserRole) => Promise<{ success: boolean; error?: string }>;
  updateProfile: (data: Partial<UserProfile>) => void;
  toggleBlockUser: (userId: string, reason?: string) => void;
  deleteUser: (userId: string) => void;
  updateUserRole: (userId: string, role: UserRole) => void;
  logActivity: (log: Omit<SystemActivityLog, 'id' | 'timestamp'>) => void;
  clearActivityLogs: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

async function api(path: string, options?: RequestInit) {
  const res = await fetch(path, {
    headers: { 'Content-Type': 'application/json' },
    credentials: 'same-origin',
    ...options,
  });
  const data = await res.json().catch(() => ({}));
  return { ok: res.ok, status: res.status, data };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [activityLogs, setActivityLogs] = useState<SystemActivityLog[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Load current session on mount.
  useEffect(() => {
    let active = true;
    (async () => {
      const { data } = await api('/api/auth/me');
      if (active && data?.user) setUser(data.user);
    })();
    return () => { active = false; };
  }, []);

  // Admin-only data: load users + activity logs once an admin is signed in.
  const refreshAdminData = useCallback(async () => {
    const [u, a] = await Promise.all([api('/api/users'), api('/api/activity')]);
    if (u.ok && u.data?.users) setUsers(u.data.users);
    if (a.ok && a.data?.logs) setActivityLogs(a.data.logs);
  }, []);

  useEffect(() => {
    let active = true;
    if (user?.role === 'admin') {
      Promise.all([api('/api/users'), api('/api/activity')]).then(([u, a]) => {
        if (!active) return;
        if (u.ok && u.data?.users) setUsers(u.data.users);
        if (a.ok && a.data?.logs) setActivityLogs(a.data.logs);
      });
    } else {
      queueMicrotask(() => {
        if (active) {
          setUsers([]);
          setActivityLogs([]);
        }
      });
    }
    return () => { active = false; };
  }, [user?.role]);

  const loginWithPassword = async (emailOrPhone: string, password: string) => {
    setIsLoading(true);
    const { ok, data } = await api('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ emailOrPhone, password }),
    });
    setIsLoading(false);
    if (ok && data?.success) { setUser(data.user); return { success: true }; }
    return { success: false, error: data?.error || 'Login failed.' };
  };

  const loginWithOtp = async (_phone: string, _otp: string) => {
    // Phone OTP is not wired to an SMS provider yet — planned for a later pass.
    return { success: false, error: 'Phone OTP sign-in is coming soon. Please use email & password for now.' };
  };

  const signup: AuthContextType['signup'] = async (userData) => {
    setIsLoading(true);
    const { ok, data } = await api('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
    setIsLoading(false);
    if (ok && data?.success) { setUser(data.user); return { success: true }; }
    return { success: false, error: data?.error || 'Registration failed.' };
  };

  const logout = () => {
    setUser(null);
    api('/api/auth/logout', { method: 'POST' });
  };

  const quickDemoLogin = async (role: UserRole) => {
    const creds = DEMO_CREDENTIALS[role];
    if (!creds) return { success: false, error: 'Unknown demo role.' };
    return loginWithPassword(creds.email, creds.password);
  };

  const updateProfile = (patch: Partial<UserProfile>) => {
    if (!user) return;
    const optimistic = { ...user, ...patch };
    setUser(optimistic); // instant feedback
    api('/api/auth/profile', { method: 'PATCH', body: JSON.stringify(patch) }).then(({ ok, data }) => {
      if (ok && data?.user) setUser(data.user);
    });
  };

  const toggleBlockUser = (userId: string, reason?: string) => {
    const target = users.find((u) => u.id === userId);
    const nextBlocked = !target?.isBlocked;
    setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, isBlocked: nextBlocked, blockedReason: nextBlocked ? reason : undefined } : u)));
    api(`/api/users/${userId}`, {
      method: 'PATCH',
      body: JSON.stringify({ isBlocked: nextBlocked, blockedReason: reason }),
    }).then(() => refreshAdminData());
  };

  const deleteUser = (userId: string) => {
    setUsers((prev) => prev.filter((u) => u.id !== userId));
    api(`/api/users/${userId}`, { method: 'DELETE' }).then(() => refreshAdminData());
  };

  const updateUserRole = (userId: string, role: UserRole) => {
    setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, role } : u)));
    api(`/api/users/${userId}`, { method: 'PATCH', body: JSON.stringify({ role }) }).then(() => refreshAdminData());
  };

  // Server records activity automatically on meaningful actions. This provides
  // instant optimistic feedback in the admin feed; a refresh reconciles to truth.
  const logActivity = (log: Omit<SystemActivityLog, 'id' | 'timestamp'>) => {
    setActivityLogs((prev) => [{ ...log, id: `local-${Date.now()}`, timestamp: 'Just now' }, ...prev].slice(0, 50));
  };

  const clearActivityLogs = () => setActivityLogs([]);

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
        clearActivityLogs,
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
