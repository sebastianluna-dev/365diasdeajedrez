import { useRef } from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { userEvent, within } from "storybook/test";
import { CLASS_BLOCK_KIND, CLASS_BLOCK_VISIBILITY } from "@/constants/platform/class-codes.const";
import { popupFormDone } from "@/services/shared/form-state";
import { BlockPopup, type BlockPopupHandle, type BlockPopupPreset } from "./block-popup.comp";

const PGN = "1. e4 c5 2. Nf3 d6 3. d4 cxd4 4. Nxd4 Nf6 5. Nc3 a6 *";
const GAMES = [
  {
    studyId: "s-own",
    isOwn: true,
    ownerLabel: "Mis estudios",
    studyName: "Partidas modelo",
    games: [{ id: "g1", label: "Morphy – Duque de Brunswick" }],
  },
  {
    studyId: "s-m",
    isOwn: false,
    ownerLabel: "Mateo Ríos",
    studyName: "Mis partidas",
    games: [{ id: "g2", label: "Mateo Ríos – Bot Nivel 3" }],
  },
];

const EXERCISES = [
  { id: "ex000001", title: "Mate del pasillo", facts: "Mate en 1 · 900", topics: "Táctica, Mate del pasillo" },
  { id: "ex000002", title: "El mate de Philidor", facts: "Mate en 2 · 1400", topics: "Táctica, Mate ahogado" },
  { id: "ex000003", title: "Las negras rematan", facts: "Mate en 1 · 1000", topics: "Táctica" },
];

/** A host with a button that opens the popup on a preset. */
function Host({ preset, groupSize = 1 }: { preset: BlockPopupPreset; groupSize?: number }) {
  const popup = useRef<BlockPopupHandle>(null);
  return (
    <>
      <button type="button" className="platform-button" onClick={(event) => popup.current?.open(event, preset)}>
        Abrir
      </button>
      <BlockPopup
        ref={popup}
        classId="c2"
        options={{ games: GAMES, exercises: EXERCISES }}
        groupSize={groupSize}
        endHour="13:00"
        studentLabel="Alumno Demo"
        addClassBlock={async () => popupFormDone("blockAdded")}
        updateClassBlock={async () => popupFormDone("blockSaved")}
        fetchReferencePgn={async () => PGN}
      />
    </>
  );
}

const meta = {
  title: "platform/sections/teacher/classes/class-block-editor/BlockPopup",
  component: Host,
  parameters: {
    docs: {
      description: {
        component: `
«Agregar un bloque» / «Editar el bloque»: what it is, when the student sees
it, and its fields by kind — a game transcribed on the board or cited from a
study, a lesson by id with its viewer as the check. The actions come as
props; the stories pass stubs and a host button that opens it.

Source: \`components/platform/sections/teacher/classes/class-block-editor/block-popup.comp.tsx\`.
Reference page: [Components › BlockPopup](/components/platform/sections/teacher/classes/class-block-editor/block-popup) in the docs site.
`,
      },
    },
  },
  args: { preset: { kind: CLASS_BLOCK_KIND.TEXT, visibility: CLASS_BLOCK_VISIBILITY.BEFORE } },
  argTypes: { preset: { control: "object" } },
  decorators: [
    (Story) => (
      <div className="platform-theme" style={{ padding: 16 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Host>;

export default meta;
type Story = StoryObj<typeof meta>;

const open = async ({ canvasElement }: { canvasElement: HTMLElement }) => {
  await userEvent.click(within(canvasElement).getByRole("button", { name: "Abrir" }));
};

/** A text block for «Para preparar». */
export const Text: Story = { play: open };

/** A game: transcribed on the board, or cited from a study. */
export const Game: Story = {
  args: { preset: { kind: CLASS_BLOCK_KIND.GAME_REF, visibility: CLASS_BLOCK_VISIBILITY.BEFORE } },
  play: open,
};

/** A lesson by its id, with the viewer under it as the check. */
export const Lesson: Story = {
  args: {
    preset: {
      visibility: CLASS_BLOCK_VISIBILITY.AFTER,
      block: {
        id: "b3",
        order: 3,
        kind: CLASS_BLOCK_KIND.LESSON_REF,
        visibility: CLASS_BLOCK_VISIBILITY.AFTER,
        lessonId: "20000005",
        isMovePathBroken: false,
      },
    },
  },
  play: open,
};

/** A video. */
export const Video: Story = {
  args: { preset: { kind: CLASS_BLOCK_KIND.VIDEO, visibility: CLASS_BLOCK_VISIBILITY.TEACHER } },
  play: open,
};

/** An exercise block (D29): the exercises to tick, and no «Guion del profesor» among the visibilities (D30). */
export const Exercise: Story = {
  args: { preset: { kind: CLASS_BLOCK_KIND.EXERCISE, visibility: CLASS_BLOCK_VISIBILITY.AFTER } },
  play: async ({ canvasElement }) => {
    await open({ canvasElement });
    const dialog = canvasElement.querySelector("dialog");
    if (dialog) await userEvent.click(within(dialog).getByRole("checkbox", { name: /El mate de Philidor/ }));
  },
};

/** A group class citing a student's game: the warning that every student will see it. */
export const GroupWarning: Story = {
  name: "Group warning",
  args: {
    preset: { kind: CLASS_BLOCK_KIND.GAME_REF, visibility: CLASS_BLOCK_VISIBILITY.BEFORE, gameId: "g2" },
    groupSize: 4,
  },
  play: async ({ canvasElement }) => {
    await open({ canvasElement });
    const dialog = canvasElement.querySelector("dialog");
    if (dialog) await userEvent.click(within(dialog).getByRole("radio", { name: /De un estudio/ }));
  },
};
