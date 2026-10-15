import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { CLASS_PHASE } from "@/constants/platform/class-codes.const";
import { CLASSES_NOW, CLASSES_TIME_ZONE, cdmx } from "@/lib/testing/fixtures/classes";
import { popupFormDone } from "@/services/shared/form-state";
import { ClassRow } from "./class-row.comp";
import type { ClassRowData } from "./class-row.types";

const base: ClassRowData = {
  id: "c2",
  href: "/administracion/clases/c2",
  title: "Repaso de la Najdorf: tus dudas",
  phase: CLASS_PHASE.OPEN,
  startIso: cdmx("2026-10-14", "12:00").toISOString(),
  durationMin: 60,
  timeZone: CLASSES_TIME_ZONE,
  nowIso: CLASSES_NOW.toISOString(),
  people: "GM Profesor Demo · Alumno Demo · Individual",
  chips: [],
};

const meta = {
  title: "platform/shared/ClassRow",
  component: ClassRow,
  parameters: {
    docs: {
      description: {
        component: `
One class in a list of the staff or the teacher: the date as a tile with the
hours, the phase, the topic and who is in it, the chips that say what the
reader should know at a glance, and an action. The whole row is the link to
the class (the title, stretched); the action sits above it. A card under
640px.

Source: \`components/platform/shared/class-row/class-row.comp.tsx\`.
Reference page: [Components › ClassRow](/components/platform/shared/class-row) in the docs site.
`,
      },
    },
  },
  args: { row: base, audience: "staff" },
  argTypes: {
    row: { control: "object" },
    audience: { control: "inline-radio", options: ["staff", "teacher"] },
  },
  decorators: [
    (Story) => (
      <div className="platform-theme" style={{ background: "var(--platform-bg)", padding: 16 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof ClassRow>;

export default meta;
type Story = StoryObj<typeof meta>;

/** The staff's row of a class today with its link open: the tile wears the accent. */
export const StaffUpcoming: Story = { name: "Staff, upcoming" };

/** A group class with a seat «Sin pago»: the staff's chips. */
export const StaffUnpaid: Story = {
  name: "Staff, unpaid seat",
  args: {
    row: {
      ...base,
      id: "c5",
      title: "Taller de finales de torre",
      phase: CLASS_PHASE.UPCOMING,
      startIso: cdmx("2026-10-17", "10:00").toISOString(),
      durationMin: 90,
      people: "GM Profesor Demo · Grupal · 4 de 6 plazas",
      chips: [
        { label: "Grupal · 4 de 6 plazas", icon: "group" },
        { label: "1 sin pago", icon: "unpaid", tone: "warning" },
      ],
      action: { kind: "link", label: "Registrar", href: "/administracion/alumnos/u4/pagos" },
    },
  },
};

/** A free diagnosis without a link yet: «Agregar» opens the meeting-link popup through `ClassRowAction`. */
export const StaffFree: Story = {
  name: "Staff, free",
  args: {
    row: {
      ...base,
      id: "c8",
      title: "Clase de diagnóstico",
      phase: CLASS_PHASE.UPCOMING,
      startIso: cdmx("2026-10-16", "18:00").toISOString(),
      people: "GM Profesor Demo · Andrea López · Individual",
      chips: [
        { label: "Gratis", icon: "free", tone: "success" },
        { label: "Sin enlace", icon: "no-link", tone: "warning" },
      ],
      action: {
        kind: "meeting",
        label: "Agregar",
        classId: "c8",
        current: {
          meetingUrl: null,
          visibleFromIso: null,
          startIso: cdmx("2026-10-16", "18:00").toISOString(),
          durationMin: 60,
        },
      },
    },
    serverActions: { setMeeting: async () => popupFormDone("meetingAdded", ["c8"]) },
  },
};

/** A class in progress: «En vivo» beats. */
export const StaffLive: Story = {
  name: "Staff, live",
  args: { row: { ...base, phase: CLASS_PHASE.IN_PROGRESS, nowIso: cdmx("2026-10-14", "12:20").toISOString() } },
};

/** The teacher's row: what there is to prepare, and nothing about money. */
export const TeacherPrepare: Story = {
  name: "Teacher, to prepare",
  args: {
    audience: "teacher",
    row: {
      ...base,
      href: "/profesor/clases/c2",
      people: "Alumno Demo · Individual",
      chips: [
        { label: "2 para preparar", icon: "prepare" },
        { label: "1 para después", icon: "after" },
        { label: "1 en tu guion", icon: "script" },
      ],
    },
  },
};

/** A class that ended and waits for the teacher: «Por finalizar», with the action to do it. */
export const TeacherAwaitingClose: Story = {
  name: "Teacher, awaiting close",
  args: {
    audience: "teacher",
    row: {
      ...base,
      id: "c6",
      href: "/profesor/clases/c6",
      title: "Defensa Caro-Kann: ideas",
      phase: CLASS_PHASE.AWAITING_CLOSE,
      startIso: cdmx("2026-10-12", "17:00").toISOString(),
      people: "Diego Salas · Individual",
      chips: [{ label: "Sin contenido", icon: "no-content" }],
      action: { kind: "link", label: "Finalizar", href: "/profesor/clases/c6?finalizar=1" },
    },
  },
};

/** Cancelled: the neutral tag, and the row still opens the class. */
export const Cancelled: Story = {
  args: {
    row: {
      ...base,
      id: "c7",
      title: "Táctica de la semana",
      phase: CLASS_PHASE.CANCELLED,
      startIso: cdmx("2026-10-09", "18:00").toISOString(),
      people: "GM Profesor Demo · Diego Salas · Individual",
    },
  },
};

/** Under 640px the row is a card: the strip and the phase on top, the rest under them. */
export const Phone: Story = {
  args: { row: { ...base, chips: [{ label: "Sin enlace", icon: "no-link", tone: "warning" }] } },
  globals: { viewport: { value: "mobile1", isRotated: false } },
};
