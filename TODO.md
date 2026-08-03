# Cloudinary Image Sync — Implementation Plan

## Module 1 — Shared Cloudinary helper
- [x] Extend `src/lib/cloudinary.ts` (options: folder, publicId, transformation)
- [x] Create `src/lib/cloudinary-sync.ts` (hasCloudinaryConfigured, publicIdForSku, localUrlToFilePath, syncLocalImageToCloudinary)

## Module 2 — Offline CLI import script
- [x] Create `scripts/import-images.mjs` (idempotent, resumable, throttled, retries, failure CSV)
- [x] Add `import:images` npm script in `package.json`

## Module 3 — Server-side resumable import job
- [x] Create `src/models/ImportJob.ts`
- [x] Create `src/lib/import-processing.ts` (parse + batch + processBatch)
- [x] Create `src/app/api/imports/route.ts` (POST create job, GET list)
- [x] Create `src/app/api/imports/[id]/route.ts` (GET status, POST process next batch)
- [x] Create `src/app/api/imports/[id]/start/route.ts` (non-blocking background start)
- [x] Create `src/app/api/imports/[id]/run/route.ts` (long-running batch processor)
- [x] Create `src/app/api/imports/[id]/failed/route.ts` (failed-rows CSV download)
- [x] Create `src/app/api/imports/[id]/retry/route.ts` (reset error rows + resume)
- [x] Create `src/lib/import-notify.ts` (webhook notifications)
- [x] Create `scripts/import-worker.js` (background worker script)
- [x] Update `src/components/admin/AdminPanel.tsx` Excel tab → resumable job flow with progress

## Module 4 — Hybrid: legacy route + global sync button
- [x] Update `src/app/api/excel-upload/route.ts` → Cloudinary-aware + deprecation notice
- [x] Create `src/app/api/products/sync-images/route.ts`
- [x] Create `src/app/api/products/[id]/sync/route.ts` (per-product sync)
- [x] Update `src/components/admin/ProductAdmin.tsx` → add "Sync images to Cloudinary" button
- [x] Update `.gitignore` (state/failure files)

## Security / hardening
- [x] Enforce import file-size limit (`MAX_IMPORT_FILE_BYTES`, default 10MB)
- [x] Enforce image upload size limit (8MB) in `src/app/api/upload/route.ts`
- [x] Add image upload retry logic (exponential backoff) in `src/lib/cloudinary-sync.ts`
- [x] Address hardcoded credentials — admin creds from env, bcrypt hash in production
- [x] Address timing — timing-safe credential comparison in `src/lib/auth.ts`

## Verification
- [x] `npm run lint`
- [x] `npm run build`
- [ ] Manual test of Excel upload + single-product upload with Cloudinary
