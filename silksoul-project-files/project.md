# SilkSoul — Project Specification

## 1. Project overview

Build a premium, responsive e-commerce website for **SilkSoul**, a skincare and personal-care brand. The initial catalog contains two products, but the architecture must support an expanding catalog (skincare, haircare, herbal oils, shampoos, and related products) without requiring structural code changes.

The project includes:

1. A customer-facing storefront.
2. A complete shopping and checkout journey.
3. Product detail pages with cross-product switching.
4. Customer order tracking and product reviews.
5. A protected admin dashboard for products, inventory, orders, quotations, receipts, reviews, content, and store settings.

The storefront and admin dashboard should share the same brand identity while using layouts optimized for their different purposes.

## 2. Technology stack

Use the following stack unless a documented technical reason requires a change:

- **Next.js** — App Router
- **TypeScript** — strict mode
- **Tailwind CSS** — styling and responsive layouts
- **Supabase** — PostgreSQL database, Auth, and Storage
- **Supabase SSR** — server-side authentication/session handling in Next.js
- **React Hook Form + Zod** — forms and validation
- **Lucide React** — icons
- **A maintained toast/notification library** — consistent feedback
- **A PDF-generation solution compatible with the deployment runtime** — quotations and receipts

Use the current stable versions compatible with the project at implementation time. Do not introduce Laravel, MySQL, Prisma, or a second backend unless explicitly requested.

## 3. Product experience requirements

### 3.1 Homepage hero product flipper

The homepage hero must have a split layout:

- Left side: headline, supporting copy, primary CTA (e.g. “Shop now”), secondary CTA (e.g. “Explore our products”).
- Right side: a visually prominent product image flipper/carousel featuring the brand's products.
- Use the real uploaded product images; do not invent or alter product packaging or labels.
- The featured image should automatically advance every **15 seconds**.
- Users can manually switch products using visible, accessible previous/next controls and/or product indicators.
- Clicking the displayed product image or its “View product” CTA opens that product's detail page.
- Manual selection resets the 15-second interval so the newly selected product remains visible for a full interval.
- Pause automatic rotation when the carousel is hovered or keyboard-focused, and when the browser tab is hidden. Resume safely when appropriate.
- Respect `prefers-reduced-motion`; disable or reduce automatic transitions for users who request reduced motion.
- Use a smooth, restrained transition (fade or subtle slide). Avoid distracting 3D flipping if it makes product labels hard to read.
- The carousel must be responsive and must not crop important product packaging.

For only two products, both should rotate between one another. The component must still work if more products are added later.

### 3.2 Product listing

Create a shop page with:

- Responsive product grid.
- Product image, name, short description, price, optional compare-at price, rating summary, and stock availability.
- Category and availability filters, sorting, and search.
- Add to cart and view details actions.
- Out-of-stock products cannot be added to cart.
- Do not hardcode the two initial products into the UI; fetch active products from Supabase.

### 3.3 Product detail page with related-product switching

Each product has a canonical URL, for example `/products/[slug]`.

On a product detail page:

- Show the selected product's gallery, title, price, description, benefits, ingredients/specifications, usage instructions, stock status, quantity selector, Add to Cart, and Buy Now.
- Show a **“Explore our other product”** section that prominently displays the other available product(s).
- Clicking another product card must navigate to that product's own canonical product URL and load its details.
- The selected product's content must update completely: images, title, price, description, specifications, availability, reviews, and metadata.
- Do not merely swap text in place while leaving the URL unchanged.
- Use Next.js navigation (`Link`) so the route, browser history, refresh, and sharing all work correctly.
- For two products, show the other product as the primary cross-sell item. If more products are added, show a configurable related-products list.
- Prevent the current product from appearing in its own “other product” section.

### 3.4 Cart and checkout

- Cart supports multiple products and quantity changes.
- Validate quantities against available stock.
- Recalculate subtotal, discounts, delivery charges, and total on the server before creating an order.
- Checkout collects customer name, phone, email (optional or required according to store policy), delivery address, city, postal code, and order notes.
- Support configurable payment methods. Start with Cash on Delivery if no payment provider has been selected.
- Show an order summary before submission.
- Create the order through a trusted server-side operation.
- Show a confirmation page with order reference and order details.
- Never trust client-submitted product prices or totals.
- Avoid double orders on repeated submissions; use an idempotency strategy.

