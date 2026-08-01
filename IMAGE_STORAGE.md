# 📸 Image Storage Guide — Karachi Toys

This guide explains how product image uploads work in this app, the storage options
available, what they cost, and how to make the site **production-ready**.

---

## 1. How Image Uploads Work Right Now

When you upload a product photo in the **Admin panel** (`/admin` → Products →
"Product photos"), the server does this:

```
Your image
    │
    ▼
1. sharp resizes it → fits within 1200×1200 (keeps aspect ratio)
    │   → converts to optimized JPEG (85% quality)
    │   → strips EXIF/camera metadata
    ▼
2. Tries to SAVE it to cloud storage, in this order:

   ① Vercel Blob  →  if BLOB_READ_WRITE_TOKEN is set
   ② Cloudinary   →  if CLOUDINARY_CLOUD_NAME/KEY/SECRET are real
   ③ Local disk   →  saves to /public/uploads (DEV ONLY)
    ▼
3. Returns a permanent image URL, stored on the product in MongoDB
```

The returned URL (e.g. `https://xxx.public.blob.vercel-storage.com/products/...`)
is what gets shown on the Shop, Product pages, and in the admin preview.

---

## 2. The Three Storage Options Explained

### ① Vercel Blob — RECOMMENDED (simplest for Vercel users)

| Question | Answer |
|---|---|
| What is it? | Vercel's own file-storage service (like a cloud bucket) |
| How does it work? | You upload a file, Vercel gives you back a public `https://…` URL. The file lives in Vercel's cloud, not in your Git repo |
| Where do I get it? | Vercel Dashboard → your project → **Storage** → **Create Database** → **Blob** |
| What env var? | `BLOB_READ_WRITE_TOKEN` (added automatically by Vercel) |
| **Cost?** | **Free tier included with Vercel** — includes storage + bandwidth. Paid plans raise the limits |
| Persists on redeploy? | ✅ Yes — survives every deployment |
| Good for production? | ✅ Yes — this is exactly what Vercel recommends for uploaded files |

### ② Cloudinary — the classic choice (what CLOUDINARY_CLOUD_NAME is)

| Question | Answer |
|---|---|
| What is it? | A separate cloud media service, popular for image/video hosting |
| How does `CLOUDINARY_CLOUD_NAME` work? | It's just your **account identifier**. When you sign up at cloudinary.com, they give you a unique cloud name (looks like `yourname`). Your API **key** and **secret** are your password to upload through the API |
| How do uploads work? | Your app calls Cloudinary's API with (cloud name + key + secret). Cloudinary stores the file and returns a permanent CDN URL like `https://res.cloudinary.com/yourname/image/upload/v1234/karachi-toys/abc.jpg` |
| **Cost?** | **Free plan**: 25 GB storage + 25 GB monthly bandwidth, ~100,000 transformations/month. Paid plans start ~$89/yr. Free is usually enough for a toy store |
| Persists on redeploy? | ✅ Yes — files live on Cloudinary's servers, unrelated to Vercel |
| Good for production? | ✅ Yes — very production-proven (used by tons of e-commerce sites). Also gives you automatic CDN + on-the-fly resizing |

### ③ Local `/public/uploads/` — DEV ONLY

| Question | Answer |
|---|---|
| What is it? | Just saving files into your project folder on the server |
| Works locally? | ✅ Yes |
| Works on Vercel? | ❌ **No** — Vercel wipes the filesystem on every deploy |
| Persists? | ❌ No — not in Git, not across deploys |
| Good for production? | ❌ **No** — this is why you saw broken images after deploying |

---

## 3. What Is Production-Ready?

**What we built IS production-ready** — as long as you do ONE of these two steps:

| Option | What to do | Result |
|---|---|---|
| **A (easiest, recommended)** | Create a **Vercel Blob** store (2 min, free) | Uploads persist forever, no extra account needed |
| **B (alternative)** | Create a **Cloudinary** account (free) and add the 3 env vars | Uploads persist via Cloudinary CDN |

Until you do one of these, uploads fall back to the local disk, which:
- ✅ works in development
- ❌ **won't survive deployments** on Vercel

> ⚠️ **Important:** You don't need to do anything in code — the code already tries
> Blob → Cloudinary → local automatically. You just need to configure one of them.

---

