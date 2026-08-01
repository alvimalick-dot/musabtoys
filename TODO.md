# Advanced SEO & Metadata Implementation — Karachi Toys

> Brand city: **Multan** · Shop: **Karachi Toys** · Domain: **karachitoys**

## Steps

- [x] 1. Create `src/lib/seo.ts` — central SEO helpers (site URL, absolute URL builder, JSON-LD builders)
- [x] 2. Create `public/logo.svg` — branded logo (fixes broken `/logo.png` reference)
- [x] 3. Enhance `src/app/layout.tsx` — viewport export, expanded metadata (applicationName, appleWebApp, geo), upgraded LocalBusiness JSON-LD targeting **Multan** (telephone, contactPoint, geo 30.1575/71.5249, openingHoursSpecification, hasOfferCatalog)
- [x] 4. Create `src/app/opengraph-image.tsx` + `src/app/twitter-image.tsx` — branded 1200×630 PNG via `ImageResponse`
- [ ] 5. Enhance home page (`src/app/page.tsx`) — WebPage + Breadcrumb JSON-LD
- [ ] 6. Enhance shop page (`src/app/shop/page.tsx`) — dynamic generateMetadata + CollectionPage/ItemList/BreadcrumbList JSON-LD
- [ ] 7. Enhance product page (`src/app/product/[slug]/page.tsx`) — aggregateRating + review JSON-LD, specs as additionalProperty, @id refs, absolute URLs, noindex fallback
- [ ] 8. Enhance FAQ page (`src/app/faq/page.tsx`) — absolute URLs in JSON-LD
- [ ] 9. Add noindex: `src/app/wishlist/page.tsx` metadata, `src/app/account/page.tsx` metadata, checkout success robots
- [ ] 10. Update `src/app/sitemap.ts` — add category + age-group URLs
- [ ] 11. Update `src/app/robots.ts` — disallow `/checkout/success`
- [ ] 12. Harden `src/components/seo/JsonLd.tsx` — escape `</script>`-breaking characters
- [ ] 13. Run type-check / lint to verify changes

