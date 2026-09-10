/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    dangerouslyAllowSVG: false,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com',
      },
    ],
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(self), microphone=(self), geolocation=(), payment=(self)',
          },
          {
            key: 'Cross-Origin-Opener-Policy',
            value: 'same-origin-allow-popups',
          },
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https:; style-src 'self' 'unsafe-inline' https:; img-src 'self' data: https: blob:; font-src 'self' https: data:; connect-src 'self' https:; worker-src 'self' blob:; frame-ancestors 'none'; base-uri 'self'; object-src 'none';",
          },
        ],
      },
    ];
  },
  async redirects() {
    return [
      {
        source: '/subject',
        destination: '/subjects',
        permanent: true,
      },
      {
        source: '/subject/:path*',
        destination: '/subjects/:path*',
        permanent: true,
      },
      {
        source: '/cheatsheet',
        destination: '/cheatsheets',
        permanent: true,
      },
      {
        source: '/cheatsheet/:path*',
        destination: '/cheatsheets/:path*',
        permanent: true,
      },
      {
        source: '/report',
        destination: '/feedback',
        permanent: true,
      },
      {
        source: '/report/:path*',
        destination: '/feedback',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
