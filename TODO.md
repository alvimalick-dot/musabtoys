# Production Readiness / DevSecOps Fixes

## Critical — DB backup exposure (github.com/alvimalick-dot/musabtoys)
- [x] Add `mongodb-backup/`, `*.bson`, `*.agg` to `.gitignore`
- [x] `git rm -r --cached mongodb-backup` + commit removal
- [x] Purge `mongodb-backup` from all git history via `git-filter-repo`
- [x] Force-push rewritten history to origin (`81689a8...f0514e6 main -> main`)
- [x] Reset local `main` to clean history (`f0514e6`); verified backup gone from all history locally & on origin
- [ ] **USER ACTION (security):** Rotate `ADMIN_JWT_SECRET`, `ADMIN_PASSWORD`, MongoDB connection string, Cloudinary/Resend/Upstash API keys — the data was publicly exposed before the purge. Since the dump may already be copied/scraped, treat formerly-exposed credentials as compromised.

## Security
- [x] Fix SSRF: replace `hostname: "**"` with explicit allowlist in `next.config.ts`
- [x] Add minimal security headers (X-Frame-Options, HSTS, X-Content-Type-Options, Referrer-Policy, Permissions-Policy) to `next.config.ts`
- [x] Add rate limiting to `/api/checkout` (IP-keyed, 10/15 min, Upstash-backed)

## Config / Docs
- [x] Add `UPSTASH_REDIS_REST_URL` + `UPSTASH_REDIS_REST_TOKEN` to `.env.example`
- [ ] **USER ACTION (deploy):** Confirm Upstash Redis env vars are set in Vercel → Project → Settings → Environment Variables (make rate limiting functional in prod)
- [x] Sentry deferred (documented future task) — rely on Vercel function logs for now

## Frontend / Mobile UX fixes (audit #2)
- [x] `CheckoutForm.tsx` — added `autoComplete` to all fields (name, tel, email, street-address, address-line2)
- [x] `CheckoutForm.tsx` — phone field now `type="tel"` + `inputMode="tel"` + `autoComplete="tel"` (opens numeric keypad)
- [x] `CheckoutForm.tsx` — order summary now renders above "Place order" on mobile (submit moved out of form via `form="checkout-form"` + `lg:col-start-1` keeps desktop layout)
- [x] `Header.tsx` — hamburger menu button now has a proper 40px touch target (was bare 16px icon)
- [x] `Header.tsx` — removed "Checkout" from persistent top-level nav
- [x] `Header.tsx` — search icon now always visible (was hidden on mobile); removed redundant "Search shop" dropdown link
- [x] `MobileBottomBar.tsx` — hidden on `/checkout` so "Place order" is the only call to action

## Verify
- [x] `npx tsc --noEmit` — passed (exit 0, no errors) after both DevSecOps + frontend changes
