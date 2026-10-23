import { PlatformSideNav } from "@/components/platform/shared/platform-side-nav/platform-side-nav.comp";
import { PlatformNotice } from "@/components/platform/shared/platform-notice/platform-notice.comp";
import type { StudyKindOption, StudySummary } from "@/services/studies/studies.types";
import { NewStudy } from "./new-study/new-study.comp";
import { StudiesBrowser } from "./studies-browser.comp";
import {
  isOwnStudy,
  resumeStudyOf,
  STUDY_SORTS,
  STUDY_VIEWS,
  studiesNavGroups,
  studiesOfView,
  type StudySort,
  type StudyView,
} from "./studies-nav.const";

interface StudiesListSectionProps {
  /** `getUserStudies()`, read by the page alongside the kinds so both travel at once. */
  studies: StudySummary[];
  /** The kinds the viewer can create, for «Nuevo estudio». */
  kinds: StudyKindOption[];
  /** Which kinds the page shows (`?tipo=`), and in what order (`?orden=`). */
  view: StudyView;
  sort: StudySort;
  /** What a search sent from a study's bar asked for (`?q=`). */
  query?: string;
  /** What `createStudy` bounced back with, already in words. */
  errorMessage?: string;
}

/**
 * «Mis estudios» in the new design system (2026-10-23, «M4» of the owner's
 * canvas): a workspace whose side column has «Nuevo estudio» as the extended
 * FAB and, under it, the kinds with their counts and the order, as links, so
 * a view has an address; and whose panel is the library (`StudiesBrowser`).
 *
 * The split of the library is by OWNERSHIP, not by kind: what is not theirs
 * — the collections a teacher handed them, the games of their classes — is
 * read-only and goes in its own group so it does not mix with what they can
 * touch.
 */
export function StudiesListSection({ studies, kinds, view, sort, query, errorMessage }: StudiesListSectionProps) {
  const shown = studiesOfView(studies, view, sort);
  const resume = view === undefined ? resumeStudyOf(studies) : undefined;
  const viewLabel = STUDY_VIEWS.find((entry) => entry.value === view)?.label ?? "Todos";
  const sortLabel = STUDY_SORTS.find((entry) => entry.value === sort)?.label ?? "Recientes";

  return (
    <div className="platform-workspace">
      <div className="platform-workspace__side">
        <NewStudy kinds={kinds} />
        <PlatformSideNav label="Estudios" groups={studiesNavGroups(studies, view, sort)} />
      </div>

      <section className="platform-workspace__panel" aria-label="Mis estudios">
        {errorMessage && <PlatformNotice message={errorMessage} />}
        <StudiesBrowser
          own={shown.filter(isOwnStudy)}
          received={shown.filter((study) => !isOwnStudy(study))}
          resume={resume?.resume ? { ...resume, resume: resume.resume } : undefined}
          initialQuery={query}
          viewLabel={viewLabel}
          viewKey={`${viewLabel}-${sortLabel}`}
        />
      </section>
    </div>
  );
}
