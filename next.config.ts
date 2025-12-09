import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  experimental: {
    // Disable static page generation during build to avoid VAPID issues
    isrMemoryCacheSize: 0,
  },
};

export default nextConfig;