### 3.5 Order tracking

Provide an order lookup experience using a secure order reference and a verification method (for example, phone number or a private tracking token). Do not expose customer orders through guessable sequential IDs.

Suggested statuses:

`pending` → `confirmed` → `processing` → `shipped` → `delivered`

Additional statuses: `cancelled`, `returned`.

### 3.6 Reviews

- Product-specific star ratings and written reviews.
- Optional review images can be added later.
- Admin moderation: pending, approved, rejected.
- Only mark a review “Verified purchase” when the reviewer can be reliably matched to a completed order containing that product.
- Public pages show approved reviews only.
- Prevent public users from directly setting moderation status or verified-purchase status.

## 4. Admin dashboard

Create a separate protected admin area, for example `/admin`.

### 4.1 Dashboard overview

Show:

- Total orders and recent orders.
- Revenue and sales trends.
- Pending orders.
- Products in stock, low stock, and out of stock.
- Inventory value if cost prices are configured.
- Best-selling products.
- Recent customer activity.

Use clear empty, loading, error, and populated states.

### 4.2 Product management

Admins can:

- Create, edit, archive, publish, and unpublish products.
- Manage product name, slug, SKU, description, price, optional compare-at price, category, brand, benefits, ingredients, usage instructions, specifications, SEO title/description, and product images.
- Reorder images and choose a primary image.
- Configure related products.
- Set low-stock threshold.
- View stock and sales information.

Use soft deletion/archive where order history must remain intact.

### 4.3 Inventory management

Inventory must be auditable.

- Show on-hand, reserved, and available stock.
- Available stock = on-hand stock − reserved stock.
- Record every stock movement with product, quantity delta, reason, actor, timestamp, and related order/restock reference.
- Support restock, manual adjustment, damaged/expired stock, and order reservation/release.
- Configure low-stock thresholds and show alerts.
- Do not allow negative stock.
- Use database transactions or PostgreSQL functions/RPCs to make stock and order changes atomic.
- Prevent overselling when multiple customers order simultaneously.

Suggested movement reasons: `restock`, `manual_adjustment`, `order_reserved`, `order_released`, `order_fulfilled`, `damaged`, `returned`.

### 4.4 Order management

Admins can:

- Search and filter orders.
- Open full order details.
- Review customer and delivery information.
- Update order status with an audit trail.
- Record payment status and payment method.
- Cancel orders and correctly release reserved inventory.
- View order items and historical prices, even if the product changes later.

### 4.5 Quotations

Support quotations as a separate business document from orders and receipts.

- Create a quotation for a customer.
- Add products, quantities, unit prices, discounts, delivery charges, tax (if applicable), notes, and validity date.
- Generate a branded PDF.
- Download and optionally email/share it.
- Track quotation status: `draft`, `sent`, `accepted`, `rejected`, `expired`.
- Convert an accepted quotation into an order through a safe server-side workflow.

A quotation is not proof of payment.

### 4.6 Receipts

- Generate a branded PDF receipt from an order/payment record.
- Include brand details, receipt number, order reference, customer details, product lines, quantities, prices, delivery, discounts, total, payment method, payment status, and issue date.
- Allow admin preview and download.
- Keep a record of generated documents.
- Do not label an unpaid COD order as paid. Show the correct payment status.

### 4.7 Reviews moderation

Admins can approve, reject, hide, or remove reviews. Preserve moderation history where practical.

### 4.8 Other modules

- Categories and brands.
- Customer directory and customer order history.
- Coupons and discounts.
- Shipping/delivery settings.
- Homepage content management (hero text, hero products, banners, featured products).
- Reports and exports.
- Admin users and roles.
- Store settings and notification templates.

## 5. Suggested routes

### Public routes

- `/` — homepage
- `/products` — shop
- `/products/[slug]` — product details
- `/cart` — cart
- `/checkout` — checkout
- `/order/success/[reference]` — confirmation
- `/track-order` — order lookup
- `/about`
- `/contact`
- `/faq`
- `/policies/privacy`
- `/policies/returns`
- `/policies/shipping`

### Admin routes

