import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/authStore';

export const useAuth = () => {
  const [loading, setLoading] = useState(false);
  const { user, profile, roles } = useAuthStore();

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    try {
      const first = await supabase.auth.signInWithPassword({ email, password });
      if (!first.error) return { data: first.data, error: null };
      const migrated = await supabase.functions.invoke("migrate-login", { body: { email, password } });
      if (!migrated.error && migrated.data?.migrated === true) {
        const second = await supabase.auth.signInWithPassword({ email, password });
        return { data: second.data, error: second.error };
      }
      return { data: first.data, error: first.error };
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, gamertag: string) => {
    setLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          gamertag,
        },
      },
    });
    setLoading(false);
    return { data, error };
  };

  const signOut = async () => {
    setLoading(true);
    await supabase.auth.signOut();
    useAuthStore.getState().logout();
    setLoading(false);
  };

  const resetPassword = async (email: string) => {
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    setLoading(false);
    return { error };
  };

  const isAdmin = roles.includes('admin') || roles.includes('superadmin');
  const isSuperAdmin = roles.includes('superadmin');

  return {
    user,
    profile,
    roles,
    loading,
    signIn,
    signUp,
    signOut,
    resetPassword,
    isAdmin,
    isSuperAdmin,
  };
};
