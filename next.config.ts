import type { NextConfig } from "next";
import { withPayload } from "@payloadcms/next/withPayload";

const nextConfig: NextConfig = {
  // The Cloudinary SDK reads its own package.json for version info at require-time;
  // bundling it (webpack/Turbopack) breaks that lookup ("Must supply sdk_semver").
  // Keep it external so Node requires it natively at runtime.
  serverExternalPackages: ["cloudinary"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
    ],
  },
  experimental: {
    // Con tres root layouts no hay un `not-found.tsx` que cubra las URLs que
    // no encajan con ninguna ruta: lo hace app/global-not-found.tsx.
    globalNotFound: true,
  },
};

export default withPayload(nextConfig);
