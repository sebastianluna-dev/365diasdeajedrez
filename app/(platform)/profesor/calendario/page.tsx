import type { Metadata } from "next";
import { ClassCalendar } from "@/components/platform/sections/teacher/class-calendar/class-calendar.comp";
import {
  CALENDAR_SAMPLE_CLASSES,
  CALENDAR_SAMPLE_NOW,
  CALENDAR_SAMPLE_ZONE,
} from "@/components/platform/sections/teacher/class-calendar/class-calendar.sample";
import { PlatformNotice } from "@/components/platform/shared/platform-notice/platform-notice.comp";
import { requireTeacher } from "@/lib/platform-auth/roles";

export const metadata: Metadata = { title: "Calendario" };

/** «Calendario» (2026-10-19, front-only): the teacher's classes by day, week and month, on a sample week. */
export default async function TeacherCalendarPage() {
  await requireTeacher();
  return (
    <div className="platform-page platform-page_width_full">
      {/* The bar says «Calendario» and carries the calendar's controls. */}
      <header className="platform-page__head platform-page__head_display_bar">
        <h1 className="platform-page__title">Calendario</h1>
      </header>
      <PlatformNotice
        variant="info"
        message="Vista previa: estas clases son de ejemplo. Pronto verás aquí las que te asigna administración."
      />
      <ClassCalendar classes={CALENDAR_SAMPLE_CLASSES} timeZone={CALENDAR_SAMPLE_ZONE} nowIso={CALENDAR_SAMPLE_NOW} />
    </div>
  );
}
