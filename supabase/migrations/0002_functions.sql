-- SilkSoul business functions and triggers

create or replace function public.normalize_phone(value text)
returns text
language sql
immutable
as $$
  select right(regexp_replace(coalesce(value, ''), '\D', '', 'g'), 10);
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public, extensions
as $$
  select exists (
    select 1 from public.user_roles
    where user_id = auth.uid() and role = 'admin'
  );
$$;

create or replace function public.is_staff_or_admin()
returns boolean
language sql
stable
security definer
set search_path = public, extensions
as $$
  select exists (
    select 1 from public.user_roles
    where user_id = auth.uid() and role in ('admin', 'staff')
  );
$$;

grant execute on function public.is_admin() to anon, authenticated;
grant execute on function public.is_staff_or_admin() to anon, authenticated;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public, extensions
as $$
begin
  insert into public.profiles (id, full_name, email)
  values (
    new.id,
    nullif(new.raw_user_meta_data ->> 'full_name', ''),
    new.email
  )
  on conflict (id) do nothing;

  insert into public.user_roles (user_id, role)
  values (new.id, 'customer')
  on conflict (user_id, role) do nothing;

  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

create or replace function public.create_order(
  p_payload jsonb,
  p_idempotency_key text
)
returns jsonb
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_customer jsonb;
  v_delivery jsonb;
  v_existing public.orders;
  v_customer_name text;
  v_customer_phone text;
  v_customer_email text;
  v_address text;
  v_city text;
  v_postal_code text;
  v_payment_method public.payment_method;
  v_item record;
  v_product public.products;
  v_product_ids uuid[];
  v_subtotal numeric(12, 2) := 0;
  v_discount numeric(12, 2) := 0;
  v_delivery_fee numeric(12, 2) := 0;
  v_grand_total numeric(12, 2) := 0;
  v_store_delivery_fee numeric(12, 2) := 250;
  v_free_threshold numeric(12, 2) := 5000;
  v_cod_enabled boolean := true;
  v_currency text := 'PKR';
  v_coupon public.coupons;
  v_coupon_id uuid;
  v_coupon_code text;
  v_coupon_usage integer := 0;
  v_order public.orders;
  v_order_number text;
  v_available integer;
  v_item_count integer := 0;
