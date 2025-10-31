import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  // Removed 'output: export' for production server mode
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
