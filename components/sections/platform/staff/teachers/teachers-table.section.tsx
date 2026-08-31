import Link from "next/link";
import { PlatformTable, PlatformTableCell, PlatformTableRow } from "@/components/common/platform-table.comp";
import { staffRoutes } from "@/lib/platform-routes";
import { listTeachers } from "@/services/staff-teachers/staff-teachers.service";
import "./teachers-table.section.css";

export async function TeachersTableSection() {
  const teachers = await listTeachers();

  return (
    <div className="teachers-table">
      <div className="teachers-table__bar">
        <Link href={staffRoutes.newTeacher} className="platform-button">
          Registrar profesor
        </Link>
      </div>

      <PlatformTable
        columns={[
          "Profesor",
          "Título",
          "Email",
          "Estado",
          { label: "Alumnos activos", align: "right" },
          { label: "Clases", align: "right" },
        ]}
        emptyLabel="Todavía no hay profesores registrados."
        minWidth={860}
      >
        {teachers.map((teacher) => (
          <PlatformTableRow key={teacher.id}>
            <PlatformTableCell strong>
              <Link href={teacher.href}>{teacher.displayName}</Link>
            </PlatformTableCell>
            <PlatformTableCell>{teacher.title ?? "—"}</PlatformTableCell>
            <PlatformTableCell>{teacher.email}</PlatformTableCell>
            <PlatformTableCell>
              <span className={`platform-tag${teacher.isActive ? " platform-tag_variant_accent" : ""}`}>
                {teacher.isActive ? "Activo" : "Desactivado"}
              </span>
            </PlatformTableCell>
            <PlatformTableCell align="right">{teacher.activeStudentCount}</PlatformTableCell>
            <PlatformTableCell align="right">{teacher.classCount}</PlatformTableCell>
          </PlatformTableRow>
        ))}
      </PlatformTable>
    </div>
  );
}
