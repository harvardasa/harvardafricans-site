import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Allow next/image to optimize uploads served from Supabase Storage.
    // The hostname is your project's storage CDN.
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'ocuxzuqztrhjruwzfunj.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
};

export default nextConfig;
