import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { CLASS_PHASE } from "@/constants/platform/class-codes.const";
import { CLASSES_NOW, CLASSES_TIME_ZONE, cdmx } from "@/lib/testing/fixtures/classes";
import { ClassJoinBar } from "./class-join-bar.comp";

const meta = {
  title: "platform/shared/ClassJoinBar",
  component: ClassJoinBar,
  parameters: {
    docs: {
      description: {
        component: `
«Entrar a la clase» stuck to the bottom of a phone's screen while the link
is open: the join card at its bar density in a fixed strip, only under
1024px. Widen the viewport and it goes.

Source: \`components/platform/shared/class-join-bar/class-join-bar.comp.tsx\`.
Reference page: [Components › ClassJoinBar](/components/platform/shared/class-join-bar) in the docs site.
`,
      },
    },
    viewport: { defaultViewport: "mobile1" },
  },
  args: {
    audience: "student",
    phase: CLASS_PHASE.OPEN,
    meetingUrl: "https://zoom.us/j/11111111111",
    hasLink: true,
    providerLabel: "Zoom",
    startIso: cdmx("2026-10-14", "12:00").toISOString(),
    endIso: cdmx("2026-10-14", "13:00").toISOString(),
    visibleFromIso: cdmx("2026-10-14", "11:30").toISOString(),
    untilIso: cdmx("2026-10-14", "13:30").toISOString(),
    nowIso: CLASSES_NOW.toISOString(),
    timeZone: CLASSES_TIME_ZONE,
  },
  decorators: [
    (Story) => (
      <div className="platform-theme" style={{ minHeight: 240 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof ClassJoinBar>;

export default meta;
type Story = StoryObj<typeof meta>;

/** The link open: the bar with «Entrar a la clase» and «Empieza en 20 min». */
export const Open: Story = {};

/** The class running. */
export const InProgress: Story = {
  name: "In progress",
  args: { phase: CLASS_PHASE.IN_PROGRESS, nowIso: cdmx("2026-10-14", "12:10").toISOString() },
};

/** The teacher's bar. */
export const Teacher: Story = { args: { audience: "teacher" } };
