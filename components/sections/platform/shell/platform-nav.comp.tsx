"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { platformRoutes } from "@/lib/platform-routes";
import "./platform-nav.comp.css";

// Navegación principal: SOLO estas cuatro áreas (el trainer se alcanza desde
// cursos, capítulos y dashboard, no desde el primer nivel).
const NAV_ITEMS = [
  { label: "Inicio", href: platformRoutes.dashboard },
  { label: "Mis clases", href: platformRoutes.classes },
  { label: "Mis estudios", href: platformRoutes.studies },
  { label: "Mis cursos", href: platformRoutes.courses },
];

export function PlatformNav() {
  const pathname = usePathname();

  return (
    <nav className="platform-nav" aria-label="Navegación principal">
      {NAV_ITEMS.map((item) => {
        const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`platform-nav__item${isActive ? " platform-nav__item_active" : ""}`}
            aria-current={isActive ? "page" : undefined}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
