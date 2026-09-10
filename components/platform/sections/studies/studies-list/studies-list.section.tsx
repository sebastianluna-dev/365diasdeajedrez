import { EmptyState } from "@/components/platform/shared/empty-state.comp";
import { getUserStudies } from "@/services/studies/studies.service";
import { StudiesBrowser } from "./studies-browser.comp";

export async function StudiesListSection() {
  const studies = await getUserStudies();

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
