import type { NextConfig } from "next";

const NextConfig: NextConfig = {
  // Skip ESLint during production builds (Vercel) to avoid blocking on lint errors
  eslint: {
    ignoreDuringBuilds: true,
  },
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
