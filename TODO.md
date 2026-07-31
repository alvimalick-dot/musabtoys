# Theme Color Update TODO

## Color Palette
- coral → Pink `#ec4899` (primary CTA, prices)
- coral-deep → Deep Pink `#db2777` (hover)
- sky → Purple `#8b5cf6` (secondary accent)
- sky-deep → Deep Purple `#7c3aed` (hover)
- sun → Rose-Red `#f43f5e` (badges, highlights)
- mint → Green `#22c55e` (stock, success)
- bg → Soft Lavender `#faf5ff`
- bg-deep → Deeper Lavender `#f3e8ff`

## Steps

### Step 1: globals.css ✅
- [x] Update CSS variables
- [x] Update toy-grid-bg gradients
- [x] Update ::selection colors
- [x] Update btn-primary shadows
- [x] Update kt-shimmer gradient
- [x] Update focus ring colors

### Step 2: Home Components
- [x] Hero.tsx — gradient bg classes, blur blobs
- [x] CtaBanner.tsx — gradient from-coral via-* to-sun
- [x] FeatureBand.tsx — accent colors, blur blobs
- [x] CategoryStrip.tsx — category tint classes
- [x] FeaturedProducts.tsx — coral accent text (auto via CSS var)
- [x] NewArrivalProducts.tsx — sky accent text (auto via CSS var)

### Step 3: Layout Components
- [x] Header.tsx — background, shadow, logo, nav active
- [x] Footer.tsx — accent colors (auto via CSS var)
- [x] CartDrawer.tsx — gradient, backgrounds, icons
- [x] WhatsAppFab.tsx — keep green bg (brand color)

### Step 4: Shop & Product Components
- [x] ProductCard.tsx — backgrounds, borders, accent colors
- [x] ShopClient.tsx — accent colors (auto via CSS var)
- [x] ProductDetailClient.tsx — accent colors (auto via CSS var)

### Step 5: Checkout Components
- [x] CheckoutForm.tsx — accent colors (auto via CSS var)
- [x] SuccessClient.tsx — accent colors (auto via CSS var)

### Step 6: Other Components
- [x] ProductGallery.tsx
- [x] ProductReviews.tsx
- [x] RelatedProducts.tsx
- [x] TrackForm.tsx
- [x] Breadcrumbs.tsx
- [x] Admin components
- [x] Search for hardcoded hex colors (#fff8f0, #fff1e0, #ffe8d2, #f1e2ca etc.) — all updated

### Step 7: Verify
- [x] Run build/lint to check for errors — passed, no lint errors

## Round 2: User Feedback Fixes

### Issue 1: Coupon feature — discount not reflected in Place Order / summary
- [x] Diagnosed: coupon only validated on submit, summary total computed without discount
- [x] Add "Apply coupon" button with client-side validation (PUT /api/coupons)
- [x] Show discount line in order summary
- [x] Update "Place order" button total with discount
- [x] Re-validate coupon on submit using applied code

### Issue 2: Home page search bar
- [x] Add search bar in Hero that navigates to /shop?q=...

### Issue 3: Shop search bar — text overlaps search icon
- [x] Diagnosed: .input-field padding shorthand overrode Tailwind pl-11
- [x] Changed .input-field to use individual padding properties (top/bottom/left/right)
- [x] Used inline style as extra safety for Hero and Shop search inputs

## Round 3: Theme Refinement — Balanced 3-Color Palette

- [x] Tuned down pink → crimson-rose `#e11d48` (red-shade of pink)
- [x] Changed sky (purple) → amber `#f59e0b` (warmth)
- [x] Changed sun (rose-red) → teal `#0891b2` (cool balance)
- [x] Changed bg from lavender → warm off-white `#fffcf9`
- [x] Updated all hardcoded CSS color references (shadows, gradients, focus rings, shimmer)
- [x] Added `--sun-deep` CSS variable
- [x] Updated CategoryStrip hardcoded hex colors to use theme tokens
