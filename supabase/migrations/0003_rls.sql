-- SilkSoul row level security and public grants

alter table public.profiles enable row level security;
alter table public.user_roles enable row level security;
alter table public.categories enable row level security;
alter table public.brands enable row level security;
alter table public.products enable row level security;
alter table public.product_images enable row level security;
alter table public.product_relations enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.order_status_history enable row level security;
alter table public.inventory_movements enable row level security;
alter table public.reviews enable row level security;
alter table public.coupons enable row level security;
alter table public.coupon_usage enable row level security;
alter table public.store_settings enable row level security;
alter table public.shipping_rules enable row level security;
alter table public.quotations enable row level security;
alter table public.quotation_items enable row level security;
alter table public.receipts enable row level security;
alter table public.audit_logs enable row level security;
alter table public.admin_notifications enable row level security;

-- Profiles
create policy "Profiles are visible to their owner or staff"
on public.profiles for select
using (id = auth.uid() or public.is_staff_or_admin());

create policy "Profiles can be updated by their owner"
on public.profiles for update
using (id = auth.uid())
with check (id = auth.uid());

create policy "Administrators manage profiles"
on public.profiles for all
using (public.is_admin())
with check (public.is_admin());

-- Roles
create policy "Users can read their own roles"
on public.user_roles for select
using (user_id = auth.uid() or public.is_staff_or_admin());

create policy "Administrators manage roles"
on public.user_roles for all
using (public.is_admin())
with check (public.is_admin());

-- Catalog
create policy "Public reads active categories"
on public.categories for select
using (is_active or public.is_staff_or_admin());

create policy "Administrators manage categories"
on public.categories for all
using (public.is_staff_or_admin())
with check (public.is_staff_or_admin());

create policy "Public reads active brands"
on public.brands for select
using (is_active or public.is_staff_or_admin());

create policy "Administrators manage brands"
on public.brands for all
using (public.is_staff_or_admin())
with check (public.is_staff_or_admin());

create policy "Public reads published products"
on public.products for select
using (
  (is_active and archived_at is null)
  or public.is_staff_or_admin()
);

create policy "Administrators manage products"
on public.products for all
using (public.is_staff_or_admin())
with check (public.is_staff_or_admin());

create policy "Public reads images of published products"
on public.product_images for select
using (
  exists (
    select 1 from public.products p
    where p.id = product_images.product_id
      and p.is_active
      and p.archived_at is null
  )
  or public.is_staff_or_admin()
);

create policy "Administrators manage product images"
on public.product_images for all
using (public.is_staff_or_admin())
with check (public.is_staff_or_admin());

create policy "Public reads relations of published products"
on public.product_relations for select
using (
  exists (
    select 1 from public.products p
    where p.id = product_relations.product_id
      and p.is_active
      and p.archived_at is null
  )
  or public.is_staff_or_admin()
);

create policy "Administrators manage product relations"
on public.product_relations for all
using (public.is_staff_or_admin())
with check (public.is_staff_or_admin());

-- Orders
create policy "Customers read their own orders"
on public.orders for select
using (customer_id = auth.uid() or public.is_staff_or_admin());

create policy "Staff update orders"
on public.orders for update
using (public.is_staff_or_admin())
with check (public.is_staff_or_admin());

create policy "Administrators delete orders"
on public.orders for delete
using (public.is_admin());

create policy "Customers read their own order items"
on public.order_items for select
using (
  exists (
    select 1 from public.orders o
    where o.id = order_items.order_id
      and (o.customer_id = auth.uid() or public.is_staff_or_admin())
  )
);

create policy "Staff manage order items"
on public.order_items for all
using (public.is_staff_or_admin())
with check (public.is_staff_or_admin());

create policy "Customers read their own order history"
on public.order_status_history for select
using (
  exists (
    select 1 from public.orders o
    where o.id = order_status_history.order_id
      and (o.customer_id = auth.uid() or public.is_staff_or_admin())
  )
);

create policy "Staff manage order history"
on public.order_status_history for all
using (public.is_staff_or_admin())
with check (public.is_staff_or_admin());

-- Inventory is staff-only and every change goes through audited functions
create policy "Staff read inventory movements"
on public.inventory_movements for select
using (public.is_staff_or_admin());

