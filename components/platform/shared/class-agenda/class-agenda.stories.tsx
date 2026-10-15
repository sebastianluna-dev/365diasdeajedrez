import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { CLASS_PHASE } from "@/constants/platform/class-codes.const";
import type { ClassRowData } from "@/components/platform/shared/class-row/class-row.types";
import { CLASSES_NOW, CLASSES_TIME_ZONE, cdmx } from "@/lib/testing/fixtures/classes";
import { ClassAgenda, type ClassAgendaDay } from "./class-agenda.comp";

function row(
  id: string,
  title: string,
  day: string,
  time: string,
  people: string,
  extra: Partial<ClassRowData> = {},
): ClassRowData {
  return {
    id,
    href: `/administracion/clases/${id}`,
    title,
    phase: CLASS_PHASE.UPCOMING,
    startIso: cdmx(day, time).toISOString(),
    durationMin: 60,
    timeZone: CLASSES_TIME_ZONE,
    nowIso: CLASSES_NOW.toISOString(),
    people,
    chips: [],
    ...extra,
  };
}

const WEEK: ClassAgendaDay[] = [
  {
    key: "2026-10-14",
    label: "Hoy · miércoles 14 de octubre",
    isToday: true,
    rows: [
      row(
        "c2",
        "Repaso de la Najdorf: tus dudas",
        "2026-10-14",
        "12:00",
        "GM Profesor Demo · Alumno Demo · Individual",
        {
          phase: CLASS_PHASE.OPEN,
        },
      ),
      row("c3", "Plan de aperturas con blancas", "2026-10-14", "17:00", "GM Profesor Demo · Mateo Ríos · Individual", {
        chips: [{ label: "Sin enlace", icon: "no-link", tone: "warning" }],
        action: { kind: "link", label: "Agregar enlace", href: "/administracion/clases/c3" },
      }),
      row("c4", "Clase de Valentina Cruz", "2026-10-14", "19:00", "GM Profesor Demo · Valentina Cruz · Individual", {
        chips: [{ label: "Sin tema", icon: "no-topic" }],
      }),
    ],
  },
  {
    key: "2026-10-16",
    label: "Viernes 16 de octubre",
    isToday: false,
    rows: [
      row("c8", "Clase de diagnóstico", "2026-10-16", "18:00", "GM Profesor Demo · Andrea López · Individual", {
        chips: [{ label: "Gratis", icon: "free", tone: "success" }],
      }),
    ],
  },
  {
    key: "2026-10-17",
    label: "Sábado 17 de octubre",
    isToday: false,
    rows: [
      row("c5", "Taller de finales de torre", "2026-10-17", "10:00", "GM Profesor Demo · Grupal · 4 de 6 plazas", {
        durationMin: 90,
        chips: [{ label: "1 sin pago", icon: "unpaid", tone: "warning" }],
      }),
    ],
  },
];

const meta = {
  title: "platform/shared/ClassAgenda",
  component: ClassAgenda,
  parameters: {
    docs: {
      description: {
        component: `
Classes by day: a heading per day («Hoy · miércoles 14 de octubre») and its
rows, only the days that have any, a line when none does, and a link at the
foot to the next stretch of days.

Source: \`components/platform/shared/class-agenda/class-agenda.comp.tsx\`.
Reference page: [Components › ClassAgenda](/components/platform/shared/class-agenda) in the docs site.
`,
      },
    },
  },
  args: {
    days: WEEK,
    audience: "staff",
    emptyLine: "No hay clases esta semana.",
    foot: { label: "Ver la semana siguiente", href: "?hasta=2026-10-27" },
  },
  argTypes: {
    days: { control: "object" },
    audience: { control: "inline-radio", options: ["staff", "teacher"] },
    emptyLine: { control: "text" },
    foot: { control: "object" },
  },
  decorators: [
    (Story) => (
      <div className="platform-theme" style={{ background: "var(--platform-bg)", padding: 16 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof ClassAgenda>;

export default meta;
type Story = StoryObj<typeof meta>;

/** The staff's week: today first, in the accent, and two more days with classes. */
export const StaffWeek: Story = { name: "Staff, week" };

/** The teacher's week: their own rows, with what there is to prepare and nothing about money. */
export const TeacherWeek: Story = {
  name: "Teacher, week",
  args: {
    audience: "teacher",
    days: WEEK.map((day) => ({
      ...day,
      rows: day.rows.map((item) => ({
        ...item,
        href: `/profesor/clases/${item.id}`,
        people: item.people.replace("GM Profesor Demo · ", ""),
        chips: item.chips.filter((chip) => chip.icon !== "unpaid"),
        action: undefined,
      })),
    })),
  },
};

/** Today without classes: the day is left out, and the next ones follow. */
export const TodayEmpty: Story = { name: "Today empty", args: { days: WEEK.slice(1) } };

/** Nothing in the stretch: the line, and the foot still offers the next one. */
export const Empty: Story = { args: { days: [] } };
