"use client";

import { usePathname, useSearchParams } from "next/navigation";
import {
  PlatformSideNav,
  type PlatformSideNavGroup,
} from "@/components/platform/shared/platform-side-nav/platform-side-nav.comp";
import { isCurrentView } from "./courses-nav.const";

interface CoursesSideNavProps {
  /** `coursesNavGroups`: the links and their counts, none lit. */
  groups: PlatformSideNavGroup[];
  /** Where «Seguir donde iba» leads, if there is a course to go on with. */
  resumeHref?: string;
}

/**
 * The side column of «Cursos» in the layout both pages share: the server
 * counts it once, and the browser lights the view on screen from the address
 * (`isCurrentView`), so moving between views redraws only the panel. Client,
 * because it follows the address.
 */
export function CoursesSideNav({ groups, resumeHref }: CoursesSideNavProps) {
  const pathname = usePathname();
  const params = useSearchParams();
  const lit = groups.map((group) => ({
    ...group,
    links: group.links.map((link) => ({ ...link, current: isCurrentView(link.href, pathname, params) })),
  }));

  return (
    <PlatformSideNav
      label="Cursos"
      action={resumeHref ? { label: "Seguir donde iba", href: resumeHref } : undefined}
      groups={lit}
    />
  );
}
