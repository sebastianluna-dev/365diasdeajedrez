import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { PlatformSearchField } from "./platform-search-field.comp";

const meta = {
  title: "platform/shared/PlatformSearchField",
  component: PlatformSearchField,
  parameters: {
    docs: {
      description: {
        component: `
A search box: the magnifying glass and a \`type="search"\` input in one frame,
with the accent's focus, since a search is a filter and not a form. With a
\`name\` it is a field of the form around it; without one it only narrows what
is on screen and swallows Enter.

Source: \`components/platform/shared/platform-search-field/platform-search-field.comp.tsx\`.
Reference page: [Components › PlatformSearchField](/components/platform/shared/platform-search-field) in the docs site.
`,
      },
    },
  },
  args: { label: "Buscar clase", placeholder: "Buscar por tema, alumno o profesor" },
  argTypes: {
    label: { control: "text", description: "The accessible name." },
    placeholder: { control: "text" },
    defaultValue: { control: "text" },
    name: { control: "text", description: "With a name the field travels with its form." },
  },
  decorators: [
    (Story) => (
      <div className="platform-theme" style={{ maxWidth: 420 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof PlatformSearchField>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Empty: the placeholder says what to search by. */
export const Empty: Story = {};

/** With a search written. */
export const Filled: Story = { args: { defaultValue: "Najdorf" } };

/** Inside a form, with a name: Enter submits the form with `q`. */
export const InsideForm: Story = {
  name: "Inside form",
  args: { name: "q", defaultValue: "finales" },
  render: (args) => (
    <form action="?" method="get" style={{ display: "flex", gap: 12 }}>
      <div style={{ flex: 1 }}>
        <PlatformSearchField {...args} />
      </div>
      <button type="submit" className="platform-button">
        Buscar
      </button>
    </form>
  ),
};
