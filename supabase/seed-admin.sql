-- Run this alone to create or reset the admin login.
begin;

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
