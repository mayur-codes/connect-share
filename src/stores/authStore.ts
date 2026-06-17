import { create } from 'zustand';
import type { User } from '@/services/api';
import { TOKEN_STORAGE_KEY, USER_STORAGE_KEY } from '@/services/config';
import { setToken } from '@/services/apiClient';
import * as authApi from '@/services/auth';

interface AuthState {
  user: User | null;
  token: string | null;
  ready: boolean;
  initialize: () => Promise<void>;
  setSession: (token: string, user: User) => void;
  logout: () => Promise<void>;
  setUser: (user: User) => void;
}

function readStoredUser(): User | null {
  try {
    const raw = localStorage.getItem(USER_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

function readStoredToken(): string | null {
  try { return localStorage.getItem(TOKEN_STORAGE_KEY); } catch { return null; }
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: readStoredUser(),
  token: readStoredToken(),
  ready: false,

  async initialize() {
    const token = readStoredToken();
    if (!token) { set({ ready: true }); return; }
    try {
      const user = await authApi.getCurrentProfile();
      set({ user, token, ready: true });
    } catch {
      // 401 handler already cleared storage
      set({ user: null, token: null, ready: true });
    }
  },

  setSession(token, user) {
    setToken(token);
    try { localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user)); } catch {/* */}
    set({ token, user });
  },

  async logout() {
    await authApi.logout();
    set({ user: null, token: null });
  },

  setUser(user) {
    try { localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user)); } catch {/* */}
    set({ user });
  },
}));
