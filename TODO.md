# Karachi Toys — UI Modernization Plan

**Constraints (confirmed):**
- Keep the 7-link header nav unchanged (Home, Shop, Wishlist, Account, Track, FAQ, Checkout)
- Keep all Pakistan / PKR / COD messaging — no UK/GBP changes
- Keep existing design system (Tailwind v4, coral/sky/sun palette, pill buttons)

## Tracks

### Track 1 — Design System Polish ✅
- [x] Add dark mode support (CSS variables + `@theme` + `ThemeProvider` + `ThemeToggle` in header, persisted)
- [x] Add reusable `SectionHeading` component to unify heading hierarchy (used in FeaturedProducts, NewArrivals, CategoryStrip)
- [x] Added theme-aware tokens (`--surface`, `--surface-raised`, `--border`, `--header-bg`, etc.)

### Track 2 — Conversion & Trust ✅
- [x] Add top announcement bar (`AnnouncementBar`) — free shipping over PKR 3,000 + COD promo, rotating, dismissible
- [x] Add sticky mobile bottom bar (`MobileBottomBar`) — Cart + Wishlist + WhatsApp
- [x] Add trust badges (`TrustBadges`) near product add-to-cart (COD, fast delivery, secure, returns)

### Track 3 — Product Experience ✅
- [x] Add price range slider (`PriceRangeSlider`) — dual-range in shop sidebar
- [x] Add "Recently viewed" rail (`RecentlyViewed`) on product page
- [x] ProductCard already has add-to-cart + 3D tilt (kept)

### Track 4 — Performance & Polish
- [x] Dark-mode skeleton shimmer styling
- [x] Toast feedback already present (sonner + confetti) — kept
- [ ] Per-card skeleton enhancement (optional, deferred)

### Track 5 — Visual Refresh ✅
- [x] Redesign Footer (newsletter signup, trust/payment badges, expanded links)
- [x] Add section divider (`SectionDivider`) between homepage sections
- [x] WhatsApp FAB repositioned above mobile bottom bar on mobile

## Files created
- `src/components/layout/AnnouncementBar.tsx`
- `src/components/layout/MobileBottomBar.tsx`
- `src/components/ui/SectionHeading.tsx`
- `src/components/home/SectionDivider.tsx`
- `src/components/ui/PriceRangeSlider.tsx`
- `src/components/product/RecentlyViewed.tsx`
- `src/components/ui/TrustBadges.tsx`
- `src/components/ui/ThemeProvider.tsx`
- `src/components/ui/ThemeToggle.tsx`

## Files edited
- `src/app/globals.css` — dark mode tokens, theme-aware btn/input, range-slider, dark shimmer
- `src/app/layout.tsx` — wrapped in ThemeProvider, added AnnouncementBar + MobileBottomBar
- `src/components/layout/Header.tsx` — added ThemeToggle, theme-aware header bg
- `src/components/layout/Footer.tsx` — newsletter + trust/payment badges
- `src/components/layout/CartDrawer.tsx` — theme-aware surfaces
- `src/components/layout/WhatsAppFab.tsx` — repositioned for mobile bar
- `src/components/shop/ShopClient.tsx` — price range slider, theme-aware sidebar
- `src/components/shop/ProductCard.tsx` — theme-aware card surface
- `src/components/product/ProductDetailClient.tsx` — trust badges
- `src/app/product/[slug]/page.tsx` — recently viewed integration
- `src/components/home/FeaturedProducts.tsx` / `NewArrivalProducts.tsx` — SectionHeading
- `src/components/home/CategoryStrip.tsx` — SectionHeading
- `src/app/page.tsx` — SectionDivider

## Follow-up
- [x] Run `npm run build` — clean build succeeded (all 18 pages + routes generated). Fixed SectionDivider client directive + lint issues.
- [x] Fix build-breaking lint errors (Footer unused `Mail` import, PriceRangeSlider unused `cur`)
- [x] Fix SectionDivider `createMotionComponent from server` prerender error (added `"use client"`)
- [ ] Test dark mode toggle persistence
- [ ] Verify announcement bar + mobile bar appearance
