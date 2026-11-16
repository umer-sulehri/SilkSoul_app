# SilkSoul — Visual Design System

## 1. Brand direction

**Brand:** SilkSoul  
**Category:** Skincare and personal care  
**Visual keywords:** Premium, gentle, clean, botanical, modern, confident, calm, trustworthy.

The experience should feel like a carefully art-directed skincare brand rather than a generic online marketplace. Keep the product packaging and photography central to the design.

## 2. Color palette

Use warm neutrals with a restrained botanical accent. Centralize colors as CSS variables and Tailwind theme tokens.

| Token | Suggested value | Usage |
|---|---|---|
| `--color-background` | `#F8F6F1` | Main warm ivory background |
| `--color-surface` | `#FFFFFF` | Cards, panels, forms |
| `--color-surface-soft` | `#F0EEE7` | Secondary sections |
| `--color-ink` | `#252923` | Main text |
| `--color-muted` | `#777B70` | Supporting text |
| `--color-primary` | `#66745C` | Botanical green, primary actions |
| `--color-primary-hover` | `#53624A` | Hover/active primary |
| `--color-accent` | `#C6A77B` | Small premium accents |
| `--color-border` | `#E6E2D9` | Borders and dividers |
| `--color-success` | `#4F7859` | Success states |
| `--color-warning` | `#B9853D` | Low-stock/warning states |
| `--color-danger` | `#B6534B` | Errors and destructive actions |

Use the accent sparingly. Do not make every section green or beige; preserve whitespace and contrast.

## 3. Typography

Use a refined editorial heading face paired with a highly readable sans-serif.

Suggested pairing:
- Headings: `DM Serif Display` or `Cormorant Garamond`.
- Body/UI: `DM Sans` or `Inter`.

Rules:
- Headings should feel elegant, not overly decorative.
- Body text must remain highly readable.
- Use a clear type scale and consistent font weights.
- Avoid long all-caps paragraphs.
- Use tabular numerals for prices, quantities, order IDs, and dashboard metrics where available.

## 4. Layout and spacing

- Use a centered content container with a comfortable maximum width (approximately 1200–1320px on large screens).
- Give the storefront generous horizontal and vertical breathing room.
- Use consistent spacing increments based on a 4px or 8px scale.
- Keep section spacing generous on desktop and tighter but still comfortable on mobile.
- Use a clear grid and consistent alignment.
- Avoid unnecessary borders and card-on-card nesting.

Suggested radii:
- Small controls: 8–10px.
- Standard cards: 14–18px.
- Large hero/media panels: 20–28px.
- Pills: fully rounded.

Use subtle shadows only where they improve hierarchy. Prefer borders and tonal surfaces over heavy shadows.

## 5. Storefront visual language

### Header
- Clean, light background.
- SilkSoul wordmark on the left.
- Main navigation centered or adjacent.
- Search, account (if enabled), and cart actions on the right.
- Sticky header is optional; if used, keep it compact.
- Mobile navigation should be simple and accessible.

### Homepage hero

Use a balanced two-column layout on desktop:

**Left column**
- Small eyebrow/brand message.
- Large editorial headline.
- Short supporting copy.
- Primary CTA: “Shop now”.
- Secondary text/link CTA: “Discover our products”.

**Right column**
- Large product image stage featuring the actual SilkSoul products.
- Product image should use `object-contain` so packaging and labels remain visible.
- Product name and optional short descriptor can appear near the image.
- Previous/next controls and slide indicators must be visible but visually quiet.
- Rotate featured products automatically every 15 seconds.
- Use a subtle fade or short slide transition; avoid dramatic spinning/3D effects.
- Make the whole product image or a clear CTA clickable.
- On mobile, stack the text and product visual without making the image too small.

The hero should feel like a premium campaign, not a busy slider. Do not place too much copy over the product image.

### Product cards
- Consistent image ratio and visual height.
- Product images on a clean neutral background.
- Product name, concise supporting text, price, rating if available, and stock state.
- Clear Add to Cart action.
- Subtle hover elevation or image scale; respect reduced motion.
- Do not hide essential price or stock information behind hover.

### Product detail page
- Desktop: image gallery on the left, purchase information on the right.
- Mobile: image gallery first, details and purchase controls immediately below.
- Use large product photography with labels and packaging legible.
- Quantity selector and Add to Cart should be prominent.
- Benefits, ingredients, directions, specifications, FAQs, and reviews should be organized into readable sections or tabs/accordions.
- Include an “Explore our other product” or “You may also like” section.
- With two products, show the other product clearly. Clicking it navigates to its own product URL and loads its complete detail page.
- Related product cards should be visually distinct but not overpower the main product.

