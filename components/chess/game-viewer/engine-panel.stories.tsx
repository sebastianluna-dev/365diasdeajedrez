import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { fn, userEvent, within } from "storybook/test";
import type { EngineInfo } from "@/lib/chess/engine-protocol";
import { positionOutcome } from "@/lib/chess/legal-moves";
import { EnginePanel } from "./engine-panel.comp";
import type { EngineState } from "./use-engine.hook";

/** Byrne–Fischer, New York 1956, after 17. Kf1: Black to move, the position of 17… Be6. */
const FEN = "r3r1k1/pp3pbp/1qp3p1/2B5/2BP2b1/Q1n2N2/P4PPP/3R1K1R b - - 3 17";

/**
 * What the bundled Stockfish answers for it with the live analysis's settings
 * (three lines, depth 20), the score already in White's sign and each line
 * cut to the sixteen moves the panel replays.
 */
const LINES: EngineInfo[] = [
  {
    multipv: 1,
    depth: 20,
    score: -2.24,
    mateIn: null,
    pv: "g4e6 a3c3 b6c5 d4c5 g7c3 c4e6 e8e6 g2g3 a8e8 d1b1 e8e7 f1g2 e6e2 b1b3 c3g7 h1b1".split(" "),
  },
  {
    multipv: 2,
    depth: 20,
    score: 1.01,
    mateIn: null,
    pv: "c3b5 c4f7 g8h8 c5b6 b5a3 b6c5 a3b5 f7e8 a8e8 a2a4 b5c3 d1e1 e8e1 f1e1 g4f3 g2f3".split(" "),
  },
  {
    multipv: 3,
    depth: 20,
    score: 1.34,
    mateIn: null,
    pv: "c3b1 a3c1 b6d8 c1b1 g4f3 g2f3 b7b6 c5a3 d8h4 h2h3 g7d4 b1c2 a8d8 c4d3 h4h5 d3e4".split(" "),
  },
];

/** The engine with its three lines: what `useEngine` returns once the search is under way. */
const WITH_LINES: EngineState = { lines: LINES, info: LINES[0] ?? null, loading: false, outcome: null, failed: false };

/** Loaded and asked, no line yet: what `useEngine` returns between the `go` and the first `info` with a line. */
const SEARCHING: EngineState = { lines: [], info: null, loading: false, outcome: null, failed: false };

/** The «Opera game» after 17. Rd8#: Black to move, and mated. */
const MATED_FEN = "1n1Rkb1r/p4ppp/4q3/4p1B1/4P3/8/PPP2PPP/2K5 b k - 1 17";

/** The careless queen: after Qf7 the black king on h8 has no square and is not in check. */
const STALEMATE_FEN = "7k/5Q2/6K1/8/8/8/8/8 b - - 0 1";

