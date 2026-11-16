# SilkSoul — Development Skill Guide

## Purpose

This file defines how an AI coding assistant or developer should work on the SilkSoul e-commerce project. `project.md` defines what to build; `style.md` defines how it should look; this file defines the implementation workflow, engineering rules, and quality checks.

## 1. Start every task by understanding the repository

1. Inspect the current file structure, package manager, Next.js version, Tailwind version, and existing Supabase setup.
2. Read `project.md` and `style.md`.
3. Identify existing components and patterns before creating new ones.
4. Do not overwrite working configuration or replace dependencies without a clear reason.
5. If a business decision is missing, state the assumption and choose the safest reversible default.

## 2. Core engineering principles

- Next.js App Router + TypeScript strict mode + Tailwind CSS.
- Supabase is the backend: PostgreSQL, Auth, and Storage.
- Prefer Server Components. Use Client Components only for browser interactions.
- Keep business rules on the server or in PostgreSQL functions, not only in the browser.
- Use Zod to validate untrusted input at server boundaries.
- Keep UI components small, reusable, typed, and accessible.
- Avoid `any`; use generated Supabase database types where possible.
- Do not add a second backend or ORM without explicit approval.
- Do not hardcode product records, prices, inventory, reviews, or store settings in production UI.

## 3. Supabase patterns

### Client creation

Use separate Supabase clients for browser and server contexts, following the current official `@supabase/ssr` approach.

- Browser client: only for browser-safe operations.
- Server client: for Server Components, Server Actions, and Route Handlers with the user's session.
- Admin/service-role client: server-only, isolated in a clearly named module, never imported by client components.

Never expose `SUPABASE_SERVICE_ROLE_KEY` or any secret key through a `NEXT_PUBLIC_` variable.

### Authentication and authorization

- Use Supabase Auth for sign-in and session management.
- Protect `/admin` on the server.
- Verify admin/staff permissions on every privileged mutation, not just by hiding UI controls.
- Do not trust `user_metadata` or client-supplied role values for authorization.
- Prefer a protected role table and secure RLS helper/policies.
- Test access as anonymous, customer, staff, and admin.

### Database and migrations

- Put schema changes in versioned SQL migrations under `supabase/migrations/`.
- Enable RLS for all exposed tables.
- Add explicit policies for SELECT, INSERT, UPDATE, and DELETE as appropriate.
- Add indexes for frequently queried columns.
- Use foreign keys, unique constraints, check constraints, and transactions.
- Keep seed data separate from production migrations.
- Never make a destructive schema change without explaining its impact.

### Storage

- Store product images in Supabase Storage with predictable paths, for example `products/{product-id}/{file-name}`.
- Public read access is acceptable for published product images.
- Restrict upload, replacement, and deletion to authorized admins.
- Keep receipts, quotations, and customer documents private; use short-lived signed URLs where appropriate.
- Validate file type and size; do not trust file extensions alone.

## 4. Product and navigation rules

### Homepage product flipper

Implement as a reusable client component driven by active featured products from Supabase.

Required behavior:
- Rotate every 15,000 milliseconds.
- Support previous/next controls and indicators.
- Reset the timer after manual selection.
- Pause while hovered, focused, or the document is hidden.
- Respect `prefers-reduced-motion`.
- Clean up intervals and event listeners on unmount.
- Avoid hydration mismatch: do not render different initial slides on server and client.
- The selected product link must use its canonical `/products/{slug}` route.
- Provide meaningful alt text and accessible button labels.

Do not use a timer that continues running after the component unmounts. Avoid multiple overlapping intervals.

### Product detail cross-navigation

- Fetch the current product by slug on the server.
- Fetch active related products, excluding the current product.
- Render links using Next.js `Link`.
- Clicking a related product must navigate to its canonical slug route.
- Ensure page metadata, image gallery, price, stock, specifications, and reviews correspond to the selected slug.
- Handle invalid or unpublished slugs with `notFound()`.
- Preserve browser back/forward navigation.

