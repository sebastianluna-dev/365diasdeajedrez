import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { PlayerAvatar } from "./player-avatar.comp";

const meta = {
  title: "chess/PlayerAvatar",
  component: PlayerAvatar,
  parameters: {
    docs: {
      description: {
        component: `
A portrait without a picture, for a bot or a person (A4): the initials on one
of six tones that come from the slug (\`avatarToneOf\`), a gold ring for a world
champion, Mexico's three colours for its Olympiad teams, and the federation's
flag in a corner. While a bot thinks, an arc of the accent turns around it (D2);
under reduced motion it stands still as a whole ring.

Source: \`components/chess/player-avatar/player-avatar.comp.tsx\`.
Reference page: [Components › PlayerAvatar](/components/chess/player-avatar) in the docs site.
`,
      },
    },
  },
  args: { initials: "DC", tone: 4, ring: "NONE", country: "MEX", size: "md", busy: false },
  argTypes: {
    tone: { control: "inline-radio", options: [1, 2, 3, 4, 5, 6] },
    ring: { control: "inline-radio", options: ["NONE", "GOLD", "TRICOLOR"] },
    size: { control: "inline-radio", options: ["sm", "md", "lg", "xl"] },
    country: { control: "text", description: "Federation code; no flag when the table does not know it." },
  },
  decorators: [
    (Story) => (
      <div
        style={{
          display: "flex",
          gap: "var(--platform-space-6)",
          alignItems: "center",
          padding: "var(--platform-space-3)",
        }}
      >
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof PlayerAvatar>;

export default meta;
type Story = StoryObj<typeof meta>;

/** An invented character at the strip's size: Don Chuy, with Mexico's flag in the corner. */
export const Default: Story = {};

/** The four sizes side by side: a row, a strip, a card and the profile's square header. */
export const Sizes: Story = {
  render: (args) => (
    <>
      <PlayerAvatar {...args} size="sm" />
      <PlayerAvatar {...args} size="md" />
      <PlayerAvatar {...args} size="lg" />
      <PlayerAvatar {...args} size="xl" />
    </>
  ),
};

/** The six tones, one per seed, with their initials. */
export const Tones: Story = {
  render: (args) => (
    <>
      {([1, 2, 3, 4, 5, 6] as const).map((tone) => (
        <PlayerAvatar key={tone} {...args} tone={tone} country={null} size="lg" />
      ))}
    </>
  ),
};

/** The rings: a world champion in gold (Capablanca) and a player of Mexico's team in its three colours. */
export const Rings: Story = {
  render: (args) => (
    <>
      <PlayerAvatar {...args} initials="JC" tone={2} ring="GOLD" country="CUB" size="lg" />
      <PlayerAvatar {...args} initials="ZC" tone={3} ring="TRICOLOR" country="MEX" size="lg" />
    </>
  ),
};

/** Thinking: the accent's arc turns around the portrait (it stands still under reduced motion). */
export const Busy: Story = { args: { busy: true } };
