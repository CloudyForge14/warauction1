import createNextIntlPlugin from 'next-intl/plugin';

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config, { isServer }) => {
    if (isServer) {
      require('./scripts/generate-sitemap');
    }
    return config;
  },
};

// Создаём конфигурацию с плагином для интернационализации
const withNextIntl = createNextIntlPlugin();
export default withNextIntl(nextConfig);
