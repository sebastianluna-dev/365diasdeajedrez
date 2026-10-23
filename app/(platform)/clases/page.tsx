import type { Metadata } from "next";
import {
  ClassesListSection,
  type ClassesTab,
} from "@/components/platform/sections/classes/classes-list/classes-list.section";
import { ClassJoinBar } from "@/components/platform/shared/class-join-bar/class-join-bar.comp";
import { getUserClasses } from "@/services/classes/classes.service";

export const metadata: Metadata = {
  title: "Mis clases",
};

interface ClassesPageProps {
  /** `vista=pasadas`: the past classes' view; `pagina`: how many pages of ten past classes to show. */
  searchParams: Promise<{ vista?: string; pagina?: string }>;
}

/**
 * «Mis clases» (ALU-1), in the new design system (2026-10-23): the page
 * takes the window and bleeds onto the canvas; the section draws the
 * workspace — the views and the classes paid in the side column, the
 * agenda or the past classes in the panel.
 */
export default async function ClassesPage({ searchParams }: ClassesPageProps) {
  const { vista, pagina } = await searchParams;
  const tab: ClassesTab = vista === "pasadas" ? "pasadas" : "proximas";
  const pastPages = Math.min(50, Math.max(1, Number.parseInt(pagina ?? "1", 10) || 1));
  // Border of the private area: the service resolves the session in the DAL.
  const view = await getUserClasses(pastPages);

  return (
    <>
      <div
        className={`platform-page platform-page_width_full platform-page_frame_bleed${view.joinOpen ? " platform-page_foot_join-bar" : ""}`}
      >
        <ClassesListSection view={view} tab={tab} pastPages={pastPages} />
      </div>
      {view.joinOpen && <ClassJoinBar {...view.joinOpen} audience="student" look="material" />}
    </>
  );
}
