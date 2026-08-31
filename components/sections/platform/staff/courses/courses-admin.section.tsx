import Link from "next/link";
import { PlatformTable, PlatformTableCell, PlatformTableRow } from "@/components/common/platform-table.comp";
import { staffRoutes } from "@/lib/platform-routes";
import { listCoursesAdmin } from "@/services/staff-courses/staff-courses.service";
import "./courses-admin.section.css";

export async function CoursesAdminSection() {
  const courses = await listCoursesAdmin();

  return (
    <div className="courses-admin">
      <div className="courses-admin__bar">
        <Link href={staffRoutes.newCourse} className="platform-button">
          Nuevo curso
        </Link>
      </div>

      <PlatformTable
        columns={[
          "Curso",
          "Identificador",
          "Tipo",
          "Estado",
          { label: "Capítulos", align: "right" },
          { label: "Lecciones", align: "right" },
          "Publicado",
        ]}
        emptyLabel="Todavía no hay cursos. Crea el primero en borrador."
        minWidth={900}
      >
        {courses.map((course) => (
          <PlatformTableRow key={course.id}>
            <PlatformTableCell strong>
              <Link href={course.href}>{course.name}</Link>
            </PlatformTableCell>
            <PlatformTableCell>{course.slug}</PlatformTableCell>
            <PlatformTableCell>{course.typeLabel}</PlatformTableCell>
            <PlatformTableCell>
              <span className="platform-tag">{course.statusLabel}</span>
            </PlatformTableCell>
            <PlatformTableCell align="right">{course.chapterCount}</PlatformTableCell>
            <PlatformTableCell align="right">{course.lessonCount}</PlatformTableCell>
            <PlatformTableCell>{course.publishedAtLabel ?? "—"}</PlatformTableCell>
          </PlatformTableRow>
        ))}
      </PlatformTable>
    </div>
  );
}
