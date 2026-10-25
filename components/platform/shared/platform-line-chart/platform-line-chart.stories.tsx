import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, userEvent, within } from "storybook/test";
import { SAMPLE_LEVEL_POINTS } from "@/constants/platform/chart-samples.const";
import { PlatformLineChart } from "./platform-line-chart.comp";

const meta = {
  title: "platform/shared/PlatformLineChart",
  component: PlatformLineChart,
  parameters: {
    docs: {
      description: {
        component: `
A series in time over its filled area, with a slider under it that picks a
point: the chosen one is marked, a hatched slice drops from it and its value
rides in a tag; the slider says its date. It starts on the last point and
moves with the arrows, Inicio and Fin, or the pointer. A Client Component.

Source: \`components/platform/shared/platform-line-chart/platform-line-chart.comp.tsx\`.
Reference page: [Components › PlatformLineChart](/components/platform/shared/platform-line-chart) in the docs site.
`,
      },
    },
  },
  decorators: [
    (Story) => (
      <div className="platform-workspace" style={{ minHeight: 0 }}>
        <div className="platform-workspace__panel" style={{ maxWidth: 640 }}>
          <Story />
        </div>
      </div>
    ),
  ],
  args: {
    points: SAMPLE_LEVEL_POINTS,
    valuePrefix: "≈ ",
    sliderLabel: "Partida elegida",
    label: `Nivel contra bots después de cada una de tus últimas 10 partidas: ${SAMPLE_LEVEL_POINTS.map((point) => `${point.label} ≈ ${point.value}`).join(", ")}.`,
  },
} satisfies Meta<typeof PlatformLineChart>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Ten games of the level against bots, the last one chosen. */
export const LastPoint: Story = {};

/** The slider moved back three games with the keyboard: the slice, the tag and the date follow. */
export const MovedBack: Story = {
  play: async ({ canvasElement }) => {
    const slider = within(canvasElement).getByRole("slider", { name: "Partida elegida" });
    slider.focus();
    await userEvent.keyboard("{ArrowLeft}{ArrowLeft}{ArrowLeft}");
    await expect(slider).toHaveAttribute("aria-valuetext", "22 oct, ≈ 829");
  },
};

/** Only five games, the fewest that make a level: the steps are wider. */
export const FewPoints: Story = {
  args: { points: SAMPLE_LEVEL_POINTS.slice(-5) },
};

/** A larger span of values: more grid lines, each with its value. */
export const WideRange: Story = {
  args: {
    points: [
      { label: "1 sep", value: 620 },
      { label: "8 sep", value: 700 },
      { label: "15 sep", value: 760 },
      { label: "22 sep", value: 830 },
      { label: "29 sep", value: 910 },
    ],
  },
};
