import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, userEvent, within } from "storybook/test";
import { MovePathPicker, type FetchPgn } from "./move-path-picker.comp";

/** Légal's mate, Paris 1750: a short game in the public domain, with the move an exercise would start from. */
const LEGAL_MATE = `[Event "París"]
[White "Legal de Kermeur"]
[Black "Saint Brie"]
[Result "1-0"]

1. e4 e5 2. Bc4 d6 3. Nf3 Bg4 4. Nc3 g6 5. Nxe5 Bxd1 6. Bxf7+ Ke7 7. Nd5# 1-0`;

const meta = {
  title: "platform/shared/MovePathPicker",
  component: MovePathPicker,
  parameters: {
    docs: {
      description: {
        component: `
Picks a position of a game or a lesson: the usual viewer on the referenced PGN,
which \`fetchPgn\` reads (a server action in the app, a stub here), and «Usar
esta posición» hands back the path the viewer is on with the PGN. The class
block editor keeps the path (with «Quitar posición» and the line that says the
move); the exercise editor's «Desde una partida» takes the position at once.

Source: \`components/platform/shared/move-path-picker/move-path-picker.comp.tsx\`.
Reference page: [Components › MovePathPicker](/components/platform/shared/move-path-picker) in the docs site.
`,
      },
    },
  },
  args: {
    referenceId: "g1x2y3z4",
    hint: "Ve a la jugada desde la que empieza el ejercicio y pulsa «Usar esta posición».",
    value: "",
    onChange: fn().mockName("onChange"),
    fetchPgn: (async () => LEGAL_MATE) as FetchPgn,
  },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 960 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof MovePathPicker>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Playing through the game, as «Desde una partida» shows it: no saved move, and «Usar esta posición» hands back the path with the PGN. */
export const Playing: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const use = await canvas.findByRole("button", { name: "Usar esta posición" });
    await userEvent.click(use);
    await expect(args.onChange).toHaveBeenCalledWith("", LEGAL_MATE);
  },
};

/** A path chosen and kept, as a class block shows it: the viewer opens on 5. Cxe5, with «Quitar posición» and «Posición guardada: jugada 9». */
export const PathChosen: Story = {
  args: {
    hint: "Navega hasta la posición con la que quieras abrir el bloque y púlsala. Si no eliges ninguna, el bloque empieza desde el principio.",
    value: "0.0.0.0.0.0.0.0.0",
    onClear: fn().mockName("onClear"),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(await canvas.findByText("Posición guardada: jugada 9")).toBeVisible();
  },
};

/** A reference that cannot be read: the line that says so, and nothing to pick. */
export const Unavailable: Story = {
  args: { fetchPgn: (async () => null) as FetchPgn },
};
