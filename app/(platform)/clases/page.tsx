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
  /** `vista=pasadas`: the past classes' tab; `pagina`: how many pages of ten past classes to show. */
  searchParams: Promise<{ vista?: string; pagina?: string }>;
}

/** «Mis clases» (ALU-1): the upcoming classes as tickets, the past ones as cards, beside the classes paid. */
export default async function ClassesPage({ searchParams }: ClassesPageProps) {
  const { vista, pagina } = await searchParams;
  const tab: ClassesTab = vista === "pasadas" ? "pasadas" : "proximas";
  const pastPages = Math.min(50, Math.max(1, Number.parseInt(pagina ?? "1", 10) || 1));
  // Border of the private area: the service resolves the session in the DAL.
  const view = await getUserClasses(pastPages);

  return (
    <>
      <div className={`platform-page platform-page_width_wide${view.joinOpen ? " platform-page_foot_join-bar" : ""}`}>
        <header className="platform-page__head">
          <h1 className="platform-page__title">Mis clases</h1>
        </header>
        <ClassesListSection view={view} tab={tab} pastPages={pastPages} />
      </div>
      {view.joinOpen && <ClassJoinBar {...view.joinOpen} audience="student" />}
    </>
  );
}
