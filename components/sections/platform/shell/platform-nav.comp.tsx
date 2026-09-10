"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { activeNavHref, type PlatformNavGroup } from "@/constants/platform/nav-items.const";
import "./platform-nav.comp.css";

interface PlatformNavProps {
  /** Composed by role in the shell (server): here they are only rendered. */
  groups: PlatformNavGroup[];
}

export function PlatformNav({ groups }: PlatformNavProps) {
  const pathname = usePathname();
  const activeHref = activeNavHref(groups, pathname);

  return (
    <nav className="platform-nav" aria-label="Navegación principal">
      {groups.map((group, index) => (
        <div key={group.label ?? `group-${index}`} className="platform-nav__group">
          {/* The group label (`group.label`) is not rendered in the top bar: there
              is no row to put it on and it repeats what the first item already says
              ("Administración", "Panel del profesor"). The menu is exclusive by
              role, so there are no two groups to tell apart. */}
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
