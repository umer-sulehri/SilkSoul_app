"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/types/database";
import { supabaseConfig } from "@/lib/env";

let browserClient: ReturnType<typeof createBrowserClient<Database>> | null = null;

export function createClient() {
  if (!supabaseConfig.isConfigured) return null;
  if (!browserClient) {
    browserClient = createBrowserClient<Database>(
      supabaseConfig.url,
      supabaseConfig.anonKey,
    );
  }
  return browserClient;
}
