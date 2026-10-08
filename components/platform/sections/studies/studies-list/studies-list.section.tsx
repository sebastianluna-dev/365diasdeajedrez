import type { StudyKindOption, StudySummary } from "@/services/studies/studies.types";
import { StudiesBrowser } from "./studies-browser.comp";

interface StudiesListSectionProps {
  /** `getUserStudies()`, read by the page alongside the kinds so both travel at once. */
  studies: StudySummary[];
  /** The kinds the viewer can create, for the grid's «Nuevo estudio» slot. */
  kinds: StudyKindOption[];
}

export function StudiesListSection({ studies, kinds }: StudiesListSectionProps) {
  // No empty state of its own: the library is drawn even with nothing in it,
  // because its grid opens with the slot that creates the first study, the
  // only way to create one since the page's button went. («Mis partidas» is
  // born with the account, so it is rarely empty at all.)
  //
  // The split is decided by OWNERSHIP, not by kind: what is not theirs — the
  // databases of their courses and the collections a teacher handed them — is
  // read-only and goes in its own section so it does not mix with what they
  // can touch.
  return (
    <StudiesBrowser
      own={studies.filter((study) => study.permissions.canEditGames)}
      received={studies.filter((study) => !study.permissions.canEditGames)}
      kinds={kinds}
    />
  );
}
