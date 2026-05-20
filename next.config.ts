import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.r2.dev',
      },
      ...(process.env.R2_PUBLIC_HOSTNAME
        ? [
            {
              protocol: 'https' as const,
              hostname: process.env.R2_PUBLIC_HOSTNAME,
            },
          ]
        : []),
    ],
  },
}

export default nextConfig
