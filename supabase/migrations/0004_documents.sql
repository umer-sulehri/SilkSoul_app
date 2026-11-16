-- Quotations, quotation conversion and receipt generation.

create or replace function public.create_quotation(p_payload jsonb)
returns jsonb
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_item record;
  v_product public.products;
  v_quotation public.quotations;
  v_quantity integer;
  v_unit_price numeric(12, 2);
  v_line_total numeric(12, 2);
  v_subtotal numeric(12, 2) := 0;
  v_discount numeric(12, 2);
  v_delivery numeric(12, 2);
  v_tax numeric(12, 2);
  v_quotation_number text;
  v_product_ids uuid[] := '{}';
begin
  if not public.is_staff_or_admin() then
    raise exception 'Not authorized' using errcode = '42501';
  end if;

  if coalesce(trim(p_payload ->> 'customer_name'), '') = ''
     or coalesce(trim(p_payload ->> 'customer_phone'), '') = '' then
    raise exception 'Customer name and phone are required.' using errcode = '22023';
  end if;

  if jsonb_typeof(p_payload -> 'items') <> 'array'
     or jsonb_array_length(p_payload -> 'items') = 0 then
    raise exception 'Add at least one product to the quotation.' using errcode = '22023';
  end if;

  v_discount := greatest(coalesce((p_payload ->> 'discount_total')::numeric, 0), 0);
  v_delivery := greatest(coalesce((p_payload ->> 'delivery_fee')::numeric, 0), 0);
  v_tax := greatest(coalesce((p_payload ->> 'tax_total')::numeric, 0), 0);
  v_quotation_number := 'QT-' || to_char(now() at time zone 'Asia/Karachi', 'YYMMDD') || '-' ||
    upper(substr(encode(gen_random_bytes(3), 'hex'), 1, 6));

  insert into public.quotations (
    quotation_number, customer_name, customer_email, customer_phone,
    customer_address, customer_city, customer_postal_code, status,
    notes, validity_date, currency, created_by
  ) values (
    v_quotation_number,
    trim(p_payload ->> 'customer_name'),
    nullif(trim(p_payload ->> 'customer_email'), ''),
    trim(p_payload ->> 'customer_phone'),
    nullif(trim(p_payload ->> 'customer_address'), ''),
    nullif(trim(p_payload ->> 'customer_city'), ''),
    nullif(trim(p_payload ->> 'customer_postal_code'), ''),
    'draft',
    nullif(trim(p_payload ->> 'notes'), ''),
    nullif(p_payload ->> 'validity_date', '')::date,
    'PKR',
    auth.uid()
  ) returning * into v_quotation;

  for v_item in
    select value from jsonb_array_elements(p_payload -> 'items') as item(value)
  loop
    select * into v_product
    from public.products
    where id = (v_item.value ->> 'product_id')::uuid
      and archived_at is null;

    if not found then
      raise exception 'Product is not available.' using errcode = '22023';
    end if;

    if v_product.id = any(v_product_ids) then
      raise exception 'Combine duplicate products into one line.' using errcode = '22023';
    end if;
    v_product_ids := array_append(v_product_ids, v_product.id);

    v_quantity := coalesce((v_item.value ->> 'quantity')::integer, 0);
    if v_quantity < 1 or v_quantity > 999 then
      raise exception 'Product quantities must be between 1 and 999.' using errcode = '22023';
    end if;

    v_unit_price := coalesce(nullif(v_item.value ->> 'unit_price', '')::numeric, v_product.price);
    if v_unit_price < 0 or v_unit_price > 10000000 then
      raise exception 'Unit price is invalid.' using errcode = '22023';
    end if;

    v_line_total := round(v_unit_price * v_quantity, 2);
    v_subtotal := v_subtotal + v_line_total;

    insert into public.quotation_items (
      quotation_id, product_id, product_name, quantity, unit_price, line_total
    ) values (
      v_quotation.id, v_product.id, v_product.name, v_quantity, v_unit_price, v_line_total
    );
  end loop;

  v_discount := least(v_discount, v_subtotal);

  update public.quotations
  set subtotal = v_subtotal,
      discount_total = v_discount,
      delivery_fee = v_delivery,
      tax_total = v_tax,
      grand_total = v_subtotal - v_discount + v_delivery + v_tax,
      updated_at = now()
  where id = v_quotation.id
  returning * into v_quotation;

  insert into public.audit_logs (actor_user_id, action, entity_type, entity_id, details)
  values (
    auth.uid(), 'quotation.created', 'quotation', v_quotation.id,
    jsonb_build_object('quotation_number', v_quotation.quotation_number,
                       'grand_total', v_quotation.grand_total)
  );

  return jsonb_build_object(
    'quotation_id', v_quotation.id,
    'quotation_number', v_quotation.quotation_number
  );
