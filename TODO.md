# TODO — Add "Clear all products" feature

## Steps
- [x] 1. Create `src/app/api/products/clear/route.ts` — guarded bulk-delete endpoint
- [x] 2. Update `src/components/admin/ProductAdmin.tsx` — add "Delete all products" button with type-to-confirm dialog
- [x] 3. Revalidate homepage / shop / sitemap after delete so featured & new-arrival sections reset immediately
- [x] 4. Verify build / lint passes
