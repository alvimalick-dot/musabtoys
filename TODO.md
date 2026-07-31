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
- [ ] FeaturedProducts.tsx — coral accent text (auto via CSS var)
- [ ] NewArrivalProducts.tsx — sky accent text (auto via CSS var)

### Step 3: Layout Components
- [x] Header.tsx — background, shadow, logo, nav active
- [ ] Footer.tsx — accent colors
- [x] CartDrawer.tsx — gradient, backgrounds, icons
- [ ] WhatsAppFab.tsx — keep green bg

### Step 4: Shop & Product Components
- [x] ProductCard.tsx — backgrounds, borders, accent colors
- [ ] ShopClient.tsx — accent colors (auto via CSS var)
- [ ] ProductDetailClient.tsx — accent colors (auto via CSS var)

### Step 5: Checkout Components
- [ ] CheckoutForm.tsx — accent colors (auto via CSS var)
- [ ] SuccessClient.tsx — accent colors (auto via CSS var)

### Step 6: Other Components
- [ ] ProductGallery.tsx
- [ ] ProductReviews.tsx
- [ ] RelatedProducts.tsx
- [ ] TrackForm.tsx
- [ ] Breadcrumbs.tsx
- [ ] Admin components
- [ ] Search for hardcoded hex colors (#fff8f0, #fff1e0, #ffe8d2, #f1e2ca etc.)

### Step 7: Verify
- [ ] Run build/lint to check for errors
