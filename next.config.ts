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
    // With three root layouts there is no `not-found.tsx` covering the URLs that
    // match no route: app/global-not-found.tsx does that.
    globalNotFound: true,
  },
  // The headers Vercel does not add on its own (it does add HSTS). No CSP yet:
  // the inline scripts of Google Analytics and the Meta Pixel would need a
  // nonce from proxy.ts, which is a job of its own (IMPROVEMENTS #33).
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          // Nothing here is meant to be framed, Payload's panel included.
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
    ];
  },
};

export default withPayload(nextConfig);