## 5. Cart, checkout, and inventory rules

- Treat browser cart contents as a request, not a source of truth.
- On checkout, reload product prices and stock from Supabase.
- Recalculate every line total, discount, delivery fee, and grand total on the server.
- Validate integer quantities and maximum purchase limits.
- Use a PostgreSQL transaction/RPC or equivalent atomic server-side workflow to create the order, reserve stock, create order items, and write inventory movements.
- Lock relevant product rows or use a safe conditional update to prevent overselling.
- Use an idempotency key or equivalent protection against duplicate order submissions.
- Never trust totals or stock values submitted by the browser.
- On cancellation, release reserved stock exactly once.
- On fulfillment, decrement on-hand stock and release the reservation exactly once.
- Ensure all status transitions are validated and audited.

## 6. Quotations and receipts

- Keep quotations, orders, and receipts as separate concepts.
- A quotation is an offer and must not imply payment.
- A receipt records an actual order/payment event; show payment status accurately.
- Generate PDFs on a trusted server-side path.
- Use a consistent branded template with clear totals and document numbers.
- Store generated files privately and record metadata in Supabase.
- Avoid generating a receipt that says “Paid” when payment is pending or COD has not been collected.
- Validate permissions before viewing or downloading customer documents.

## 7. Reviews

- Public users may submit a review only through a validated server-side action or route.
- New reviews should default to pending moderation.
- Public product pages query approved reviews only.
- Only derive `is_verified_purchase` from a matching completed order item.
- Do not let a client set `status=approved` or `is_verified_purchase=true`.
- Apply rate limits and basic spam protections.

## 8. UI implementation rules

- Follow `style.md` for colors, typography, spacing, components, and motion.
- Use semantic HTML and accessible labels.
- Use `next/image` or the current supported image approach for product photography.
- Keep product images uncropped where packaging/labels matter (`object-contain` in product-focused contexts).
- Use consistent loading skeletons, empty states, errors, success messages, and disabled states.
- Make touch targets comfortable on mobile.
- Avoid horizontal overflow.
- Use responsive layouts rather than separate duplicated pages.
- Keep forms keyboard-accessible and show inline validation.
- Use confirmation dialogs for destructive admin actions.

## 9. Suggested implementation order

1. Repository audit and foundation.
2. Supabase schema, generated types, RLS, and seed products.
3. Shared storefront layout and design system.
4. Homepage hero flipper.
5. Shop listing and product detail route.
6. Related-product navigation.
7. Cart and server-validated checkout.
8. Atomic inventory/order workflow.
9. Admin authentication and dashboard shell.
10. Product and inventory management.
11. Order management and tracking.
12. Reviews and moderation.
13. Quotations and receipts.
14. Reports, settings, responsive polish, and security review.

Do not jump to PDF generation or advanced analytics before the product, order, and inventory foundations are reliable.

## 10. Required checks before marking a task complete

Run the scripts that exist in the repository, normally:

```bash
npm run lint
npm run typecheck
npm run build
```

If a script is not configured, do not pretend it ran. Explain what is missing.

Also test relevant behavior:
- Homepage rotation advances at 15 seconds.
- Manual carousel controls work and reset the interval.
- Reduced-motion behavior works.
- Clicking a product opens the correct slug.
- Related-product click changes URL and all product content.
- Out-of-stock products cannot be purchased.
- Checkout recalculates price and stock server-side.
- Two simultaneous purchases cannot oversell.
- Cancellation releases stock once.
- Unauthorized users cannot access admin routes or mutations.
- Customers cannot read other customers' orders.
- Public visitors cannot see pending reviews.
- Receipt payment status is accurate.

## 11. How to communicate progress

For each implementation task, report:

1. What was changed.
2. Important files created or updated.
3. Database migrations or environment variables required.
4. Checks/tests run and their actual results.
5. Any remaining assumptions, blockers, or manual setup.

Do not claim a feature is complete if it is only a static mockup. Clearly distinguish UI-only work from working Supabase functionality.
