import { shareStudyWithStudent, unshareStudyWithStudent } from "@/services/studies/studies.actions";
import type { StudentOption, StudyShareItem } from "@/services/studies/studies.types";
import "./share-collection.comp.css";
import { SubmitButton } from "@/components/platform/shared/submit-button.comp";

interface ShareCollectionProps {
  studyId: string;
  /** Who it has already been handed to. */
  shares: StudyShareItem[];
  /** Students with an active assignment to the teacher who hands it out. */
  students: StudentOption[];
}

/**
 * Who this collection reaches.
 *
 * Only the OWNER of the collection sees it — the teacher who made it —; whoever
 * receives it has no business knowing who else it is shared with, which is why
 * `StudyDetail.shares` arrives empty for them.
 *
 * No JavaScript of its own: two forms against their server actions. The
 * share is a row that exists or does not, so there is no intermediate state
 * that deserves a client component.
 */
export function ShareCollection({ studyId, shares, students }: ShareCollectionProps) {
  const sharedIds = new Set(shares.map((share) => share.userId));
  // Handing it to someone who already has it does nothing (the action is
  // idempotent), but offering it confuses: it looks like it can be given twice.
  const candidates = students.filter((student) => !sharedIds.has(student.id));

  return (
    <section className="share-collection">
      <header className="share-collection__head">
        <h2 className="share-collection__title">Alumnos con esta colección</h2>
        <p className="share-collection__hint">
          La reciben en «Mis estudios» y sólo pueden leerla: recorrer las jugadas y las variantes y ver tus comentarios.
          No pueden cambiar nada.
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
                <SubmitButton className="share-collection__remove" pendingLabel="Quitando…">
                  Quitar
                </SubmitButton>
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
            <select className="share-collection__select" name="studentId" defaultValue={candidates[0]?.id}>
              {candidates.map((student) => (
                <option key={student.id} value={student.id}>
                  {student.displayName} · {student.email}
                </option>
              ))}
            </select>
          </label>

          <SubmitButton pendingLabel="Compartiendo…">Compartir</SubmitButton>
        </form>
      ) : (
        <p className="share-collection__empty">
          {students.length === 0 ? "No tienes alumnos asignados a los que dársela." : "Ya la tienen todos tus alumnos."}
        </p>
      )}
    </section>
  );
}
