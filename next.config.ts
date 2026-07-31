import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
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
    ],
    // Allow local /uploads/ images (dev mode)
    unoptimized: process.env.NODE_ENV === "development",
  },
};

export default nextConfig;