begin
  if p_idempotency_key is null or length(btrim(p_idempotency_key)) < 8 then
    raise exception 'A valid idempotency key is required.' using errcode = '22023';
  end if;

  if jsonb_typeof(p_payload) <> 'object' then
    raise exception 'Invalid order payload.' using errcode = '22023';
  end if;

  perform pg_advisory_xact_lock(hashtext(p_idempotency_key));

  select * into v_existing
  from public.orders
  where idempotency_key = p_idempotency_key;

  if found then
    return jsonb_build_object(
      'order_id', v_existing.id,
      'order_number', v_existing.order_number,
      'tracking_token', v_existing.tracking_token,
      'grand_total', v_existing.grand_total,
      'reused', true
    );
  end if;

  v_customer := p_payload -> 'customer';
  v_delivery := p_payload -> 'delivery';

  v_customer_name := btrim(coalesce(v_customer ->> 'name', ''));
  v_customer_phone := btrim(coalesce(v_customer ->> 'phone', ''));
  v_customer_email := nullif(btrim(coalesce(v_customer ->> 'email', '')), '');
  v_address := btrim(coalesce(v_delivery ->> 'address', ''));
  v_city := btrim(coalesce(v_delivery ->> 'city', ''));
  v_postal_code := nullif(btrim(coalesce(v_delivery ->> 'postal_code', '')), '');

  if length(v_customer_name) < 2 then
    raise exception 'Please provide a valid customer name.' using errcode = '22023';
  end if;
  if length(public.normalize_phone(v_customer_phone)) < 10 then
    raise exception 'Please provide a valid phone number.' using errcode = '22023';
  end if;
  if length(v_address) < 10 then
    raise exception 'Please provide a complete delivery address.' using errcode = '22023';
  end if;
  if length(v_city) < 2 then
    raise exception 'Please provide a valid city.' using errcode = '22023';
  end if;

  v_payment_method := coalesce((p_payload ->> 'payment_method')::public.payment_method, 'cod');

  if v_payment_method <> 'cod' then
    raise exception 'This payment method is not available.' using errcode = '22023';
  end if;

  if jsonb_typeof(p_payload -> 'items') <> 'array'
     or jsonb_array_length(p_payload -> 'items') = 0 then
    raise exception 'Your cart is empty.' using errcode = '22023';
  end if;

  if exists (
    select 1
    from jsonb_array_elements(p_payload -> 'items') as item
    where coalesce((item ->> 'quantity')::integer, 0) <= 0
       or (item ->> 'quantity')::integer > 20
  ) then
    raise exception 'Quantities must be between 1 and 20.' using errcode = '22023';
  end if;

  select array_agg(distinct (item ->> 'product_id')::uuid order by (item ->> 'product_id')::uuid)
  into v_product_ids
  from jsonb_array_elements(p_payload -> 'items') as item;

  if v_product_ids is null or array_length(v_product_ids, 1) = 0 then
    raise exception 'Your cart is empty.' using errcode = '22023';
  end if;

  perform p.id
  from public.products p
  where p.id = any(v_product_ids)
  order by p.id
  for update;

  for v_item in
    select
      (item ->> 'product_id')::uuid as product_id,
      sum((item ->> 'quantity')::integer)::integer as quantity
    from jsonb_array_elements(p_payload -> 'items') as item
    group by 1
    order by 1
  loop
    select * into v_product from public.products where id = v_item.product_id;

    if not found then
      raise exception 'A product in your cart is no longer available.' using errcode = 'P0001';
    end if;
    if not v_product.is_active or v_product.archived_at is not null then
      raise exception '% is not available for purchase.', v_product.name using errcode = 'P0001';
    end if;

    v_available := v_product.stock_on_hand - v_product.stock_reserved;
    if v_available < v_item.quantity then
      raise exception 'Only % of % remain in stock.', greatest(v_available, 0), v_product.name
        using errcode = 'P0001';
    end if;

    if v_item_count = 0 then
      v_currency := v_product.currency;
    elsif v_currency <> v_product.currency then
      raise exception 'Products in one order must share a currency.' using errcode = 'P0001';
    end if;

    v_subtotal := v_subtotal + (v_product.price * v_item.quantity);
    v_item_count := v_item_count + 1;
  end loop;

  select delivery_fee, free_delivery_threshold, cod_enabled
  into v_store_delivery_fee, v_free_threshold, v_cod_enabled
  from public.store_settings
  where id = 1;

  if not found then
    v_store_delivery_fee := 250;
    v_free_threshold := 5000;
    v_cod_enabled := true;
  end if;

  if not v_cod_enabled then
    raise exception 'Cash on delivery is currently unavailable.' using errcode = 'P0001';
  end if;

  v_coupon_code := upper(btrim(coalesce(p_payload ->> 'coupon_code', '')));
  if v_coupon_code <> '' then
    select * into v_coupon
    from public.coupons
    where upper(code) = v_coupon_code
      and is_active
      and (starts_at is null or starts_at <= now())
      and (ends_at is null or ends_at >= now());

    if not found then
      raise exception 'That discount code is invalid or has expired.' using errcode = 'P0001';
    end if;
    v_coupon_id := v_coupon.id;
    if v_subtotal < v_coupon.min_subtotal then
      raise exception 'The order does not meet the minimum for this discount code.'
        using errcode = 'P0001';
    end if;

    select count(*) into v_coupon_usage from public.coupon_usage where coupon_id = v_coupon.id;
    if v_coupon.usage_limit is not null and v_coupon_usage >= v_coupon.usage_limit then
      raise exception 'That discount code has reached its usage limit.' using errcode = 'P0001';
    end if;

    if v_coupon.per_customer_limit is not null and auth.uid() is not null then
      select count(*) into v_coupon_usage
      from public.coupon_usage
      where coupon_id = v_coupon.id and customer_id = auth.uid();

      if v_coupon_usage >= v_coupon.per_customer_limit then
        raise exception 'You have already used this discount code the maximum number of times.'
          using errcode = 'P0001';
      end if;
    end if;

    if v_coupon.discount_type = 'percentage' then
      v_discount := round(v_subtotal * v_coupon.discount_value / 100, 2);
    else
      v_discount := v_coupon.discount_value;
    end if;

    if v_coupon.max_discount is not null then
      v_discount := least(v_discount, v_coupon.max_discount);
    end if;
    v_discount := least(v_discount, v_subtotal);
  end if;

  if (v_subtotal - v_discount) >= v_free_threshold then
    v_delivery_fee := 0;
  else
    v_delivery_fee := v_store_delivery_fee;
  end if;

  v_grand_total := v_subtotal - v_discount + v_delivery_fee;

  v_order_number := 'SS-' || to_char(now() at time zone 'Asia/Karachi', 'YYMMDD') || '-' ||
    upper(substr(encode(gen_random_bytes(3), 'hex'), 1, 6));

  insert into public.orders (
    order_number,
    idempotency_key,
    customer_id,
    customer_name,
    customer_email,
    customer_phone,
    delivery_address,
    city,
    postal_code,
    payment_method,
    subtotal,
    discount_total,
    delivery_fee,
    grand_total,
    currency,
    coupon_code,
    customer_note
  )
  values (
    v_order_number,
    p_idempotency_key,
    auth.uid(),
    v_customer_name,
    v_customer_email,
    v_customer_phone,
    v_address,
    v_city,
    v_postal_code,
    v_payment_method,
    v_subtotal,
    v_discount,
    v_delivery_fee,
    v_grand_total,
    v_currency,
    nullif(v_coupon_code, ''),
    nullif(btrim(coalesce(p_payload ->> 'customer_note', '')), '')
  )
  returning * into v_order;

  for v_item in
    select
      (item ->> 'product_id')::uuid as product_id,
      sum((item ->> 'quantity')::integer)::integer as quantity
    from jsonb_array_elements(p_payload -> 'items') as item
    group by 1
    order by 1
  loop
    select * into v_product from public.products where id = v_item.product_id;

    insert into public.order_items (
      order_id, product_id, product_name, product_sku, unit_price, quantity, line_total
    )
    values (
      v_order.id,
      v_product.id,
      v_product.name,
      v_product.sku,
      v_product.price,
      v_item.quantity,
      v_product.price * v_item.quantity
    );

    update public.products
    set stock_reserved = stock_reserved + v_item.quantity
    where id = v_product.id;

    insert into public.inventory_movements (
      product_id,
      on_hand_delta,
      reserved_delta,
      movement_type,
      reason,
      reference_type,
      reference_id,
      actor_user_id,
      notes
    )
    values (
      v_product.id,
      0,
      v_item.quantity,
      'order_reserved',
      'Reserved for order',
      'order',
      v_order.id,
      auth.uid(),
      'Order ' || v_order.order_number
    );
  end loop;

  insert into public.order_status_history (order_id, from_status, to_status, actor_user_id, note)
  values (v_order.id, null, 'pending', auth.uid(), 'Order placed');

  if v_coupon_id is not null then
    insert into public.coupon_usage (coupon_id, order_id, customer_id, discount_amount)
    values (v_coupon_id, v_order.id, auth.uid(), v_discount);
  end if;

  insert into public.audit_logs (actor_user_id, action, entity_type, entity_id, details)
  values (
    auth.uid(),
    'order.created',
    'order',
    v_order.id,
    jsonb_build_object('order_number', v_order.order_number, 'total', v_grand_total)
  );

  return jsonb_build_object(
    'order_id', v_order.id,
    'order_number', v_order.order_number,
    'tracking_token', v_order.tracking_token,
    'grand_total', v_order.grand_total,
    'reused', false
  );
