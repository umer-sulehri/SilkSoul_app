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
    when 'pending' then v_new in ('confirmed', 'processing', 'shipped', 'delivered', 'cancelled')
    when 'confirmed' then v_new in ('processing', 'shipped', 'delivered', 'cancelled')
    when 'processing' then v_new in ('shipped', 'delivered', 'cancelled')
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
    confirmed_at = case
      when v_new in ('confirmed', 'processing', 'shipped', 'delivered')
        then coalesce(confirmed_at, now())
      else confirmed_at
    end,
    shipped_at = case
      when v_new in ('shipped', 'delivered') then coalesce(shipped_at, now())
      else shipped_at
    end,
    delivered_at = case
      when v_new = 'delivered' then coalesce(delivered_at, now())
      else delivered_at
    end,
    cancelled_at = case
      when v_new = 'cancelled' then coalesce(cancelled_at, now())
      else cancelled_at
    end
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
