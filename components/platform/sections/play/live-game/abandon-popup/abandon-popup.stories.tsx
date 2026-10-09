import { useRef } from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { fn, userEvent, within } from "storybook/test";
import type { PlatformPopupHandle } from "@/components/platform/shared/platform-popup/platform-popup.comp";
import { AbandonPopup } from "./abandon-popup.comp";

/** The popup behind the viewer's «Abandonar», as the game's section mounts it. */
function AbandonSample({ onAbandon }: { onAbandon: () => Promise<void> }) {
  const popup = useRef<PlatformPopupHandle>(null);
  return (
    <>
      <button
        type="button"
        className="platform-button platform-button_variant_danger platform-button_size_sm"
        onClick={(event) => popup.current?.open(event)}
      >
        Abandonar
      </button>
      <AbandonPopup
        ref={popup}
        onAbandon={async () => {
          await onAbandon();
          popup.current?.close();
        }}
        onCancel={() => popup.current?.close()}
      />
    </>
  );
}

const meta = {
  title: "platform/sections/play/live-game/AbandonPopup",
  component: AbandonPopup,
  parameters: {
    docs: {
      description: {
        component: `
«¿Abandonas la partida?» (P1): a small popup, and on a phone a sheet on the
bottom edge (P3). Not a destruction: the game stays on the profile, lost.

Source: \`components/platform/sections/play/live-game/abandon-popup/abandon-popup.comp.tsx\`.
Reference page: [Components › AbandonPopup](/components/platform/sections/play/live-game/abandon-popup) in the docs site.
`,
      },
    },
  },
  args: { ref: { current: null }, onAbandon: fn(async () => {}).mockName("abandonPlayedGame"), onCancel: fn() },
  render: (args) => <AbandonSample onAbandon={args.onAbandon} />,
} satisfies Meta<typeof AbandonPopup>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Open, by its `play`: the question, «Seguir jugando» and «Abandonar» in the danger red. */
export const Open: Story = {
  play: async ({ canvasElement }) => {
    await userEvent.click(within(canvasElement).getByRole("button", { name: "Abandonar" }));
  },
};

/** The same in a phone's width: the sheet on the bottom edge. */
export const OnPhone: Story = {
  globals: { viewport: { value: "mobile1", isRotated: false } },
  play: Open.play,
};
