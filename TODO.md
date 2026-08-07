# Task Plan — Email-based order tracking (Option 1: Order ID + Email)

## Goal
Replace the phone-based tracking verification with an **email-based** verification,
so tracking works across devices (e.g. order placed on Phone A, tracked on Phone B)
where the customer simply knows the email they used at checkout.

## Completed changes

### API — `/api/orders/track` (src/app/api/orders/track/route.ts)
- [x] `trackSchema` now accepts `email` (validated with `z.string().email()`), not `phone`.
- [x] Matches `order.customer.email` case-insensitively against the submitted email.
- [x] Uses shared `normalizeEmail` / `emailsMatch` helpers from `@/lib/email`.
- [x] Keeps privacy: does not return address / full phone / email in the response payload.

### Shared helper — src/lib/email.ts
- [x] Added `normalizeEmail()` (trim + lowercase) and `emailsMatch()` (case-insensitive compare).

### Track page — src/app/track/page.tsx
- [x] Metadata description updated to "order number and email address".
- [x] Reads `email` from `searchParams` and passes it to `TrackForm`.

### TrackForm — src/components/track/TrackForm.tsx
- [x] Replaced `phone` state with `email` (type="email", autoComplete, inputMode).
- [x] Sends `{ orderNumber, email }` to the API.
- [x] Helper hint under order number.
- [x] "Print invoice" link now passes `?email=` instead of `?phone=`.
- [x] a11y: htmlFor/id, aria-busy, aria-live, role=alert.

### Invoice — src/app/invoice/[orderNumber]/page.tsx
- [x] Guards via `?email=...` using `emailsMatch()` (case-insensitive).

### Order confirmation email — src/lib/notify.ts + OrderConfirmationEmail.tsx
- [x] `trackUrl` now includes `&email=...` so the link pre-fills the field.
- [x] OrderConfirmationEmail already instructs customers to enter Order ID at /track.

### Account page — src/app/account/page.tsx
- [x] "Track / Reorder" link pre-fills the logged-in customer's email.

### FAQ — src/app/faq/page.tsx
- [x] Tracking answer updated to mention the email used at checkout.

## Verify (optional)
- [ ] Run `npx tsc --noEmit` to confirm no type errors.
- [ ] Run `npm run build` for a clean production build.

