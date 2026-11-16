-- SilkSoul initial schema
create extension if not exists pgcrypto;

create type public.user_role as enum ('admin', 'staff', 'customer');
create type public.order_status as enum (
  'pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'returned'
);
create type public.payment_status as enum (
  'unpaid', 'paid', 'partially_refunded', 'refunded', 'failed'
);
create type public.payment_method as enum ('cod', 'bank_transfer', 'card');
create type public.review_status as enum ('pending', 'approved', 'rejected', 'hidden');
create type public.movement_type as enum (
  'restock', 'manual_adjustment', 'order_reserved', 'order_released', 'order_fulfilled',
  'damaged', 'returned'
);
create type public.quotation_status as enum ('draft', 'sent', 'accepted', 'rejected', 'expired');
create type public.discount_type as enum ('percentage', 'fixed');

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  phone text,
  email text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.user_role not null default 'customer',
  created_at timestamptz not null default now(),
  unique (user_id, role)
);

create table public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  image_url text,
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.brands (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  logo_url text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.products (
  id uuid primary key default gen_random_uuid(),
  category_id uuid references public.categories(id) on delete set null,
  brand_id uuid references public.brands(id) on delete set null,
  name text not null,
  slug text not null unique,
  sku text not null unique,
  short_description text,
  description text,
  price numeric(12, 2) not null check (price >= 0),
  compare_at_price numeric(12, 2) check (compare_at_price is null or compare_at_price >= 0),
  cost_price numeric(12, 2) check (cost_price is null or cost_price >= 0),
  currency text not null default 'PKR' check (char_length(currency) = 3),
  benefits jsonb not null default '[]'::jsonb check (jsonb_typeof(benefits) = 'array'),
  ingredients jsonb not null default '[]'::jsonb check (jsonb_typeof(ingredients) = 'array'),
  usage_instructions text,
  specifications jsonb not null default '{}'::jsonb
    check (jsonb_typeof(specifications) in ('object', 'array')),
  stock_on_hand integer not null default 0 check (stock_on_hand >= 0),
  stock_reserved integer not null default 0 check (stock_reserved >= 0),
  low_stock_threshold integer not null default 5 check (low_stock_threshold >= 0),
  is_active boolean not null default true,
  is_featured boolean not null default false,
  seo_title text,
  seo_description text,
  archived_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (stock_reserved <= stock_on_hand)
);

create table public.product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  storage_path text not null,
  alt_text text,
  sort_order integer not null default 0,
  is_primary boolean not null default false,
  created_at timestamptz not null default now()
);

create unique index product_images_one_primary
  on public.product_images (product_id)
  where is_primary;

create table public.product_relations (
  product_id uuid not null references public.products(id) on delete cascade,
  related_product_id uuid not null references public.products(id) on delete cascade,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  primary key (product_id, related_product_id),
  check (product_id <> related_product_id)
);

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique,
  tracking_token text not null unique default encode(gen_random_bytes(24), 'hex'),
  idempotency_key text unique,
  customer_id uuid references auth.users(id) on delete set null,
  customer_name text not null,
  customer_email text,
  customer_phone text not null,
  delivery_address text not null,
  city text not null,
  postal_code text,
  status public.order_status not null default 'pending',
  payment_method public.payment_method not null default 'cod',
  payment_status public.payment_status not null default 'unpaid',
  subtotal numeric(12, 2) not null default 0 check (subtotal >= 0),
  discount_total numeric(12, 2) not null default 0 check (discount_total >= 0),
  delivery_fee numeric(12, 2) not null default 0 check (delivery_fee >= 0),
  tax_total numeric(12, 2) not null default 0 check (tax_total >= 0),
  grand_total numeric(12, 2) not null default 0 check (grand_total >= 0),
  currency text not null default 'PKR' check (char_length(currency) = 3),
  coupon_code text,
  customer_note text,
  admin_note text,
  placed_at timestamptz not null default now(),
  confirmed_at timestamptz,
  shipped_at timestamptz,
  delivered_at timestamptz,
  cancelled_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint orders_grand_total_equation_check
    check (grand_total = subtotal - discount_total + delivery_fee + tax_total)
);

create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  product_name text not null,
  product_sku text,
  unit_price numeric(12, 2) not null check (unit_price >= 0),
  quantity integer not null check (quantity > 0),
  line_total numeric(12, 2) not null check (line_total >= 0),
  created_at timestamptz not null default now()
);

create table public.order_status_history (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  from_status public.order_status,
  to_status public.order_status not null,
  actor_user_id uuid references auth.users(id) on delete set null,
  note text,
  created_at timestamptz not null default now()
);

create table public.inventory_movements (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  on_hand_delta integer not null default 0,
  reserved_delta integer not null default 0,
  quantity_delta integer generated always as (on_hand_delta - reserved_delta) stored,
  movement_type public.movement_type not null,
  reason text,
  reference_type text,
  reference_id uuid,
  actor_user_id uuid references auth.users(id) on delete set null,
  notes text,
  created_at timestamptz not null default now()
);

