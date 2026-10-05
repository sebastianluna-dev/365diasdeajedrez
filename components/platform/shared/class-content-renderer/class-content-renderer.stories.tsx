import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, within } from "storybook/test";
import type { ClassBlockView } from "@/services/classes/classes.types";
import { ClassContentRenderer } from "./class-content-renderer.comp";

/** Morphy against the Duke of Brunswick and Count Isouard, Paris 1858: the "Opera game", in the public domain. */
const OPERA_GAME = `[Event "Paris"]
[Site "Paris FRA"]
[Date "1858.??.??"]
[White "Morphy, Paul"]
[Black "Duke Karl / Count Isouard"]
[Result "1-0"]

1. e4 e5 2. Nf3 d6 3. d4 Bg4 4. dxe5 Bxf3 5. Qxf3 dxe5 6. Bc4 Nf6 7. Qb3 Qe7
8. Nc3 c6 9. Bg5 b5 10. Nxb5 cxb5 11. Bxb5+ Nbd7 12. O-O-O Rd8 13. Rxd7 Rxd7
14. Rd1 Qe6 15. Bxd7+ Nxd7 16. Qb8+ Nxb8 17. Rd8# 1-0`;

/** A lesson's PGN: its prose lives in the comments. */
const LESSON = `[Event "Finales de torres"]
[White "Lección"]
[Black "Lucena"]
[FEN "1K1k4/1P6/8/8/8/8/r7/2R5 w - - 0 1"]
[SetUp "1"]
[Result "*"]

{ El rey blanco está encerrado delante de su peón. La idea es construir un puente. }
1. Rd1+ Ke7 2. Rd4 { La torre se prepara para cubrir al rey de los jaques. } Rb2 3. Kc7 Rc2+ 4. Kb6 Rb2+
5. Kc6 Rc2+ 6. Kb5 Rb2+ 7. Rb4 { El puente: la torre corta los jaques, el rey la protege y el peón corona. } *`;

const TEXT: ClassBlockView = {
  id: "b1",
  kind: "TEXT",
  text: "## El puente de Lucena\n\nHoy vimos cómo ganar con torre y peón cuando el rey propio está delante del peón.\n\nRepasa la posición antes de la próxima clase.",
};
const VIDEO: ClassBlockView = {
  id: "b2",
  kind: "VIDEO",
  videoUrl: "https://www.youtube.com/watch?v=example",
  caption: "Grabación de la clase",
};
const GAME: ClassBlockView = {
  id: "b3",
  kind: "GAME_REF",
  caption: "La partida que comentamos al final.",
  // The label the mapper gives a study's game: its two players, as the PGN writes them.
  game: {
    id: "g1",
    label: "Morphy, Paul – Duke Karl / Count Isouard",
    pgn: OPERA_GAME,
    href: "/estudios/1/partidas/1",
  },
};
const LESSON_REF: ClassBlockView = {
  id: "b4",
  kind: "LESSON_REF",
  lesson: {
    id: "l1",
    name: "La posición de Lucena",
    pgn: LESSON,
    orientation: "white",
    href: "/cursos/finales-de-torres/2/18",
  },
};
const POSITION: ClassBlockView = {
  id: "b5",
  kind: "POSITION_REF",
  caption: "Juegan las blancas: ¿cómo construyen el puente?",
  position: { fen: "1K1k4/1P6/8/8/8/8/r7/2R5 w - - 0 1", orientation: "white", title: "Lucena" },
};
const FILE: ClassBlockView = { id: "b6", kind: "FILE", caption: "Ejercicios para la semana" };

const meta = {
  title: "platform/shared/ClassContentRenderer",
  component: ClassContentRenderer,
  parameters: {
    docs: {
      description: {
        component: `
A class's material, block by block in its order, each drawn by its kind: text
(a line that starts with «## » is a subheading), a video and a file as link
cards, a game and a lesson inside \`GameViewer\` with a link to open them in
full, and a position as a \`StaticDiagram\`. The chess blocks are references to
the original material, not copies.

Source: \`components/platform/shared/class-content-renderer/class-content-renderer.comp.tsx\`.
Reference page: [Components › ClassContentRenderer](/components/platform/shared/class-content-renderer) in the docs site.
`,
      },
    },
  },
  args: { blocks: [TEXT, VIDEO, GAME, LESSON_REF, POSITION, FILE] },
  argTypes: {
    blocks: { control: "object", description: "`ClassBlockView[]` from `services/classes/classes.types`, in order." },
  },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 900 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof ClassContentRenderer>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Every kind of block, in the order a teacher might put them. */
export const EveryKind: Story = { name: "Every kind" };

/** Text: paragraphs, and a line with «## » as a subheading. */
export const Text: Story = { args: { blocks: [TEXT] } };

/** The same text with the CRLF line breaks a form sends: it still breaks into a subheading and two paragraphs. */
export const TextWithCrlf: Story = {
  name: "Text with CRLF",
  args: { blocks: [{ ...TEXT, text: TEXT.text?.replace(/\n/g, "\r\n") ?? null }] },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("heading", { name: "El puente de Lucena" })).toBeVisible();
    await expect(canvasElement.querySelectorAll(".class-content__text-paragraph")).toHaveLength(2);
  },
};

/** A game of a study, in the viewer, with the link to open it in «Mis estudios» and its caption. */
export const Game: Story = { args: { blocks: [GAME] } };

/**
 * A game transcribed in the class: it lives nowhere else, so there is no link to open it, and the mapper titles it
 * with the block's caption — which is then written under the board as well.
 */
export const TranscribedGame: Story = {
  name: "Transcribed game",
  args: {
    blocks: [{ ...GAME, game: { ...GAME.game, label: GAME.caption ?? "", href: undefined } }] as ClassBlockView[],
  },
};

/** A lesson, seen inside the class from its start position, with the link to open it whole. */
export const Lesson: Story = { args: { blocks: [LESSON_REF] } };

/** A position, as a static diagram with its caption. */
export const Position: Story = { args: { blocks: [POSITION] } };

/** A video and a file, as link cards. */
export const VideoAndFile: Story = { name: "Video and file", args: { blocks: [VIDEO, FILE] } };
