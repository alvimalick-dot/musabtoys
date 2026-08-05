# Performance Optimization TODO

## Goal
Reduce page-load latency across the home → shop → product-detail flow without changing site functionality.

## Steps
1. [x] Cache the facet (category/brand/ageGroup) `distinct()` queries in `/api/products` with a short TTL so they aren't re-scanned on every request.
2. [x] Pass server-loaded reviews into `ProductReviews` as initial data to avoid a duplicate `/api/reviews` fetch on the product page.
3. [x] Make the shop page's JSON-LD collection query non-blocking (background refresh) so it no longer waits on a DB round-trip before rendering.
4. [x] Run related-products and reviews queries in parallel on the product page, and project only the fields related cards need.
5. [x] Verify the production build still compiles and lint passes.
