import { EmptyState } from "@/components/common/empty-state.comp";
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

  // El corte lo decide el dueño de la base, no el tipo: las de curso son de
  // sólo lectura y por eso van en su propia sección.
  return (
    <StudiesBrowser
      own={studies.filter((study) => !study.isCourseStudy)}
      course={studies.filter((study) => study.isCourseStudy)}
    />
  );
}
