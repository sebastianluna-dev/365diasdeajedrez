import type { CatalogOption } from "@/services/staff-courses/staff-courses.types";
import type { CourseSourceAdmin } from "@/services/staff-sources/staff-sources.types";
import { StaffPanel } from "../staff-panel.comp";
import { CourseSourceDialog } from "./course-source-dialog.comp";
import "./course-sources.comp.css";

interface CourseSourcesProps {
  courseId: string;
  sources: CourseSourceAdmin[];
  /** The kinds of resource, from the catalog. */
  sourceTypes: CatalogOption[];
}

/**
 * The grey line under the title: who, what kind of resource and the year,
 * "Garry Kasparov · Libro · 2003". The kind is left out when it already is
 * the title.
 */
function sourceFacts(source: CourseSourceAdmin): string {
  const kind = source.originalTitle ? source.sourceTypeLabel : undefined;
  return [source.authors, kind, source.publicationYear?.toString()].filter(Boolean).join(" · ");
}

/**
 * «Procedencia del recurso»: the card of the course editor's narrow column
 * that lists where the material comes from, one row per source. Two lines a
 * row: the title, which wraps as much as it needs, and the facts in grey
 * under it; nothing is cut, the row grows with its title.
 *
 * The header adds a source and «Editar» opens the dialog of one, where it is
 * also removed; the rest of what a source records (edition, reference,
 * notes) is read there. Only the type is required, so a row may be just
 * "Material de elaboración propia".
 */
export function CourseSources({ courseId, sources, sourceTypes }: CourseSourcesProps) {
  return (
    <StaffPanel
      title="Procedencia del recurso"
      meta={`${sources.length}`}
      action={<CourseSourceDialog courseId={courseId} sourceTypes={sourceTypes} />}
    >
      <div className="course-sources">
        {sources.length === 0 ? (
          <p className="course-sources__empty">Todavía no se ha registrado de dónde procede este curso.</p>
        ) : (
          <ul className="course-sources__list">
            {sources.map((source) => {
              const title = source.originalTitle ?? source.sourceTypeLabel;
              const facts = sourceFacts(source);
              return (
                <li key={source.id} className="course-sources__row">
                  <div className="course-sources__text">
                    {source.url ? (
                      <a href={source.url} target="_blank" rel="noreferrer" className="course-sources__title">
                        {title}
                      </a>
                    ) : (
                      <span className="course-sources__title">{title}</span>
                    )}
                    {facts && <span className="course-sources__meta">{facts}</span>}
                  </div>

                  <CourseSourceDialog courseId={courseId} source={source} sourceTypes={sourceTypes} />
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </StaffPanel>
  );
}
