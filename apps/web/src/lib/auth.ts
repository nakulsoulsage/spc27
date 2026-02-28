'use client';

import { create } from 'zustand';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  institutionId: string;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  setAuth: (user: User, accessToken: string, refreshToken: string) => void;
  logout: () => void;
  isAuthenticated: () => boolean;
}

// Simple auth store - in production use httpOnly cookies for refresh token
export const useAuthStore = create<AuthState>((set, get) => ({
  user: typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('spc27_user') || 'null') : null,
  accessToken: typeof window !== 'undefined' ? localStorage.getItem('spc27_token') : null,
  refreshToken: typeof window !== 'undefined' ? localStorage.getItem('spc27_refresh') : null,

  setAuth: (user, accessToken, refreshToken) => {
    localStorage.setItem('spc27_user', JSON.stringify(user));
    localStorage.setItem('spc27_token', accessToken);
    localStorage.setItem('spc27_refresh', refreshToken);
    set({ user, accessToken, refreshToken });
  },

  logout: () => {
    localStorage.removeItem('spc27_user');
    localStorage.removeItem('spc27_token');
    localStorage.removeItem('spc27_refresh');
    set({ user: null, accessToken: null, refreshToken: null });
  },

  isAuthenticated: () => !!get().accessToken,
}));
