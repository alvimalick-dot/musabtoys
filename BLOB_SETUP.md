# Persistent Image Uploads on Vercel — Setup Guide

## The Problem

On Vercel, the filesystem is **ephemeral** — anything written to `public/uploads/` at
runtime (like product images uploaded via the Admin panel) is:

- **Wiped on every deployment**
- **Not included in Git** (`.gitignore` ignores `/public/uploads`)
- **Not shared across serverless instances**

That's why images show locally but return a broken image icon after deploying to Vercel.

## The Solution

We added **Vercel Blob Storage** — a persistent cloud store that survives deployments
and is the native Vercel way to store uploaded files.

The upload flow is now:

```
1. Vercel Blob (persistent cloud)      ← best, works everywhere
2. Cloudinary (persistent cloud)       ← fallback if Blob not configured
3. Local /public/uploads               ← last resort (dev only)
```

## One-Time Setup (2 minutes)

### Step 1 — Install the Vercel Blob CLI

In your terminal run:

```bash
npx vercel login
```

### Step 2 — Create a Blob Store in your Vercel project

In the **Vercel Dashboard**:

1. Open your project
2. Go to **Storage** tab
3. Click **Create Database** / **Connect Store**
4. Choose **Blob** → **Create**
5. It will auto-link to your project

### Step 3 — Add the token to Vercel Environment Variables

After creating the Blob store, Vercel automatically adds:

```
BLOB_READ_WRITE_TOKEN=vercel_blob_rw_xxxxxxxxxxxx
```

to your project's environment variables (Production + Preview + Development).

> You can also find the token in the Blob store's **Settings** page under
> **Manage Tokens** → **BLOB_READ_WRITE_TOKEN**.

### Step 4 — Optional: also set it locally for dev

Create or edit `.env.local` in your project root:

```
BLOB_READ_WRITE_TOKEN=vercel_blob_rw_xxxxxxxxxxxx
```

Then restart `npm run dev`.

### Step 5 — Redeploy

Push your code (it now includes `@vercel/blob` and the updated `/api/upload` route) —
Vercel will automatically pick up the `BLOB_READ_WRITE_TOKEN` env var.

## Verify

1. Deploy the new code to Vercel
2. Open **Admin → Products → Product photos**
3. Upload an image
4. The image URL will now look like:
   ```
   https://xxxxx.public.blob.vercel-storage.com/products/...
   ```
5. It persists across redeploys and shows for all visitors

## Alternative: Use Cloudinary instead

If you prefer Cloudinary (or already have a Cloudinary account), make sure these
env vars are set correctly on Vercel (not placeholder values):

```
CLOUDINARY_CLOUD_NAME=your_real_cloud_name
CLOUDINARY_API_KEY=your_real_api_key
CLOUDINARY_API_SECRET=your_real_api_secret
```

Our upload route tries **Vercel Blob → Cloudinary → local** in order, so having
either Blob or Cloudinary configured will make images persist on Vercel.

## Why not just commit to GitHub?

Committing `public/uploads/` to Git is a workaround, not a fix:

- Images would be baked into the build (bad for large photos)
- Every image upload would require a git commit + redeploy
- Vercel build size limits (images belong in a blob store, not the bundle)

