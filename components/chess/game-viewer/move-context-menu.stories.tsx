import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, userEvent, waitFor, within } from "storybook/test";
import { MoveContextMenu, type MoveContextMenuTarget } from "./move-context-menu.comp";

/**
 * A right click on 8. Dxb7 of the annotated Opera Game: the first move of a variation, second among its
 * siblings, so it can go up one step and become the main line. The menu opens where the click landed — here at
 * the canvas's padding.
 */
const VARIATION: MoveContextMenuTarget = {
  path: "0.0.0.0.0.0.0.0.0.0.0.0.0.0.1",
  x: 32,
  y: 32,
  label: "8. Dxb7",
  canPromote: true,
  canPromoteOneStep: true,
};

/** A right click on 7. Db3, already on the main line: there is nothing to promote it to. */
const MAIN_LINE: MoveContextMenuTarget = {
  path: "0.0.0.0.0.0.0.0.0.0.0.0.0",
  x: 32,
  y: 32,
  label: "7. Db3",
  canPromote: false,
  canPromoteOneStep: false,
};

const meta = {
  title: "chess/game-viewer/MoveContextMenu",
  component: MoveContextMenu,
  parameters: {
    docs: {
      description: {
        component: `
What a right click on a move opens in an editable viewer: promote the
variation one step or to the main line, comment the move, annotate it with
signs, copy the variation's PGN and delete from that move on. It is the
host's: the lists only report the right click, and the host decides whether
a menu exists and passes the actions. The three optional ones (comment,
annotate, copy) are left out when there is nowhere to write them.

The menu is \`position: fixed\` at the click, so in this page each story is
drawn in a frame of its own. The actions are spies listed in the Actions
panel, and the host here never closes it.

Source: \`components/chess/game-viewer/move-context-menu.comp.tsx\`.
Reference page: [Components › MoveContextMenu](/components/chess/game-viewer/move-context-menu) in the docs site.
`,
      },
      story: { inline: false, iframeHeight: 400 },
    },
  },
  args: {
    target: VARIATION,
    onPromoteOneStep: fn().mockName("onPromoteOneStep"),
    onPromoteToMainLine: fn().mockName("onPromoteToMainLine"),
    onComment: fn().mockName("onComment"),
    onAnnotate: fn().mockName("onAnnotate"),
    onCopyVariation: fn(async () => {}).mockName("onCopyVariation"),
    onDelete: fn().mockName("onDelete"),
    onClose: fn().mockName("onClose"),
  },
  argTypes: {
    target: {
      control: "object",
      description: "`MoveContextMenuTarget`: the move, where the click was, what can be promoted.",
    },
    closing: { control: "boolean", description: "The host has closed it and keeps it mounted while the exit plays." },
  },
  decorators: [
    (Story) => (
      // The menu is fixed and takes no room: this keeps the canvas as tall as the menu it shows.
      <div style={{ minHeight: 340 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof MoveContextMenu>;

export default meta;
type Story = StoryObj<typeof meta>;

/** On a variation: every item, both ways of promoting it enabled, and «Eliminar a partir de aquí» in the danger colour. */
export const Variation: Story = {};

/** On a move of the main line: the two ways of promoting are there but disabled. */
export const MainLine: Story = { name: "Main line", args: { target: MAIN_LINE } };

/**
 * Without anywhere to write — in full screen, or a viewer without its tools —: no «Comentar este movimiento» and no
 * «Anotar con iconos».
 */
export const WithoutWriting: Story = {
  name: "Without writing",
  args: { onComment: undefined, onAnnotate: undefined },
};

/** «Copiar PGN de la variante» pressed, by its `play` function: the item says «PGN copiado» before the menu closes. */
export const Copied: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("menuitem", { name: "Copiar PGN de la variante" }));
    // The menu fades in (160 ms): the item is visible once that entrance has played.
    await waitFor(() => expect(canvas.getByRole("menuitem", { name: "PGN copiado" })).toBeVisible());
    await expect(args.onCopyVariation).toHaveBeenCalled();
  },
};
