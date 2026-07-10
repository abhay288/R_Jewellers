import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // @ts-ignore - Next.js config type is currently missing this property but it is required by the CLI
  allowedDevOrigins: ['192.168.29.92'],
};

export default nextConfig;
