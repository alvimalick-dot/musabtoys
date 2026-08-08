import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // Excel imports may contain HTTPS product images from a supplier CDN.
      // Keep local paths and insecure HTTP URLs out of this allowance.
      // NOTE: no wildcard hostname here — an allowlist prevents the Next.js
      // image optimizer from being abused as an SSRF / bandwidth-exhaustion proxy.
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "**.cloudinary.com",
      },
      {
        protocol: "https",
        hostname: "**.public.blob.vercel-storage.com",
      },
    ],
    // Allow local /uploads/ images (dev mode)
    unoptimized: process.env.NODE_ENV === "development",
  },
  // ── Security headers ────────────────────────────────────────────────
  // Non-disruptive hardening: clickjacking, MIME sniffing, HSTS, referrer.
  // A strict Content-Security-Policy is intentionally deferred (it can block
  // third-party scripts / inline styles and needs testing against the live UI).
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