end;
$$;

grant execute on function public.create_order(jsonb, text) to anon, authenticated;

create or replace function public.track_order(p_order_number text, p_phone text)
returns jsonb
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_order public.orders;
begin
  select * into v_order
  from public.orders
  where upper(order_number) = upper(btrim(p_order_number))
    and public.normalize_phone(customer_phone) = public.normalize_phone(p_phone)
  limit 1;

  if not found then
    return null;
  end if;

  return jsonb_build_object(
    'order_number', v_order.order_number,
    'status', v_order.status,
    'payment_method', v_order.payment_method,
    'payment_status', v_order.payment_status,
    'customer_name', v_order.customer_name,
    'city', v_order.city,
    'subtotal', v_order.subtotal,
    'discount_total', v_order.discount_total,
    'delivery_fee', v_order.delivery_fee,
    'grand_total', v_order.grand_total,
    'currency', v_order.currency,
    'placed_at', v_order.placed_at,
    'items', coalesce((
      select jsonb_agg(jsonb_build_object(
        'product_name', oi.product_name,
        'product_sku', oi.product_sku,
        'quantity', oi.quantity,
        'unit_price', oi.unit_price,
        'line_total', oi.line_total
      ) order by oi.created_at)
      from public.order_items oi
      where oi.order_id = v_order.id
    ), '[]'::jsonb),
    'timeline', coalesce((
      select jsonb_agg(jsonb_build_object('status', h.to_status, 'at', h.created_at) order by h.created_at)
      from public.order_status_history h
      where h.order_id = v_order.id
    ), jsonb_build_array(jsonb_build_object('status', 'pending', 'at', v_order.placed_at)))
  );