end;
$$;

revoke all on function public.create_quotation(jsonb) from public;
grant execute on function public.create_quotation(jsonb) to authenticated;

create or replace function public.set_quotation_status(p_quotation_id uuid, p_status text)
returns jsonb
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_quotation public.quotations;
  v_new public.quotation_status := p_status::public.quotation_status;
  v_from public.quotation_status;
  v_allowed boolean := false;
begin
  if not public.is_staff_or_admin() then
    raise exception 'Not authorized' using errcode = '42501';
  end if;

  select * into v_quotation
  from public.quotations
  where id = p_quotation_id
  for update;

  if not found then
    raise exception 'Quotation not found.' using errcode = 'P0002';
  end if;

  if v_new = v_quotation.status then
    return jsonb_build_object('quotation_id', v_quotation.id, 'status', v_quotation.status);
  end if;

  if v_new = 'accepted' and v_quotation.validity_date is not null
     and v_quotation.validity_date < current_date then
    raise exception 'This quotation has expired. Update the validity date first.' using errcode = '22023';
  end if;

  v_allowed := case v_quotation.status
    when 'draft' then v_new in ('sent', 'accepted', 'rejected', 'expired')
    when 'sent' then v_new in ('accepted', 'rejected', 'expired')
    else false
  end;

  if not v_allowed then
    raise exception 'Cannot change a % quotation to %.', v_quotation.status, v_new
      using errcode = '22023';
  end if;

  v_from := v_quotation.status;

  update public.quotations
  set status = v_new, updated_at = now()
  where id = v_quotation.id
  returning * into v_quotation;

  insert into public.audit_logs (actor_user_id, action, entity_type, entity_id, details)
  values (
    auth.uid(), 'quotation.status_changed', 'quotation', v_quotation.id,
    jsonb_build_object('from', v_from, 'to', v_new)
  );

  return jsonb_build_object('quotation_id', v_quotation.id, 'status', v_new);
end;
$$;

revoke all on function public.set_quotation_status(uuid, text) from public;
grant execute on function public.set_quotation_status(uuid, text) to authenticated;

create or replace function public.convert_quotation_to_order(
  p_quotation_id uuid,
  p_idempotency_key text
)
returns jsonb
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_quotation public.quotations;
  v_existing public.orders;
  v_order public.orders;
  v_item record;
  v_product public.products;
  v_subtotal numeric(12, 2) := 0;
  v_discount numeric(12, 2) := 0;
  v_delivery numeric(12, 2) := 0;
  v_tax numeric(12, 2) := 0;
  v_available integer;
  v_order_number text;
