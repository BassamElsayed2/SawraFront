import { spawnSync } from "node:child_process";
import { randomUUID } from "node:crypto";
import withSerwistInit from "@serwist/next";

const revision =
  spawnSync("git", ["rev-parse", "HEAD"], { encoding: "utf-8" }).stdout?.trim() ||
  randomUUID();

const withSerwist = withSerwistInit({
  additionalPrecacheEntries: [{ url: "/offline.html", revision }],
  swSrc: "app/sw.ts",
  swDest: "public/sw.js",
  disable: process.env.NODE_ENV === "development",
});

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
  // Removed problematic rewrites that caused infinite loop
  // async rewrites() {
  //   return [
  //     {
  //       source: "/:path*",
  //       destination: `http://localhost:${process.env.PORT || 4016}/:path*`,
  //     },
  //   ];
  // },
};

export default withSerwist(nextConfig);
