# SilkSoul

Premium botanical haircare storefront and admin studio for SILK Soul. Built with Next.js App Router, TypeScript, Tailwind CSS and Supabase.

## What is included

- Responsive editorial storefront: home, shop, filters, product detail, reviews, story, FAQ, contact and policies.
- Cart persisted in the browser, server-validated cash-on-delivery checkout, order success and phone-based tracking.
- Supabase schema with catalog, inventory, orders, reviews, coupons, quotations, receipts, audit logs and notifications.
- Atomic order function that re-prices products, checks stock, reserves inventory and supports idempotent submissions.
- Row Level Security for customers, staff and administrators plus a public product-image bucket.
- Protected admin studio: dashboard, products, image uploads, inventory movements, order fulfilment, quotations, receipts, review moderation, settings, discount codes and team roles.
- Branded quotation and receipt PDFs rendered on demand with `pdf-lib`; quotations can be converted into stock-reserving orders.

## Requirements

- Node.js 20.9+ (Node 22 recommended)
- npm
- A Supabase project

## Setup

1. Install dependencies:

```bash
npm install
```

2. Create `.env.local` from `.env.example` and fill in:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-or-publishable-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

`SUPABASE_SERVICE_ROLE_KEY` is server-only. Never expose it with a `NEXT_PUBLIC_` prefix or commit it.

3. In the Supabase SQL editor, run the migrations in order:

```text
supabase/migrations/0001_init.sql
supabase/migrations/0002_functions.sql
supabase/migrations/0003_rls.sql
supabase/migrations/0004_documents.sql
supabase/migrations/0005_search_path.sql
supabase/migrations/0006_product_experience.sql
```

4. Seed the starter catalog, store settings and administrator login:

```text
supabase/seed.sql
```

The seed uses the two approved products, local image paths and placeholder prices/stock. Update prices and stock in the admin before launch.

The seeded admin login is:

```text
Email: admin@silksoul.local
Password: ChangeMe_SilkSoul_2026!
```

Change this password after the first login. To create or reset only the admin login later, run `supabase/seed-admin.sql`.

5. Start the app:

```bash
npm run dev
```

Storefront: `http://localhost:3000`  
Admin: `http://localhost:3000/admin`

Without Supabase environment variables the storefront runs in preview mode with the seed catalog snapshot. Checkout is deliberately disabled and no fake order is created. The admin cannot be opened until Supabase is connected.

## Scripts

```bash
npm run dev        # development server
npm run build      # production build
npm run start      # start the production build
npm run lint       # ESLint
npm run typecheck  # tsc --noEmit
```

## Admin roles

- `admin`: full access, including settings, discount codes and team roles.
- `staff`: catalog, product images, inventory, orders and review moderation.
- `customer`: no admin access.

Roles are enforced by Supabase RLS on every table and by server checks in admin actions. Direct table writes are not exposed to customers for orders, reviews or inventory changes; those use audited security-definer functions.

## Order lifecycle

1. Checkout posts the cart, customer details and an idempotency key.
2. `create_order` locks products, re-prices from the database, validates stock, applies a valid coupon and reserves inventory.
3. Status changes run through `admin_update_order_status`:
   - `pending → confirmed → processing → shipped → delivered`
   - cancellation releases reservations
   - delivery deducts on-hand stock
   - returns add stock back
4. Every stock change creates an inventory movement and an audit entry.

Cash on delivery is the only enabled payment method. Payment status is tracked separately so admins can mark orders paid after collection.

## Quotations and receipts

- Create quotations in **Admin → Quotations**. They support line-level pricing, discounts, delivery, tax, notes and a validity date.
- Mark a quotation **accepted**, then convert it. Conversion rechecks availability, reserves stock atomically and creates a pending COD order while keeping the quoted prices and totals.
- Generate receipts from an order. A receipt snapshots the payment status at issue time; unpaid COD orders are clearly labelled **unpaid** and must not be treated as proof of payment.
- PDFs preview inline and download with a `?download=1` link. The PDFs embed the brand logo and store contact settings.

## Product images

Seed image paths point at `/images/...` in this repository. Uploaded images go to the public `product-images` Supabase Storage bucket. Add the Supabase storage host to `next.config.ts` remote patterns if you use a custom domain.

## Notes before launch

- Replace placeholder prices, stock, contact details and social links with verified business information.
- Review the privacy, shipping and returns policies with the business owner.
- Configure Supabase Auth email templates and password reset if customer accounts will be enabled.
- Add email/SMS notifications and courier integration as a follow-up; the schema already records order status history and notifications.
- Run `npm run lint`, `npm run typecheck` and `npm run build` before deployment.
