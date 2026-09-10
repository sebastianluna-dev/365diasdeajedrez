import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { siteConfig } from "@/config/site.config";
import LandingPage from "./landing-page";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

// Static home page: prerendered at build time and served from the CDN. Whoever
// is already logged in does not see it: `proxy.ts` sends anyone carrying a
// session cookie to /entrar, and that route handler dispatches by role (or
// deletes the expired cookie and returns here). That is why this page cannot
// read cookies or headers: as soon as it did, it would render per request again.
//
// The Globals' `afterChange` hooks regenerate it on save in the CMS
// (revalidatePath); the one-hour window is the safety net for changes that
// bypass Payload, the same one as in services/home/home.service.ts.
export const revalidate = 3600;

export default function HomePage() {
  if (!siteConfig.home.enabled) notFound();

  return <LandingPage />;
}
