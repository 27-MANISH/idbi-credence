/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { UserOut } from '@/lib/api';

interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: string;
  is_active: boolean;
}

interface AuthState {
  user: AuthUser | null;
  token: string | null;

  /** Set JWT token (called after login/signup) */
  setToken: (token: string) => void;
  /** Set user profile from /auth/me response */
  setUser: (user: UserOut) => void;
  /** Legacy quick-login for mock/testing flows */
  login: (email: string, role: 'MSME' | 'OFFICER') => void;
  /** Clear auth state */
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      // Default user — officer view for local development convenience
      user: {
        id: 'dev-officer-001',
        email: 'shashankckotagi@gmail.com',
        name: 'Shashank Kotagi',
        role: 'OFFICER',
        is_active: true,
      },
      token: 'mock-jwt-token-dev',

      setToken: (token) => set({ token }),

      setUser: (user: UserOut) =>
        set({
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            is_active: user.is_active,
          },
        }),

      login: (email, role) => {
        const name = role === 'OFFICER' ? 'Shashank Kotagi' : 'MSME Owner';
        set({
          user: {
            id: `mock-${role.toLowerCase()}-${Date.now()}`,
            email,
            name,
            role,
            is_active: true,
          },
          token: `mock-jwt-token-${Date.now()}`,
        });
      },

      logout: () => set({ user: null, token: null }),
    }),
    {
      name: 'credence-auth-storage',
    },
  ),
);
