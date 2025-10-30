import { create } from 'zustand';

interface User {
  id: string;
  username: string;
  email: string;
  imageUrl?: string;
}

interface AuthState {
  token: string | null;
  user: User | null;
  setAuth: (token: string, user: User) => void;
  clearAuth: () => void;
}

let tokenCache: string | null = null;

export const getToken = () => tokenCache;

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  user: null,
  setAuth: (token, user) => {
    tokenCache = token;
    set({ token, user });
  },
  clearAuth: () => {
    tokenCache = null;
    set({ token: null, user: null });
  }
}));