create table public.reviews (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  customer_id uuid references auth.users(id) on delete set null,
  order_item_id uuid references public.order_items(id) on delete set null,
  display_name text not null,
  rating integer not null check (rating between 1 and 5),
  title text,
  body text not null,
  status public.review_status not null default 'pending',
  is_verified_purchase boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index reviews_product_status_idx on public.reviews (product_id, status);

create table public.coupons (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  description text,
  discount_type public.discount_type not null,
  discount_value numeric(12, 2) not null check (discount_value >= 0),
  min_subtotal numeric(12, 2) not null default 0 check (min_subtotal >= 0),
  max_discount numeric(12, 2) check (max_discount is null or max_discount >= 0),
  starts_at timestamptz,
  ends_at timestamptz,
  usage_limit integer check (usage_limit is null or usage_limit > 0),
  per_customer_limit integer check (per_customer_limit is null or per_customer_limit > 0),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.coupon_usage (
  id uuid primary key default gen_random_uuid(),
  coupon_id uuid not null references public.coupons(id) on delete cascade,
  order_id uuid not null references public.orders(id) on delete cascade,
  customer_id uuid references auth.users(id) on delete set null,
  discount_amount numeric(12, 2) not null default 0 check (discount_amount >= 0),
  created_at timestamptz not null default now(),
  unique (coupon_id, order_id)
);

create table public.store_settings (
  id integer primary key default 1 check (id = 1),
  store_name text not null default 'SilkSoul',
  support_email text not null default '',
  support_phone text not null default '',
  currency text not null default 'PKR' check (char_length(currency) = 3),
  delivery_fee numeric(12, 2) not null default 250 check (delivery_fee >= 0),
  free_delivery_threshold numeric(12, 2) not null default 5000
    check (free_delivery_threshold >= 0),
  cod_enabled boolean not null default true,
  address text,
  socials jsonb not null default '{}'::jsonb,
  announcement text,
  updated_at timestamptz not null default now()
);

create table public.shipping_rules (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  city text,
  fee numeric(12, 2) not null default 0 check (fee >= 0),
  free_threshold numeric(12, 2) check (free_threshold is null or free_threshold >= 0),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.quotations (
  id uuid primary key default gen_random_uuid(),
  quotation_number text not null unique,
  customer_name text not null,
  customer_email text,
  customer_phone text not null,
  customer_address text,
  customer_city text,
  customer_postal_code text,
  status public.quotation_status not null default 'draft',
  subtotal numeric(12, 2) not null default 0 check (subtotal >= 0),
  discount_total numeric(12, 2) not null default 0 check (discount_total >= 0),
  delivery_fee numeric(12, 2) not null default 0 check (delivery_fee >= 0),
  tax_total numeric(12, 2) not null default 0 check (tax_total >= 0),
  grand_total numeric(12, 2) not null default 0 check (grand_total >= 0),
  currency text not null default 'PKR' check (char_length(currency) = 3),
  notes text,
  validity_date date,
  converted_order_id uuid references public.orders(id) on delete set null,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.quotation_items (
  id uuid primary key default gen_random_uuid(),
  quotation_id uuid not null references public.quotations(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  product_name text not null,
  quantity integer not null check (quantity > 0),
  unit_price numeric(12, 2) not null check (unit_price >= 0),
  line_total numeric(12, 2) not null check (line_total >= 0),
  created_at timestamptz not null default now()
);

create table public.receipts (
  id uuid primary key default gen_random_uuid(),
  receipt_number text not null unique,
  order_id uuid not null references public.orders(id) on delete cascade,
  payment_method public.payment_method not null,
  payment_status public.payment_status not null,
  amount numeric(12, 2) not null check (amount >= 0),
  issued_at timestamptz not null default now(),
  storage_path text,
  generated_by uuid references auth.users(id) on delete set null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_user_id uuid references auth.users(id) on delete set null,
  action text not null,
  entity_type text not null,
  entity_id uuid,
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table public.admin_notifications (
  id uuid primary key default gen_random_uuid(),
  type text not null,
  title text not null,
  body text,
  link text,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

create index products_active_idx on public.products (is_active, archived_at);
create index products_category_idx on public.products (category_id);
create index products_featured_idx on public.products (is_featured);
create index product_images_product_idx on public.product_images (product_id, sort_order);
create index product_relations_product_idx on public.product_relations (product_id, sort_order);
create index orders_customer_idx on public.orders (customer_id);
create index orders_status_idx on public.orders (status);
create index orders_placed_at_idx on public.orders (placed_at desc);
create index orders_phone_idx on public.orders (customer_phone);
create index order_items_order_idx on public.order_items (order_id);
create index inventory_movements_product_idx on public.inventory_movements (product_id, created_at desc);
create index audit_logs_created_idx on public.audit_logs (created_at desc);

create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

create trigger categories_set_updated_at
before update on public.categories
for each row execute function public.set_updated_at();

create trigger brands_set_updated_at
before update on public.brands
for each row execute function public.set_updated_at();

create trigger products_set_updated_at
before update on public.products
for each row execute function public.set_updated_at();

create trigger orders_set_updated_at
before update on public.orders
for each row execute function public.set_updated_at();

create trigger reviews_set_updated_at
before update on public.reviews
for each row execute function public.set_updated_at();

create trigger coupons_set_updated_at
before update on public.coupons
for each row execute function public.set_updated_at();

create trigger shipping_rules_set_updated_at
before update on public.shipping_rules
for each row execute function public.set_updated_at();

create trigger quotations_set_updated_at
before update on public.quotations
for each row execute function public.set_updated_at();

create or replace view public.product_ratings
with (security_invoker = true)
as
select
  product_id,
  count(*)::integer as review_count,
  round(avg(rating)::numeric, 2) as average_rating
from public.reviews
where status = 'approved'
group by product_id;
