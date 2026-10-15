import type { Metadata } from "next";
import { ClassesListSection } from "@/components/platform/sections/classes/classes-list/classes-list.section";
import { ClassJoinBar } from "@/components/platform/shared/class-join-bar/class-join-bar.comp";
import { PaidClassesCard } from "@/components/platform/shared/paid-classes-card/paid-classes-card.comp";
import { getUserClasses } from "@/services/classes/classes.service";
import "./classes-page.css";

export const metadata: Metadata = {
  title: "Mis clases",
};

interface ClassesPageProps {
  /** `pasadas`: how many pages of ten past classes to show. */
  searchParams: Promise<{ pasadas?: string }>;
}

/** «Mis clases» (ALU-1): the classes beside what is left of the payment; on a phone the balance folds. */
export default async function ClassesPage({ searchParams }: ClassesPageProps) {
  const { pasadas } = await searchParams;
  const pastPages = Math.min(50, Math.max(1, Number.parseInt(pasadas ?? "1", 10) || 1));
  // Border of the private area: the service resolves the session in the DAL.
  const view = await getUserClasses(pastPages);
  const { balance } = view;
  const whatsappHref = balance?.whatsappHref ?? view.joinOpen?.whatsappHref ?? "";

  return (
    <>
      <div
        className={`platform-page platform-page_width_wide classes-page${view.joinOpen ? " platform-page_foot_join-bar" : ""}`}
      >
        <header className="platform-page__head">
          <h1 className="platform-page__title">Mis clases</h1>
          <p className="platform-page__subtitle">Tus clases en vivo: las de hoy, las que vienen y las pasadas.</p>
        </header>

        {balance && (
          <details className="classes-page__balance">
            <summary className="classes-page__balance-summary">
              {balance.line.split(":")[0]}
              {balance.toSchedule > 0 ? ` · ${balance.toSchedule} por programar` : ""}
            </summary>
            <PaidClassesCard balance={balance} whatsappHref={whatsappHref} />
          </details>
        )}

        <div className="classes-page__columns">
          <div className="classes-page__main">
            <ClassesListSection view={view} pastPages={pastPages} />
          </div>
          <aside className="classes-page__lane">
            <PaidClassesCard balance={balance} whatsappHref={whatsappHref} />
          </aside>
        </div>
      </div>
      {view.joinOpen && <ClassJoinBar {...view.joinOpen} audience="student" />}
    </>
  );
}
