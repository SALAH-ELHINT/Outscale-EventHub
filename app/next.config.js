/** @type {import('next').NextConfig} */
const { i18n } = require('./next-i18next.config');

const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['localhost'],
    remotePatterns: [
      {
        hostname: '**.cyber-scale.me',
      },
    ],
  },
  i18n,
  async rewrites() {
    return [
      {
        source: '/verify-email',
        destination: '/verify-email',
        locale: false,
      },
    ];
  },
};

module.exports = nextConfig;