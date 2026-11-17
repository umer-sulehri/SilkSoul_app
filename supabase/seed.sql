-- SilkSoul starter catalog.
-- Prices and stock are placeholders from the approved product brief; update them in admin.

begin;

insert into public.categories (id, name, slug, description, sort_order, is_active)
values
  (
    'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1',
    'Hair Oils',
    'hair-oils',
    'Botanical oils for scalp nourishment, softness and shine.',
    1,
    true
  ),
  (
    'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa2',
    'Shampoos',
    'shampoos',
    'Gentle cleansers for clean, soft and manageable hair.',
    2,
    true
  )
on conflict (id) do update
set name = excluded.name,
    slug = excluded.slug,
    description = excluded.description,
    sort_order = excluded.sort_order,
    is_active = excluded.is_active;

insert into public.brands (id, name, slug, description, is_active)
values (
  'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb1',
  'SILK Soul',
  'silk-soul',
  'Botanical haircare made with gentle oils and milky extracts.',
  true
)
on conflict (id) do update
set name = excluded.name,
    slug = excluded.slug,
    description = excluded.description,
    is_active = excluded.is_active;

insert into public.products (
  id,
  category_id,
  brand_id,
  name,
  slug,
  sku,
  short_description,
  description,
  price,
  compare_at_price,
  currency,
  benefits,
  ingredients,
  usage_instructions,
  specifications,
  stock_on_hand,
  stock_reserved,
  low_stock_threshold,
  is_active,
  is_featured,
  seo_title,
  seo_description
)
values
  (
    '11111111-1111-4111-8111-111111111111',
    'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1',
    'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb1',
    'Natural Hair Oil',
    'natural-hair-oil',
    'SS-HO-200',
    'A featherlight blend of seven botanicals for softer, stronger-looking hair.',
    'SILK Soul Natural Hair Oil is a nourishing blend of rosemary, coconut, almond, castor, argan, mustard and fenugreek oils. It helps improve hair softness, manageability and shine while supporting stronger-looking, healthier-feeling hair.',
    2650,
    null,
    'PKR',
    '["Nourishes the scalp and hair","Helps reduce hair breakage","Supports stronger-looking hair","Improves hair softness and manageability","Enhances natural shine"]'::jsonb,
    '["Rosemary oil","Coconut oil","Almond oil","Castor oil","Argan oil","Mustard oil","Fenugreek oil"]'::jsonb,
    'Apply a suitable amount of oil to the scalp and hair. Gently massage the scalp with fingertips. Distribute the oil evenly through the hair lengths. Leave on for 1–2 hours or as directed, then wash thoroughly with shampoo.',
    '[{"label":"Size","value":"200 ml / 6.7 fl. oz."},{"label":"Packaging","value":"120 mm × 98 mm"},{"label":"Hair type","value":"All hair types"},{"label":"Key botanicals","value":"7 natural oils"},{"label":"Finish","value":"Soft, natural shine"},{"label":"Ritual","value":"Use 1–2 times weekly"}]'::jsonb,
    48,
    0,
    8,
    true,
    true,
    'Natural Hair Oil | SILK Soul',
    'A nourishing blend of rosemary, coconut, almond, castor, argan, mustard and fenugreek oils for softer, stronger-looking hair.'
  ),
  (
    '22222222-2222-4222-8222-222222222222',
    'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa2',
    'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb1',
    'Milky Repair & Smooth Shampoo',
    'milky-repair-smooth-shampoo',
    'SS-SH-250',
    'A sulphate-free milky cleanse that leaves hair soft, smooth and manageable.',
    'SILK Soul Milky Repair & Smooth Shampoo is a gentle yet effective cleansing formula enriched with natural milky extracts. It helps remove dirt, oil and product buildup while nourishing and revitalising hair, leaving it clean, soft, smooth and naturally healthy-looking.',
    2250,
    null,
    'PKR',
    '["Gently cleanses scalp and hair","Nourishes and conditions","Helps remove dirt, oil and product buildup","Improves softness and manageability","Enhances natural shine","Suitable for all hair types"]'::jsonb,
    '["Natural milky extract blend","Sulphate-free cleansing base","Gentle conditioning agents"]'::jsonb,
    'Wet your hair thoroughly. Take a suitable amount of shampoo and apply it to the scalp. Gently massage with the fingertips to create a rich lather. Rinse thoroughly with water. Repeat if needed.',
    '[{"label":"Size","value":"250 ml / 8.4 fl. oz."},{"label":"Packaging","value":"154 mm × 112 mm"},{"label":"Hair type","value":"All hair types"},{"label":"Formula","value":"Sulphate free"},{"label":"Key ingredient","value":"Milky extract"},{"label":"Finish","value":"Soft, smooth and silky"}]'::jsonb,
    62,
    0,
    10,
    true,
    true,
    'Milky Repair & Smooth Shampoo | SILK Soul',
    'A sulphate-free shampoo enriched with milky extracts for clean, soft, smooth and manageable hair.'
  )
on conflict (id) do update
set
  category_id = excluded.category_id,
  brand_id = excluded.brand_id,
  name = excluded.name,
  slug = excluded.slug,
  sku = excluded.sku,
  short_description = excluded.short_description,
  description = excluded.description,
  price = excluded.price,
  compare_at_price = excluded.compare_at_price,
  currency = excluded.currency,
  benefits = excluded.benefits,
  ingredients = excluded.ingredients,
  usage_instructions = excluded.usage_instructions,
  specifications = excluded.specifications,
  low_stock_threshold = excluded.low_stock_threshold,
  is_active = excluded.is_active,
  is_featured = excluded.is_featured,
  seo_title = excluded.seo_title,
  seo_description = excluded.seo_description;

