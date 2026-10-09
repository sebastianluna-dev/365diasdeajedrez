import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, userEvent, waitFor, within } from "storybook/test";
import { buildPlatformNavGroups, isNavDropdown, type PlatformNavDropdown } from "@/constants/platform/nav-items.const";
import { PlatformNavMenu } from "./platform-nav-menu.comp";

/** «Herramientas» as the student's menu builds it with everything switched on. */
const TOOLS = buildPlatformNavGroups(
  { isTeacher: false, isStaff: false },
  { play: true, analysisBoard: true, trainer: true },
)[0]!.items.find(isNavDropdown) as PlatformNavDropdown;

const meta = {
  title: "platform/shared/PlatformNavMenu",
  component: PlatformNavMenu,
  parameters: {
    docs: {
      description: {
        component: `
A dropdown of the top bar (M3), on Radix's \`DropdownMenu\`: «Herramientas»
gathers the analysis board, the explorer and the trainer, two columns of tools
each with its icon and the line that says what it is for. The trigger lights up like an item when one of its tools is the page.

Source: \`components/platform/shared/platform-nav-menu/platform-nav-menu.comp.tsx\`.
Reference page: [Components › PlatformNavMenu](/components/platform/shared/platform-nav-menu) in the docs site.
`,
      },
    },
  },
  args: { menu: TOOLS, activeHref: null },
  decorators: [
    (Story) => (
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "flex-end",
          minHeight: 280,
          padding: "var(--platform-space-3)",
        }}
      >
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof PlatformNavMenu>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Closed: the trigger among the bar's items. */
export const Closed: Story = {};

/** Open, by its `play`: the three tools in two columns, with their lines. */
export const Open: Story = {
  play: async ({ canvasElement }) => {
    await userEvent.click(within(canvasElement).getByRole("button", { name: "Herramientas" }));
    const menu = await within(document.body).findByRole("menu");
    await waitFor(() => expect(menu).toBeVisible());
  },
};

/** On the analysis board: the trigger is lit, and so is its tool in the open menu. */
export const OnATool: Story = {
  args: { activeHref: TOOLS.items[0]!.href },
  play: Open.play,
};
