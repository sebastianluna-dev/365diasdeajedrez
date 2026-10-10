import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { OpenNotebook } from "./open-notebook.comp";

const meta = {
  title: "adventure/shelf/OpenNotebook",
  component: OpenNotebook,
  parameters: {
    docs: {
      description: {
        component: `
A notebook of the shelf that can be opened: the whole journey on its cover, its
place, its name, «4 de 12 rivales» with the stars, a bar of twelve segments and
«Abrir el mapa». It only knows how many rivals are beaten: the bar's segments
are drawn from that.

Source: \`components/adventure/shelf/open-notebook/open-notebook.comp.tsx\`.
Reference page: [Components › OpenNotebook](/components/adventure/shelf/open-notebook) in the docs site.
`,
      },
    },
  },
  args: {
    notebook: {
      slug: "cuaderno-del-viajero",
      title: "El cuaderno del viajero",
      place: "La ciudad",
      beaten: 4,
      total: 12,
      stars: 9,
    },
  },
  decorators: [
    (Story) => (
      <div className="adventure" style={{ width: 420, padding: 28, background: "var(--adventure-wood)" }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof OpenNotebook>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Four of twelve beaten and nine stars; the fifth segment is the one to play. */
export const FourOfTwelve: Story = {};

/** Nothing written: no stars, and the first segment is the one to play. */
export const Fresh: Story = {
  args: {
    notebook: {
      slug: "cuaderno-del-viajero",
      title: "El cuaderno del viajero",
      place: "La ciudad",
      beaten: 0,
      total: 12,
      stars: 0,
    },
  },
};

/** Every page written: all twelve segments filled, thirty-six stars. */
export const Complete: Story = {
  args: {
    notebook: {
      slug: "cuaderno-del-viajero",
      title: "El cuaderno del viajero",
      place: "La ciudad",
      beaten: 12,
      total: 12,
      stars: 36,
    },
  },
};
