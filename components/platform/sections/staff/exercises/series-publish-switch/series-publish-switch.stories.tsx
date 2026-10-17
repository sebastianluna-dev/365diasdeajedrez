import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { fn } from "storybook/test";
import { SeriesPublishSwitch } from "./series-publish-switch.comp";

const meta = {
  title: "platform/sections/staff/exercises/SeriesPublishSwitch",
  component: SeriesPublishSwitch,
  parameters: {
    docs: {
      description: {
        component: `
«Publicada», the switch of an academy series: on, every student sees it on
«Series de la academia»; off, only the staff. It takes effect at once; an
empty series cannot be switched on.

Source: \`components/platform/sections/staff/exercises/series-publish-switch/series-publish-switch.comp.tsx\`.
Reference page: [Components › SeriesPublishSwitch](/components/platform/sections/staff/exercises/series-publish-switch) in the docs site.
`,
      },
    },
  },
  args: {
    seriesId: "se000009",
    published: true,
    publishedLabel: "Publicada el 14 de octubre, 2026",
    itemCount: 5,
    action: fn(async () => undefined).mockName("setAcademySeriesPublished"),
  },
  decorators: [
    (Story) => (
      <div className="platform-theme" style={{ maxWidth: 360, padding: 24 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof SeriesPublishSwitch>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Published: on, with the day it was published under the label. */
export const Published: Story = {};

/** Unpublished with exercises: off, and the hint says who sees it now. */
export const Unpublished: Story = {
  args: { published: false, publishedLabel: null },
};

/** Empty and unpublished: the switch is disabled until an exercise is added. */
export const Empty: Story = {
  args: { published: false, publishedLabel: null, itemCount: 0 },
};