## 4. Step-by-Step: Option A — Vercel Blob (recommended)

1. Go to **https://vercel.com/dashboard** → open your project
2. Click the **Storage** tab
3. Click **Create Database** / **Connect Store**
4. Select **Blob** → **Create**
5. Vercel auto-adds `BLOB_READ_WRITE_TOKEN` to your environment variables
6. Push a new commit (so Vercel redeploys with the new code)
7. Done! Upload a product image in `/admin` — the URL will be `…public.blob.vercel-storage.com…`

---

## 5. Step-by-Step: Option B — Cloudinary (free plan)

1. Sign up free at **https://cloudinary.com/signup**
2. On your dashboard you'll see three values:
   - **Cloud name** → `CLOUDINARY_CLOUD_NAME`
   - **API Key** → `CLOUDINARY_API_KEY`
   - **API Secret** → `CLOUDINARY_API_SECRET`
3. Add them to your **Vercel project → Settings → Environment Variables**:

   ```
   CLOUDINARY_CLOUD_NAME=your-cloud-name
   CLOUDINARY_API_KEY=your-api-key
   CLOUDINARY_API_SECRET=your-api-secret
   ```

4. Also add the same 3 lines to your local **`.env.local`** (so it works in dev too)
5. Redeploy / restart `npm run dev`
6. Done! Uploads will now go to Cloudinary and return CDN URLs

---

## 6. Cost Summary (honest breakdown)

| Storage | Free tier | Good enough for a toy store? |
|---|---|---|
| **Vercel Blob** | Included in Vercel free/hobby plan (some GB storage + bandwidth) | ✅ Yes |
| **Cloudinary** | 25 GB storage + 25 GB bandwidth / month | ✅ Yes (25 GB is thousands of product photos) |
| **Local disk** | Free but useless on Vercel | ❌ No |

**Bottom line:** Both cloud options have a free tier that is more than enough for a
toy store with a few hundred/thousand product images. You likely won't pay anything
until your store grows very large.

---

## 7. What the Code Already Does (so you're confident it's production-grade)

✅ **Auto image normalization** — `sharp` resizes any upload to fit 1200×1200, converts
to high-quality JPEG, strips EXIF → uniform, fast-loading product photos.

✅ **Fallback chain** — Blob → Cloudinary → local. If one fails, it tries the next
instead of erroring out.

✅ **Security** — upload endpoint requires the admin session cookie
(`getAdminSession()`). Only `image/*` MIME types accepted. Files capped at 8 MB.

✅ **Image whitelist** — `next.config.ts` allows `res.cloudinary.com`,
`**.cloudinary.com`, and `**.public.blob.vercel-storage.com` for the
`next/image` optimizer.

✅ **Automatic conversion to JPEG** — Cloudinary gets `image/jpeg` data URIs (correct
MIME, no more broken PNG/WebP uploads).

---

## 8. Troubleshooting

| Symptom | Cause | Fix |
|---|---|---|
| Image shows locally but not on Vercel | Uploads saved to local disk | Create a Vercel Blob store OR add Cloudinary env vars (sections 4–5) |
| "Unauthorized" on upload | Not logged in as admin | Log in at `/admin` first |
| Upload fails with Cloudinary error | Env vars missing/placeholder | Add real values to Vercel + `.env.local` |
| Slow image loading | Original image was huge | Now fixed — every upload is auto-resized to ≤1200px |
| PNG with transparent bg looks off | Converted to JPEG (no alpha) | Acceptable for product photos; JPEG is much smaller |

---

## 9. Files Involved

| File | Role |
|---|---|
| `src/app/api/upload/route.ts` | The upload endpoint (resize + save) |
| `src/lib/cloudinary.ts` | Cloudinary SDK config + upload helper |
| `src/lib/product-images.ts` | Excel image resolution (cell value → public URL) |
| `src/app/api/excel-upload/route.ts` | Bulk Excel import — resolves & stores image URLs |
| `src/components/admin/ProductAdmin.tsx` | The "Product photos" upload UI |
| `next.config.ts` | Whitelists cloud image hosts |
| `BLOB_SETUP.md` | Quick Vercel Blob setup cheat-sheet |

---

## 10. Excel Import + Cloudinary — How Images Are Resolved

This section explains exactly what happens to the **Image column** when you
import a catalog via **Admin → Excel upload**, and how Cloudinary fits in.

