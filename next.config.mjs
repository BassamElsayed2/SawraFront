/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  env: {
    NEXT_PUBLIC_SITE_URL:
      process.env.NEXT_PUBLIC_SITE_URL || "https://elsawra.net",
  },
  async rewrites() {
    return [
      {
        source: "/:path*",
        destination: `http://localhost:${process.env.PORT || 4016}/:path*`, // Use your app's internal port
      },
    ];
  },
};

export default nextConfig;
