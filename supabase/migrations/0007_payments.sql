-- Payment methods, advance payment receipt uploads and payment confirmation.

alter type public.payment_method add value if not exists 'advance';
alter type public.payment_method add value if not exists 'jazzcash';

alter table public.orders
  add column if not exists payment_receipt_path text,
  add column if not exists payment_receipt_uploaded_at timestamptz,
  add column if not exists payment_confirmed_at timestamptz,
  add column if not exists payment_confirmed_by uuid
    references auth.users(id) on delete set null;

alter table public.orders
  drop constraint if exists orders_payment_receipt_path_check,
  add constraint orders_payment_receipt_path_check
    check (
      payment_receipt_path is null
      or payment_receipt_path ~ '^orders/[A-Za-z0-9._-]+$'
    );

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'payment-receipts',
  'payment-receipts',
  false,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp', 'image/avif']
)
on conflict (id) do update
set public = false,
    file_size_limit = 5242880,
    allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp', 'image/avif'];

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
  v_store_socials jsonb := '{}'::jsonb;
  v_payment_method_text text;
  v_payment_receipt_path text;
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

  select delivery_fee, free_delivery_threshold, cod_enabled, socials
  into v_store_delivery_fee, v_free_threshold, v_cod_enabled, v_store_socials
  from public.store_settings
  where id = 1;

  if not found then
    v_store_delivery_fee := 250;
    v_free_threshold := 5000;
    v_cod_enabled := true;
    v_store_socials := '{}'::jsonb;
  end if;

  v_payment_method_text := lower(btrim(coalesce(p_payload ->> 'payment_method', 'cod')));

  if v_payment_method_text not in ('cod', 'advance', 'jazzcash') then
    raise exception 'This payment method is not available.' using errcode = '22023';
  end if;

  v_payment_receipt_path := nullif(btrim(coalesce(p_payload ->> 'payment_receipt_path', '')), '');

  if v_payment_method_text = 'cod' then
    if not v_cod_enabled then
      raise exception 'Cash on delivery is currently unavailable.' using errcode = 'P0001';
    end if;
    v_payment_receipt_path := null;
  elsif v_payment_method_text = 'advance' then
    if not coalesce((v_store_socials #>> '{payments,advance,enabled}')::boolean, false) then
      raise exception 'Advance payment is currently unavailable.' using errcode = 'P0001';
    end if;
  elsif v_payment_method_text = 'jazzcash' then
    if not coalesce((v_store_socials #>> '{payments,jazzcash,enabled}')::boolean, false) then
      raise exception 'JazzCash payment is currently unavailable.' using errcode = 'P0001';
    end if;
  end if;

  if v_payment_method_text in ('advance', 'jazzcash') then
    if v_payment_receipt_path is null
       or length(v_payment_receipt_path) > 300
       or v_payment_receipt_path !~ '^orders/[A-Za-z0-9._-]+$' then
      raise exception 'Please upload your payment receipt.' using errcode = '22023';
    end if;

    if not exists (
      select 1
      from storage.objects so
      where so.bucket_id = 'payment-receipts'
        and so.name = v_payment_receipt_path
    ) then
      raise exception 'Please upload your payment receipt.' using errcode = '22023';
    end if;
  end if;

  v_payment_method := v_payment_method_text::public.payment_method;

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
    payment_receipt_path,
    payment_receipt_uploaded_at,
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
    v_payment_receipt_path,
    case when v_payment_receipt_path is null then null else now() end,
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
