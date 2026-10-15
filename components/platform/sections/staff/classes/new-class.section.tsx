import { createClass } from "@/services/staff-classes/staff-classes.actions";
import type { NewClassDefaults, SchedulableStudent } from "@/services/staff-classes/staff-classes.types";
import { loadTeacherBusy } from "@/services/staff-payments/staff-payments.actions";
import type { TeacherOption } from "@/services/staff-payments/staff-payments.types";
import { NewClassForm } from "./new-class-form/new-class-form.comp";

interface NewClassSectionProps {
  defaults: NewClassDefaults;
  teachers: TeacherOption[];
  students: SchedulableStudent[];
  timeZone: string;
  nowIso: string;
}

/** «Crear clase» (ADM-3): the Server Component that hands the form its actions. */
export function NewClassSection({ defaults, teachers, students, timeZone, nowIso }: NewClassSectionProps) {
  return (
    <NewClassForm
      defaults={defaults}
      teachers={teachers}
      students={students}
      timeZone={timeZone}
      nowIso={nowIso}
      createClass={createClass}
      loadTeacherBusy={loadTeacherBusy}
    />
  );
}
