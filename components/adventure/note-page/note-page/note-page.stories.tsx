import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { CUADERNO_DEL_VIAJERO } from "@/lib/adventure/adventures/cuaderno-del-viajero";
import { NotePage } from "./note-page.comp";

const zone = (slug: string) => CUADERNO_DEL_VIAJERO.zones.find((candidate) => candidate.slug === slug)!;

const meta = {
  title: "adventure/note-page/NotePage",
  component: NotePage,
  parameters: {
    docs: {
      description: {
        component: `
A page of the notebook of 1994, read on arriving at a zone: a taped label with
the place and its number, and the ruled sheet with the chapter, the note and
who signed it. A page not reached yet is a closed flap that says «Se abre al
llegar»; one that has been reached is folded until half of it comes into view,
and then the flap turns up and the sheet unrolls (at once for whoever asks for
less motion). The page that was torn out has a ragged edge and no signature.

Source: \`components/adventure/note-page/note-page/note-page.comp.tsx\`.
Reference page: [Components › NotePage](/components/adventure/note-page/note-page) in the docs site.
`,
      },
    },
  },
  args: {
    zone: zone("biblioteca"),
    number: 3,
    isReached: true,
    position: { left: 50, top: 50, width: 90, rotation: 1.5 },
  },
  decorators: [
    (Story) => (
      // The page sits in a world: a box with the unit of the art (`--u`) in pixels.
      <div
        className="adventure"
        style={
          {
            position: "relative",
            width: 380,
            height: 420,
            background: "var(--adventure-paper)",
            "--u": "1.1px",
          } as React.CSSProperties
        }
      >
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof NotePage>;

export default meta;
type Story = StoryObj<typeof meta>;

/** A page that has been reached and is in view: open, with its chapter, its note and its signature. */
export const Open: Story = {};

/** A page not reached yet: folded shut under its flap, which says «Se abre al llegar»; the note is not read to anyone. */
export const Closed: Story = {
  args: {
    zone: zone("malecon"),
    number: 4,
    isReached: false,
    position: { left: 50, top: 50, width: 90, rotation: -2 },
  },
};

/** The page torn out of the notebook: a ragged lower edge and no signature. */
export const Torn: Story = {
  args: { zone: zone("club"), number: 2, position: { left: 50, top: 50, width: 90, rotation: -2.5 } },
};
