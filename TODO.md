# Cloudinary Image Sync — Implementation Plan

## Module 1 — Shared Cloudinary helper
- [x] Extend `src/lib/cloudinary.ts` (options: folder, publicId, transformation)
- [x] Create `src/lib/cloudinary-sync.ts` (hasCloudinaryConfigured, publicIdForSku, localUrlToFilePath, syncLocalImageToCloudinary)

## Module 2 — Offline CLI import script
- [x] Create `scripts/import-images.mjs` (idempotent, resumable, throttled, retries, failure CSV)
- [x] Add `import:images` npm script in `package.json`

## Module 3 — Server-side resumable import job
- [ ] Create `src/models/ImportJob.ts`
- [ ] Create `src/lib/import-processing.ts` (parse + batch + processBatch)
- [ ] Create `src/app/api/imports/route.ts` (POST create job, GET list)
- [ ] Create `src/app/api/imports/[id]/route.ts` (GET status, POST process next batch)
- [ ] Update `src/components/admin/AdminPanel.tsx` Excel tab → resumable job flow with progress

## Module 4 — Hybrid: legacy route + global sync button
- [ ] Update `src/app/api/excel-upload/route.ts` → Cloudinary-aware
- [ ] Create `src/app/api/products/sync-images/route.ts`
- [ ] Update `src/components/admin/ProductAdmin.tsx` → add "Sync images to Cloudinary" button
- [ ] Update `.gitignore` (state/failure files)

## Verification
- [ ] `npm run lint`
- [ ] `npm run build`
- [ ] Manual test of Excel upload + single-product upload with Cloudinary
