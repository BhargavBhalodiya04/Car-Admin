import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'quqswxhpcgtsdmeznagw.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
  allowedDevOrigins: ['172.16.0.2', '172.18.96.1', '172.23.64.1', 'localhost:3000', 'localhost:3030'],
};


export default nextConfig;
