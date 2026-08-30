import { EmptyState } from "@/components/common/empty-state.comp";
import { getUserStudies } from "@/services/studies/studies.service";
import { StudyCard } from "./study-card.comp";
import "./studies-list.section.css";

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

  const ownStudies = studies.filter((study) => !study.isCourseStudy);
  const courseStudies = studies.filter((study) => study.isCourseStudy);

  return (
    <div className="studies-list">
      {ownStudies.length > 0 && (
        <div className="studies-list__group">
          <h2 className="studies-list__group-title">Tus estudios</h2>
          <div className="studies-list__grid">
            {ownStudies.map((study) => (
              <StudyCard key={study.id} study={study} />
            ))}
          </div>
        </div>
      )}

      {courseStudies.length > 0 && (
        <div className="studies-list__group">
          <h2 className="studies-list__group-title">Bases de tus cursos</h2>
          <div className="studies-list__grid">
            {courseStudies.map((study) => (
              <StudyCard key={study.id} study={study} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
