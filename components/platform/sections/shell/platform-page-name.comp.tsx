"use client";

import { usePathname } from "next/navigation";
import { activeApp, type PlatformApps } from "@/constants/platform/nav-items.const";
import "./platform-page-name.comp.css";

interface PlatformPageNameProps {
  /** The role's tools: the page's name is the name of the one it belongs to. */
  apps: PlatformApps;
}

/**
 * The name of the page on screen, beside the wordmark («Calendario»,
 * «Ejercicios»), as Google writes its product's: the name of the tool the
 * page belongs to (`activeApp`), and nothing on a page no tool leads to (the
 * home, a lesson). Client, because it follows the address.
 */
export function PlatformPageName({ apps }: PlatformPageNameProps) {
  const pathname = usePathname();
  const app = activeApp(apps, pathname);
  if (!app) return null;
  return <span className="platform-page-name">{app.label}</span>;
}
