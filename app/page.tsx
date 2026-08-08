import { notFound } from "next/navigation";
import { siteConfig } from "@/config/site.config";
import LandingPage from "./landing-page";

export default function HomePage() {
  if (!siteConfig.home.enabled) notFound();

  return <LandingPage />;
}
