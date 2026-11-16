import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import type { Database } from "@/types/database";
import { supabaseConfig } from "@/lib/env";

export async function createClient() {
  if (!supabaseConfig.isConfigured) return null;

  const cookieStore = await cookies();

  return createServerClient<Database>(supabaseConfig.url, supabaseConfig.anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // Server Components cannot set cookies. The proxy refreshes the session.
        }
      },
    },
  });
}

export async function getSessionUser() {
  const supabase = await createClient();
  if (!supabase) return { supabase: null, user: null };
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return { supabase, user };
}
