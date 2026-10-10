import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Keepsake } from "./keepsake.comp";

const meta = {
  title: "adventure/keepsakes/Keepsake",
  component: Keepsake,
  parameters: {
    docs: {
      description: {
        component: `
What a beaten rival leaves in the notebook: a small drawing — the bottle cap, the
popsicle stick, the membership card with the person's name, the sticker, the
bookmark, a badge, a shell, a knot, the score sheet, a key, a photograph and
the last page — stuck on the map with a strip of tape. Still to win, the
rival's keepsake is a sealed envelope. It is decoration, hidden from a screen
reader: the rival's card says what it is in words.

Source: \`components/adventure/keepsakes/keepsake/keepsake.comp.tsx\`.
Reference page: [Components › Keepsake](/components/adventure/keepsakes/keepsake) in the docs site.
`,
      },
    },
  },
  args: { adventure: "cuaderno-del-viajero", order: 3, playerName: "Alumno Demo" },
  decorators: [
    (Story) => (
      <div className="adventure" style={{ padding: 32, background: "var(--adventure-paper)" }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Keepsake>;

export default meta;
type Story = StoryObj<typeof meta>;

/** The keepsake as wide as what holds it. */
const alone = (args: React.ComponentProps<typeof Keepsake>) => (
  <div style={{ width: 180 }}>
    <Keepsake {...args} />
  </div>
);

/** The membership card of the club, with the person's name written on it. */
export const MembershipCard: Story = { render: alone };

/** The twelve keepsakes, one for each rival, as the notebook keeps them. */
export const AllTwelve: Story = {
  render: (args) => (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 140px)", gap: 28 }}>
      {Array.from({ length: 12 }, (_, index) => (
        <div key={index} style={{ justifySelf: "center", width: 120 }}>
          <Keepsake {...args} order={index + 1} />
        </div>
      ))}
    </div>
  ),
};

/** The envelope of a keepsake still to win. */
export const Sealed: Story = { args: { isSealed: true }, render: alone };

/** A keepsake stuck on the map: placed in percentages of the world, tilted and held by its tape. */
export const Stuck: Story = {
  args: { position: { left: 50, top: 50, width: 60, rotation: -9 } },
  render: (args) => (
    <div style={{ position: "relative", width: 240, height: 200, "--u": "1px" } as React.CSSProperties}>
      <Keepsake {...args} />
    </div>
  ),
};
