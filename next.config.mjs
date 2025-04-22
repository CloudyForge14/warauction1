import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin();

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Настройка для next/image
  images: {
    domains: ['xerkmpqjygwvwzgiysep.supabase.co'], // Добавьте домен Supabase
  },

  // Настройка заголовков Cache-Control
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
      {
        source: '/public/(.*)',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=0, must-revalidate' },
        ],
      },
    ];
  },
  async redirects() {
    return [
      {
        source: '/',
        destination: '/en',
        permanent: true,
      },
      {
        source: '/:path*',
        has: [{ type: 'host', value: 'cloudyforge.com' }],
        destination: 'https://www.cloudyforge.com/:path*',
        permanent: true,
      },
    ];
  }

};

export default withNextIntl(nextConfig);