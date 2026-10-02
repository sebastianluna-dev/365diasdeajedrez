import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { CLASS_STATUS } from "@/constants/platform/class-codes.const";
import { platformRoutes } from "@/lib/platform-routes";
import type { ClassSummary } from "@/services/classes/classes.types";
import { ClassCard } from "./class-card.comp";

/**
 * An invented class, scheduled for 8 October 2026 at 18:00 in Mexico City.
 * The labels are the server's text, shown until `LocalDateTime` rewrites the
 * instant in the viewer's own zone; the status label is the catalog's.
 */
const SCHEDULED: ClassSummary = {
  id: "c-101",
  title: "Finales de torres: la posición de Lucena",
  teacherName: "Fernanda Ríos",
  scheduledAtIso: "2026-10-09T00:00:00.000Z",
  dateLabel: "8 de octubre, 2026",
  timeLabel: "18:00 h",
  durationMin: 60,
  statusCode: CLASS_STATUS.SCHEDULED,
  statusLabel: "Programada",
  href: platformRoutes.classDetail("c-101"),
};

const meta = {
  title: "platform/sections/classes/classes-list/ClassCard",
  component: ClassCard,
  parameters: {
    nextjs: { navigation: { pathname: platformRoutes.classes } },
    docs: {
      description: {
        component: `
A class in «Clases», under «Próximas clases» or «Clases pasadas»: the whole
card is the link to the class. Its title and teacher, the date and time in the
viewer's zone with how long it lasts, and a tag with its status, coloured by
the status's code; a cancelled class is dimmed. Invented data.

Source: \`components/platform/sections/classes/classes-list/class-card.comp.tsx\`.
Reference page: [Components › ClassCard](/components/platform/sections/classes/classes-list/class-card) in the docs site.
`,
      },
    },
  },
  args: { classSummary: SCHEDULED },
  argTypes: {
    classSummary: { control: "object", description: "The class as `services/classes` maps it, labels included." },
  },
  // The list of «Clases», one card to a row in the page's column.
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 860 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof ClassCard>;

export default meta;
type Story = StoryObj<typeof meta>;

/** A class still to come, «Programada»: the tag in the accent's wash. */
export const Scheduled: Story = {};

/** A class happening now, «En vivo»: the tag in the danger colour, so it is seen first. */
export const Live: Story = {
  args: {
    classSummary: {
      ...SCHEDULED,
      id: "c-102",
      title: "Táctica: clavadas y desviaciones",
      teacherName: "Mateo Vidal",
      scheduledAtIso: "2026-10-02T23:00:00.000Z",
      dateLabel: "2 de octubre, 2026",
      timeLabel: "17:00 h",
      durationMin: 90,
      statusCode: CLASS_STATUS.LIVE,
      statusLabel: "En vivo",
      href: platformRoutes.classDetail("c-102"),
    },
  },
};

/** A class already given, «Finalizada», as «Clases pasadas» lists it: the tag in green. */
export const Completed: Story = {
  args: {
    classSummary: {
      ...SCHEDULED,
      id: "c-095",
      title: "La Partida de la Ópera, jugada a jugada",
      scheduledAtIso: "2026-09-25T00:00:00.000Z",
      dateLabel: "24 de septiembre, 2026",
      timeLabel: "18:00 h",
      durationMin: 45,
      statusCode: CLASS_STATUS.COMPLETED,
      statusLabel: "Finalizada",
      href: platformRoutes.classDetail("c-095"),
    },
  },
};

/** A cancelled class, «Cancelada»: the whole card dimmed, and the tag left in its neutral grey. */
export const Cancelled: Story = {
  args: {
    classSummary: {
      ...SCHEDULED,
      id: "c-103",
      title: "Repaso de aperturas abiertas",
      teacherName: "Mateo Vidal",
      scheduledAtIso: "2026-10-16T00:00:00.000Z",
      dateLabel: "15 de octubre, 2026",
      timeLabel: "18:00 h",
      statusCode: CLASS_STATUS.CANCELLED,
      statusLabel: "Cancelada",
      href: platformRoutes.classDetail("c-103"),
    },
  },
};
