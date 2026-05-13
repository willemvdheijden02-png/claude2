import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      // Root → statische marketing site (public/index.html)
      { source: "/", destination: "/index.html" },
    ];
  },
};

export default nextConfig;