end;
$$;

grant execute on function public.track_order(text, text) to anon, authenticated;

create or replace function public.get_order_by_token(p_order_number text, p_token text)
returns jsonb
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_order public.orders;
begin
  if coalesce(length(p_token), 0) < 16 then
    return null;
  end if;

  select * into v_order
  from public.orders
  where upper(order_number) = upper(btrim(p_order_number))
    and tracking_token = p_token
  limit 1;

  if not found then
    return null;
  end if;

  return jsonb_build_object(
    'order_number', v_order.order_number,
    'status', v_order.status,
    'payment_method', v_order.payment_method,
    'payment_status', v_order.payment_status,
    'customer_name', v_order.customer_name,
    'city', v_order.city,
    'subtotal', v_order.subtotal,
    'discount_total', v_order.discount_total,
    'delivery_fee', v_order.delivery_fee,
    'grand_total', v_order.grand_total,
    'currency', v_order.currency,
    'placed_at', v_order.placed_at,
    'items', coalesce((
      select jsonb_agg(jsonb_build_object(
        'product_name', oi.product_name,
        'product_sku', oi.product_sku,
        'quantity', oi.quantity,
        'unit_price', oi.unit_price,
        'line_total', oi.line_total
      ) order by oi.created_at)
      from public.order_items oi
      where oi.order_id = v_order.id
    ), '[]'::jsonb),
    'timeline', coalesce((
      select jsonb_agg(jsonb_build_object('status', h.to_status, 'at', h.created_at) order by h.created_at)
      from public.order_status_history h
      where h.order_id = v_order.id
    ), jsonb_build_array(jsonb_build_object('status', 'pending', 'at', v_order.placed_at)))
  );
end;
$$;

grant execute on function public.get_order_by_token(text, text) to anon, authenticated;

create or replace function public.submit_review(
  p_product_id uuid,
  p_display_name text,
  p_rating integer,
  p_title text,
  p_body text
)
returns jsonb
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_review public.reviews;
  v_verified boolean := false;
  v_order_item_id uuid;
  v_user uuid := auth.uid();
begin
  if not exists (
    select 1 from public.products
    where id = p_product_id and is_active and archived_at is null
  ) then
    raise exception 'Product not found.' using errcode = 'P0001';
  end if;

  if p_rating is null or p_rating < 1 or p_rating > 5 then
    raise exception 'Rating must be between 1 and 5.' using errcode = '22023';
  end if;

  if length(btrim(coalesce(p_display_name, ''))) < 2 then
    raise exception 'Please provide a display name.' using errcode = '22023';
  end if;

  if length(btrim(coalesce(p_body, ''))) < 10 then
    raise exception 'Please write a little more in your review.' using errcode = '22023';
  end if;

  if v_user is not null then
    select oi.id into v_order_item_id
    from public.order_items oi
    join public.orders o on o.id = oi.order_id
    where o.customer_id = v_user
      and oi.product_id = p_product_id
      and o.status = 'delivered'
    order by o.delivered_at desc nulls last
    limit 1;

    v_verified := v_order_item_id is not null;
  end if;

  insert into public.reviews (
    product_id,
    customer_id,
    order_item_id,
    display_name,
    rating,
    title,
    body,
    status,
    is_verified_purchase
  )
  values (
    p_product_id,
    v_user,
    v_order_item_id,
    left(btrim(p_display_name), 60),
    p_rating,
    nullif(left(btrim(coalesce(p_title, '')), 120), ''),
    left(btrim(p_body), 1200),
    'pending',
    v_verified
  )
  returning * into v_review;

  return jsonb_build_object('review_id', v_review.id, 'status', v_review.status);
