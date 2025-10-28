import type { NextConfig } from "next";

const NextConfig = {
  experimental: {
    // Disable caching in development
    isrMemoryCacheSize: 0,
  },
  // Disable static optimization for development
  ...(process.env.NODE_ENV === "development" && {
    experimental: {
      forceSwcTransforms: true,
    },
  }),
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "nspkypsrdwtoaszvxxov.supabase.co",
        port: "",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
};

export default NextConfig;
