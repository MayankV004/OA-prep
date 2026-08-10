import createMDX from '@next/mdx';

/** @type {import('next').NextConfig} */
const nextConfig = {
  pageExtensions: ['js', 'jsx', 'md', 'mdx', 'ts', 'tsx'],
  async headers() {
    const isDev = process.env.NODE_ENV !== 'production';
    const scriptSrc = isDev ? "'self' 'unsafe-inline' 'unsafe-eval'" : "'self' 'unsafe-inline'";

    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: `default-src 'self'; img-src 'self' data: https:; style-src 'self' 'unsafe-inline'; script-src ${scriptSrc}; connect-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self';`,
          },
        ],
      },
    ];
  },
};

// Turbopack requires plugin names as strings (not imported functions)
const withMDX = createMDX({
  options: {
    remarkPlugins: ['remark-gfm'],
    rehypePlugins: [],
  },
});

export default withMDX(nextConfig);