end;
$$;

grant execute on function public.submit_review(uuid, text, integer, text, text) to anon, authenticated;

create or replace function public.admin_update_order_status(
  p_order_id uuid,
  p_status text,
  p_note text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_order public.orders;
  v_new public.order_status := p_status::public.order_status;
  v_from public.order_status;
  v_item record;
  v_allowed boolean := false;
begin
  if not public.is_staff_or_admin() then
    raise exception 'Not authorised.' using errcode = '42501';
  end if;

  select * into v_order from public.orders where id = p_order_id for update;
  if not found then
    raise exception 'Order not found.' using errcode = 'P0001';
  end if;

  if v_order.status = v_new then
    return jsonb_build_object('order_id', v_order.id, 'status', v_order.status);
  end if;

  v_from := v_order.status;

  v_allowed := case v_order.status
    when 'pending' then v_new in ('confirmed', 'cancelled')
    when 'confirmed' then v_new in ('processing', 'cancelled')
    when 'processing' then v_new in ('shipped', 'cancelled')
    when 'shipped' then v_new in ('delivered', 'cancelled')
    when 'delivered' then v_new in ('returned')
    else false
  end;

  if not v_allowed then
    raise exception 'Cannot change order status from % to %.', v_order.status, v_new
      using errcode = 'P0001';
  end if;

  if v_new = 'cancelled' then
    for v_item in
      select product_id, sum(quantity)::integer as quantity
      from public.order_items
      where order_id = v_order.id and product_id is not null
      group by product_id
    loop
      update public.products
      set stock_reserved = greatest(0, stock_reserved - v_item.quantity)
      where id = v_item.product_id;

      insert into public.inventory_movements (
        product_id, on_hand_delta, reserved_delta, movement_type, reason,
        reference_type, reference_id, actor_user_id, notes
      )
      values (
        v_item.product_id, 0, -v_item.quantity, 'order_released',
        'Order cancelled', 'order', v_order.id, auth.uid(),
        'Released reservation for ' || v_order.order_number
      );
    end loop;
  end if;

  if v_new = 'delivered' then
    for v_item in
      select product_id, sum(quantity)::integer as quantity
      from public.order_items
      where order_id = v_order.id and product_id is not null
      group by product_id
    loop
      update public.products
      set
        stock_on_hand = stock_on_hand - v_item.quantity,
        stock_reserved = greatest(0, stock_reserved - v_item.quantity)
      where id = v_item.product_id;

      insert into public.inventory_movements (
        product_id, on_hand_delta, reserved_delta, movement_type, reason,
        reference_type, reference_id, actor_user_id, notes
      )
      values (
        v_item.product_id, -v_item.quantity, -v_item.quantity, 'order_fulfilled',
        'Order delivered', 'order', v_order.id, auth.uid(),
        'Fulfilled ' || v_order.order_number
      );
    end loop;
  end if;

  if v_new = 'returned' then
    for v_item in
      select product_id, sum(quantity)::integer as quantity
      from public.order_items
      where order_id = v_order.id and product_id is not null
      group by product_id
    loop
      update public.products
      set stock_on_hand = stock_on_hand + v_item.quantity
      where id = v_item.product_id;

      insert into public.inventory_movements (
        product_id, on_hand_delta, reserved_delta, movement_type, reason,
        reference_type, reference_id, actor_user_id, notes
      )
      values (
        v_item.product_id, v_item.quantity, 0, 'returned',
        'Order returned', 'order', v_order.id, auth.uid(),
        'Returned ' || v_order.order_number
      );
    end loop;
  end if;

  update public.orders
  set
    status = v_new,
    confirmed_at = case when v_new = 'confirmed' then now() else confirmed_at end,
    shipped_at = case when v_new = 'shipped' then now() else shipped_at end,
    delivered_at = case when v_new = 'delivered' then now() else delivered_at end,
    cancelled_at = case when v_new = 'cancelled' then now() else cancelled_at end
  where id = v_order.id
  returning * into v_order;

  insert into public.order_status_history (order_id, from_status, to_status, actor_user_id, note)
  values (v_order.id, v_from, v_new, auth.uid(), nullif(btrim(coalesce(p_note, '')), ''));

  insert into public.audit_logs (actor_user_id, action, entity_type, entity_id, details)
  values (
    auth.uid(),
    'order.status_changed',
    'order',
    v_order.id,
    jsonb_build_object('status', v_new, 'note', p_note)
  );

  insert into public.admin_notifications (type, title, body, link)
  values (
    'order',
    'Order ' || v_order.order_number || ' marked ' || v_new,
    nullif(btrim(coalesce(p_note, '')), ''),
    '/admin/orders/' || v_order.id
  );

  return jsonb_build_object('order_id', v_order.id, 'status', v_order.status);
end;
$$;

grant execute on function public.admin_update_order_status(uuid, text, text) to authenticated;

create or replace function public.adjust_inventory(
  p_product_id uuid,
  p_on_hand_delta integer,
  p_movement_type text,
  p_reason text,
  p_notes text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_product public.products;
  v_type public.movement_type := p_movement_type::public.movement_type;
  v_new_on_hand integer;
begin
  if not public.is_staff_or_admin() then
    raise exception 'Not authorised.' using errcode = '42501';
  end if;

  if p_on_hand_delta is null or p_on_hand_delta = 0 then
    raise exception 'Enter a non-zero stock adjustment.' using errcode = '22023';
  end if;

  if v_type not in ('restock', 'manual_adjustment', 'damaged', 'returned') then
    raise exception 'Invalid inventory movement type.' using errcode = '22023';
  end if;

  if length(btrim(coalesce(p_reason, ''))) < 3 then
    raise exception 'A reason is required for inventory changes.' using errcode = '22023';
  end if;

  select * into v_product from public.products where id = p_product_id for update;
  if not found then
    raise exception 'Product not found.' using errcode = 'P0001';
  end if;

  v_new_on_hand := v_product.stock_on_hand + p_on_hand_delta;
  if v_new_on_hand < 0 then
    raise exception 'Stock cannot be negative.' using errcode = '23514';
  end if;
  if v_new_on_hand < v_product.stock_reserved then
    raise exception 'On-hand stock cannot fall below reserved stock.' using errcode = '23514';
  end if;

  update public.products
  set stock_on_hand = v_new_on_hand
  where id = p_product_id;

  insert into public.inventory_movements (
    product_id,
    on_hand_delta,
    reserved_delta,
    movement_type,
    reason,
    reference_type,
    actor_user_id,
    notes
  )
  values (
    p_product_id,
    p_on_hand_delta,
    0,
    v_type,
    btrim(p_reason),
    'manual',
    auth.uid(),
    nullif(btrim(coalesce(p_notes, '')), '')
  );

  insert into public.audit_logs (actor_user_id, action, entity_type, entity_id, details)
  values (
    auth.uid(),
    'inventory.adjusted',
    'product',
    p_product_id,
    jsonb_build_object('delta', p_on_hand_delta, 'new_on_hand', v_new_on_hand, 'reason', p_reason)
  );

  return jsonb_build_object('product_id', p_product_id, 'stock_on_hand', v_new_on_hand);
end;
$$;

grant execute on function public.adjust_inventory(uuid, integer, text, text, text) to authenticated;

create or replace function public.admin_set_user_role(p_user_id uuid, p_role text)
returns jsonb
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_role public.user_role := p_role::public.user_role;
begin
  if not public.is_admin() then
    raise exception 'Only administrators can change roles.' using errcode = '42501';
  end if;

  if p_user_id = auth.uid() and v_role <> 'admin' then
    raise exception 'You cannot remove your own administrator role.' using errcode = 'P0001';
  end if;

  insert into public.user_roles (user_id, role)
  values (p_user_id, v_role)
  on conflict (user_id, role) do nothing;

  insert into public.audit_logs (actor_user_id, action, entity_type, entity_id, details)
  values (
    auth.uid(),
    'user.role_granted',
    'user',
    p_user_id,
    jsonb_build_object('role', v_role)
  );

  return jsonb_build_object('user_id', p_user_id, 'role', v_role);
end;
$$;

grant execute on function public.admin_set_user_role(uuid, text) to authenticated;
