"use client";

import { usePathname } from "next/navigation";
import { activeApp, type PlatformApps } from "@/constants/platform/nav-items.const";
import { NavArt } from "./nav-art.comp";
import "./platform-page-name.comp.css";

interface PlatformPageNameProps {
  /** The role's tools: the page's name is the name of the one it belongs to. */
  apps: PlatformApps;
}

/**
 * The name of the page on screen at the left of the bar («Calendario»,
 * «Ejercicios»), as Google writes its product's: the tool's drawing (`NavArt`,
 * the one of its tile in the tools menu, still) and the name of the tool the
 * page belongs to (`activeApp`). It takes the wordmark's place (2026-10-22,
 * the new design system's header); a page no tool leads to (a lesson) draws
 * nothing, and the wordmark stays. Client, because it follows the address.
 */
export function PlatformPageName({ apps }: PlatformPageNameProps) {
  const pathname = usePathname();
  const app = activeApp(apps, pathname);
  if (!app) return null;
  return (
    <span className="platform-page-name">
      <NavArt art={app.art} className="platform-page-name__art" />
      {app.label}
    </span>
  );
}
