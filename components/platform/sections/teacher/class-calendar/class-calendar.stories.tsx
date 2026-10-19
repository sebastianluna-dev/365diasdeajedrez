import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, userEvent, waitFor, within } from "storybook/test";
import { ClassCalendar } from "./class-calendar.comp";
import { CALENDAR_SAMPLE_CLASSES, CALENDAR_SAMPLE_NOW, CALENDAR_SAMPLE_ZONE } from "./class-calendar.sample";

const meta = {
  title: "platform/sections/teacher/ClassCalendar",
  component: ClassCalendar,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component: `
The teacher's classes on a calendar, the way Google Calendar shows a diary
(option A of the calendar canvas, 2026-10-19): a day, a week or a month,
«Hoy» and the arrows, a small month at the side and each class a block in its
phase's colours that opens a card. Front-only: it is given its classes.

Source: \`components/platform/sections/teacher/class-calendar/class-calendar.comp.tsx\`.
Reference page: [Components › ClassCalendar](/components/platform/sections/teacher/class-calendar) in the docs site.
`,
      },
    },
  },
  args: {
    classes: CALENDAR_SAMPLE_CLASSES,
    timeZone: CALENDAR_SAMPLE_ZONE,
    nowIso: CALENDAR_SAMPLE_NOW,
  },
  decorators: [
    (Story) => (
      <div className="platform-theme platform-page platform-page_width_full">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof ClassCalendar>;

export default meta;
type Story = StoryObj<typeof meta>;

/** The week in sight, by hours: two classes that overlap share their hour, and the red line is now. */
export const Week: Story = {};

/** One day, today: its classes at the whole width. */
export const Day: Story = {
  args: { defaultView: "day" },
};

/** The month: each day its first classes, «N más» for the rest, today's number in the accent. */
export const Month: Story = {
  args: { defaultView: "month" },
};

/** A week with no classes: only the grid and the hours. */
export const EmptyWeek: Story = {
  args: { defaultDay: "2026-11-09" },
};

/** The live class clicked: its card, with its phase, its hours, who is in it, «Entrar a la clase» and «Ver la clase». */
export const ClassCard: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: /^La defensa de Philidor,/ }));
    const card = await canvas.findByRole("dialog", { name: "La defensa de Philidor" });
    // The card fades in: it is visible once it has unfolded.
    await waitFor(() => expect(within(card).getByRole("link", { name: "Entrar a la clase" })).toBeVisible());
    await expect(within(card).getByRole("link", { name: "Ver la clase" })).toBeVisible();
  },
};

/** «Mes» chosen and the arrow pressed: November, its title in the toolbar. */
export const NextMonth: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "Mes" }));
    await userEvent.click(canvas.getByRole("button", { name: "Mes siguiente" }));
    await expect(canvas.getByRole("heading", { name: "noviembre de 2026" })).toBeVisible();
  },
};
