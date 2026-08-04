# TODO — Fix sitemap "Unable to fetch" + enhance sitemap

## Module 1 — Fix build error blocking deployment
- [x] Rewrite `src/app/api/imports/[id]/start/route.ts` with clean Next.js 15 `params` signature (consistent line endings)
- [x] Verify other `[id]` routes use consistent `await params` pattern (rewrote `run/route.ts` too)

## Module 2 — Harden & enhance `sitemap.ts`
- [x] Add `export const revalidate` (ISR caching) to avoid DB query per crawl
- [x] Add `console.error` logging in the catch block
- [x] Make product limit env-configurable (`SITEMAP_MAX_PRODUCTS`, default 10000)
- [x] Add `/account` static page to sitemap
- [x] Add `<image:image>` product image URLs for schema.org product indexing

## Module 3 — Verification
- [ ] `npm run build` passes
- [ ] `npm run lint` passes
