-- Supabase installs pgcrypto in the extensions schema, while local Postgres
-- installs it in public. Include both so gen_random_bytes resolves everywhere.
alter function public.create_order(jsonb, text) set search_path = public, extensions;
alter function public.create_quotation(jsonb) set search_path = public, extensions;
alter function public.convert_quotation_to_order(uuid, text) set search_path = public, extensions;
alter function public.create_receipt(uuid) set search_path = public, extensions;
