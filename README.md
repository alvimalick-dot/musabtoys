# Karachi Toy Shop

Digital commerce platform for a large toy catalog (PKR 100 – 150,000+).

**Stack:** Next.js 15 · TypeScript · MongoDB Atlas · Cloudinary · JazzCash / PayFast · COD

## Quick start

1. Follow **[SETUP.md](./SETUP.md)** for MongoDB Atlas, env vars, and first seed.
2. `npm install` → copy `.env.example` to `.env.local` → `npm run dev`
3. Open http://localhost:3000

## Features

- Animated landing page (Framer Motion)
- Shop with filters + typo-tolerant search (Fuse.js)
- Product detail + persistent cart drawer
- Checkout: COD, JazzCash & PayFast stubs
- Admin: Excel bulk upsert, order board, sample seed
