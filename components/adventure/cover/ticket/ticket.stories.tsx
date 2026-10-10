import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { platformRoutes } from "@/lib/platform-routes";
import { Ticket } from "./ticket.comp";

const meta = {
  title: "adventure/cover/Ticket",
  component: Ticket,
  parameters: {
    docs: {
      description: {
        component: `
A ticket on the cover's desk: a stub with a vertical word, a printed body and
one way in. «Partida libre» is the warm ticket and links to the gallery of
bots; «Contra una persona» is the quiet one, not valid yet, with a
«Próximamente» stamp instead of an action.

Source: \`components/adventure/cover/ticket/ticket.comp.tsx\`.
Reference page: [Components › Ticket](/components/adventure/cover/ticket) in the docs site.
`,
      },
    },
  },
  decorators: [
    (Story) => (
      <div className="adventure" style={{ width: 330, padding: 40, background: "var(--adventure-wood)" }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Ticket>;

export default meta;
type Story = StoryObj<typeof meta>;

/** The ticket that works: «Partida libre» with its «Elegir un bot» link to the gallery. */
export const FreeGame: Story = {
  args: {
    tone: "free",
    eyebrow: "Galería de bots",
    title: "Partida libre",
    description: "Elige a cualquier bot de la galería y juega sin seguir la historia.",
    stub: "Cualquier bot",
    action: { href: platformRoutes.freePlay, label: "Elegir un bot" },
  },
};

/** The ticket that is not valid yet: «Contra una persona», quiet paper, a «Próximamente» stamp and no action. */
export const ComingSoon: Story = {
  args: {
    tone: "person",
    eyebrow: "Partida amistosa",
    title: "Contra una persona",
    description: "Reta a otro alumno de la plataforma.",
    stub: "Admite dos",
    soon: true,
  },
};