insert into public.product_images (id, product_id, storage_path, alt_text, sort_order, is_primary)
values
  (
    'cccccccc-cccc-4ccc-8ccc-ccccccccccc1',
    '11111111-1111-4111-8111-111111111111',
    '/images/product-1-hair-oil.jpeg',
    'SILK Soul Natural Hair Oil bottle with botanical label',
    0,
    true
  ),
  (
    'cccccccc-cccc-4ccc-8ccc-ccccccccccc2',
    '22222222-2222-4222-8222-222222222222',
    '/images/product-2-milky-shampoo.jpeg',
    'SILK Soul Milky Repair & Smooth Shampoo bottle with sulphate-free label',
    0,
    true
  )
on conflict (id) do nothing;

insert into public.product_relations (product_id, related_product_id, sort_order)
values
  (
    '11111111-1111-4111-8111-111111111111',
    '22222222-2222-4222-8222-222222222222',
    1
  ),
  (
    '22222222-2222-4222-8222-222222222222',
    '11111111-1111-4111-8111-111111111111',
    1
  )
on conflict do nothing;

update public.products
set companion_product_id = '22222222-2222-4222-8222-222222222222'
where id = '11111111-1111-4111-8111-111111111111';

update public.products
set
  companion_product_id = '11111111-1111-4111-8111-111111111111',
  theme_primary = '#6b5740',
  theme_accent = '#c59a62',
  theme_soft = '#f1e9dc'
where id = '22222222-2222-4222-8222-222222222222';

insert into public.store_settings (
  id,
  store_name,
  support_email,
  support_phone,
  currency,
  delivery_fee,
  free_delivery_threshold,
  cod_enabled,
  announcement,
  socials
)
values (
  1,
  'SilkSoul',
  'silksoul26@gmail.com',
  '+92 325 2545556',
  'PKR',
  250,
  5000,
  true,
  'Complimentary delivery on orders over Rs 5,000 · Cash on delivery available',
  '{"instagram":"@silksoul_official","theme":{"background":"#f7f5ec","surface":"#fffdf7","surfaceSoft":"#e9efe1","ink":"#1f2d23","muted":"#626e60","primary":"#3e5a44","accent":"#c19a5b","border":"#dbe3d0","success":"#3f6e4e","warning":"#8f5f1f","danger":"#a24c42"},"payments":{"advance":{"enabled":false,"details":""},"jazzcash":{"enabled":false,"details":""}}}'::jsonb
)
on conflict (id) do nothing;

insert into public.shipping_rules (name, city, fee, free_threshold, is_active)
select 'Standard delivery', null, 250, 5000, true
where not exists (
  select 1 from public.shipping_rules where name = 'Standard delivery'
);

-- Create or reset the store admin account.
-- Email: admin@silksoul.local
-- Password: ChangeMe_SilkSoul_2026!  ← change after the first login.
do $$
declare
  v_email text := 'admin@silksoul.local';
  v_password text := 'ChangeMe_SilkSoul_2026!';
  v_user_id uuid;
begin
  select id
  into v_user_id
  from auth.users
  where lower(email) = lower(v_email)
  limit 1;

  if v_user_id is null then
    v_user_id := gen_random_uuid();

    insert into auth.users (
      instance_id,
      id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      raw_app_meta_data,
      raw_user_meta_data,
      created_at,
      updated_at,
      confirmation_token,
      recovery_token,
      email_change,
      email_change_token_new
    )
    values (
      '00000000-0000-0000-0000-000000000000',
      v_user_id,
      'authenticated',
      'authenticated',
      v_email,
      extensions.crypt(v_password, extensions.gen_salt('bf')),
      now(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      jsonb_build_object('full_name', 'SilkSoul Admin'),
      now(),
      now(),
      '',
      '',
      '',
      ''
    );
  else
    update auth.users
    set
      email = v_email,
      encrypted_password = extensions.crypt(v_password, extensions.gen_salt('bf')),
      email_confirmed_at = coalesce(email_confirmed_at, now()),
      raw_app_meta_data = '{"provider":"email","providers":["email"]}'::jsonb,
      raw_user_meta_data = coalesce(raw_user_meta_data, '{}'::jsonb)
        || jsonb_build_object('full_name', 'SilkSoul Admin'),
      updated_at = now()
    where id = v_user_id;
  end if;

  if exists (
    select 1
    from auth.identities
    where user_id = v_user_id
      and provider = 'email'
  ) then
    update auth.identities
    set
      provider_id = v_user_id::text,
      identity_data = jsonb_build_object(
        'sub', v_user_id::text,
        'email', v_email,
        'email_verified', true
      ),
      updated_at = now()
    where user_id = v_user_id
      and provider = 'email';
  else
    insert into auth.identities (
      id,
      user_id,
      provider_id,
      provider,
      identity_data,
      last_sign_in_at,
      created_at,
      updated_at
    )
    values (
      gen_random_uuid(),
      v_user_id,
      v_user_id::text,
      'email',
      jsonb_build_object(
        'sub', v_user_id::text,
        'email', v_email,
        'email_verified', true
      ),
      now(),
      now(),
      now()
    );
  end if;

  insert into public.profiles (id, full_name, email)
  values (v_user_id, 'SilkSoul Admin', v_email)
  on conflict (id) do update
  set
    full_name = excluded.full_name,
    email = excluded.email;

  insert into public.user_roles (user_id, role)
  values (v_user_id, 'admin')
  on conflict (user_id, role) do nothing;

  delete from public.user_roles
  where user_id = v_user_id
    and role = 'customer';

  raise notice 'Admin account ready: %', v_email;
end
$$;

commit;
