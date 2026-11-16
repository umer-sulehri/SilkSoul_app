alter table public.products
  add column if not exists companion_product_id uuid
    references public.products(id) on delete set null,
  add column if not exists theme_primary text not null default '#3e5a44'
    check (theme_primary ~ '^#[0-9a-fA-F]{6}$'),
  add column if not exists theme_accent text not null default '#c19a5b'
    check (theme_accent ~ '^#[0-9a-fA-F]{6}$'),
  add column if not exists theme_soft text not null default '#e9efe1'
    check (theme_soft ~ '^#[0-9a-fA-F]{6}$');

alter table public.products
  drop constraint if exists products_companion_not_self,
  add constraint products_companion_not_self
    check (companion_product_id is null or companion_product_id <> id);

update public.products p
set companion_product_id = relation.related_product_id
from (
  select distinct on (product_id)
    product_id,
    related_product_id
  from public.product_relations
  order by product_id, sort_order, related_product_id
) relation
where relation.product_id = p.id
  and p.companion_product_id is null;

update public.products
set
  theme_primary = '#6b5740',
  theme_accent = '#c59a62',
  theme_soft = '#f1e9dc'
where slug = 'milky-repair-smooth-shampoo';
