# DevSecOps Hardening Plan — COMPLETE

## 1. ✅ Create `src/lib/security.ts`
- `isValidObjectId(id)` — strict 24-hex ObjectId validation.
- `safeErrorMessage(error, fallback)` — generic error messages, no internal leaks.
- `requireAdmin()` — admin session guard.

## 2. ✅ Harden `src/middleware.ts`
- Enforce real admin auth on admin-only API segments (imports, orders, seed, upload, excel-upload, admin, products/clear, products/recategorize, products/sync-images) returning 401 JSON.
- Redirect unauthenticated non-login `/admin/*` pages to login.
- Public `/api/products` (catalog GET) and `/api/coupons` (public PUT) remain reachable.
- Public API routes pass through.

## 3. ✅ ObjectId validation in admin dynamic routes
- `/api/imports/[id]/route.ts`, `run`, `start`, `retry`, `failed`
- `/api/products/[id]/route.ts` (GET/PATCH/DELETE), `sync`

## 4. ✅ NoSQL injection remediation
- `/api/products/[id]` GET — ObjectId-vs-slug split lookup.
- `/api/cart` — validate all `productId` values.
- `/api/checkout` — validate all `productId` values.

## 5. ✅ Fix `/api/notify/order` IDOR
- Require admin session OR customer session with matching verified email. Added rate limiting. Returns generic 404 without leaking order existence.

## 6. ✅ Error sanitization across sensitive admin routes
- products, orders, imports, clear, recategorize, sync-images, notify/order, cart, products/[id].

## 7. ✅ Build & verify
- `npm run build` — SUCCESS (compiled, linted, type-checked, static pages generated).
- `npx tsc --noEmit` — no errors.
</content>
