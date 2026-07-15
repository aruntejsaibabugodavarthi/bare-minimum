import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    unoptimized: true,
  },
  async rewrites() {
    return {
      beforeFiles: [
        {
          source: '/admin',
          destination: 'http://localhost:3001/admin'
        },
        {
          source: '/admin/:path*',
          destination: 'http://localhost:3001/admin/:path*'
        },
        {
          source: '/api/:path*',
          destination: 'http://localhost:8081/api/:path*'
        }
      ],
      fallback: [
        // Allow explicit legacy HTML routes
        {
          source: '/:path(about|cart|checkout|invoice|login|privacy|product|shop|tracking)',
          destination: 'http://localhost:8081/:path'
        },
        // Allow explicit legacy asset directories
        {
          source: '/:path(assets|css|js)/:rest*',
          destination: 'http://localhost:8081/:path/:rest*'
        },
        // Allow service worker
        {
          source: '/sw.js',
          destination: 'http://localhost:8081/sw.js'
        }
      ]
    };
  }
};

export default nextConfig;
