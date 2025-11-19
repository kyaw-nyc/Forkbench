import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    // Disable ESLint during builds since we're using ESLint 9 flat config
    // which isn't fully supported by Next.js yet
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