### Cart and checkout
- Calm, distraction-free, conversion-focused layout.
- Clear step hierarchy.
- Strong order summary visibility.
- Inputs should have visible labels, clear focus states, and helpful errors.
- Make delivery fees and final totals explicit before order placement.
- On mobile, keep the primary action easy to reach without covering form fields.

## 6. Admin dashboard visual language

The admin dashboard is a separate operational experience. It should be more compact and information-dense than the storefront while retaining SilkSoul's colors.

### Structure
- Fixed or collapsible left sidebar on desktop.
- Top bar with page title/breadcrumbs, search, notifications, and admin profile.
- Main content area with consistent page padding.
- Mobile sidebar becomes a drawer.
- Keep active navigation state clear.

### Dashboard cards
- Use white surfaces, thin neutral borders, and restrained shadows.
- Large metric value, concise label, and optional comparison.
- Use green for positive/success, amber for warning, red for errors only when meaningful.
- Avoid decorative gradients and oversized charts.

### Tables
- Clear column headers and row spacing.
- Search, filters, sorting, pagination, and bulk actions where useful.
- Use status badges with consistent semantic colors.
- Keep important identifiers and totals easy to scan.
- Provide mobile-friendly table behavior (horizontal scroll or responsive row cards).

### Inventory
- Make on-hand, reserved, and available stock visually distinct.
- Low-stock and out-of-stock states must be immediately recognizable.
- Stock adjustment actions should be explicit and auditable.
- Use compact movement history with date, reason, quantity delta, and actor.

### Forms and dialogs
- Group related fields into clear sections.
- Use helper text for complex fields.
- Use confirmation dialogs for delete/archive, cancellation, and inventory adjustments.
- Show success/error feedback after actions.
- Keep save/cancel actions consistently positioned.

## 7. Components and states

Create shared styles for:
- Buttons: primary, secondary, outline, ghost, destructive.
- Inputs, textareas, selects, checkboxes, radio controls.
- Product cards and image galleries.
- Price display and discount display.
- Stock status.
- Rating stars and review cards.
- Tabs and accordions.
- Dialogs and drawers.
- Tables, pagination, filters, and status badges.
- Toasts and inline alerts.
- Skeletons, empty states, error states, and success states.

Every interactive control needs:
- Default state.
- Hover state (where applicable).
- Focus-visible state.
- Active/pressed state.
- Disabled state.
- Loading state (where applicable).

## 8. Motion and interaction

- Use short, restrained transitions (roughly 150–250ms).
- Use easing that feels natural, not springy or playful.
- Hero product rotation interval: exactly 15 seconds.
- Manual carousel controls must reset the timer.
- Pause autoplay on hover/focus and when the page is hidden.
- Respect `prefers-reduced-motion`.
- Avoid parallax, constant floating elements, excessive scroll animations, and distracting motion.
- Do not use animation as the only way to communicate state.

## 9. Responsive behavior

Design and test at least:
- Mobile: 360–430px.
- Tablet: 768px.
- Laptop: 1024–1280px.
- Desktop: 1440px and wider.

Requirements:
- No horizontal overflow.
- Product grid adapts from 1–2 columns on mobile to 3–4 on larger screens as appropriate.
- Hero stacks on mobile.
- Admin navigation collapses to a drawer.
- Tables remain usable on narrow screens.
- Buttons and inputs have comfortable touch targets.
- Product images retain their aspect ratio and remain legible.

## 10. Accessibility

- Use semantic HTML.
- Provide alt text for product images.
- Use labels for all form controls.
- Ensure keyboard operation for navigation, carousel controls, dialogs, and forms.
- Use visible focus indicators.
- Maintain adequate text/background contrast.
- Do not rely on color alone for stock or order status.
- Announce meaningful dynamic updates where appropriate.
- Respect reduced-motion preferences.

## 11. Avoid

- Generic marketplace templates.
- Neon colors or excessive gradients.
- Heavy glassmorphism.
- Overly rounded “toy-like” UI.
- Huge decorative icons.
- Low-contrast beige text on beige backgrounds.
- Product photos that crop off labels or packaging.
- Fake ratings, fake reviews, or unsupported claims.
- Inconsistent button styles or random spacing.
- A storefront and admin dashboard that look like unrelated products.
