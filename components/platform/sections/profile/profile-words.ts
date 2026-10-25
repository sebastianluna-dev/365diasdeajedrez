import { STUDY_DAY_TIMEZONE } from "@/constants/platform/timezones.const";
import { changeLabel } from "@/lib/charts/chart-geometry";
import { MONTHS_ES } from "@/lib/format-spanish-date";
import { cumulative } from "@/lib/study-minutes";
import { dayKey } from "@/lib/study-streak";
import type { BotLevelSummary } from "@/services/play/play.types";
import type { ProfileBotRecord, ProfileView } from "@/services/profile/profile.types";
import type { StreakOverview, StudyMonthComparison } from "@/services/study-goal/study-goal.types";

// What «Visión general» says in words (2026-10-25, the owner's «Perfil E2»):
// each chapter of the story opens with a sentence that reads its chart, in
// the second person on one's own profile and in the third on somebody
// else's, and each chart is an image whose label states its data. Pure, so
// every sentence can be read in a test without drawing a page.

/** «tú» on one's own profile, «él o ella» on somebody else's: the verb forms the sentences pick between. */
type Voice = { isOwn: boolean };

const pick = ({ isOwn }: Voice, own: string, theirs: string) => (isOwn ? own : theirs);

/** «1 día», «12 días». */
export const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;

/** «13 oct»: a day in the study day's calendar, the month in three letters. */
export function shortDate(at: Date): string {
  const key = dayKey(at, STUDY_DAY_TIMEZONE);
  return `${Number(key.slice(8, 10))} ${(MONTHS_ES[Number(key.slice(5, 7)) - 1] ?? "").slice(0, 3)}`;
}

/** «6 de julio»: a day key as a date is written in a sentence. */
function longDate(key: string): string {
  return `${Number(key.slice(8, 10))} de ${MONTHS_ES[Number(key.slice(5, 7)) - 1] ?? ""}`;
}

const capitalised = (text: string) => text.charAt(0).toUpperCase() + text.slice(1);

export interface StudyWords {
  eyebrow: string;
  heading: string;
  lead: string;
  /** «Del 1 al 25 de octubre». */
  range: string;
  /** This month's minutes so far. */
  total: number;
  /** «septiembre, a estas alturas, iba en 905». */
  note: string;
  /** The band chart's running totals, its tag and its label. */
  current: number[];
  previous: number[];
  tag: string | null;
  chartLabel: string;
  reads: string;
}

/** The first chapter: this month's minutes of lessons against the last month's. */
export function studyWords(months: StudyMonthComparison, voice: Voice): StudyWords {
  const current = cumulative(months.current.days.map((day) => day.minutes));
  const previous = cumulative(months.previous.days.map((day) => day.minutes));
  const reached = current.length;
  const now = current.at(-1) ?? 0;
  const before = previous[Math.min(reached, previous.length) - 1] ?? 0;
  const whole = previous.at(-1) ?? 0;
  const month = months.current.name;
  const last = months.previous.name;

  let heading: string;
  if (now === 0 && whole === 0) heading = `${capitalised(month)} todavía no tiene minutos de lecciones`;
  else if (whole > 0 && now > whole) heading = `${capitalised(month)} ya rebasó a todo ${last}`;
  else if (now > before) heading = `${capitalised(month)} va por delante de ${last}`;
  else if (now < before) heading = `${capitalised(month)} va por detrás de ${last}`;
  else heading = `${capitalised(month)} va a la par de ${last}`;

  const lead =
    now === 0 && whole === 0
      ? pick(
          voice,
          "Los minutos de las lecciones que termines aparecen aquí.",
          "Aquí aparecen los minutos de las lecciones que termine.",
        )
      : `${pick(voice, "Llevas", "Lleva")} ${plural(now, "minuto", "minutos")} de lecciones en ${plural(reached, "día", "días")}; ${last} completo sumó ${whole}.`;

  return {
    eyebrow: `Estudio · ${month}`,
    heading,
    lead,
    range: reached === 1 ? `El 1 de ${month}` : `Del 1 al ${reached} de ${month}`,
    total: now,
    note: `${last}, a estas alturas, iba en ${before}`,
    current,
    previous,
    tag: changeLabel(now, before),
    chartLabel:
      `Minutos de estudio acumulados: ${now} del 1 al ${reached} de ${month} contra ${before} en los mismos días de ${last}` +
      `${before > 0 ? ` (${changeLabel(now, before)})` : ""}; ${last} cerró con ${whole}.`,
    reads: pick(
      voice,
      "Suma los minutos de las lecciones que terminas cada día; las partidas no cuentan aquí.",
      "Suma los minutos de las lecciones que termina cada día; las partidas no cuentan aquí.",
    ),
  };
}

export interface StreakWords {
  heading: string;
  lead: string;
  /** Days of this week up to today, and how many of them had something. */
  weekDays: number;
  chartLabel: string;
  tag: string | undefined;
  /** The sheet's line under the streak: «Hoy ya estudiaste · la mejor, 19». */
  sheetNote: string;
}

