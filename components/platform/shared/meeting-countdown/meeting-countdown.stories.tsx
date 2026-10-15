import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { CLASSES_NOW, CLASSES_TIME_ZONE, cdmx } from "@/lib/testing/fixtures/classes";
import { MeetingCountdown } from "./meeting-countdown.comp";

const NOON = {
  startIso: cdmx("2026-10-14", "12:00").toISOString(),
  endIso: cdmx("2026-10-14", "13:00").toISOString(),
  visibleFromIso: cdmx("2026-10-14", "11:30").toISOString(),
  untilIso: cdmx("2026-10-14", "13:30").toISOString(),
  hasLink: true,
  timeZone: CLASSES_TIME_ZONE,
};

const meta = {
  title: "platform/shared/MeetingCountdown",
  component: MeetingCountdown,
  parameters: {
    docs: {
      description: {
        component: `
How long until the class, in words that follow the clock, with a live
region for the changes that matter. The stories fix «now» at the page's
read instant; in the browser the words move on from there.

Source: \`components/platform/shared/meeting-countdown/meeting-countdown.comp.tsx\`.
Reference page: [Components › MeetingCountdown](/components/platform/shared/meeting-countdown) in the docs site.
`,
      },
    },
  },
  args: { ...NOON, nowIso: CLASSES_NOW.toISOString() },
  decorators: [
    (Story) => (
      <div className="platform-theme" style={{ padding: 16 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof MeetingCountdown>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Far ahead: the class and the link both still to come. */
export const FarAhead: Story = { name: "Far ahead", args: { nowIso: cdmx("2026-10-14", "09:00").toISOString() } };

/** Soon: the link is open, the class starts in twenty minutes. */
export const Soon: Story = {};

/** Started: the class is running. */
export const Started: Story = { args: { nowIso: cdmx("2026-10-14", "12:10").toISOString() } };
