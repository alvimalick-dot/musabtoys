# Karachi Toy Shop — Setup Guide

Complete walkthrough to run the storefront, API, MongoDB Atlas, Cloudinary, and admin tools.

---

## 1. Prerequisites

Install these on your machine:

| Tool | Version | Download |
|------|---------|----------|
| Node.js | 20 LTS or newer | https://nodejs.org |
| npm | comes with Node | — |
| Git | latest | https://git-scm.com |

Optional: MongoDB Compass (GUI) — https://www.mongodb.com/products/compass

---

## 2. Install the project

```bash
cd karachitoys
npm install
```

Copy the environment template:

```bash
# Windows (PowerShell)
Copy-Item .env.example .env.local

# macOS / Linux
cp .env.example .env.local
```

---

## 3. Set up MongoDB Atlas (required)

### 3.1 Create account & cluster

1. Go to [https://cloud.mongodb.com](https://cloud.mongodb.com) and sign up / log in.
2. Click **Build a Cluster** (or **Create**).
3. Choose the **Free (M0)** shared tier.
4. Cloud provider: any (AWS is fine). Region: closest to Pakistan (e.g. **Bahrain** or **Mumbai**).
5. Name the cluster (e.g. `karachi-toys`) → **Create**.

### 3.2 Database user

1. In Atlas left sidebar: **Database Access** → **Add New Database User**.
2. Authentication: **Password**.
3. Username: e.g. `karachitoys`.
4. Password: generate a strong one — **save it**.
5. Role: **Atlas admin** or **Read and write to any database**.
6. Click **Add User**.

### 3.3 Network access (IP allowlist)

1. **Network Access** → **Add IP Address**.
2. For local development click **Allow Access from Anywhere** (`0.0.0.0/0`), or add your current IP.
3. Confirm.

> For production on Hostinger, allow `0.0.0.0/0` or the server egress IPs.

### 3.4 Connection string

1. **Database** → **Connect** on your cluster → **Drivers**.
2. Copy the URI. It looks like:

```
mongodb+srv://karachitoys:<password>@karachi-toys.xxxxx.mongodb.net/?retryWrites=true&w=majority
```

3. Replace `<password>` with your real password (URL-encode special characters if needed).
4. Add a database name before the `?`:

```
mongodb+srv://karachitoys:YOUR_PASSWORD@karachi-toys.xxxxx.mongodb.net/karachi-toy-shop?retryWrites=true&w=majority
```

5. Paste into `.env.local`:

```env
MONGODB_URI=mongodb+srv://...
```

---

## 4. Set up Cloudinary (images)

1. Sign up at [https://cloudinary.com](https://cloudinary.com).
2. Open the **Dashboard** — copy **Cloud Name**, **API Key**, **API Secret**.
3. Put them in `.env.local`:

```env
CLOUDINARY_CLOUD_NAME=xxxxx
CLOUDINARY_API_KEY=xxxxx
CLOUDINARY_API_SECRET=xxxxx
```

Product images in Excel can be public URLs (Unsplash, your CDN, or Cloudinary). The upload helper in `src/lib/cloudinary.ts` is ready when you add direct file uploads later.

---

## 5. Admin credentials

Edit `.env.local`:

```env
ADMIN_EMAIL=admin@karachitoys.pk
ADMIN_PASSWORD=ChangeMe123!
ADMIN_JWT_SECRET=pick-a-long-random-string
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**Change these before going live.**

---

## 6. Run frontend + backend

This is one Next.js app — UI pages and `/api/*` route handlers run together:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

| URL | What |
|-----|------|
| `/` | Animated landing page |
| `/shop` | Catalog + filters + fuzzy search |
| `/product/[slug]` | Product detail |
| `/checkout` | COD / JazzCash / PayFast |
| `/admin` | Excel upload, orders, sample seed |

---

## 7. First data load

### Option A — Sample products (fastest)

1. Open `/admin` and log in.
2. Tab **Sample data** → **Seed sample catalog**.
3. Visit `/shop`.

### Option B — Excel / CSV upload

1. Use `public/sample-products.csv` as a template (open in Excel, Save As `.xlsx`).
2. Admin → **Excel upload** → choose file.
3. Rows upsert by **SKU** (price/stock update without duplicates). Slugs are auto-generated for SEO.

Required columns: `name`, `price`, `category`  
Recommended: `sku`, `stock`, `brand`, `ageGroup`, `description`, `images`

---

## 8. Payment gateways (optional)

COD works out of the box.

For JazzCash / PayFast, add merchant keys to `.env.local` (see `.env.example`). The checkout API creates the order and redirects to `/checkout/payment` — replace that stub with the official hosted checkout redirect when credentials are ready.

---

## 9. Production build

```bash
npm run build
npm start
```

### Hostinger (Node.js)

1. Push this repo to GitHub.
2. In Hostinger → **Node.js** app → connect the repo.
3. Set **all** `.env.local` variables in the Hostinger environment panel.
4. Build command: `npm run build`
5. Start command: `npm start`
6. Ensure Node 20+.

---

## 10. Project map

```
src/
  app/                 # Pages + API route handlers
    api/products
    api/excel-upload
    api/cart
    api/checkout
    api/orders
    api/auth/login
    api/seed
  components/          # UI (landing, shop, cart, admin)
  models/              # Mongoose Product & Order
  lib/                 # DB, auth, Cloudinary, Zod validators
  store/cartStore.ts   # Persistent cart (localStorage)
```

---

## 11. SEO & Google ranking

Technical SEO is built in:

- Meta titles, descriptions, Open Graph, Twitter cards
- `/sitemap.xml` (home, shop, all products)
- `/robots.txt` (blocks `/admin` and `/api`)
- JSON-LD schema: ToyStore, WebSite search, Product offers
- Canonical URLs + SEO product slugs

**Code alone cannot guarantee #1 on Google.** After you deploy with a real domain:

1. Set `NEXT_PUBLIC_APP_URL=https://yourdomain.com` in production env
2. Create a property in [Google Search Console](https://search.google.com/search-console)
3. Submit `https://yourdomain.com/sitemap.xml`
4. Create a [Google Business Profile](https://business.google.com) for “Karachi Toy Shop”
5. Use real product names/descriptions in Excel (not empty rows)
6. Build local mentions (Facebook, Instagram, directories)

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| `Missing MONGODB_URI` | Create `.env.local` from `.env.example` |
| `Authentication failed` on Atlas | Check user password; URL-encode `# @ %` etc. |
| `IP not allowed` | Atlas → Network Access → allow your IP or `0.0.0.0/0` |
| Shop empty | Seed sample data or upload Excel |
| Admin login fails | Match `ADMIN_EMAIL` / `ADMIN_PASSWORD` exactly |
| Images broken | Allow host in `next.config.ts` `images.remotePatterns` |

---

## Quick checklist

- [ ] `npm install`
- [ ] `.env.local` with `MONGODB_URI`
- [ ] Atlas user + IP access
- [ ] Admin email/password/JWT secret
- [ ] `npm run dev`
- [ ] Login at `/admin` → seed or Excel upload
- [ ] Browse `/shop` and place a COD test order
