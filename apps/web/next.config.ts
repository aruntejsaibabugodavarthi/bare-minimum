import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return {
      beforeFiles: [
        {
          source: '/api/:path*',
          destination: 'http://localhost:8081/api/:path*',
        },
      ],
      fallback: [
        {
          source: '/:path*',
          destination: 'http://localhost:8081/:path*',
        },
      ],
    };
  },
};

export default nextConfig;
