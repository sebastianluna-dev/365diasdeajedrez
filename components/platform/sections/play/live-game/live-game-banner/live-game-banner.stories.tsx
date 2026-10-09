import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { fn } from "storybook/test";
import { LiveGameBanner } from "./live-game-banner.comp";

const meta = {
  title: "platform/sections/play/live-game/LiveGameBanner",
  component: LiveGameBanner,
  parameters: {
    docs: {
      description: {
        component: `
Why the board of a live game stopped, above it and never over it: another tab
moved, or the bot's engine died. «Recargar» starts again from what the server
has; nothing is lost.

Source: \`components/platform/sections/play/live-game/live-game-banner/live-game-banner.comp.tsx\`.
Reference page: [Components › LiveGameBanner](/components/platform/sections/play/live-game/live-game-banner) in the docs site.
`,
      },
    },
  },
  args: { kind: "stale", onReload: fn().mockName("reload") },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 720 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof LiveGameBanner>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Another tab moved first: this one is behind. */
export const Stale: Story = {};

/** The bot's engine stopped answering. */
export const EngineFailed: Story = { args: { kind: "engine-failed" } };
