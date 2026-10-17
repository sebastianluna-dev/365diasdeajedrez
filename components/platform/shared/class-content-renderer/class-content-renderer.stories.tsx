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
  visibility: "BEFORE",
  text: "## El puente de Lucena\n\nHoy vimos cómo ganar con torre y peón cuando el rey propio está delante del peón.\n\nRepasa la posición antes de la próxima clase.",
};
const VIDEO: ClassBlockView = {
  id: "b2",
  kind: "VIDEO",
  visibility: "AFTER",
  videoUrl: "https://www.youtube.com/watch?v=example",
  caption: "Grabación de la clase",
};
const GAME: ClassBlockView = {
  id: "b3",
  kind: "GAME_REF",
  visibility: "AFTER",
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
  visibility: "BEFORE",
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
  visibility: "BEFORE",
  caption: "Juegan las blancas: ¿cómo construyen el puente?",
  position: { fen: "1K1k4/1P6/8/8/8/8/r7/2R5 w - - 0 1", orientation: "white", title: "Lucena" },
};

/** An exercise block as the student reads it: their marks in this block, and «Resolver» («Volver a ver» once solved). */
const EXERCISES: ClassBlockView = {
  id: "b6",
  kind: "EXERCISE",
  visibility: "BEFORE",
  caption: "Dos mates para calentar antes de la clase.",
  exercises: [
    {
      id: "dmEjer01",
      n: 1,
      title: "El pasillo abierto",
      facts: "Mate en 1 · 900",
      startFen: "6k1/5ppp/8/8/8/8/5PPP/3R2K1 w - - 0 1",
      orientation: "white",
      mark: "solved",
      href: "/clases/c2/ejercicios/b6/1",
    },
    {
      id: "dmEjer02",
      n: 2,
      title: "El mate de Philidor",
      facts: "Mate en 2 · 1400",
      startFen: "r6k/6pp/7N/8/2Q5/8/6PP/6K1 w - - 0 1",
      orientation: "white",
      mark: "failed",
      href: "/clases/c2/ejercicios/b6/2",
    },
    {
      id: "dmEjer03",
      n: 3,
      title: "Mate de las negras",
      facts: "Mate en 1 · 1000",
      startFen: "3r2k1/5ppp/8/8/8/8/5PPP/6K1 b - - 0 1",
      orientation: "black",
      mark: null,
      href: "/clases/c2/ejercicios/b6/3",
    },
  ],
};

const meta = {
  title: "platform/shared/ClassContentRenderer",
  component: ClassContentRenderer,
  parameters: {
    docs: {
      description: {
        component: `
A class's material, block by block in its order, each an article with the
icon of its kind, its heading and its lead: text (a line that starts with
«## » is a subheading), a video as a link out, a game and a lesson inside
\`GameViewer\` — the game with its players and result, and with its next moves
hidden when its study says so — with a link to open them in full, and a
position as a \`StaticDiagram\`, and an exercise block as rows with the
student's mark in it and «Resolver» (D29) — the teacher and the staff read the
count instead. The chess blocks are references to the original material, not
copies. A block added after the class started wears «Nuevo»;
\`groups="byVisibility"\` folds the blocks by who sees them.

Source: \`components/platform/shared/class-content-renderer/class-content-renderer.comp.tsx\`.
Reference page: [Components › ClassContentRenderer](/components/platform/shared/class-content-renderer) in the docs site.
`,
      },
    },
  },
  args: { blocks: [TEXT, VIDEO, GAME, LESSON_REF, POSITION, EXERCISES], groups: "none" },
  argTypes: {
    blocks: { control: "object", description: "`ClassBlockView[]` from `services/classes/classes.types`, in order." },
    groups: { control: "inline-radio", options: ["none", "byVisibility"] },
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
  args: { blocks: [{ ...TEXT, text: TEXT.text.replace(/\n/g, "\r\n") }] },
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
    blocks: [{ ...GAME, game: { ...GAME.game, label: GAME.caption ?? "", href: undefined } }],
  },
};

/** A lesson, seen inside the class from its start position, with the link to open it whole. */
export const Lesson: Story = { args: { blocks: [LESSON_REF] } };

/** A position, as a static diagram with its caption. */
export const Position: Story = { args: { blocks: [POSITION] } };

/** A video, as a link out: the arrow, and «(se abre en una pestaña nueva)» for a screen reader. */
export const Video: Story = { args: { blocks: [VIDEO] } };

/** An exercise block as the student reads it (D29): one solved («Volver a ver»), one failed and one untried («Resolver»). */
export const Exercises: Story = { args: { blocks: [EXERCISES] } };

/**
 * The same block as the teacher and the staff read it: «2 de 3 lo resolvieron» beside each exercise, no way to
 * solve, and one the students no longer see.
 */
export const ExercisesReadOnly: Story = {
  name: "Exercises, read only",
  args: {
    blocks: [
      {
        ...EXERCISES,
        exercises: EXERCISES.exercises.map((item, index) => ({
          ...item,
          mark: null,
          href: undefined,
          solvedLabel: ["2 de 3 lo resolvieron", "1 de 3 lo resolvió", "0 de 3 lo resolvieron"][index],
          unavailable: index === 2 ? true : undefined,
        })),
      },
    ],
  },
};

/** A game with its record: the players' strips and the result around the board, and the next moves hidden. */
export const GameWithPlayers: Story = {
  name: "Game with players",
  args: {
    blocks: [
      {
        ...GAME,
        title: "La partida que comentamos",
        game: {
          ...GAME.game,
          players: {
            white: { name: "Morphy, Paul", country: "USA" },
            black: { name: "Duke Karl / Count Isouard", country: "FRA" },
          },
          result: "1-0",
          conceal: true,
          pinnedComment: "¿Qué jugarías tú por las blancas?",
        },
      },
    ],
  },
};

/** A block added after the class started: «Nuevo» beside its heading. */
export const NewBlock: Story = { name: "New block", args: { blocks: [{ ...TEXT, isNew: true }] } };

/** A lesson the block cited and that no longer exists. */
export const MissingLesson: Story = {
  name: "Missing lesson",
  args: { blocks: [{ ...LESSON_REF, lesson: { ...LESSON_REF.lesson, missing: true } }] },
};

/** Folded by visibility, as the staff's sheet reads a class: to prepare, after the class, and the script folded. */
export const ByVisibility: Story = {
  name: "By visibility",
  args: {
    groups: "byVisibility",
    blocks: [
      TEXT,
      LESSON_REF,
      { ...GAME, visibility: "AFTER" },
      { id: "b7", kind: "TEXT", visibility: "TEACHER", text: "Preguntas para abrir: ¿por qué 5...a6?" },
    ],
  },
};
