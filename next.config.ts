import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  env: {
    NEXT_PUBLIC_DEV_MODE: process.env.DEV_MODE,
  },
  images: {
    domains: [
      'images.unsplash.com', 
      'randomuser.me',
      'ui-avatars.com'
    ],
  },
  /* config options here */
};

export default nextConfig;
