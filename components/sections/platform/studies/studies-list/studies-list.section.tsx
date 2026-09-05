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

  // El corte lo decide la PROPIEDAD, no el tipo: lo que no es suyo —las bases
  // de sus cursos y las colecciones que le repartió un maestro— es de sólo
  // lectura y va en su propia sección para que no se mezcle con lo que sí puede
  // tocar.
  return (
    <StudiesBrowser
      own={studies.filter((study) => study.permissions.canEditGames)}
      received={studies.filter((study) => !study.permissions.canEditGames)}
    />
  );
}
