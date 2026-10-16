import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, userEvent, waitFor, within } from "storybook/test";
import { ExerciseCard } from "./exercise-card.comp";
import type { ExerciseCardData } from "./exercise-card.types";

const READY: ExerciseCardData = {
  id: "ex000002",
  href: "/profesor/ejercicios/ex000002",
  title: "La dama que se entrega",
  startFen: "r1b2k1r/ppp1bppp/8/1B1Q4/5q2/2P5/PPP2PPP/R3R1K1 w - - 1 1",
  orientation: "white",
  statusCode: "READY",
  statusLabel: "Listo",
  kindLabel: "Mate en 2",
  difficulty: 1400,
  levelName: "Intermedio",
  playerMoves: 2,
  topicLabels: ["Táctica", "Desviación", "Sacrificio"],
  allowed: { duplicate: true, archive: true, restore: false, delete: true },
};

const action = () => fn(async () => undefined);

const meta = {
  title: "platform/shared/ExerciseCard",
  component: ExerciseCard,
  parameters: {
    docs: {
      description: {
        component: `
An exercise of a bank: the start position small, the title that opens it, the
status and the kind as tags, the difficulty with its level, the student's
moves and the topics; and, with \`actions\`, the row's words. «Eliminar» is
only offered for one nobody has tried, behind its confirmation.

Source: \`components/platform/shared/exercise-card/exercise-card.comp.tsx\`.
Reference page: [Components › ExerciseCard](/components/platform/shared/exercise-card) in the docs site.
`,
      },
    },
  },
  args: {
    exercise: READY,
    actions: { duplicate: action(), archive: action(), restore: action(), delete: action() },
  },
  decorators: [
    (Story) => (
      <div className="platform-theme" style={{ maxWidth: 560, padding: 24 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof ExerciseCard>;

export default meta;
type Story = StoryObj<typeof meta>;

/** A ready «Mate en 2» nobody has tried: «Duplicar», «Archivar» and «Eliminar». */
export const Ready: Story = {};

/** A draft sequence with Black to move: the plain tag, the board turned, no level for its difficulty. */
export const Draft: Story = {
  args: {
    exercise: {
      ...READY,
      title: "Clavada en la columna e",
      startFen: "4r1k1/5ppp/8/8/8/2B5/4QPPP/6K1 b - - 0 1",
      orientation: "black",
      statusCode: "DRAFT",
      statusLabel: "Borrador",
      kindLabel: "Secuencia",
      difficulty: 2600,
      levelName: null,
      playerMoves: 3,
      topicLabels: [],
    },
  },
};

/** Tried by students and then archived: the board steps back, «Restaurar», and no «Eliminar» — its history is kept. */
export const Archived: Story = {
  args: {
    exercise: {
      ...READY,
      statusCode: "ARCHIVED",
      statusLabel: "Archivado",
      allowed: { duplicate: true, archive: false, restore: true, delete: false },
    },
  },
};

/** «Eliminar» opens its confirmation over the page, naming the exercise. */
export const ConfirmDelete: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "Eliminar" }));
    const dialog = await canvas.findByRole("dialog", { name: "¿Eliminar «La dama que se entrega»?" });
    await waitFor(() => expect(dialog).toBeVisible());
  },
};
