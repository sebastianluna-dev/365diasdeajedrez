import { PlatformForm, PlatformFormField } from "@/components/platform/shared/platform-form/platform-form.comp";
import { PlatformSelect } from "@/components/platform/shared/platform-select/platform-select.comp";
import { savedValueKey } from "@/components/platform/shared/saved-value-key";
import { SubmitButton } from "@/components/platform/shared/submit-button/submit-button.comp";
import type {
  StudentShareAction,
  StudentShareOption,
  StudentShareRow,
  StudentShareSubject,
} from "./student-share-panel.types";
import "./student-share-panel.comp.css";

interface StudentSharePanelProps {
  /** What is given: a collection of studies, or a series of exercises. Both words are feminine. */
  subject: StudentShareSubject;
  /** Who already has it. */
  shares: StudentShareRow[];
  /** Students with an active assignment to the teacher who gives it. */
  students: StudentShareOption[];
  /** Gives it to the `studentId` sent; bound to the collection or the series. */
  share: StudentShareAction;
  /** Takes it from the `studentId` sent; the material stays the teacher's. */
  unshare: StudentShareAction;
  /**
   * `panel` is the wide box of a page; `compact` a card of an aside, where
   * each student takes two lines and the form stacks, because there is no
   * width for a row.
   */
  layout?: "panel" | "compact";
}

/** The heading and the line under it, by what is given. */
const COPY: Record<StudentShareSubject, { title: string; hint: string }> = {
  collection: {
    title: "Alumnos con esta colección",
    hint: "La reciben en «Mis estudios» y sólo pueden leerla: recorrer las jugadas y las variantes y ver tus comentarios. No pueden cambiar nada.",
  },
  series: {
    title: "Alumnos con esta serie",
    hint: "La ven en «Ejercicios» mientras sean tus alumnos, con sus ejercicios en el orden que le diste. Un ejercicio archivado deja de aparecerles.",
  },
};

/**
 * Who a teacher's material reaches — a collection of studies or a series of
 * exercises (D31) —: who already has it, with «Quitar» on each, and a select
 * of the students who do not, with «Compartir». The two behave alike because
 * they are this one panel.
 *
 * Only the OWNER sees it; whoever receives the material has no business
 * knowing who else has it. No JavaScript of its own: two forms against the
 * actions it is given. A share is a row that exists or does not, so there is
 * no intermediate state that deserves a client component.
 */
export function StudentSharePanel({
  subject,
  shares,
  students,
  share,
  unshare,
  layout = "panel",
}: StudentSharePanelProps) {
  const copy = COPY[subject];
  const sharedIds = new Set(shares.map((row) => row.userId));
  // Giving it to someone who already has it does nothing (the actions are
  // idempotent), but offering it confuses: it looks like it can be given twice.
  const candidates = students.filter((student) => !sharedIds.has(student.id));
  const first = candidates[0]?.id;

  return (
    <section className={`student-share-panel student-share-panel_layout_${layout}`}>
      <header className="student-share-panel__head">
        <h2 className="student-share-panel__title">{copy.title}</h2>
        <p className="student-share-panel__hint">{copy.hint}</p>
      </header>

      {shares.length > 0 ? (
        <ul className="student-share-panel__list">
          {shares.map((row) => (
            <li key={row.userId} className="student-share-panel__item">
              <span className="student-share-panel__student">
                <span className="student-share-panel__name">{row.displayName}</span>
                <span className="student-share-panel__email">{row.email}</span>
              </span>

              <span className="student-share-panel__date">Desde el {row.sharedAtLabel}</span>

              <form action={unshare} className="student-share-panel__remove">
                <input type="hidden" name="studentId" value={row.userId} />
                <SubmitButton
                  className="platform-button platform-button_size_sm"
                  pendingLabel="Quitando…"
                  aria-label={`Quitar a ${row.displayName}`}
                >
                  Quitar
                </SubmitButton>
              </form>
            </li>
          ))}
        </ul>
      ) : (
        <p className="student-share-panel__empty">Todavía no se la has dado a nadie.</p>
      )}

      {candidates.length > 0 ? (
        <PlatformForm action={share} className="student-share-panel__form">
          <div className="student-share-panel__field">
            <PlatformFormField name="studentId" label="Dársela a">
              {/* Keyed by the first candidate: once one is given it, the select
                  opens on the next instead of the one React's reset brings back. */}
              <PlatformSelect
                key={savedValueKey(first)}
                defaultValue={first}
                required
                // In an aside's column an address is wider than the select: the name alone.
                options={candidates.map((student) => ({
                  value: student.id,
                  label: layout === "compact" ? student.displayName : `${student.displayName} · ${student.email}`,
                }))}
              />
            </PlatformFormField>
          </div>

          <SubmitButton className="platform-button student-share-panel__submit" pendingLabel="Compartiendo…">
            Compartir
          </SubmitButton>
        </PlatformForm>
      ) : (
        <p className="student-share-panel__empty">
          {students.length === 0 ? "No tienes alumnos asignados a los que dársela." : "Ya la tienen todos tus alumnos."}
        </p>
      )}
    </section>
  );
}
