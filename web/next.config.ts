import type { NextConfig } from "next";

const isRailway = !!process.env.RAILWAY_ENVIRONMENT;

const nextConfig: NextConfig = {
  async redirects() {
    if (isRailway) {
      return [
        // Op Railway: root → agency portal
        { source: "/", destination: "/portal", permanent: false },
      ];
    }
    return [];
  },
  async rewrites() {
    if (!isRailway) {
      return [
        // Lokaal: root → statische marketing site (public/index.html)
        { source: "/", destination: "/index.html" },
      ];
    }
    return [];
  },
};

export default nextConfig;
