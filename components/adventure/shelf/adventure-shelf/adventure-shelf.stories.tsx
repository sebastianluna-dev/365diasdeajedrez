import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { COMING_ADVENTURES } from "@/lib/adventure/adventures";
import { AdventureShelf } from "./adventure-shelf.comp";

const NOTEBOOK = { slug: "cuaderno-del-viajero", title: "El cuaderno del viajero", place: "La ciudad", total: 12 };

const meta = {
  title: "adventure/shelf/AdventureShelf",
  component: AdventureShelf,
  parameters: {
    docs: {
      description: {
        component: `
«Elige tu cuaderno»: a bookshelf of dark wood. The notebook that can be
opened stands at the left, open, with the person's progress; the six that are
coming stand closed on two boards, each with its cover, «Próximamente» and no
action. It is the lower half of «Jugar» (\`PlayHome\`, \`/jugar#cuadernos\`),
an island of the adventure's paper inside the Material panel; this story hands
it a fixture.

Source: \`components/adventure/shelf/adventure-shelf/adventure-shelf.comp.tsx\`.
Reference page: [Components › AdventureShelf](/components/adventure/shelf/adventure-shelf) in the docs site.
`,
      },
    },
  },
  args: { shelf: { notebooks: [{ ...NOTEBOOK, beaten: 4, stars: 9 }], coming: COMING_ADVENTURES } },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 1240, margin: "0 auto" }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof AdventureShelf>;

export default meta;
type Story = StoryObj<typeof meta>;

/** The shelf of a person with four pages written. */
export const FourOfTwelve: Story = {};

/** The shelf of a person who has not opened the notebook yet. */
export const Fresh: Story = {
  args: { shelf: { notebooks: [{ ...NOTEBOOK, beaten: 0, stars: 0 }], coming: COMING_ADVENTURES } },
};

/** The shelf of a person who has written every page. */
export const Complete: Story = {
  args: { shelf: { notebooks: [{ ...NOTEBOOK, beaten: 12, stars: 36 }], coming: COMING_ADVENTURES } },
};
