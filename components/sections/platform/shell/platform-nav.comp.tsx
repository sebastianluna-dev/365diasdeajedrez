"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { activeNavHref, type PlatformNavGroup } from "@/constants/platform/nav-items.const";
import "./platform-nav.comp.css";

interface PlatformNavProps {
  /** Compuestos por rol en el shell (server): aquí sólo se pintan. */
  groups: PlatformNavGroup[];
}

export function PlatformNav({ groups }: PlatformNavProps) {
  const pathname = usePathname();
  const activeHref = activeNavHref(groups, pathname);

  return (
    <nav className="platform-nav" aria-label="Navegación principal">
      {groups.map((group, index) => (
        <div key={group.label ?? `group-${index}`} className="platform-nav__group">
          {group.label && <p className="platform-nav__group-label">{group.label}</p>}

          {group.items.map((item) => {
            const isActive = item.href === activeHref;
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
        </div>
      ))}
    </nav>
  );
}
