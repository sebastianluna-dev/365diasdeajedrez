import { shareStudyWithStudent, unshareStudyWithStudent } from "@/services/studies/studies.actions";
import type { StudentOption, StudyShareItem } from "@/services/studies/studies.types";
import "./share-collection.comp.css";

interface ShareCollectionProps {
  studyId: string;
  /** A quién se le repartió ya. */
  shares: StudyShareItem[];
  /** Alumnos con asignación activa del profesor que la reparte. */
  students: StudentOption[];
}

/**
 * A quién le llega esta colección.
 *
 * Sólo lo ve el DUEÑO de la colección —el maestro que la hizo—; a quien la
 * recibe no le incumbe con quién más se comparte, y por eso `StudyDetail.shares`
 * llega vacío para él.
 *
 * Sin JavaScript propio: dos formularios contra sus server actions. El reparto
 * es una fila que existe o no existe, así que no hay estado intermedio que
 * merezca un componente de cliente.
 */
export function ShareCollection({ studyId, shares, students }: ShareCollectionProps) {
  const sharedIds = new Set(shares.map((share) => share.userId));
  // Repartirla a quien ya la tiene no hace nada (la acción es idempotente),
  // pero ofrecerlo confunde: parece que se puede dar dos veces.
  const candidates = students.filter((student) => !sharedIds.has(student.id));

  return (
    <section className="share-collection">
      <header className="share-collection__head">
        <h2 className="share-collection__title">Alumnos con esta colección</h2>
        <p className="share-collection__hint">
          La reciben en «Mis estudios» y sólo pueden leerla: recorrer las jugadas y las variantes y ver
          tus comentarios. No pueden cambiar nada.
        </p>
      </header>

      {shares.length > 0 ? (
        <ul className="share-collection__list">
          {shares.map((share) => (
            <li key={share.userId} className="share-collection__item">
              <span className="share-collection__student">
                <span className="share-collection__name">{share.displayName}</span>
                <span className="share-collection__email">{share.email}</span>
              </span>

              <span className="share-collection__date">Desde el {share.sharedAtLabel}</span>

              <form action={unshareStudyWithStudent.bind(null, studyId)}>
                <input type="hidden" name="studentId" value={share.userId} />
                <button type="submit" className="share-collection__remove">
                  Quitar
                </button>
              </form>
            </li>
          ))}
        </ul>
      ) : (
        <p className="share-collection__empty">Todavía no se la has dado a nadie.</p>
      )}

      {candidates.length > 0 ? (
        <form action={shareStudyWithStudent.bind(null, studyId)} className="share-collection__form">
          <label className="share-collection__field">
            <span className="share-collection__label">Dársela a</span>
            <select className="share-collection__select" name="studentId" defaultValue={candidates[0].id}>
              {candidates.map((student) => (
                <option key={student.id} value={student.id}>
                  {student.displayName} · {student.email}
                </option>
              ))}
            </select>
          </label>

          <button type="submit" className="platform-button">
            Compartir
          </button>
        </form>
      ) : (
        <p className="share-collection__empty">
          {students.length === 0
            ? "No tienes alumnos asignados a los que dársela."
            : "Ya la tienen todos tus alumnos."}
        </p>
      )}
    </section>
  );
}
