import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, userEvent, within } from "storybook/test";
import { PlatformSearch } from "./platform-search.comp";

const meta = {
  title: "platform/sections/shell/PlatformSearch",
  component: PlatformSearch,
  parameters: {
    docs: {
      description: {
        component: `
The search field of the top bar. **It does not search yet**: there is nothing
to send it to — \`/explorador\` looks up positions, not words — so it shows no
results, and it is deliberately not a \`<form>\`: pressing Enter does nothing
instead of reloading the page with a query nobody reads. It is drawn at the
size and in the place it will keep once it does search.

A filled pill in the page's grey, which is what tells it apart on the white
bar; the frame here stands in for that bar. The label is said only to a
screen reader.

Source: \`components/platform/sections/shell/platform-search.comp.tsx\`.
Reference page: [Components › PlatformSearch](/components/platform/sections/shell/platform-search) in the docs site.
`,
      },
    },
  },
  decorators: [
    // The shell's bar (platform-shell.section.css): the field's grey only reads on its white.
    (Story) => (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          padding: "var(--platform-space-3) var(--platform-space-6)",
          background: "var(--platform-surface)",
          boxShadow: "var(--platform-shadow-bar)",
        }}
      >
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof PlatformSearch>;

export default meta;
type Story = StoryObj<typeof meta>;

/** At rest, as every page of the platform shows it: the magnifier and «Buscar» on the page's grey. */
export const Default: Story = {};

/** Typed and Enter pressed, by its `play` function: the field takes the white and the accent's border, the words stay and nothing happens. */
export const Typed: Story = {
  play: async ({ canvasElement }) => {
    // By role alone: the field's id is fixed (one bar per page), so on the Docs page, where both stories are drawn,
    // the second field's label points at the first one.
    const field = within(canvasElement).getByRole("searchbox");
    await userEvent.type(field, "Defensa Siciliana{enter}");
    await expect(field).toHaveValue("Defensa Siciliana");
  },
};