/** The second chapter: the streak and its sixteen weeks. */
export function streakWords(overview: StreakOverview, voice: Voice): StreakWords {
  const { days, studiedToday } = overview.streak;
  const all = overview.weeks.flat();
  const spanDays = all.filter((day) => !day.isFuture).length;
  const weekDays = (overview.weeks.at(-1) ?? []).filter((day) => !day.isFuture).length;
  const first = all[0]?.day ?? "";
  const today = all.find((day) => day.isToday)?.day ?? all.at(-1)?.day ?? "";

  let heading: string;
  if (days === 0) heading = "Sin racha por ahora";
  else if (studiedToday) heading = `${plural(days, "día", "días")} seguidos, y hoy ya cuenta`;
  else
    heading = `${plural(days, "día", "días")} seguidos; ${pick(voice, "hoy puedes sumar uno", "hoy aún no estudia")}`;

  const studied = `${pick(voice, "Estudiaste", "Estudió")} ${overview.daysStudied} de los últimos ${spanDays} días`;
  const lead =
    overview.bestStreak > 0
      ? `${studied}; ${pick(voice, "tu", "su")} mejor racha fue de ${plural(overview.bestStreak, "día", "días")}.`
      : pick(
          voice,
          "Una lección, un ejercicio o una clase hoy la empiezan.",
          "Todavía no tiene días de estudio en estas semanas.",
        );

  const todayLine = studiedToday
    ? pick(voice, "Hoy ya estudiaste", "Hoy ya estudió")
    : pick(voice, "Hoy aún no estudias", "Hoy aún no estudia");

  return {
    heading,
    lead,
    weekDays,
    tag: days > 0 ? plural(days, "día", "días") : undefined,
    chartLabel:
      `${pick(voice, "Tus", "Sus")} últimas ${overview.weeks.length} semanas, del ${longDate(first)} al ${longDate(today)}: ` +
      `${pick(voice, "estudiaste", "estudió")} ${plural(overview.daysStudied, "día", "días")}; ` +
      `${pick(voice, "tu", "su")} racha actual es de ${plural(days, "día", "días")} y la mejor, de ${overview.bestStreak}.`,
    sheetNote: overview.bestStreak > 0 ? `${todayLine} · la mejor, ${overview.bestStreak}` : todayLine,
  };
}

export interface PlayWords {
  heading: string;
  lead: string;
  /** Games finished against the bots. */
  finished: number;
  /** The share of them won, to one decimal; null with none finished. */
  winShare: number | null;
  /** The level's points for the line chart: the last ten. */
  points: { label: string; value: number }[];
  lineLabel: string;
  /** The sheet's line under the level. */
  levelNote: string;
  barsLabel: string;
  barsReads: string;
}

/** The third chapter: the level against bots, the record and the record against each bot. */
export function playWords(
  level: BotLevelSummary,
  record: ProfileView["record"],
  bots: readonly ProfileBotRecord[],
  voice: Voice,
  { window, minimum }: { window: number; minimum: number },
): PlayWords {
  const finished = record.wins + record.losses + record.draws;
  const series = level.series.slice(-window);
  const points = series.map((point) => ({ label: shortDate(point.at), value: point.level }));
  const firstPoint = points[0];
  const change = level.level !== null && firstPoint ? level.level - firstPoint.value : 0;
  const yours = pick(voice, "Tu", "Su");

  let heading: string;
  if (level.level === null)
    heading =
      finished === 0
        ? "Todavía sin partidas contra los bots"
        : `${yours} nivel contra los bots aparece a las ${minimum} partidas`;
  else if (points.length < 2 || change === 0) heading = `${yours} nivel contra los bots está en ≈ ${level.level}`;
  else heading = `${yours} nivel contra los bots ${change > 0 ? "subió" : "bajó"} a ≈ ${level.level}`;

  const games = `${plural(record.wins, "ganada", "ganadas")} de ${plural(finished, "partida terminada", "partidas terminadas")}`;
  let lead: string;
  if (finished === 0 && record.open === 0)
    lead = pick(
      voice,
      "Las partidas que juegues contra los bots aparecen aquí.",
      "Cuando juegue contra los bots, sus partidas aparecen aquí.",
    );
  else if (level.level !== null && firstPoint && points.length >= 2)
    lead = `${change >= 0 ? "+" : "−"}${Math.abs(change)} desde el ${firstPoint.label}, con ${games}.`;
  else lead = `${capitalised(games)}${record.open > 0 ? ` y ${plural(record.open, "en curso", "en curso")}` : ""}.`;

  const missing = minimum - level.sampleSize;
  const levelNote =
    level.level !== null
      ? `Aproximado, sobre ${pick(voice, "tus", "sus")} últimas ${Math.min(level.sampleSize, window)} partidas`
      : level.sampleSize === 0
        ? `Aparece después de ${minimum} partidas terminadas contra bots`
        : `Faltan ${plural(missing, "partida terminada", "partidas terminadas")} para calcularlo`;

  const open = bots.find((bot) => bot.open > 0);
  return {
    heading,
    lead,
    finished,
    winShare: finished === 0 ? null : Math.round((record.wins / finished) * 1000) / 10,
    points,
    lineLabel:
      `Nivel contra bots después de cada una de ${pick(voice, "tus", "sus")} últimas ${plural(points.length, "partida", "partidas")}: ` +
      `${points.map((point) => `${point.label} ≈ ${point.value}`).join(", ")}.`,
    levelNote,
    barsLabel: `Partidas contra cada bot: ${bots
      .map(
        (bot) =>
          `${bot.name} (${bot.elo}) ${bot.wins + bot.losses + bot.draws + bot.open}: ${plural(bot.wins, "ganada", "ganadas")}, ` +
          `${plural(bot.losses, "perdida", "perdidas")}, ${bot.draws} tablas${bot.open > 0 ? `, ${bot.open} en curso` : ""}`,
      )
      .join("; ")}.`,
    barsReads: open
      ? `La altura son las partidas contra cada bot; la de ${open.name} va resaltada: ${pick(voice, "tienes", "tiene")} una partida abierta con ese bot.`
      : "La altura son las partidas contra cada bot.",
  };
}
