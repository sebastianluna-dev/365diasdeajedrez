import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { CLASSES_TIME_ZONE, cdmx } from "@/lib/testing/fixtures/classes";
import { ClassDateTile } from "./class-date-tile.comp";

const meta = {
  title: "platform/shared/ClassDateTile",
  component: ClassDateTile,
  parameters: {
    docs: {
      description: {
        component: `
The date of a class as a calendar page: the weekday, the day in large figures
and the month, in the reader's zone; today's wears the accent's border. It is
decorative beside a \`ClassWhen\` that says the same in words.

Source: \`components/platform/shared/class-date-tile/class-date-tile.comp.tsx\`.
Reference page: [Components › ClassDateTile](/components/platform/shared/class-date-tile) in the docs site.
`,
      },
    },
  },
  args: { startIso: cdmx("2026-10-14", "12:00").toISOString(), timeZone: CLASSES_TIME_ZONE, isToday: true, size: "md" },
  argTypes: {
    startIso: { control: "text" },
    timeZone: { control: "text" },
    isToday: { control: "boolean" },
    size: { control: "inline-radio", options: ["md", "sm"] },
  },
} satisfies Meta<typeof ClassDateTile>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Today: «MIÉ 14 OCT» with the accent's border and wash. */
export const Today: Story = {};

/** Another day: the neutral tile. */
export const OtherDay: Story = {
  name: "Other day",
  args: { startIso: cdmx("2026-10-17", "10:00").toISOString(), isToday: false },
};

/** The row's size, 44 × 52. */
export const Small: Story = { args: { size: "sm", isToday: false } };
