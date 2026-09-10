import Image from "next/image";
import Link from "next/link";
import { EmptyState } from "@/components/platform/shared/empty-state.comp";
import { ChevronIcon } from "@/components/icons/chevron-icon.comp";
import { SearchIcon } from "@/components/icons/search-icon.comp";
import { COURSE_STATUS } from "@/constants/platform/course-codes.const";
import { staffRoutes } from "@/lib/platform-routes";
import { isDisplayableImage } from "@/lib/remote-image";
import { listCoursesAdmin } from "@/services/staff-courses/staff-courses.service";
import { StaffEditorHead } from "./staff-editor.comp";
import "./courses-admin.section.css";

interface CoursesAdminSectionProps {
  /** What is searched and the status filtered by; both come from the URL. */
  query?: string;
  status?: string;
}

/** The status filters, with "Todos" first. Empty `status` = all. */
const FILTERS: { label: string; status?: string }[] = [
  { label: "Todos" },
  { label: "Publicados", status: COURSE_STATUS.PUBLISHED },
  { label: "Borradores", status: COURSE_STATUS.DRAFT },
  { label: "Archivados", status: COURSE_STATUS.ARCHIVED },
];

/** 40 px thumbnail: the frame is painted even when there is no cover. */
const COVER_SIZES = "44px";

function filterHref(status: string | undefined, query: string | undefined): string {
  const params = new URLSearchParams();
  if (status) params.set("estado", status);
  if (query) params.set("q", query);
  const search = params.toString();
  return search ? `${staffRoutes.courses}?${search}` : staffRoutes.courses;
}

export async function CoursesAdminSection({ query, status }: CoursesAdminSectionProps) {
  const { courses, chapterCount, lessonCount } = await listCoursesAdmin({ query, status });
  const isFiltered = Boolean(query) || Boolean(status);

  return (
    <div className="courses-admin">
      <StaffEditorHead
        title="Cursos"
        description="Los cursos nacen en borrador y sólo se ven en la plataforma al publicarlos."
        actions={
          <>
            {/* An ordinary GET: the search stays in the URL, so it can be shared
                and the back button undoes it. */}
            <form className="courses-admin__search" action={staffRoutes.courses}>
              <SearchIcon className="courses-admin__search-icon" />
              <input
                type="search"
                name="q"
                defaultValue={query ?? ""}
                className="courses-admin__search-input"
                placeholder="Buscar curso o identificador"
                aria-label="Buscar curso o identificador"
              />
              {/* The active status travels with the search so it is not lost when searching. */}
              {status && <input type="hidden" name="estado" value={status} />}
            </form>

            <Link href={staffRoutes.newCourse} className="platform-button">
              Nuevo curso
            </Link>
          </>
        }
      />

      <div className="courses-admin__bar">
        <div className="courses-admin__filters">
          {FILTERS.map((filter) => {
            const isActive = (filter.status ?? "") === (status ?? "");
            return (
              <Link
                key={filter.label}
                href={filterHref(filter.status, query)}
                aria-current={isActive ? "page" : undefined}
                className={`courses-admin__filter${isActive ? " courses-admin__filter_state_active" : ""}`}
              >
                {filter.label}
              </Link>
            );
          })}
        </div>

        <p className="courses-admin__totals">
          <strong>{courses.length}</strong> {courses.length === 1 ? "curso" : "cursos"}
          <span className="courses-admin__dot" aria-hidden="true" />
          <strong>{chapterCount}</strong> {chapterCount === 1 ? "capítulo" : "capítulos"}
          <span className="courses-admin__dot" aria-hidden="true" />
          <strong>{lessonCount}</strong> {lessonCount === 1 ? "lección" : "lecciones"}
        </p>
      </div>

      {courses.length === 0 ? (
        <EmptyState
          title={isFiltered ? "Ningún curso coincide" : "Todavía no hay cursos"}
          description={
            isFiltered
              ? "Prueba con otra búsqueda o quita el filtro de estado."
              : "Crea el primero: nace en borrador y no se ve hasta que lo publiques."
          }
        />
      ) : (
        <div className="courses-admin__table">
          <div className="courses-admin__head" aria-hidden="true">
            <span>Curso</span>
            <span>Tipo</span>
            <span>Estado</span>
            <span className="courses-admin__number">Capítulos</span>
            <span className="courses-admin__number">Lecciones</span>
            <span>Publicado</span>
            <span />
          </div>

          <ul className="courses-admin__rows">
            {courses.map((course) => (
              <li key={course.id}>
                {/* The whole ROW is the link: in a seven-column table, forcing the
                    user to aim at the name is asking for marksmanship. */}
                <Link href={course.href} className="courses-admin__row">
                  <span className="courses-admin__course">
                    <span className="courses-admin__cover">
                      {isDisplayableImage(course.cover) && (
                        <Image
                          src={course.cover}
                          alt=""
                          fill
                          sizes={COVER_SIZES}
                          className="courses-admin__cover-image"
                        />
                      )}
                    </span>
                    <span className="courses-admin__names">
                      <span className="courses-admin__name">{course.name}</span>
                      <span className="courses-admin__slug">{course.slug}</span>
                    </span>
                  </span>

                  <span className="courses-admin__cell">{course.typeLabel}</span>

                  <span className="courses-admin__cell">
                    <span
                      className={`courses-admin__status courses-admin__status_state_${course.statusCode.toLowerCase()}`}
                    >
                      {course.statusLabel}
                    </span>
                  </span>

                  <span className="courses-admin__cell courses-admin__number">{course.chapterCount}</span>
                  <span className="courses-admin__cell courses-admin__number">{course.lessonCount}</span>
                  <span className="courses-admin__cell">{course.publishedAtLabel ?? "—"}</span>

                  <span className="courses-admin__chevron" aria-hidden="true">
                    <ChevronIcon />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
