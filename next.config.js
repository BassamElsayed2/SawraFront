/** @type {import('next').NextConfig} */
const { i18n } = require('./next-i18next.config');

const nextConfig = {
  reactStrictMode: true,
  basePath: process.env.NODE_ENV === 'production' ? process.env.NEXT_PUBLIC_BASEPATH : "",
  i18n,
  images: {
    domains: ['enzpacmxxlkvnoyuqtyv.supabase.co'],
  },
};

module.exports = nextConfig;


