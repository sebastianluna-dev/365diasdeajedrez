import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { CLASS_PHASE } from "@/constants/platform/class-codes.const";
import { STUDENT_PAST_CARD, STUDENT_PLAIN_PAST_CARD, studentCardAt } from "@/lib/testing/fixtures/student-classes";
import { PastClassCard } from "./past-class-card.comp";

const meta = {
  title: "platform/shared/PastClassCard",
  component: PastClassCard,
  parameters: {
    docs: {
      description: {
        component: `
A class once it is over and counts as finished: «Asististe», the hours, the
topic, «Finalizada · con …», the summary, «Grabación», how many blocks and
«Ver la clase». The board of the class's first position, game or lesson
leads the card when the class has one; without chess, the same card without
it. A free class says «Gratis»; which payment a paid one came from, never.

Source: \`components/platform/shared/past-class-card/past-class-card.comp.tsx\`.
Reference page: [Components › PastClassCard](/components/platform/shared/past-class-card) in the docs site.
`,
      },
    },
  },
  args: { card: STUDENT_PAST_CARD },
  decorators: [
    (Story) => (
      <div className="platform-theme" style={{ maxWidth: 680, padding: 16 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof PastClassCard>;

export default meta;
type Story = StoryObj<typeof meta>;

/** With chess: the board of the Opera game, «Asististe», the summary, «Grabación» and «4 bloques». */
export const WithBoard: Story = { name: "With board" };

/** Without chess or summary: the same card without the board. */
export const WithoutBoard: Story = { name: "Without board", args: { card: STUDENT_PLAIN_PAST_CARD } };

/** A free class: «Asististe» and «Gratis». */
export const Free: Story = {
  args: {
    card: studentCardAt("2026-08-16", "12:00", 60, CLASS_PHASE.DONE, {
      id: "c-free",
      title: "Repaso de aperturas",
      visibleBlocks: 0,
      isFree: true,
      past: { attended: true, hasRecording: false, summary: null, board: null },
    }),
  },
};

/** The old class of a moved seat: «No asististe» and «tu clase pasó al vie 9 oct», a link to the new one. */
export const Moved: Story = {
  args: {
    card: studentCardAt("2026-10-02", "19:00", 60, CLASS_PHASE.DONE, {
      id: "c11",
      title: "Estructuras de peones",
      past: { attended: false, hasRecording: false, summary: null, board: null },
      moved: { label: "No asististe · tu clase pasó al vie 9 oct", href: "/clases/c12" },
      visibleBlocks: 2,
    }),
  },
};

/** A cancelled class that already passed: «Cancelada», stepped back. */
export const Cancelled: Story = {
  args: {
    card: studentCardAt("2026-10-09", "18:00", 60, CLASS_PHASE.CANCELLED, {
      id: "c7",
      title: "Táctica de la semana",
      join: null,
      cancelled: true,
      visibleBlocks: 0,
    }),
  },
};

/** On a phone: the board goes on top of the card. */
export const Phone: Story = { globals: { viewport: { value: "mobile1", isRotated: false } } };