- `/admin`
- `/admin/products`
- `/admin/products/new`
- `/admin/products/[id]`
- `/admin/inventory`
- `/admin/inventory/movements`
- `/admin/orders`
- `/admin/orders/[id]`
- `/admin/quotations`
- `/admin/quotations/new`
- `/admin/quotations/[id]`
- `/admin/receipts`
- `/admin/reviews`
- `/admin/customers`
- `/admin/categories`
- `/admin/coupons`
- `/admin/content`
- `/admin/reports`
- `/admin/settings`
- `/admin/users`

## 6. Supabase data model

Design a normalized PostgreSQL schema. A suggested starting point:

### `profiles`
- `id uuid primary key references auth.users(id)`
- `full_name`
- `phone`
- `created_at`
- `updated_at`

### `user_roles`
- `user_id uuid references auth.users(id)`
- `role` — `admin`, `staff`, or `customer`
- Primary/unique constraint on `(user_id, role)` as appropriate.

Do not rely on client-editable profile metadata to grant admin privileges. Admin role assignment must be restricted to trusted server-side administration.

### `categories`
- `id`
- `name`
- `slug unique`
- `description`
- `is_active`
- timestamps

### `products`
- `id`
- `category_id`
- `name`
- `slug unique`
- `sku unique`
- `short_description`
- `description`
- `price numeric`
- `compare_at_price numeric nullable`
- `cost_price numeric nullable` (admin-only)
- `currency`
- `benefits jsonb`
- `ingredients jsonb`
- `usage_instructions`
- `specifications jsonb`
- `stock_on_hand integer`
- `stock_reserved integer`
- `low_stock_threshold integer`
- `is_active`
- `is_featured`
- `seo_title`
- `seo_description`
- timestamps

Add constraints for non-negative prices and stock, and ensure reserved stock does not exceed on-hand stock.

### `product_images`
- `id`
- `product_id`
- `storage_path`
- `alt_text`
- `sort_order`
- `is_primary`
- `created_at`

### `product_relations`
- `product_id`
- `related_product_id`
- `sort_order`
- unique pair constraint; prevent self-relations.

### `carts` and `cart_items`
Use either persisted carts or a client-side guest cart with server-side validation at checkout. Do not treat client cart values as authoritative.

### `orders`
- `id`
- `order_number unique`
- `customer_id nullable`
- customer name, email, phone
- delivery address fields
- `status`
- `payment_method`
- `payment_status`
- `subtotal`
- `discount_total`
- `delivery_fee`
- `grand_total`
- `customer_note`
- timestamps

### `order_items`
- `id`
- `order_id`
- `product_id nullable`
- product name/SKU snapshot
- `quantity`
- `unit_price`
- `line_total`

Store product snapshots so historical orders remain accurate if a product is renamed or repriced.

### `inventory_movements`
- `id`
- `product_id`
- `quantity_delta`
- `movement_type`
- `reason`
- `reference_type`
- `reference_id`
- `actor_user_id`
- `notes`
- `created_at`

### `reviews`
- `id`
- `product_id`
- `customer_id nullable`
- `order_item_id nullable`
- `display_name`
- `rating`
- `title`
- `body`
- `status`
- `is_verified_purchase`
- timestamps

### `quotations` and `quotation_items`
Store customer details and immutable line-item price snapshots, totals, validity, status, and generated document metadata.

### `receipts`
Store order reference, receipt number, issue date, payment details, storage path, and generated-by user.

### Supporting tables
Add tables for coupons, coupon usage, store settings, shipping rules, audit logs, and admin notifications as needed.

Use appropriate indexes for slugs, SKUs, order numbers, statuses, foreign keys, and common admin filters.

## 7. Security and Supabase requirements

- Enable Row Level Security (RLS) on every table exposed through the Supabase API.
- Public visitors may read only active/published product and category data.
- Public visitors may read only approved reviews.
- Customers may access only their own profile, orders, and permitted review records.
- Admin/staff access must be checked using a secure role source and policies; never trust a role sent by the browser.
- Never expose the Supabase service-role key in client-side code.
- Use server-side Supabase clients for privileged operations.
- Keep storage buckets private where files contain customer/order data. Product images may use a public read bucket with admin-only writes.
- Validate all inputs with Zod on the server.
- Apply rate limiting to checkout, order lookup, review submission, and authentication-sensitive endpoints.
- Use secure, non-guessable tracking references.
- Do not store payment card data. Use a compliant payment provider if online payments are added.
- Keep secrets in environment variables and provide `.env.example` with placeholder values only.

