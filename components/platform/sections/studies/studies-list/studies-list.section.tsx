import { EmptyState } from "@/components/platform/shared/empty-state.comp";
import type { StudySummary } from "@/services/studies/studies.types";
import { StudiesBrowser } from "./studies-browser.comp";

interface StudiesListSectionProps {
  /** `getUserStudies()`, read by the page alongside the kinds so both travel at once. */
  studies: StudySummary[];
}

export function StudiesListSection({ studies }: StudiesListSectionProps) {
  if (studies.length === 0) {
    return (
      <EmptyState
        title="Todavía no tienes estudios"
        description="Crea un estudio o importa partidas para empezar tu biblioteca."
      />
    );
  }

  // The split is decided by OWNERSHIP, not by kind: what is not theirs — the
  // databases of their courses and the collections a teacher handed them — is
  // read-only and goes in its own section so it does not mix with what they
  // can touch.
  return (
    <StudiesBrowser
      own={studies.filter((study) => study.permissions.canEditGames)}
      received={studies.filter((study) => !study.permissions.canEditGames)}
    />
  );
}
