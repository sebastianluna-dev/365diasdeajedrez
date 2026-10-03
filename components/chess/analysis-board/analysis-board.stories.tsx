import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fireEvent, fn, userEvent, waitFor, within } from "storybook/test";
import { AnalysisBoard } from "./analysis-board.comp";

/**
 * Morphy's «Opera Game», Paris 1858, as a teacher would transcribe it for a
 * class: a comment on the start, a sign on two moves, a variation where Black
 * went wrong (the bundled engine's choice) and a comment at the end.
 */
const OPERA_GAME = `{ Paul Morphy contra el duque Carlos de Brunswick y el conde Isouard, en el palco del duque en la Ópera de París, 1858. }
1. e4 e5 2. Nf3 d6 3. d4 Bg4 4. dxe5 Bxf3 5. Qxf3 dxe5 6. Bc4 Nf6 7. Qb3 Qe7 8. Nc3 c6 9. Bg5 b5 $6
(9... Na6 10. Bxa6 bxa6) 10. Nxb5 cxb5 11. Bxb5+ Nbd7 12. O-O-O Rd8
13. Rxd7 $1 { Entrega la torre para abrir la columna d. } 13... Rxd7 14. Rd1 Qe6 15. Bxd7+ Nxd7 16. Qb8+ Nxb8
17. Rd8# { Mate con la torre, sostenida por el alfil de g5. } 1-0`;

/** What a `play` function types into the comment of the starting position. */
const NOTE = " Se jugó durante la función.";

const typeNote = async (canvasElement: HTMLElement) => {
  const field = within(canvasElement).getByPlaceholderText("Comentario de la posición inicial");
  // The field takes the start's comment in an effect after it mounts; writing before that lands writes into the
  // empty draft.
  await waitFor(() => expect(field).not.toHaveValue(""));
  // Not `userEvent.type`: on this controlled textarea its keystrokes reach the DOM but never the component's
  // `onChange` (seen in headless Chrome: 28 input events, React's value untouched). `fireEvent.input` sets the
  // value the way React reads it.
  fireEvent.input(field, { target: { value: `${(field as HTMLTextAreaElement).value}${NOTE}` } });
  await userEvent.tab();
};

const meta = {
  title: "chess/AnalysisBoard",
  component: AnalysisBoard,
  parameters: {
    docs: {
      description: {
        component: `
The board a teacher transcribes a game on, inside the class block form: moves
played on the board go into the list, going back and playing something else
opens a variation, and each move takes a comment, quality and evaluation
signs and arrows drawn with the right button. The result travels as the PGN
of a hidden input named by \`name\`, so saving is the form's own submit.

Source: \`components/chess/analysis-board/analysis-board.comp.tsx\`.
Reference page: [Components › AnalysisBoard](/components/chess/analysis-board/analysis-board) in the docs site.
`,
      },
    },
  },
  args: { name: "pgn", defaultPgn: OPERA_GAME },
  argTypes: {
    name: { control: "text", description: "Name of the hidden input the PGN travels in." },
    defaultPgn: { control: "text", description: "The game to start from; empty, the board starts at `initialFen`." },
    initialFen: { control: "text", description: "Starting position when there is no game; the usual one if omitted." },
    orientation: { control: "inline-radio", options: ["white", "black"] },
    onAutoSave: { description: "Saves on its own after a pause; without it the form's button saves." },
  },
  decorators: [
    // As wide as the class block it is edited in: board and panel side by side.
    (Story) => (
      <div style={{ maxWidth: 960 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof AnalysisBoard>;

export default meta;
type Story = StoryObj<typeof meta>;

/** A transcribed game, as a saved block reopens it: the moves with their variation and comments, the board at the start. */
export const WithGame: Story = {};

/** A new block: the starting position and an empty list, waiting for the first move. */
export const Empty: Story = { args: { defaultPgn: undefined } };

/**
 * Edited and not saved, by its `play` function: a comment typed on the start brings «Hay cambios sin guardar.» and
 * «Descartar cambios», which goes back to the saved game.
 */
export const UnsavedChanges: Story = {
  play: async ({ canvasElement }) => {
    await typeNote(canvasElement);
    await expect(await within(canvasElement).findByText("Hay cambios sin guardar.")).toBeVisible();
  },
};

/** The «Calidad» tab, by its `play` function: 13. Txd7 chosen in the list, its «!» pressed among the signs. */
export const Quality: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // The move is named as it is read: its sign is drawn, and said in words
    // (the hidden words are a box of their own, so a space may come before the comma).
    await userEvent.click(canvas.getByRole("button", { name: /^13\. Txd7\s*, Buena jugada$/ }));
    await userEvent.click(canvas.getByRole("tab", { name: "Calidad" }));
  },
};

/**
 * Saving on its own, by its `play` function: a comment typed, a pause, and the status goes from «Cambios sin
 * guardar…» to «Guardado». No screen passes `onAutoSave` today; the class block saves with its button.
 */
export const Autosave: Story = {
  args: { onAutoSave: fn(async () => true).mockName("onAutoSave") },
  play: async ({ canvasElement }) => {
    await typeNote(canvasElement);
    await expect(await within(canvasElement).findByText("Guardado", undefined, { timeout: 8000 })).toBeVisible();
  },
};
