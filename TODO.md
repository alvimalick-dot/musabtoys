# TODO — Order Tracking (Email) + Product Staleness Fixes

## Tracking — Order ID + Email (DONE)
- [x] 1. `src/app/api/orders/track/route.ts` — verify order by email instead of phone
- [x] 2. `src/components/track/TrackForm.tsx` — replace phone field with email field, link with ?email=
- [x] 3. `src/app/track/page.tsx` — accept `email` searchParam, pass as initialEmail
- [x] 4. `src/app/invoice/[orderNumber]/page.tsx` — authorize via ?email= instead of ?phone=
- [x] 5. `src/app/faq/page.tsx` — update track FAQ to mention email
- [x] 6. `src/lib/notify.ts` — include &email= in trackUrl
- [x] 7. `src/components/emails/OrderConfirmationEmail.tsx` — update track hint + URL with email

## Bug 1 — Admin sees stale/new products late (DONE)
- [x] `src/app/api/products/route.ts` — admin GET requests set `Cache-Control: no-store`; public requests keep CDN caching

## Bug 2 — Left-open tabs show stale data (DONE)
- [x] `src/components/shop/ShopClient.tsx` — refetch on tab focus (visibilitychange) when hidden 30s+
- [x] `src/components/admin/ProductAdmin.tsx` — refetch on tab focus (visibilitychange) when hidden 30s+

## Verification (DONE)
- [x] `tsc --noEmit` passed — exit code 0
