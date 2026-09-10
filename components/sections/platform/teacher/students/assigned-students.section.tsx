import Link from "next/link";
import { FormField } from "@/components/common/form-field.comp";
import { LocalDateTime } from "@/components/common/local-datetime.comp";
import { PlatformTable, PlatformTableCell, PlatformTableRow } from "@/components/common/platform-table.comp";
import { teacherRoutes } from "@/lib/platform-routes";
import { getAssignedStudents } from "@/services/teacher-students/teacher-students.service";
import "./assigned-students.section.css";

interface AssignedStudentsSectionProps {
  /** Search by name or email; comes from searchParams and filters in the `where`. */
  query?: string;
}

export async function AssignedStudentsSection({ query }: AssignedStudentsSectionProps) {
  const students = await getAssignedStudents(query);

  return (
    <div className="assigned-students">
      {/* GET form: the filter lives in the URL, not in client state. */}
      <form className="assigned-students__search" action={teacherRoutes.students}>
        <FormField label="Buscar alumno">
          <input type="search" name="q" defaultValue={query ?? ""} placeholder="Nombre o email" maxLength={120} />
        </FormField>
        <button type="submit" className="platform-button platform-button_variant_secondary">
          Buscar
        </button>
      </form>

      <PlatformTable
        columns={["Alumno", "Email", "Asignado desde", "Próxima clase conmigo", "Última actividad"]}
        emptyLabel={
          query
            ? "Ningún alumno tuyo coincide con esa búsqueda."
            : "Todavía no tienes alumnos asignados. Los asigna el equipo de administración."
        }
        minWidth={880}
      >
        {students.map((student) => (
          <PlatformTableRow key={student.id}>
            <PlatformTableCell strong>
              <Link href={student.href}>{student.displayName}</Link>
            </PlatformTableCell>
            <PlatformTableCell>{student.email}</PlatformTableCell>
            <PlatformTableCell>
              <LocalDateTime iso={student.assignedAtIso} fallback={student.assignedAtLabel} withTime={false} />
            </PlatformTableCell>
            <PlatformTableCell>{student.nextClassLabel ?? "—"}</PlatformTableCell>
            <PlatformTableCell>
              {student.lastActivityIso ? (
                <LocalDateTime iso={student.lastActivityIso} fallback={student.lastActivityLabel ?? ""} withTime={false} />
              ) : (
                "Sin actividad"
              )}
            </PlatformTableCell>
          </PlatformTableRow>
        ))}
      </PlatformTable>
    </div>
  );
}
