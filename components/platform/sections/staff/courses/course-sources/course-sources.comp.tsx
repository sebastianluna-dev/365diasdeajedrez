import { SubmitButton } from "@/components/platform/shared/submit-button.comp";
import type { CatalogOption } from "@/services/staff-courses/staff-courses.types";
import { deleteCourseSource } from "@/services/staff-sources/staff-sources.actions";
import type { CourseSourceAdmin, SourceEntityOption } from "@/services/staff-sources/staff-sources.types";
import { StaffPanel } from "../staff-panel.comp";
import { CourseSourceDialog } from "./course-source-dialog.comp";
import "./course-sources.comp.css";

interface CourseSourcesProps {
  courseId: string;
  sources: CourseSourceAdmin[];
  /** The kinds of resource, from the catalog. */
  sourceTypes: CatalogOption[];
  /** The entities a source can cite, from /administracion/entidades. */
  entities: SourceEntityOption[];
}

/** "1971, 2.ª ed." — the year and the edition on one breath, or whichever there is. */
function editionLabel(source: CourseSourceAdmin): string | undefined {
  const parts = [source.publicationYear?.toString(), source.edition].filter(Boolean);
  return parts.length > 0 ? parts.join(", ") : undefined;
}

/**
 * «Procedencia del recurso»: the panel of the course editor that lists where
 * the material comes from, one row per source, with the dialog that adds one
 * in the header and, on each row, the dialog that edits it and the form that
 * removes it. Only the type is required, so a row may be just "Material de
 * elaboración propia".
 */
export function CourseSources({ courseId, sources, sourceTypes, entities }: CourseSourcesProps) {
  return (
    <StaffPanel
      title="Procedencia del recurso"
      meta={`${sources.length}`}
      description="De dónde procede el material del curso: un libro, un curso digital, un vídeo… Una recopilación se registra fuente a fuente. Sólo el tipo es obligatorio."
      action={<CourseSourceDialog courseId={courseId} sourceTypes={sourceTypes} entities={entities} />}
    >
      <div className="course-sources">
        {sources.length === 0 ? (
          <p className="course-sources__empty">Todavía no se ha registrado de dónde procede este curso.</p>
        ) : (
          <ul className="course-sources__list">
            {sources.map((source) => {
              const facts = [source.authors, source.entityName, editionLabel(source), source.specificReference].filter(
                Boolean,
              );
              return (
                <li key={source.id} className="course-sources__row">
                  <div className="course-sources__text">
                    <span className="course-sources__type">{source.sourceTypeLabel}</span>
                    <span className="course-sources__title">
                      {source.url ? (
                        <a href={source.url} target="_blank" rel="noreferrer" className="course-sources__link">
                          {source.originalTitle ?? source.url}
                        </a>
                      ) : (
                        (source.originalTitle ?? "Sin título")
                      )}
                    </span>
                    {facts.length > 0 && <span className="course-sources__meta">{facts.join(" · ")}</span>}
                    {source.notes && <span className="course-sources__notes">{source.notes}</span>}
                  </div>

                  <div className="course-sources__controls">
                    <CourseSourceDialog
                      courseId={courseId}
                      source={source}
                      sourceTypes={sourceTypes}
                      entities={entities}
                    />
                    <form action={deleteCourseSource.bind(null, courseId)}>
                      <input type="hidden" name="sourceId" value={source.id} />
                      <SubmitButton className="course-sources__remove" pendingLabel="Quitando…">
                        Quitar
                      </SubmitButton>
                    </form>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </StaffPanel>
  );
}
