import Link from "next/link";
import { FormField } from "@/components/platform/shared/form-field.comp";
import { LocalDateTime } from "@/components/platform/shared/local-datetime.comp";
import { PlatformTable, PlatformTableCell, PlatformTableRow } from "@/components/platform/shared/platform-table.comp";
import { staffRoutes } from "@/lib/platform-routes";
import { listStudents } from "@/services/staff-students/staff-students.service";
import "./students-table.section.css";

interface StudentsTableSectionProps {
  query?: string;
}

export async function StudentsTableSection({ query }: StudentsTableSectionProps) {
  const students = await listStudents(query);

  return (
    <div className="students-table">
      <div className="students-table__bar">
        {/* GET: the filter lives in the URL, no client state. */}
        <form className="students-table__search" action={staffRoutes.students}>
          <FormField label="Buscar">
            <input type="search" name="q" defaultValue={query ?? ""} placeholder="Nombre o email" maxLength={120} />
          </FormField>
          <button type="submit" className="platform-button platform-button_variant_secondary">
            Buscar
          </button>
        </form>

        <Link href={staffRoutes.newStudent} className="platform-button">
          Registrar alumno
        </Link>
      </div>

      <PlatformTable
        columns={["Nombre", "Email", "Acceso", "Profesor activo", "Último acceso"]}
        emptyLabel={query ? "Ninguna cuenta coincide con esa búsqueda." : "Todavía no hay cuentas registradas."}
        minWidth={860}
      >
        {students.map((student) => (
          <PlatformTableRow key={student.id}>
            <PlatformTableCell strong>
              <Link href={student.href}>{student.displayName}</Link>
            </PlatformTableCell>
            <PlatformTableCell>{student.email}</PlatformTableCell>
            <PlatformTableCell>
              {student.hasPassword ? (
                "Con contraseña"
              ) : (
                <span className="platform-tag platform-tag_variant_accent">Sin contraseña</span>
              )}
            </PlatformTableCell>
            <PlatformTableCell>{student.activeTeacherName ?? "Sin asignar"}</PlatformTableCell>
            <PlatformTableCell>
              {student.lastLoginAtIso ? (
                <LocalDateTime iso={student.lastLoginAtIso} fallback={student.lastLoginAtLabel ?? ""} withTime={false} />
              ) : (
                "Nunca"
              )}
            </PlatformTableCell>
          </PlatformTableRow>
        ))}
      </PlatformTable>
    </div>
  );
}
