import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'uztest.uz' },
      { protocol: 'https', hostname: 'artelelectronics.com' },
      { protocol: 'https', hostname: 'imzo.uz' },
      { protocol: 'https', hostname: 'texnopark.uz' },
      { protocol: 'https', hostname: 'premier-sert.uz' },
      { protocol: 'https', hostname: 'www.ansorsafety.uz' },
      { protocol: 'https', hostname: 'texniksinovlar.uz' },
      { protocol: 'https', hostname: 'asiapowersun.com' },
      { protocol: 'https', hostname: 'correct-results.uz' },
      { protocol: 'https', hostname: 'www.lps.uz' },
      { protocol: 'https', hostname: 'upload.wikimedia.org' },
      { protocol: 'https', hostname: 'encrypted-tbn0.gstatic.com' },
      { protocol: 'https', hostname: 'static.tildacdn.one' },
    ],
  },
};

export default nextConfig;
