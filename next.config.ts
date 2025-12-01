import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ['@tanstack/react-query'],
  turbopack: {
    root: process.cwd(),
  },
};

export default nextConfig;
