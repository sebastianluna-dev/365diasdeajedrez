import { academyWhatsappHref } from "@/constants/platform/academy-contact.const";
import { CLASS_STATUS } from "@/constants/platform/class-codes.const";
import { getPlatformDb } from "@/lib/platform-db/get-platform-db";
import { requireTeacher } from "@/lib/platform-auth/roles";
import { dayRangeIn } from "@/lib/timezone";
import { mapTeacherClassRow, teacherJoinData, teacherPhaseOf } from "@/services/teacher-classes/teacher-classes.mapper";
import { teacherClassSelect, teacherZone, toTeacherSource } from "@/services/teacher-classes/teacher-classes.service";
import { groupTeacherWeek } from "./teacher.mapper";
import type { TeacherDashboard, TeacherProfile } from "./teacher.types";

// Services of the teacher panel. Identity and role ALWAYS through
// requireTeacher() (never an id coming from the client) and the authorisation
// goes inside the `where`: there is no "read and then check".

const WEEK_DAYS = 7;
const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * The panel (PROF-1): the next class with how to join it, the classes that
 * ended and wait to be finalized, and this week by day — all cut in the
 * teacher's zone (D7), the academy's when they have none.
 */
export async function getTeacherDashboard(): Promise<TeacherDashboard> {
  const { teacher } = await requireTeacher();
  const db = getPlatformDb();
  const now = new Date();
  const zone = await teacherZone(teacher.id);
  const timeZone = zone.timeZone;
  const today = dayRangeIn(now, timeZone);
  const weekEnd = new Date(today.start.getTime() + WEEK_DAYS * DAY_MS);
  const notCancelled = { status: { code: { not: CLASS_STATUS.CANCELLED } } } as const;

  const [nextRow, awaitingRows, weekRows, todayCount] = await Promise.all([
    db.class.findFirst({
      where: { teacherId: teacher.id, ...notCancelled, endsAt: { gte: now } },
      select: { ...teacherClassSelect, description: true, meetingProvider: { select: { label: true } } },
      orderBy: { scheduledAt: "asc" },
    }),
    db.class.findMany({
      where: { teacherId: teacher.id, status: { code: CLASS_STATUS.SCHEDULED }, endsAt: { lt: now } },
      select: teacherClassSelect,
      orderBy: { endsAt: "asc" },
    }),
    db.class.findMany({
      where: { teacherId: teacher.id, ...notCancelled, scheduledAt: { gte: today.start, lt: weekEnd } },
      select: teacherClassSelect,
      orderBy: { scheduledAt: "asc" },
    }),
    db.class.count({
      where: { teacherId: teacher.id, ...notCancelled, scheduledAt: { gte: today.start, lt: today.end } },
    }),
  ]);
  const context = { now, timeZone, teacherName: teacher.displayName };
  const next = nextRow
    ? (() => {
        const source = toTeacherSource(nextRow);
        const row = mapTeacherClassRow(source, context);
        return {
          row,
          join: teacherJoinData(
            { ...source, providerLabel: nextRow.meetingProvider?.label ?? null },
            teacherPhaseOf(source, now),
            {
              now,
              timeZone,
              whatsappHref: academyWhatsappHref(`Hola, soy ${teacher.displayName}. Sobre la clase «${row.title}»:`),
            },
          ),
          description: nextRow.description,
        };
      })()
    : null;

  return {
    displayName: teacher.displayName,
    timeZone,
    timeZoneMissing: zone.missing,
    nowIso: now.toISOString(),
    todayCount,
    next,
    awaitingClose: awaitingRows.map((row) => mapTeacherClassRow(toTeacherSource(row), context)),
    week: groupTeacherWeek(
      weekRows.map((row) => mapTeacherClassRow(toTeacherSource(row), context)),
      timeZone,
      now,
    ),
  };
}

export async function getTeacherProfile(): Promise<TeacherProfile> {
  const { teacher, user } = await requireTeacher();
  const db = getPlatformDb();

  const row = await db.teacher.findUniqueOrThrow({
    where: { id: teacher.id },
    select: { displayName: true, title: true, bio: true, photo: true, timezone: true },
  });

  return {
    displayName: row.displayName,
    title: row.title ?? undefined,
    bio: row.bio ?? undefined,
    photo: row.photo ?? undefined,
    timezone: row.timezone ?? undefined,
    email: user.email,
  };
}
