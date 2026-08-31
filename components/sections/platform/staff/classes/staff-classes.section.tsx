import Link from "next/link";
import { FormField } from "@/components/common/form-field.comp";
import { LocalDateTime } from "@/components/common/local-datetime.comp";
import { PlatformTable, PlatformTableCell, PlatformTableRow } from "@/components/common/platform-table.comp";
import { CLASS_STATUS } from "@/constants/platform/class-codes.const";
import { staffRoutes } from "@/lib/platform-routes";
import type { StaffClassFilters, StaffClassSummary } from "@/services/staff-classes/staff-classes.types";
import "./staff-classes.section.css";

interface StaffClassesSectionProps {
  classes: StaffClassSummary[];
  teachers: { id: string; displayName: string }[];
  filters: StaffClassFilters;
  /** Valores crudos de la URL, para repintar el formulario tal cual. */
  rawFilters: { teacherId?: string; status?: string; from?: string; to?: string; q?: string };
}

const STATUS_LABELS: Record<string, string> = {
  [CLASS_STATUS.SCHEDULED]: "Programadas",
  [CLASS_STATUS.LIVE]: "En vivo",
  [CLASS_STATUS.COMPLETED]: "Terminadas",
  [CLASS_STATUS.CANCELLED]: "Canceladas",
};

/** Vista global de lectura: los filtros van por searchParams, sin estado de cliente. */
export function StaffClassesSection({ classes, teachers, rawFilters }: StaffClassesSectionProps) {
  return (
    <div className="staff-classes">
      <form className="staff-classes__filters" action={staffRoutes.classes}>
        <FormField label="Profesor">
          <select name="teacherId" defaultValue={rawFilters.teacherId ?? ""}>
            <option value="">Todos</option>
            {teachers.map((teacher) => (
              <option key={teacher.id} value={teacher.id}>
                {teacher.displayName}
              </option>
            ))}
          </select>
        </FormField>

        <FormField label="Estado">
          <select name="status" defaultValue={rawFilters.status ?? ""}>
            <option value="">Todos</option>
            {Object.values(CLASS_STATUS).map((code) => (
              <option key={code} value={code}>
                {STATUS_LABELS[code]}
              </option>
            ))}
          </select>
        </FormField>

        <FormField label="Desde">
          <input type="date" name="from" defaultValue={rawFilters.from ?? ""} />
        </FormField>

        <FormField label="Hasta">
          <input type="date" name="to" defaultValue={rawFilters.to ?? ""} />
        </FormField>

        <FormField label="Título">
          <input type="search" name="q" defaultValue={rawFilters.q ?? ""} maxLength={120} />
        </FormField>

        <button type="submit" className="platform-button platform-button_variant_secondary">
          Filtrar
        </button>
      </form>

      <PlatformTable
        columns={[
          "Clase",
          "Profesor",
          "Fecha",
          "Estado",
          { label: "Alumnos", align: "right" },
          { label: "Asistieron", align: "right" },
        ]}
        emptyLabel="Ninguna clase coincide con esos filtros."
        minWidth={880}
      >
        {classes.map((item) => (
          <PlatformTableRow key={item.id}>
            <PlatformTableCell strong>
              <Link href={item.href}>{item.title}</Link>
            </PlatformTableCell>
            <PlatformTableCell>{item.teacherName}</PlatformTableCell>
            <PlatformTableCell>
              <LocalDateTime iso={item.scheduledAtIso} fallback={`${item.dateLabel} · ${item.timeLabel}`} />
            </PlatformTableCell>
            <PlatformTableCell>
              <span className="platform-tag">{item.statusLabel}</span>
            </PlatformTableCell>
            <PlatformTableCell align="right">{item.participantCount}</PlatformTableCell>
            <PlatformTableCell align="right">{item.attendedCount}</PlatformTableCell>
          </PlatformTableRow>
        ))}
      </PlatformTable>
    </div>
  );
}