### 10.1 How an Excel image cell is resolved

Every image value from the Excel `Image` column is processed by
`resolveProductImages()` in `src/lib/product-images.ts`:

| What you put in the cell | What gets stored in MongoDB | Where the file actually lives |
|---|---|---|
| `https://...` (any full URL) | **Stored as-is**, never touched | Whatever host you gave (Unsplash, Cloudinary, S3, …) |
| `HW-001.jpg` (just a filename) | `/images/HW-001.jpg` | Your repo's `public/images/` folder |
| `images/HW-001.jpg` | `/images/HW-001.jpg` | Same folder |
| `public/images/HW-001.jpg` | `/images/HW-001.jpg` | Same folder |
| `HW-001` (no extension) | Auto-detects `HW-001.jpg` / `.png` / `.webp` / `.gif` | Same folder |
| *(no Image column at all)* | Auto-matches files named after the **SKU** (e.g. SKU = `HW-001` → `HW-001.jpg`) | Same folder |

> **Important:** The Excel path **never uploads to Cloudinary automatically**.
> Cloudinary is only used when you upload photos one-by-one with the admin
> **"Choose photos"** button (`/api/upload`). Excel import either keeps a full
> URL you typed, or points to `/images/...` inside the repo.

### 10.2 Your 3 options for Excel images + Cloudinary

#### Option A — Keep using `public/images/` (no Cloudinary needed)

- Put photos in `public/images/`, commit to GitHub, reference by filename in Excel.
- Works on Vercel today because `public/` is deployed as **static files**
  (this is different from `/uploads`, which gets wiped on every deploy).
- **Downsides:** Every image bloats your Git repo. Updating one photo means a
  git push + redeploy. With thousands of images this gets heavy.

#### Option B — Paste Cloudinary URLs directly into Excel (no code changes)

1. Upload your photos to Cloudinary first — either drag & drop on
   `cloudinary.com`, or use the admin **"Choose photos"** button once Cloudinary
   env vars are set.
2. Copy each CDN URL
   (`https://res.cloudinary.com/<cloud-name>/image/upload/v1234/karachi-toys/HW-001.jpg`).
3. Paste the URL(s) into the Excel `Image` column (comma-separated for multiple).
4. Excel stores the URL **as-is** → CDN-hosted, survives every deployment,
   zero code changes.

- **Downsides:** Manual URL copying per product — painful for a large catalog.

#### Option C — Auto-upload local images to Cloudinary during Excel import *(recommended for big catalogs)*

- You still put photos in `public/images/` and reference by filename in Excel.
- Code change: the Excel upload route detects images that resolved to a local
  `/images/...` path, reads the file from disk, uploads it to Cloudinary, and
  stores the **Cloudinary CDN URL** in MongoDB instead of `/images/...`.
- Result: your database holds permanent CDN URLs, images are no longer tied to
  the repo, and you never manually copy URLs. Perfect for migrating a large
  catalog **once**.
- Bonus: a **"Sync all images to Cloudinary"** admin action can re-process
  existing products already stored with `/images/...` paths so they also get CDN
  URLs.

### 10.3 What I recommend

**Option C** is the only one that is truly production-grade for a catalog with
many products: full CDN hosting, no manual work, and your MongoDB records become
permanent Cloudinary URLs that survive any redeploy.

> 📝 **Note for Vercel:** `public/images/` is deployed as read-only static files,
> but serverless functions **can still read** them from disk, so the auto-upload
> approach in Option C works on Vercel too.

### 10.4 Implementation sketch for Option C

- **New helper:** `src/lib/cloudinary-sync.ts`
  - `syncLocalImageToCloudinary(publicPath: string): Promise<string>`
  - Reads the file from `public/images/...`, calls `uploadImage()` from
    `src/lib/cloudinary.ts`, returns the CDN URL.
- **Modify:** `src/app/api/excel-upload/route.ts`
  - After `resolveProductImages()` returns `/images/...` URLs, upload each to
    Cloudinary (when env vars are configured) and store the returned CDN URLs.
  - Keep the original `/images/...` URL as a fallback if Cloudinary is not
    configured or the upload fails.
- **Optional admin action:** a button that iterates products with `/images/...`
  URLs, uploads them to Cloudinary, and updates MongoDB.

