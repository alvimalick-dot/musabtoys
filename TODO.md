# Task Plan — Homepage hierarchy + compareAtPrice admin field

## A. Homepage visual hierarchy (approved)
- [x] A1. Fix `SectionHeading.tsx` — add `accentColor` prop (default `text-coral`) so accent word is brandable.
- [x] A2. Update `NewArrivalProducts.tsx` — add `accentColor="text-sky"` + wrap section in a full-bleed sky tint band.
- [x] A3. Create `src/components/home/AgeShopBadges.tsx` — dedicated "Shop by age" section with colorful ring badges.
- [x] A4. Update `page.tsx` — insert `<AgeShopBadges />` right after `<Hero />`.
- [x] A5. Update `CategoryStrip.tsx` — remove the redundant "Shop by age" pill block (now its own section).

## B. compareAtPrice — Admin form (only missing piece)
- [x] B1. Update `ProductAdmin.tsx`:
  - [x] Add `compareAtPrice` to `ProductRow` type.
  - [x] Add `compareAtPrice` to form state + reset().
  - [x] Map `compareAtPrice` in `edit()`.
  - [x] Add `compareAtPrice` to `onSave()` payload.
  - [x] Add "Compare-at price (PKR)" input next to "Price (PKR)".
  - [x] Show compare-at price in the product list row text.

## C. Verify
- [x] C1. Run `npx tsc --noEmit` — no errors (PASSED, empty log).
- [ ] C2. Run `npm run build` — builds cleanly.

