import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { FIXTURE_BOT } from "@/lib/testing/fixtures/bots";
import { OpenGameNotice } from "./open-game-notice.comp";

const RIVAL = {
  kind: "bot" as const,
  botId: 4,
  name: FIXTURE_BOT.name,
  slug: FIXTURE_BOT.slug,
  elo: FIXTURE_BOT.elo,
  avatar: FIXTURE_BOT.avatar,
  title: null,
};

const meta = {
  title: "platform/sections/play/lobby/OpenGameNotice",
  component: OpenGameNotice,
  parameters: {
    docs: {
      description: {
        component: `
The open game against a bot, above the lobby's gallery, with «Continuar»: a
game against a bot has no clock, so it waits where it was left.

Source: \`components/platform/sections/play/lobby/open-game-notice/open-game-notice.comp.tsx\`.
Reference page: [Components › OpenGameNotice](/components/platform/sections/play/lobby/open-game-notice) in the docs site.
`,
      },
    },
  },
  args: { game: { id: "AbC12345", rival: RIVAL, color: "white", plyCount: 12 } },
} satisfies Meta<typeof OpenGameNotice>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Six moves in, with White. */
export const Default: Story = {};

/** Just started with Black, the bot not having moved yet. */
export const NotStarted: Story = { args: { game: { id: "AbC12345", rival: RIVAL, color: "black", plyCount: 0 } } };
