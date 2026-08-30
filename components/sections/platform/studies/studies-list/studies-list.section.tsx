import { EmptyState } from "@/components/common/empty-state.comp";
import { createStudy } from "@/services/studies/studies.actions";
import { getStudyKinds, getUserStudies } from "@/services/studies/studies.service";
import { StudyCard } from "./study-card.comp";
import "./studies-list.section.css";

export async function StudiesListSection() {
  const [studies, kinds] = await Promise.all([getUserStudies(), getStudyKinds()]);

  const ownStudies = studies.filter((study) => !study.isCourseStudy);
  const courseStudies = studies.filter((study) => study.isCourseStudy);

  return (
    <div className="studies-list">
      <form className="studies-list__create platform-card" action={createStudy}>
        <h2 className="platform-card__title">Crear estudio</h2>

        <div className="studies-list__create-fields">
          <label className="studies-list__field">
            <span className="studies-list__field-label">Nombre</span>
            <input
              className="studies-list__input"
              type="text"
              name="name"
              maxLength={120}
              required
              placeholder="Mi repertorio con blancas"
            />
          </label>

          <label className="studies-list__field">
            <span className="studies-list__field-label">Descripción (opcional)</span>
            <input
              className="studies-list__input"
              type="text"
              name="description"
              maxLength={500}
              placeholder="Para qué te sirve este estudio"
            />
          </label>

          <label className="studies-list__field studies-list__field_size_small">
            <span className="studies-list__field-label">Tipo</span>
            <select className="studies-list__select" name="kindCode" defaultValue={kinds[0]?.code}>
              {kinds.map((kind) => (
                <option key={kind.code} value={kind.code}>
                  {kind.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        <button type="submit" className="platform-button">
          Crear estudio
        </button>
      </form>

      {studies.length === 0 && (
        <EmptyState
          title="Todavía no tienes estudios"
          description="Crea un estudio o importa partidas para empezar tu biblioteca."
        />
      )}

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
