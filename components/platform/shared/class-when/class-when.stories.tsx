import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { CLASSES_NOW, CLASSES_TIME_ZONE, cdmx } from "@/lib/testing/fixtures/classes";
import { ClassWhen } from "./class-when.comp";

const meta = {
  title: "platform/shared/ClassWhen",
  component: ClassWhen,
  parameters: {
    docs: {
      description: {
        component: `
When a class is, the one way on every screen: the short day and the hours in
the reader's zone, «Hoy», «Mañana» and «Ayer» for the days next to today's,
the year only when it is not the current one, and the zone's name when the
reader is told it. A \`<time>\` element with the instant.

Source: \`components/platform/shared/class-when/class-when.comp.tsx\`.
Reference page: [Components › ClassWhen](/components/platform/shared/class-when) in the docs site.
`,
      },
    },
  },
  args: {
    startIso: cdmx("2026-10-14", "12:00").toISOString(),
    durationMin: 60,
    timeZone: CLASSES_TIME_ZONE,
    nowIso: CLASSES_NOW.toISOString(),
    withZone: false,
  },
  argTypes: {
    startIso: { control: "text", description: "The class's start, ISO." },
    durationMin: { control: "number" },
    timeZone: { control: "text", description: "The zone the reader reads in." },
    nowIso: { control: "text", description: "«Now», for the relative days." },
    withZone: { control: "boolean" },
  },
} satisfies Meta<typeof ClassWhen>;

export default meta;
type Story = StoryObj<typeof meta>;

/** A class today: «Hoy · 12:00–13:00». */
export const Today: Story = {};

/** Tomorrow: «Mañana · 18:00–19:00». */
export const Tomorrow: Story = { args: { startIso: cdmx("2026-10-15", "18:00").toISOString() } };

/** Another day of the week: «sáb 17 oct · 10:00–11:30». */
export const OtherDay: Story = {
  name: "Other day",
  args: { startIso: cdmx("2026-10-17", "10:00").toISOString(), durationMin: 90 },
};

/** Another year: the year is written, «mié 3 dic 2025 · 12:00–13:00». */
export const OtherYear: Story = { name: "Other year", args: { startIso: cdmx("2025-12-03", "12:00").toISOString() } };

/** With the zone, for a teacher who reads in the academy's: «Hoy · 12:00–13:00 (hora de Ciudad de México)». */
export const WithZone: Story = { name: "With zone", args: { withZone: true } };
