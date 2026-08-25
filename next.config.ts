import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Izinkan streaming dan response size besar dari AI
  experimental: {
    serverActions: {
      bodySizeLimit: "2mb",
    },
  },
};

export default nextConfig;