create policy "Administrators insert inventory movements"
on public.inventory_movements for insert
with check (public.is_staff_or_admin());

-- Reviews
create policy "Public reads approved reviews"
on public.reviews for select
using (
  status = 'approved'
  or customer_id = auth.uid()
  or public.is_staff_or_admin()
);

create policy "Staff moderate reviews"
on public.reviews for update
using (public.is_staff_or_admin())
with check (public.is_staff_or_admin());

create policy "Administrators delete reviews"
on public.reviews for delete
using (public.is_admin());

-- Coupons
create policy "Staff read coupons"
on public.coupons for select
using (public.is_staff_or_admin());

create policy "Administrators manage coupons"
on public.coupons for all
using (public.is_admin())
with check (public.is_admin());

create policy "Staff read coupon usage"
on public.coupon_usage for select
using (public.is_staff_or_admin() or customer_id = auth.uid());

create policy "Administrators manage coupon usage"
on public.coupon_usage for all
using (public.is_admin())
with check (public.is_admin());

-- Store settings and shipping rules
create policy "Public reads store settings"
on public.store_settings for select
using (true);

create policy "Administrators update store settings"
on public.store_settings for update
using (public.is_admin())
with check (public.is_admin());

create policy "Public reads active shipping rules"
on public.shipping_rules for select
using (is_active or public.is_staff_or_admin());

create policy "Administrators manage shipping rules"
on public.shipping_rules for all
using (public.is_admin())
with check (public.is_admin());

-- Quotations and receipts are private staff documents
create policy "Staff manage quotations"
on public.quotations for all
using (public.is_staff_or_admin())
with check (public.is_staff_or_admin());

create policy "Staff manage quotation items"
on public.quotation_items for all
using (public.is_staff_or_admin())
with check (public.is_staff_or_admin());

create policy "Staff manage receipts"
on public.receipts for all
using (public.is_staff_or_admin())
with check (public.is_staff_or_admin());

-- Audit and notifications
create policy "Staff read audit logs"
on public.audit_logs for select
using (public.is_staff_or_admin());

create policy "Staff append audit logs"
on public.audit_logs for insert
with check (public.is_staff_or_admin() and actor_user_id = auth.uid());

create policy "Administrators manage audit logs"
on public.audit_logs for all
using (public.is_admin())
with check (public.is_admin());

create policy "Staff read notifications"
on public.admin_notifications for select
using (public.is_staff_or_admin());

create policy "Staff update notifications"
on public.admin_notifications for update
using (public.is_staff_or_admin())
with check (public.is_staff_or_admin());

create policy "Administrators manage notifications"
on public.admin_notifications for all
using (public.is_admin())
with check (public.is_admin());

-- Privileges: RLS is the boundary; these grants only expose tables to PostgREST.
grant usage on schema public to anon, authenticated;
grant select on public.categories to anon, authenticated;
grant select on public.brands to anon, authenticated;
grant select on public.products to anon, authenticated;
grant select on public.product_images to anon, authenticated;
grant select on public.product_relations to anon, authenticated;
grant select on public.reviews to anon, authenticated;
grant select on public.store_settings to anon, authenticated;
grant select on public.shipping_rules to anon, authenticated;
grant select on public.product_ratings to anon, authenticated;

grant select, insert, update, delete on all tables in schema public to authenticated;
grant select on all tables in schema public to anon;

-- Storage bucket for product images
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'product-images',
  'product-images',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp', 'image/avif']
)
on conflict (id) do update
set public = true,
    file_size_limit = 5242880,
    allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp', 'image/avif'];

create policy "Public reads product images"
on storage.objects for select
using (bucket_id = 'product-images');

create policy "Staff upload product images"
on storage.objects for insert
to authenticated
with check (bucket_id = 'product-images' and public.is_staff_or_admin());

create policy "Staff update product images"
on storage.objects for update
to authenticated
using (bucket_id = 'product-images' and public.is_staff_or_admin())
with check (bucket_id = 'product-images' and public.is_staff_or_admin());

create policy "Staff delete product images"
on storage.objects for delete
to authenticated
using (bucket_id = 'product-images' and public.is_staff_or_admin());
