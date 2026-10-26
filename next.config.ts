import type { NextConfig } from "next";
import { withPayload } from "@payloadcms/next/withPayload";
import { ADMIN_PATH_PREFIX, contentSecurityPolicy, sitePolicySource } from "./lib/content-security-policy";

const isDev = process.env.NODE_ENV === "development";

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
    // A PGN import admits PGN_MAX_LENGTH (2,000,000 characters) and answers a
    // longer one with its own message. The default body limit of a server
    // action is 1 MB, which rejected the request before the action could say
    // anything: 3 MB is the PGN, the multipart envelope and room for the
    // characters that take more than one byte.
    serverActions: { bodySizeLimit: "3mb" },
  },
  // The teachers' landing answers at /para-profesores; /para-maestros is the
  // other word people use, and gets a 308 to it.
  async redirects() {
    return [{ source: "/para-maestros", destination: "/para-profesores", permanent: true }];
  },
  // The headers Vercel does not add on its own (it does add HSTS), and the
  // Content-Security-Policy of the site and of Payload's panel. The platform's
  // carries a nonce, so proxy.ts sets it per request and the site's rule
  // leaves its paths out (lib/content-security-policy.ts).
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
      {
        source: sitePolicySource(),
        headers: [{ key: "Content-Security-Policy", value: contentSecurityPolicy({ target: "site", isDev }) }],
      },
      {
        source: `${ADMIN_PATH_PREFIX}/:path*`,
        headers: [{ key: "Content-Security-Policy", value: contentSecurityPolicy({ target: "admin", isDev }) }],
      },
    ];
  },
};

export default withPayload(nextConfig);
