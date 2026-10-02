import { create } from 'zustand';
import { Session, User } from '@supabase/supabase-js';

interface AuthState {
  user: User | null;
  session: Session | null;
  profile: any | null; // Replace with proper type later
  roles: string[];
  isLoading: boolean;
  setUser: (user: User | null) => void;
  setSession: (session: Session | null) => void;
  setProfile: (profile: any | null) => void;
  setRoles: (roles: string[]) => void;
  setIsLoading: (isLoading: boolean) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  session: null,
  profile: null,
  roles: [],
  isLoading: true,
  setUser: (user) => set({ user }),
  setSession: (session) => set({ session }),
  setProfile: (profile) => set({ profile }),
  setRoles: (roles) => set({ roles }),
  setIsLoading: (isLoading) => set({ isLoading }),
  logout: () => set({ user: null, session: null, profile: null, roles: [] }),
}));
