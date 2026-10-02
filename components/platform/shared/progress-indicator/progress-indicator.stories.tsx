import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { ProgressIndicator } from "./progress-indicator.comp";

const meta = {
  title: "platform/shared/ProgressIndicator",
  component: ProgressIndicator,
  parameters: {
    docs: {
      description: {
        component: `
How far a course is gone: a bar in the progress blue (not the accent: a bar is
read, not pressed) with its percentage and, optionally, what it counts. The
percentage is rounded and held between 0 and 100 whatever it is given.

Source: \`components/platform/shared/progress-indicator/progress-indicator.comp.tsx\`.
Reference page: [Components › ProgressIndicator](/components/platform/shared/progress-indicator) in the docs site.
`,
      },
    },
  },
  args: { percent: 43, detail: "3 de 7 lecciones", layout: "inline" },
  argTypes: {
    percent: { control: { type: "range", min: -20, max: 120, step: 1 }, description: "Clamped to 0–100." },
    detail: { control: "text", description: "Optional: what the percentage counts." },
    layout: { control: "inline-radio", options: ["inline", "stacked"] },
  },
  decorators: [
    (Story) => (
      <div className="platform-card" style={{ maxWidth: 420 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof ProgressIndicator>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Bar and label on one line, as the dashboard's «Continuar» card draws it. */
export const Inline: Story = {};

/** The percentage and the detail at the two ends and the bar under them, as a course card draws it. */
export const Stacked: Story = { args: { layout: "stacked" } };

/** Not started: the track alone. */
export const NotStarted: Story = { name: "Not started", args: { percent: 0, detail: "0 de 7 lecciones" } };

/** Finished: the bar full. */
export const Finished: Story = { args: { percent: 100, detail: "7 de 7 lecciones" } };

/** Without a detail: the percentage alone. */
export const WithoutDetail: Story = { name: "Without detail", args: { detail: undefined } };
