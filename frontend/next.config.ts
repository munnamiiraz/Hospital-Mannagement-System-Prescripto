import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    domains: ["res.cloudinary.com"], // Cloudinary images allowed
  },
  webpack(config) {
    // SVGs imported as URLs so next/image can use them
    config.module.rules.push({
      test: /\.svg$/i,
      issuer: /\.[jt]sx?$/,
      type: "asset/resource", // gives URL string for SVGs
    });
    return config;
  },
};

export default nextConfig;
