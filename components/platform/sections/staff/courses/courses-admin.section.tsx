import Image from "next/image";
import Link from "next/link";
import { EmptyState } from "@/components/platform/shared/empty-state/empty-state.comp";
import { PlatformNotice } from "@/components/platform/shared/platform-notice/platform-notice.comp";
import { ChevronIcon } from "@/components/icons/chevron-icon.comp";
import { SearchIcon } from "@/components/icons/search-icon.comp";
import { COURSE_STATUS } from "@/constants/platform/course-codes.const";
import { STAFF_ERROR_MESSAGES } from "@/constants/platform/staff-messages.const";
import { staffRoutes } from "@/lib/platform-routes";
import { isDisplayableImage } from "@/lib/remote-image";
import {
  listAuthors,
  listContentTypes,
  listCoursesAdmin,
  listLevels,
} from "@/services/staff-courses/staff-courses.service";
import { AuthorsManager } from "./authors-manager/authors-manager.comp";
import { NewCourse } from "./new-course/new-course.comp";
import { StaffEditorHead } from "./staff-editor.comp";
import "./courses-admin.section.css";

interface CoursesAdminSectionProps {
  /** What is searched and what it is filtered by; the three come from the URL. */
  query?: string;
  status?: string;
  /** Slug of the level the list is narrowed to; absent = every level. */
  level?: string;
  /** What `createCourse` bounced back with, from `?error=`: its dialog lives here. */
  errorCode?: string;
}

/** The status filters, with "Todos" first. Empty `status` = all. */
const FILTERS: { label: string; status?: string }[] = [
  { label: "Todos" },
  { label: "Publicados", status: COURSE_STATUS.PUBLISHED },
  { label: "Borradores", status: COURSE_STATUS.DRAFT },
  { label: "Archivados", status: COURSE_STATUS.ARCHIVED },
];

/** "Intermedio", "Intermedio–Avanzado", "—": the stretch a course is aimed at. */
function levelRange(names: string[]): string {
  const first = names[0];
  const last = names[names.length - 1];
  if (!first || !last) return "—";
  return first === last ? first : `${first}–${last}`;
}

/** 40 px thumbnail: the frame is painted even when there is no cover. */
const COVER_SIZES = "44px";

/** The catalog's address with one filter changed and the other two kept. */
function filterHref({ status, query, level }: { status?: string; query?: string; level?: string }): string {
  const params = new URLSearchParams();
  if (status) params.set("estado", status);
  if (level) params.set("nivel", level);
  if (query) params.set("q", query);
  const search = params.toString();
  return search ? `${staffRoutes.courses}?${search}` : staffRoutes.courses;
}

export async function CoursesAdminSection({ query, status, level, errorCode }: CoursesAdminSectionProps) {
  // The content types feed the "Nuevo curso" dialog, the authors theirs and the
  // levels the filter; none depends on the listing: read together, the page
  // waits for the slowest one, not for the four.
  const [{ courses, chapterCount, lessonCount }, contentTypes, authors, levels] = await Promise.all([
    listCoursesAdmin({ query, status, level }),
    listContentTypes(),
    listAuthors(),
    listLevels(),
  ]);
  const isFiltered = Boolean(query) || Boolean(status) || Boolean(level);
  const errorMessage = errorCode ? (STAFF_ERROR_MESSAGES[errorCode] ?? STAFF_ERROR_MESSAGES.invalid) : undefined;

  return (
    <div className="courses-admin">
      <StaffEditorHead
        title="Cursos"
        level="root"
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
              {/* The active filters travel with the search so they are not lost when searching. */}
              {status && <input type="hidden" name="estado" value={status} />}
              {level && <input type="hidden" name="nivel" value={level} />}
            </form>

            {/* The authors have no page of their own: they are managed from here. */}
            <AuthorsManager authors={authors} />

            <NewCourse contentTypes={contentTypes} />
          </>
        }
      />

      {errorMessage && <PlatformNotice message={errorMessage} />}

      <div className="courses-admin__bar">
        <div className="courses-admin__filters">
          {FILTERS.map((filter) => {
            const isActive = (filter.status ?? "") === (status ?? "");
            return (
              <Link
                key={filter.label}
                href={filterHref({ status: filter.status, query, level })}
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

      {/* The levels are a second row and not a third group of the bar: the two
          filters are read one under the other, and the row says which is which. */}
      <nav className="courses-admin__levels" aria-label="Filtrar cursos por nivel">
        <span className="courses-admin__levels-label">Nivel</span>

        <Link
          href={filterHref({ status, query })}
          aria-current={level ? undefined : "page"}
          className={`courses-admin__filter${level ? "" : " courses-admin__filter_state_active"}`}
        >
          Todos
        </Link>

        {levels.map((option) => {
          const isActive = option.slug === level;
          return (
            <Link
              key={option.slug}
              href={filterHref({ status, query, level: option.slug })}
              aria-current={isActive ? "page" : undefined}
              title={`Elo ${option.eloRange}`}
              className={`courses-admin__filter${isActive ? " courses-admin__filter_state_active" : ""}`}
            >
              {option.name}
            </Link>
          );
        })}
      </nav>

      {courses.length === 0 ? (
        <EmptyState
          title={isFiltered ? "Ningún curso coincide" : "Todavía no hay cursos"}
          description={
            isFiltered
              ? "Prueba con otra búsqueda o quita los filtros de estado y nivel."
              : "Crea el primero: nace en borrador y no se ve hasta que lo publiques."
          }
        />
      ) : (
        <div className="courses-admin__table">
          <div className="courses-admin__head" aria-hidden="true">
            <span>Curso</span>
            <span>Contenido</span>
            <span>Nivel</span>
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

                  {/* What it teaches, by its short names: "Aperturas", "Cálculo"… */}
                  <span className="courses-admin__tags">
                    {course.contentTypeLabels.map((label) => (
                      <span key={label} className="platform-tag">
                        {label}
                      </span>
                    ))}
                  </span>

                  {/* Who it is for. The levels of a course are a stretch of the
                      scale, so the ends say it: "Intermedio–Avanzado". */}
                  <span className="courses-admin__level">{levelRange(course.levelNames)}</span>

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
