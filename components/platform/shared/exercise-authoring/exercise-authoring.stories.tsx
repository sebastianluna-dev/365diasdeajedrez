import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, userEvent, waitFor, within } from "storybook/test";
import type { FetchPgn } from "@/components/platform/shared/move-path-picker/move-path-picker.comp";
import { POPUP_FORM_IDLE, type PopupFormState } from "@/services/shared/form-state";
import { ExerciseAuthoring } from "./exercise-authoring.comp";
import type {
  ExerciseAuthoringCatalogs,
  ExerciseAuthoringExercise,
  ExerciseSaveAction,
  ExerciseSaveButton,
} from "./exercise-authoring.types";

const CATALOGS: ExerciseAuthoringCatalogs = {
  kinds: [
    { code: "SEQUENCE", label: "Secuencia" },
    { code: "MATE_IN", label: "Mate en N" },
  ],
  topics: [
    { code: "TACTICS", label: "Táctica", parentCode: null },
    { code: "OPENING_LINE", label: "Aperturas", parentCode: null },
    { code: "ENDGAME", label: "Finales", parentCode: null },
    { code: "FORK", label: "Ataque doble", parentCode: "TACTICS" },
    { code: "PIN", label: "Clavada", parentCode: "TACTICS" },
    { code: "DEFLECTION", label: "Desviación", parentCode: "TACTICS" },
    { code: "SACRIFICE", label: "Sacrificio", parentCode: "TACTICS" },
    { code: "BACK_RANK_MATE", label: "Mate del pasillo", parentCode: "TACTICS" },
  ],
  levels: [
    { slug: "principiante", name: "Principiante", order: 1, eloMin: 800, eloMax: 1199, isActive: true },
    { slug: "intermedio", name: "Intermedio", order: 2, eloMin: 1200, eloMax: 1599, isActive: true },
    { slug: "avanzado", name: "Avanzado", order: 3, eloMin: 1600, eloMax: 1999, isActive: true },
  ],
};

const GAMES = [
  { id: "g1x2y3z4", label: "Legal de Kermeur – Saint Brie", studyName: "Mates clásicos" },
  { id: "g5x6y7z8", label: "Morphy – Duque de Brunswick", studyName: "Mates clásicos" },
];

/** Légal's mate, for «Desde una partida». */
const LEGAL_MATE = `[Event "París"]
[White "Legal de Kermeur"]
[Black "Saint Brie"]
[Date "1750.??.??"]

1. e4 e5 2. Bc4 d6 3. Nf3 Bg4 4. Nc3 g6 5. Nxe5 Bxd1 6. Bxf7+ Ke7 7. Nd5# 1-0`;

const NEW: ExerciseAuthoringExercise = {
  id: null,
  statusCode: null,
  solutionPgn: '[SetUp "1"]\n[FEN "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"]\n\n*',
  kind: "SEQUENCE",
  mateIn: null,
  title: "",
  prompt: null,
  difficulty: 1200,
  topicCodes: [],
  hints: [],
  explanation: null,
  sourceWhite: null,
  sourceBlack: null,
  sourceEvent: null,
  sourceYear: null,
  sourceGameId: null,
};

/** A mate in 2 with its sacrifice: 1. Qd8+ Bxd8 2. Re8#. */
const MATE_IN_TWO: ExerciseAuthoringExercise = {
  ...NEW,
  id: "ex000002",
  statusCode: "READY",
  solutionPgn:
    '[SetUp "1"]\n[FEN "r1b2k1r/ppp1bppp/8/1B1Q4/5q2/2P5/PPP2PPP/R3R1K1 w - - 1 1"]\n\n1. Qd8+ { La dama se entrega para desviar el alfil. } Bxd8 2. Re8# *',
  kind: "MATE_IN",
  mateIn: 2,
  title: "La dama que se entrega",
  prompt: "Juegan blancas y dan mate en 2",
  difficulty: 1400,
  topicCodes: ["TACTICS", "DEFLECTION", "SACRIFICE"],
  hints: ["El alfil de e7 cuida d8.", "¿Y si lo obligas a irse?"],
  explanation: "Tras 1. Dd8+ Axd8 la torre entra en e8: el alfil ya no la cubre.",
  sourceWhite: "Anderssen",
  sourceEvent: "Partida libre",
};

const DRAFT_BUTTONS: ExerciseSaveButton[] = [
  { intent: "draft", label: "Guardar borrador", pendingLabel: "Guardando…", accent: false, needsReadiness: false },
  {
    intent: "ready",
    label: "Guardar y marcar como listo",
    pendingLabel: "Guardando…",
    accent: true,
    needsReadiness: true,
  },
];