const meta = {
  title: "chess/game-viewer/EnginePanel",
  component: EnginePanel,
  parameters: {
    docs: {
      description: {
        component: `
The «Módulo» block at the top of the viewer's notation card: the engine's
switch, the depth, and the three continuations Stockfish proposes for the
board's position, each opening with its evaluation. One line can be expanded
at a time, and pointing at a move shows where it leads on a small board.
Without a line it says why: the module is loading, it is thinking, or the
position is over (mate or stalemate) and there is nothing to analyse.

It only renders: the viewer owns the engine (\`useEngine\`) and passes its
state in, so here the state is a real reading of the bundled engine and the
switch is a spy.

Source: \`components/chess/game-viewer/engine-panel.comp.tsx\`.
Reference page: [Components › EnginePanel](/components/chess/game-viewer/engine-panel) in the docs site.
`,
      },
    },
  },
  args: {
    fen: FEN,
    enabled: true,
    state: WITH_LINES,
    flipBoard: false,
    onToggle: fn(),
    onExpandedChange: fn(),
  },
  argTypes: {
    fen: { control: "text", description: "The board's position; the lines are read from it." },
    enabled: { control: "boolean", description: "The switch: off, only the head is drawn." },
    state: {
      control: "object",
      description: "`EngineState` from `useEngine`: lines, best line, loading, the position's outcome, failed.",
    },
    flipBoard: { control: "boolean", description: "The preview is seen from the same side as the board." },
    onToggle: { description: "The switch; a spy here." },
    onExpandedChange: { description: "Whether a line is expanded, for the viewer's accounting; a spy here." },
  },
  decorators: [
    // The notation card of the viewer, as narrow as its column can be; the
    // material look is a card of its own, on the workspace's white panel.
    (Story, { args }) =>
      args.look === "material" ? (
        <div style={{ maxWidth: 480, padding: 16, background: "var(--platform-m3-panel)" }}>
          <Story />
        </div>
      ) : (
        <div
          style={{
            maxWidth: 400,
            overflow: "hidden",
            borderRadius: 8,
            background: "var(--platform-surface)",
            boxShadow: "var(--platform-shadow-card)",
          }}
        >
          <Story />
        </div>
      ),
  ],
} satisfies Meta<typeof EnginePanel>;

export default meta;
type Story = StoryObj<typeof meta>;

/** On, with the three lines: 17… Ae6, the famous one, first and in the strongest ink; the depth in the head. */
export const Lines: Story = {};

/** One line expanded, by its `play` function: it shows a second row and the block grows by exactly that row. */
export const Expanded: Story = {
  play: async ({ canvasElement }) => {
    const [first] = within(canvasElement).getAllByRole("button", { name: "Ver más jugadas" });
    if (first) await userEvent.click(first);
  },
};

/** Pointing at 17… Ae6, by its `play` function: the small board shows the position it leads to, over the notation. */
export const Preview: Story = {
  decorators: [
    // The rest of the notation card, which the preview is painted over.
    (Story) => (
      <div style={{ minHeight: 460 }}>
        <Story />
      </div>
    ),
  ],
  play: async ({ canvasElement }) => {
    await userEvent.hover(within(canvasElement).getByText("Ae6"));
  },
};

/** Off, as the viewer opens: only the head and the switch, and nothing is downloaded until it is switched on. */
export const Off: Story = { args: { enabled: false } };

/** Just switched on: the worker is still downloading the engine, «Cargando el módulo…». */
export const Loading: Story = { args: { state: { ...SEARCHING, loading: true } } };

/** Loaded and searching a new position, before its first line arrives: «Pensando…». */
export const Thinking: Story = { args: { state: SEARCHING } };

/** A mate on the board: the engine has no line to give, and the panel says the game is over instead of waiting. */
export const Checkmate: Story = {
  args: { fen: MATED_FEN, state: { ...SEARCHING, outcome: positionOutcome(MATED_FEN) } },
};

/** A stalemate, said the same way: a draw, and nothing to analyse. */
export const Stalemate: Story = {
  args: { fen: STALEMATE_FEN, state: { ...SEARCHING, outcome: positionOutcome(STALEMATE_FEN) } },
};

/** The engine could not start in this browser, said instead of a switch that does not respond. */
export const Failed: Story = { args: { state: { ...SEARCHING, failed: true } } };

/**
 * The new design system's card (`look="material"`, the analysis board): the switch before «Módulo», each evaluation a
 * white pill, and «Ver más jugadas» under the three lines.
 */
export const Material: Story = { args: { look: "material" } };

/** The material card switched off: the switch and «Apagado», nothing under it. */
export const MaterialOff: Story = { args: { look: "material", enabled: false } };

/** The material card's «Ver más jugadas», pressed by its `play` function: the three lines open a second row each. */
export const MaterialExpanded: Story = {
  args: { look: "material" },
  play: async ({ canvasElement }) => {
    await userEvent.click(within(canvasElement).getByRole("button", { name: "Ver más jugadas" }));
  },
};
