# Theme & Animation TODO

## Round 11: Shipping Rule — Free ≥ PKR 3000, Coupon Orders Pay 250

### New Rule
- Subtotal ≥ **PKR 3,000** → **FREE** shipping
- Subtotal < PKR 3,000 → flat **PKR 250** shipping
- If a **coupon is applied** → shipping is **always PKR 250** (not free)

### Files Changed
- [x] `src/lib/commerce.ts` — `FREE_SHIPPING_THRESHOLD` 5000 → 3000; `calcShipping(subtotal, hasCoupon)` — coupon forces the 250 fee
- [x] `src/app/api/checkout/route.ts` — passes `discount > 0` into `calcShipping` so coupon orders get charged 250
- [x] `src/components/checkout/CheckoutForm.tsx` — shipping reflects coupon status; note text updates when a coupon is applied
- [x] `src/components/layout/CartDrawer.tsx` — free-shipping progress bar auto-adjusts to the new 3000 threshold (shared constant)
- [x] `src/app/faq/page.tsx` — FAQ answer updated to 3,000 threshold + coupon exception
- [x] `src/components/home/FeatureBand.tsx` — "Free delivery on orders PKR 5,000+" → "PKR 3,000+"

## Round 10: Prevent Out-of-Stock Items from Being Added to Cart

### Root Cause
- `src/store/cartStore.ts` used `item.stock || 99` — when `stock = 0` (out of stock), `0 || 99 = 99`, so sold-out items still got added.

### Fixes Applied
- [x] `src/store/cartStore.ts` — `addItem` bails out when `stock <= 0`; safe max via `stock > 0 ? stock : 99`; `updateQty` clamps the same way.
- [x] `src/app/wishlist/page.tsx` — "Add to cart" now fetches live stock (`/api/products/:id`) and blocks out-of-stock items with an error toast; passes real stock to the cart store.
- [x] `src/components/track/TrackForm.tsx` — "Reorder" now validates items via `/api/cart` POST; skips unavailable items, clamps quantities to live stock, and warns which items were skipped.
- [x] `src/app/api/cart/route.ts` — Invalid-item response now includes `stock` so clients can read available quantity.
- [x] `src/components/product/ProductDetailClient.tsx` — Derives `isOutOfStock` from `stock <= 0` (not just stale `stockStatus`); shows "Notify me" for sold-out; guards Add-to-cart click; uses `availableStock` for qty limits.

## Round 9: GSAP + Lottie + Confetti — Heavy UI/UX Animations

### New Components Created
- [x] `src/components/ui/ScrollReveal.tsx` — GSAP ScrollTrigger wrapper (up/down/left/right/scale/blur variants)
- [x] `src/components/ui/LottieAnimation.tsx` — Loads Lottie JSON animations via lottie-web
- [x] `src/components/ui/AnimatedCounter.tsx` — GSAP + ScrollTrigger number counter (count-up on scroll)
- [x] `src/components/ui/TeddyMascot.tsx` — Pure SVG teddy bear character (happy/sad mood, bouncing idle, blinking eyes)
- [x] `src/components/ui/MouseTrail.tsx` — Sparkle particles follow the mouse cursor on homepage

### Assets Copied to `public/lottie/`
- [x] `cart-jump.json` — Animated trolley jumping (empty cart state in CartDrawer)
- [x] `heartbeat.json` — Animated heart pulse (wishlist)
- [x] `star-rating.json` — Star rating animation
- [x] `avatar.json` — Avatar animation
- [x] `loading.json` — Loading spinner (ProductSkeleton)
- [x] `activity.json` — Activity animation

### Updated Components
- [x] **Hero.tsx** — TeddyMascot placed next to "Karachi Toys" heading; GSAP ScrollTrigger text color shift (ink → teal)
- [x] **FeatureBand.tsx** — ScrollReveal wraps section heading; AnimatedCounter stats row (4500+ toys, 12000+ families, etc.)
- [x] **CartDrawer.tsx** — Empty cart state shows LottieAnimation (cart-jump.json) instead of static icon
- [x] **ProductCard.tsx** — 3D mouse tilt effect (perspective rotateX/Y on mousemove); confetti burst on "Add to cart"
- [x] **ProductSkeleton.tsx** — Loading state shows LottieAnimation (loading.json) spinning in the image area
- [x] **layout.tsx** — MouseTrail component added (sparkle cursor effect across the whole site)

### Dependencies Installed
- [x] `gsap` (already installed)
- [x] `lottie-web` (already installed)
- [x] `canvas-confetti` (already installed) + `@types/canvas-confetti`
- [x] `@formkit/auto-animate` (already installed)

n 