begin
  if not public.is_staff_or_admin() then
    raise exception 'Not authorized' using errcode = '42501';
  end if;

  if coalesce(trim(p_idempotency_key), '') = '' then
    raise exception 'Missing idempotency key.' using errcode = '22023';
  end if;

  perform pg_advisory_xact_lock(hashtext(p_idempotency_key));

  select * into v_existing from public.orders where idempotency_key = p_idempotency_key;
  if found then
    return jsonb_build_object('order_id', v_existing.id, 'order_number', v_existing.order_number);
  end if;

  select * into v_quotation
  from public.quotations
  where id = p_quotation_id
  for update;

  if not found then
    raise exception 'Quotation not found.' using errcode = 'P0002';
  end if;

  if v_quotation.status <> 'accepted' then
    raise exception 'Only accepted quotations can be converted.' using errcode = '22023';
  end if;

  if v_quotation.converted_order_id is not null then
    select * into v_existing from public.orders where id = v_quotation.converted_order_id;
    return jsonb_build_object('order_id', v_existing.id, 'order_number', v_existing.order_number);
  end if;

  if v_quotation.validity_date is not null and v_quotation.validity_date < current_date then
    raise exception 'This quotation has expired.' using errcode = '22023';
  end if;

  perform p.id
  from public.products p
  join public.quotation_items qi on qi.product_id = p.id
  where qi.quotation_id = v_quotation.id
  order by p.id
  for update of p;

  for v_item in
    select qi.* from public.quotation_items qi
    where qi.quotation_id = v_quotation.id
    order by qi.created_at, qi.id
    for update
  loop
    select * into v_product
    from public.products
    where id = v_item.product_id
      and archived_at is null
      and is_active
    for update;

    if not found then
      raise exception 'One of the quoted products is no longer available.' using errcode = '22023';
    end if;

    v_available := v_product.stock_on_hand - v_product.stock_reserved;
    if v_available < v_item.quantity then
      raise exception 'Only % units of % are available.', v_available, v_product.name
        using errcode = '22023';
    end if;

    v_subtotal := v_subtotal + v_item.line_total;
  end loop;

  v_discount := least(coalesce(v_quotation.discount_total, 0), v_subtotal);
  v_delivery := coalesce(v_quotation.delivery_fee, 0);
  v_tax := coalesce(v_quotation.tax_total, 0);
  v_order_number := 'SS-' || to_char(now() at time zone 'Asia/Karachi', 'YYMMDD') || '-' ||
    upper(substr(encode(gen_random_bytes(3), 'hex'), 1, 6));

  insert into public.orders (
    order_number, idempotency_key, customer_name, customer_email, customer_phone,
    delivery_address, city, postal_code, status, payment_method, payment_status,
    subtotal, discount_total, delivery_fee, tax_total, grand_total, currency,
    customer_note
  ) values (
    v_order_number, p_idempotency_key, v_quotation.customer_name, v_quotation.customer_email,
    v_quotation.customer_phone, coalesce(v_quotation.customer_address, 'To be confirmed'),
    coalesce(v_quotation.customer_city, 'To be confirmed'),
    v_quotation.customer_postal_code, 'pending', 'cod', 'unpaid',
    v_subtotal, v_discount, v_delivery, v_tax,
    v_subtotal - v_discount + v_delivery + v_tax, v_quotation.currency,
    'Converted from quotation ' || v_quotation.quotation_number
  ) returning * into v_order;

  insert into public.order_items (
    order_id, product_id, product_name, product_sku, unit_price, quantity, line_total
  )
  select v_order.id, qi.product_id, qi.product_name, p.sku, qi.unit_price, qi.quantity, qi.line_total
  from public.quotation_items qi
  left join public.products p on p.id = qi.product_id
  where qi.quotation_id = v_quotation.id;

  update public.products p
  set stock_reserved = p.stock_reserved + qi.quantity,
      updated_at = now()
  from public.quotation_items qi
  where qi.quotation_id = v_quotation.id
    and qi.product_id = p.id;

  insert into public.inventory_movements (
    product_id, on_hand_delta, reserved_delta, movement_type, reason,
    reference_type, reference_id, actor_user_id, notes
  )
  select qi.product_id, 0, qi.quantity, 'order_reserved', 'quotation conversion',
         'quotation', v_quotation.id, auth.uid(), v_order.order_number
  from public.quotation_items qi
  where qi.quotation_id = v_quotation.id;

  insert into public.order_status_history (order_id, from_status, to_status, actor_user_id, note)
  values (v_order.id, null, 'pending', auth.uid(), 'Order created from quotation ' || v_quotation.quotation_number);

  update public.quotations
  set converted_order_id = v_order.id, updated_at = now()
  where id = v_quotation.id;

  insert into public.audit_logs (actor_user_id, action, entity_type, entity_id, details)
  values (
    auth.uid(), 'quotation.converted', 'quotation', v_quotation.id,
    jsonb_build_object('order_id', v_order.id, 'order_number', v_order.order_number)
  );

  insert into public.admin_notifications (type, title, body, link)
  values (
    'order', 'Quotation converted',
    v_quotation.quotation_number || ' became order ' || v_order.order_number,
    '/admin/orders/' || v_order.id
  );

  return jsonb_build_object('order_id', v_order.id, 'order_number', v_order.order_number);
end;
$$;

revoke all on function public.convert_quotation_to_order(uuid, text) from public;
grant execute on function public.convert_quotation_to_order(uuid, text) to authenticated;

create or replace function public.create_receipt(p_order_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_order public.orders;
  v_receipt public.receipts;
  v_receipt_number text;
begin
  if not public.is_staff_or_admin() then
    raise exception 'Not authorized' using errcode = '42501';
  end if;

  select * into v_order from public.orders where id = p_order_id;
  if not found then
    raise exception 'Order not found.' using errcode = 'P0002';
  end if;

  v_receipt_number := 'RC-' || to_char(now() at time zone 'Asia/Karachi', 'YYMMDD') || '-' ||
    upper(substr(encode(gen_random_bytes(3), 'hex'), 1, 6));

  insert into public.receipts (
    receipt_number, order_id, payment_method, payment_status, amount, generated_by, metadata
  ) values (
    v_receipt_number, v_order.id, v_order.payment_method, v_order.payment_status,
    v_order.grand_total, auth.uid(),
    jsonb_build_object('order_number', v_order.order_number, 'customer_name', v_order.customer_name)
  ) returning * into v_receipt;

  insert into public.audit_logs (actor_user_id, action, entity_type, entity_id, details)
  values (
    auth.uid(), 'receipt.generated', 'receipt', v_receipt.id,
    jsonb_build_object('receipt_number', v_receipt.receipt_number, 'order_id', v_order.id)
  );

  return jsonb_build_object('receipt_id', v_receipt.id, 'receipt_number', v_receipt.receipt_number);
end;
$$;

revoke all on function public.create_receipt(uuid) from public;
grant execute on function public.create_receipt(uuid) to authenticated;
