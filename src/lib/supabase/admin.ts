import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import { supabaseConfig } from "@/lib/env";

export function createAdminClient() {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
  if (!supabaseConfig.isConfigured || !serviceRoleKey) return null;

  return createClient<Database>(supabaseConfig.url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
