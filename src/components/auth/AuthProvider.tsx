import { useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/stores/authStore";
import type { User } from "@supabase/supabase-js";

async function resolveRoles(user: User) {
  const roles = new Set<string>();
  if (user.user_metadata?.role === "admin") roles.add("admin");
  const { data, error } = await supabase.from("user_roles").select("roles(key)").eq("user_id", user.id);
  if (!error && Array.isArray(data)) {
    for (const row of data as Array<{ roles?: { key?: string } | null }>) {
      const key = row.roles?.key;
      if (key === "SUPERADMIN") {
        roles.add("admin");
        roles.add("superadmin");
      } else if (key === "ADMIN" || key === "admin") {
        roles.add("admin");
      }
    }
  }
  return [...roles];
}

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const { setUser, setSession, setProfile, setRoles, setIsLoading } = useAuthStore();

  useEffect(() => {
    let active = true;
    const apply = async (session: Awaited<ReturnType<typeof supabase.auth.getSession>>["data"]["session"]) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (!session?.user) {
        setProfile(null);
        setRoles([]);
        return;
      }
      const [{ data: profileData }, roles] = await Promise.all([
        supabase.from("users_profile").select("*").eq("id", session.user.id).maybeSingle(),
        resolveRoles(session.user),
      ]);
      if (!active) return;
      setProfile(profileData);
      setRoles(roles);
    };

    const initAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      await apply(session);
      if (active) setIsLoading(false);
    };

    initAuth();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      void apply(session);
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, [setIsLoading, setProfile, setRoles, setSession, setUser]);

  return <>{children}</>;
};