## 8. Design and UX requirements

Follow `style.md` as the visual source of truth.

- Premium, clean skincare brand aesthetic.
- Storefront: warm, editorial, product-focused, conversion-friendly.
- Admin: efficient, data-dense, clear, and consistent.
- Responsive across mobile, tablet, and desktop.
- Accessible labels, keyboard navigation, focus states, semantic HTML, and adequate contrast.
- Consistent empty, loading, error, success, disabled, and out-of-stock states.
- Use real SilkSoul product images supplied by the project owner. Do not fabricate packaging or label text.

## 9. Non-functional requirements

- Use Server Components by default; add Client Components only where interaction/state requires them.
- Use server actions or route handlers for trusted mutations.
- Keep reusable components and domain logic separated.
- Use typed database models generated from Supabase where practical.
- Avoid giant components and duplicated business logic.
- Optimize product images and use appropriate Next.js image handling.
- Add metadata and Open Graph data for product pages.
- Use canonical product URLs and stable slugs.
- Include accessible form validation and clear feedback.
- Add tests for checkout totals, stock reservation, cancellation/release, order status transitions, and role permissions.
- Never fake successful checkout or payment in the UI.

## 10. Suggested project structure

```text
src/
  app/
    (store)/
      page.tsx
      products/
        page.tsx
        [slug]/page.tsx
      cart/page.tsx
      checkout/page.tsx
      track-order/page.tsx
    admin/
      layout.tsx
      page.tsx
      products/
      inventory/
      orders/
      quotations/
      receipts/
      reviews/
      customers/
      settings/
    api/
  components/
    ui/
    layout/
    storefront/
    product/
    cart/
    checkout/
    admin/
  lib/
    supabase/
      client.ts
      server.ts
      middleware.ts
    validations/
    pricing/
    inventory/
    orders/
    documents/
  types/
  hooks/
  styles/
supabase/
  migrations/
  seed.sql
public/
  images/
```

Adjust the exact structure to the current Next.js version, but preserve clear separation between storefront, admin, data access, validation, and business logic.

## 11. Environment variables

Create `.env.example` with placeholders:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

Use the current Supabase publishable/secret key conventions if the project is created with the newer key format. Never commit real credentials.

## 12. Implementation phases

### Phase 1 — Foundation
- Initialize Next.js App Router, TypeScript, and Tailwind.
- Configure Supabase SSR clients and middleware/session refresh.
- Establish design tokens and shared components.
- Create database migrations, RLS policies, and seed data for the two products.

### Phase 2 — Storefront
- Homepage and 15-second hero product flipper.
- Product listing and dynamic product detail pages.
- Related/other product navigation.
- Cart and checkout UI.

### Phase 3 — Orders and inventory
- Secure checkout and order creation.
- Atomic stock reservation and stock movement history.
- Admin product, inventory, and order management.
- Order tracking.

### Phase 4 — Business documents and reviews
- Quotations and PDF generation.
- Receipts and PDF generation.
- Review submission and moderation.

### Phase 5 — Quality and launch
- Responsive and accessibility testing.
- Security/RLS review.
- Checkout and inventory concurrency tests.
- SEO, metadata, analytics, and production deployment.

## 13. Acceptance criteria

The project is not complete until:

1. Homepage hero rotates between active featured products every 15 seconds, supports manual controls, and respects reduced motion.
2. Clicking a hero product opens the correct product detail route.
3. Product detail pages display other products; selecting one navigates to its canonical URL and renders all of its correct data.
4. Product, price, and stock data come from Supabase rather than hardcoded UI arrays.
5. Cart quantity and checkout totals are validated on the server.
6. Concurrent checkouts cannot oversell inventory.
7. Admin can manage products and inventory without code changes.
8. Every inventory adjustment is recorded.
9. Admin can manage order statuses and generate downloadable quotations and receipts.
10. Public reviews are moderated; verified-purchase labels are evidence-based.
11. RLS prevents unauthorized access to customer and admin data.
12. All key screens work on mobile and desktop.

## 14. Development instruction

Before implementing, inspect the existing repository and preserve any working setup. If this is a new repository, create the foundation from this specification. Work in small phases, keep the application runnable, and report assumptions or missing business decisions rather than silently inventing them.
