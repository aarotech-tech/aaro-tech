import { withSentryConfig } from '@sentry/nextjs';
import type { NextConfig } from "next";
import "./src/env.mjs";
import withBundleAnalyzer from '@next/bundle-analyzer';

const bundleAnalyzer = withBundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
});

const nextConfig: NextConfig = {
  images: {
    formats: ['image/webp'],
    contentDispositionType: 'inline',
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Content-Security-Policy",
            value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.clerk.accounts.dev https://clerk.aarotech.in https://www.clarity.ms https://www.googletagmanager.com; connect-src 'self' https://*.clerk.accounts.dev https://clerk.aarotech.in wss://*.clerk.accounts.dev https://www.google-analytics.com https://*.clarity.ms; img-src 'self' data: blob: https://images.unsplash.com https://img.clerk.com; style-src 'self' 'unsafe-inline'; worker-src 'self' blob:; frame-ancestors 'none';",
          },
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=31536000; includeSubDomains; preload",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
        ],
      },
      {
        source: "/_next/image",
        headers: [
          {
            key: "Content-Disposition",
            value: "inline",
          },
        ],
      },
      {
        source: "/images/:path*",
        headers: [
          {
            key: "Content-Disposition",
            value: "inline",
          },
        ],
      },
    ];
  },
  async redirects() {
    return [
      {
        source: '/crm/leads/:path*',
        destination: '/sales/leads/:path*',
        permanent: true,
      },
      {
        source: '/crm/pipeline/:path*',
        destination: '/sales/pipeline/:path*',
        permanent: true,
      },
      {
        source: '/crm/proposals/:path*',
        destination: '/sales/proposals/:path*',
        permanent: true,
      },
      {
        source: '/crm/projects/:path*',
        destination: '/delivery/projects/:path*',
        permanent: true,
      },
      {
        source: '/crm/tasks/:path*',
        destination: '/delivery/tasks/:path*',
        permanent: true,
      },
      {
        source: '/crm/deliverables/:path*',
        destination: '/delivery/reviews/:path*',
        permanent: true,
      },
      {
        source: '/crm',
        destination: '/sales/pipeline',
        permanent: true,
      },
      {
        source: '/portfolio/:path*',
        destination: '/work/:path*',
        permanent: true,
      },
      {
        source: '/portfolio',
        destination: '/work',
        permanent: true,
      }
    ];
  },
  serverExternalPackages: ['pino', 'pino-pretty'],
  experimental: {
  },
};

export default bundleAnalyzer(nextConfig);
