import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { COMING_ADVENTURES } from "@/lib/adventure/adventures";
import { NotebookSpine } from "./notebook-spine.comp";

const notebookOf = (slug: string) => COMING_ADVENTURES.find((notebook) => notebook.slug === slug)!;

const meta = {
  title: "adventure/shelf/NotebookSpine",
  component: NotebookSpine,
  parameters: {
    docs: {
      description: {
        component: `
A notebook on the shelf that is not open yet: its cloth cover with a motif of
the place in two inks, a «Próximamente» stamp across it, its name and what it
will explore. It has no action and no date. One story for each of the six
covers.

Source: \`components/adventure/shelf/notebook-spine/notebook-spine.comp.tsx\`.
Reference page: [Components › NotebookSpine](/components/adventure/shelf/notebook-spine) in the docs site.
`,
      },
    },
  },
  args: { notebook: notebookOf("veracruz") },
  decorators: [
    (Story) => (
      <ul
        className="adventure"
        style={{
          width: 220,
          margin: 0,
          padding: "32px 20px 8px",
          listStyle: "none",
          background: "var(--adventure-wood)",
        }}
      >
        <Story />
      </ul>
    ),
  ],
} satisfies Meta<typeof NotebookSpine>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Veracruz: a jarana over the sea's waves, on blue cloth. */
export const Veracruz: Story = {};

/** Chihuahua: the sun over the canyon walls, on terracotta cloth. */
export const Chihuahua: Story = { args: { notebook: notebookOf("chihuahua") } };

/** Yucatán: a cenote over a band of hipil embroidery, on cream cloth. */
export const Yucatan: Story = { args: { notebook: notebookOf("yucatan") } };

/** Ciudad de México: the Angel on her column and a trajinera, on magenta cloth. */
export const Cdmx: Story = { args: { notebook: notebookOf("cdmx") } };

/** Puebla: two volcanoes over a row of talavera tiles, on pale cloth. */
export const Puebla: Story = { args: { notebook: notebookOf("puebla") } };

/** Tlaxcala: a carpet of flowers as in Huamantla, on green cloth. */
export const Tlaxcala: Story = { args: { notebook: notebookOf("tlaxcala") } };