const save: ExerciseSaveAction = async (state: PopupFormState) => state ?? POPUP_FORM_IDLE;

const meta = {
  title: "platform/shared/ExerciseAuthoring",
  component: ExerciseAuthoring,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component: `
The exercise editor (PLAN.md §4.2), the same for every author: three steps as
tabs — «Posición» (pieces placed, a pasted FEN or PGN, or a move of one of the
author's games), «Solución» (played on the board, its rules checked as it is
played) and «Datos» — over one lifted draft, and one save bar outside the
tabs. Before sending, the server's rules are checked on the draft: the editor
moves to the tab of the first problem, focuses it, and marks every tab that
has one. Its actions arrive as props (\`save\`, \`fetchGamePgn\`, \`duplicate\`),
stubs here.

Source: \`components/platform/shared/exercise-authoring/exercise-authoring.comp.tsx\`.
Reference page: [Components › ExerciseAuthoring](/components/platform/shared/exercise-authoring) in the docs site.
`,
      },
    },
  },
  args: {
    exercise: NEW,
    catalogs: CATALOGS,
    games: GAMES,
    permissions: { contentLocked: null, canDuplicate: false },
    buttons: DRAFT_BUTTONS,
    save: fn(save).mockName("save"),
    fetchGamePgn: (async () => LEGAL_MATE) as FetchPgn,
  },
  decorators: [
    (Story) => (
      <div className="platform-theme" style={{ maxWidth: 1280, padding: 24 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof ExerciseAuthoring>;

export default meta;
type Story = StoryObj<typeof meta>;

/** A new exercise, on «Posición»: the standard start on the placement board, its palette, the turn, castling and the tools; «Guardar borrador» and the accent «Guardar y marcar como listo» under the tabs. */
export const New: Story = {};

/** A ready «Mate en 2» opened on «Solución»: the board, its moves and comment, «La solución cumple las reglas.», and only «Guardar». */
export const EditingAMateInTwo: Story = {
  args: {
    exercise: MATE_IN_TWO,
    buttons: [{ intent: "save", label: "Guardar", pendingLabel: "Guardando…", accent: true, needsReadiness: true }],
    permissions: { contentLocked: null, canDuplicate: true },
  },
};

/** «Datos» of that mate: the fields, the level under «Dificultad» and the topics under their heading. */
export const DataOfAMateInTwo: Story = {
  args: EditingAMateInTwo.args,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("tab", { name: "Datos" }));
    await expect(canvas.getByText("Nivel: Intermedio (1200–1599)")).toBeVisible();
  },
};

/** «Probar» on that mate: the solve screen in preview over the unsaved draft — «Juegan blancas y dan mate en 2», «Pista», «Ver la solución» — and nothing recorded. Its `play` shows the solution. */
export const TryingAMateInTwo: Story = {
  args: EditingAMateInTwo.args,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("tab", { name: "Probar" }));
    await expect(canvas.getByText("Vista previa: el intento no se guarda.")).toBeVisible();
    await userEvent.click(canvas.getByRole("button", { name: "Ver la solución" }));
    // The result fades in (160 ms): it is visible once its entrance is over.
    await waitFor(() => expect(canvas.getByText("Esta vez viste la solución")).toBeVisible());
  },
};

/** A refused save: «Guardar y marcar como listo» on a new exercise with no moves, no title and no topic marks «Solución» and «Datos», opens the first and says why; nothing is sent. */
export const RefusedSave: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "Guardar y marcar como listo" }));
    await expect(canvas.getByRole("tab", { name: "Solución, con errores" })).toHaveAttribute("aria-selected", "true");
    await expect(canvas.getByRole("tab", { name: "Datos, con errores" })).toBeVisible();
    await expect(canvas.getByText("Juega la solución en el tablero: todavía no tiene jugadas.")).toBeVisible();
    await expect(args.save).not.toHaveBeenCalled();
  },
};

/** «Pegar FEN o PGN»: the two fields of the analysis board, «Usar sus jugadas como solución» and «Cargar posición». */
export const PasteAPosition: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("radio", { name: "Pegar FEN o PGN" }));
    await expect(canvas.getByRole("button", { name: "Cargar posición" })).toBeVisible();
  },
};

/** In the library, so locked: the reason over the tabs, the board and fields read-only, and «Duplicar» instead of the save. */
export const Locked: Story = {
  args: {
    exercise: { ...MATE_IN_TWO, statusCode: "PUBLISHED" },
    permissions: { contentLocked: "inLibrary", canDuplicate: true },
    buttons: [],
    duplicate: fn(async () => undefined).mockName("duplicate"),
  },
};
