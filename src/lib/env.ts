const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

function looksConfigured(value: string) {
  return Boolean(value) && !value.includes("your-project") && !value.startsWith("your_");
}

export const supabaseConfig = {
  url: supabaseUrl,
  anonKey: supabaseAnonKey,
  isConfigured: looksConfigured(supabaseUrl) && looksConfigured(supabaseAnonKey),
};

export const siteConfig = {
  name: "SilkSoul",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  description:
    "Botanical haircare made with gentle oils and milky extracts. Discover SilkSoul Natural Hair Oil and Milky Repair & Smooth Shampoo.",
};

export function isSupabaseConfigured() {
  return supabaseConfig.isConfigured;
}
