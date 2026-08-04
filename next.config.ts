import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // Excel imports may contain HTTPS product images from a supplier CDN.
      // Keep local paths and insecure HTTP URLs out of this allowance.
      {
        protocol: "https",
        hostname: "**",
      },
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
};

export default nextConfig;
