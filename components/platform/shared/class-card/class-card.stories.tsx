import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { CLASS_PHASE } from "@/constants/platform/class-codes.const";
import { cdmx } from "@/lib/testing/fixtures/classes";
import {
  STUDENT_GROUP_CARD,
  STUDENT_PAST_CARD,
  studentCard,
  studentCardAt,
  studentJoin,
} from "@/lib/testing/fixtures/student-classes";
import { ClassCard, UnscheduledClassCard } from "./class-card.comp";

const meta = {
  title: "platform/shared/ClassCard",
  component: ClassCard,
  parameters: {
    docs: {
      description: {
        component: `
A class as the student's lists draw it: the date as a tile, the phase, the
topic and who it is with, and what they should know at a glance. Featured,
today's or the next class with how to join it; compact, a row of «Próximas»
or «Pasadas». The whole card is the link.

Source: \`components/platform/shared/class-card/class-card.comp.tsx\`.
Reference page: [Components › ClassCard](/components/platform/shared/class-card) in the docs site.
`,
      },
    },
  },
  args: { card: studentCard(), variant: "featured" },
  decorators: [
    (Story) => (
      <div className="platform-theme" style={{ maxWidth: 640 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof ClassCard>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Today's class with its link open: «Enlace abierto», «Entrar a la clase» and «Empieza en 20 min». */
export const FeaturedOpen: Story = { name: "Featured, open" };

/** The next class, days away: when its link opens. */
export const FeaturedUpcoming: Story = {
  name: "Featured, upcoming",
  args: { card: STUDENT_GROUP_CARD },
};

/** The class running: «En vivo» and «Entrar a la clase». */
export const FeaturedInProgress: Story = {
  name: "Featured, in progress",
  args: {
    card: studentCard({
      phase: CLASS_PHASE.IN_PROGRESS,
      nowIso: cdmx("2026-10-14", "12:10").toISOString(),
      join: studentJoin({ phase: CLASS_PHASE.IN_PROGRESS, nowIso: cdmx("2026-10-14", "12:10").toISOString() }),
    }),
  },
};

/** A row of «Próximas»: the workshop, with the classmates. */
export const Compact: Story = { args: { card: STUDENT_GROUP_CARD, variant: "compact" } };

/** A row of «Pasadas»: «Asististe · Grabación · 4 bloques». */
export const CompactPast: Story = {
  name: "Compact, past",
  args: { card: STUDENT_PAST_CARD, variant: "compact" },
};

/** A cancelled class, stepped back in its greys. */
export const CompactCancelled: Story = {
  name: "Compact, cancelled",
  args: {
    card: studentCardAt("2026-10-09", "18:00", 60, CLASS_PHASE.CANCELLED, {
      id: "c7",
      title: "Táctica de la semana",
      join: null,
      cancelled: true,
      visibleBlocks: 0,
    }),
    variant: "compact",
  },
};

/** A class bought without a date yet. */
export const Unscheduled: StoryObj = {
  render: () => <UnscheduledClassCard item={{ paymentId: "p1", label: "de tu pago del 1 de octubre" }} />,
};

/** The old class of a moved seat: «No asististe · tu clase pasó al vie 9 oct», a link to the new one. */
export const Moved: Story = {
  args: {
    card: studentCardAt("2026-10-02", "19:00", 60, CLASS_PHASE.DONE, {
      id: "c11",
      title: "Estructuras de peones",
      past: { attended: false, hasRecording: false },
      moved: { label: "No asististe · tu clase pasó al vie 9 oct", href: "/clases/c12" },
      visibleBlocks: 2,
    }),
    variant: "compact",
  },
};

/** A moved seat that went back to the payment. */
export const MovedBack: Story = {
  name: "Moved back",
  args: {
    card: studentCardAt("2026-10-05", "17:00", 60, CLASS_PHASE.DONE, {
      id: "c9",
      title: "Finales de peones",
      past: { attended: false, hasRecording: false },
      moved: { label: "No asististe · tu clase volvió a tu pago", href: null },
      visibleBlocks: 0,
    }),
    variant: "compact",
  },
};

/** The make-up of a missed class. */
export const MakeUp: Story = {
  name: "Make-up",
  args: {
    card: studentCardAt("2026-10-16", "19:00", 60, CLASS_PHASE.UPCOMING, {
      id: "c12",
      title: "Clase con GM Profesor Demo",
      makeUpLabel: "Es la reposición de tu clase del vie 2 oct.",
      visibleBlocks: 0,
    }),
  },
};

/** A free class ahead, without a link yet. */
export const Free: Story = {
  args: {
    card: studentCardAt("2026-10-16", "18:00", 60, CLASS_PHASE.UPCOMING, {
      id: "c8",
      title: "Clase de diagnóstico",
      join: studentJoin({
        phase: CLASS_PHASE.UPCOMING,
        meetingUrl: null,
        hasLink: false,
        providerLabel: null,
        startIso: cdmx("2026-10-16", "18:00").toISOString(),
        endIso: cdmx("2026-10-16", "19:00").toISOString(),
        visibleFromIso: null,
        untilIso: null,
      }),
      visibleBlocks: 0,
    }),
  },
};
