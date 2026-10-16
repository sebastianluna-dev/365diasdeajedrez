import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { CLASS_PHASE } from "@/constants/platform/class-codes.const";
import { cdmx } from "@/lib/testing/fixtures/classes";
import { STUDENT_GROUP_CARD, studentCard, studentCardAt, studentJoin } from "@/lib/testing/fixtures/student-classes";
import { ClassTicket } from "./class-ticket.comp";

const meta = {
  title: "platform/shared/ClassTicket",
  component: ClassTicket,
  parameters: {
    docs: {
      description: {
        component: `
An upcoming class as a boarding pass: the stub with the day, the hours and
how long it lasts, the perforation, and the class — its phase and how long
until it starts, the topic, «Profesor», «Sala», «Tipo» and the classmates —,
with «Entrar a la clase» and the link to copy while the link is open, «Ver la
clase» before, and how many things there are to prepare. Never the class's
content nor which payment it belongs to. Today's stub is tinted; under 640px
the ticket folds with the stub on top.

Source: \`components/platform/shared/class-ticket/class-ticket.comp.tsx\`.
Reference page: [Components › ClassTicket](/components/platform/shared/class-ticket) in the docs site.
`,
      },
    },
  },
  args: { card: studentCard() },
  decorators: [
    (Story) => (
      <div className="platform-theme" style={{ maxWidth: 820, padding: 16 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof ClassTicket>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Today's class with its link open: the tinted stub, «Enlace abierto», «Empieza en 20 min», «Entrar a la clase», the link to copy and «2 para preparar». */
export const Open: Story = {};

/** A later day's group class: the neutral stub, «El enlace se abre a las 09:30», the classmates' initials and «Ver la clase». */
export const LaterGroup: Story = { name: "Later, group", args: { card: STUDENT_GROUP_CARD } };

/** The class running: «En vivo», «La clase ya empezó» and «Entrar a la clase». */
export const InProgress: Story = {
  name: "In progress",
  args: {
    card: studentCard({
      phase: CLASS_PHASE.IN_PROGRESS,
      nowIso: cdmx("2026-10-14", "12:10").toISOString(),
      join: studentJoin({ phase: CLASS_PHASE.IN_PROGRESS, nowIso: cdmx("2026-10-14", "12:10").toISOString() }),
    }),
  },
};

/** Later today, before the link opens: the countdown ticks and asks for the page again when the link opens. */
export const WaitingToday: Story = {
  name: "Waiting, today",
  args: {
    card: studentCardAt("2026-10-14", "19:00", 90, CLASS_PHASE.UPCOMING, {
      id: "c3",
      title: "Clase con GM Profesor Demo",
      visibleBlocks: 0,
    }),
  },
};

/** No link yet: «Administración agregará el enlace», «Sala» «Por confirmar», and a free make-up. */
export const NoLinkMakeUp: Story = {
  name: "No link, make-up",
  args: {
    card: studentCardAt("2026-10-16", "18:00", 60, CLASS_PHASE.UPCOMING, {
      id: "c8",
      title: "Clase de reposición",
      makeUpLabel: "Es la reposición de tu clase del vie 2 oct.",
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

/** A cancelled class ahead: its hours struck through, «Cancelada», no way in. */
export const Cancelled: Story = {
  args: {
    card: studentCardAt("2026-10-16", "18:00", 60, CLASS_PHASE.CANCELLED, {
      id: "c7",
      title: "Táctica de la semana",
      join: null,
      cancelled: true,
      visibleBlocks: 0,
    }),
  },
};

/** On a phone, folded: the stub on top and the perforation across; with the page's bar to join, «Ver la clase» takes the button's place. */
export const Phone: Story = {
  args: { withJoinBar: true },
  globals: { viewport: { value: "mobile1", isRotated: false } },
};
