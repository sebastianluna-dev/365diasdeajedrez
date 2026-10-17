import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { userEvent, within } from "storybook/test";
import { CLASS_BLOCK_KIND, CLASS_BLOCK_VISIBILITY, CLASS_PHASE } from "@/constants/platform/class-codes.const";
import type { ClassBlockView } from "@/services/classes/classes.types";
import { popupFormDone } from "@/services/shared/form-state";
import type { TeacherClassBlock } from "@/services/teacher-classes/teacher-classes.types";
import { ClassBlockList } from "./class-block-list.comp";

const BLOCKS: TeacherClassBlock[] = [
  {
    id: "b1",
    order: 1,
    kind: CLASS_BLOCK_KIND.TEXT,
    visibility: CLASS_BLOCK_VISIBILITY.BEFORE,
    text: "Trae tus dudas\n\nApunta las dos posiciones del capítulo 2 que no te quedaron claras.",
    caption: "Trae tus dudas",
    isMovePathBroken: false,
  },
  {
    id: "b2",
    order: 2,
    kind: CLASS_BLOCK_KIND.LESSON_REF,
    visibility: CLASS_BLOCK_VISIBILITY.BEFORE,
    lessonId: "20000004",
    referenceLabel: "La Variante Najdorf › La posición de partida de la Najdorf",
    isMovePathBroken: false,
  },
  {
    id: "b3",
    order: 3,
    kind: CLASS_BLOCK_KIND.LESSON_REF,
    visibility: CLASS_BLOCK_VISIBILITY.AFTER,
    lessonId: "20000005",
    referenceLabel: "La Variante Najdorf › El Peón Envenenado",
    isMovePathBroken: false,
  },
  {
    id: "b4",
    order: 4,
    kind: CLASS_BLOCK_KIND.TEXT,
    visibility: CLASS_BLOCK_VISIBILITY.TEACHER,
    text: "Preguntas para abrir\n\n¿Por qué 5...a6?",
    caption: "Preguntas para abrir",
    isMovePathBroken: false,
  },
  {
    id: "b5",
    order: 5,
    kind: CLASS_BLOCK_KIND.EXERCISE,
    visibility: CLASS_BLOCK_VISIBILITY.BEFORE,
    caption: "Dos mates para calentar antes de la clase.",
    referenceLabel: "2 ejercicios",
    exerciseIds: ["dmEjer01", "dmEjer02"],
    isMovePathBroken: false,
  },
];

const PGN = "1. e4 c5 2. Nf3 d6 3. d4 cxd4 4. Nxd4 Nf6 5. Nc3 a6 *";
const VIEWS: ClassBlockView[] = [
  {
    id: "b1",
    kind: "TEXT",
    visibility: "BEFORE",
    title: "Trae tus dudas",
    isNew: false,
    caption: "Trae tus dudas",
    text: "Apunta las dos posiciones del capítulo 2 que no te quedaron claras.",
  },
  {
    id: "b2",
    kind: "LESSON_REF",
    visibility: "BEFORE",
    isNew: false,
    lesson: {
      id: "20000004",
      name: "La posición de partida de la Najdorf",
      href: "/cursos/00020212/1/20000004",
      pgn: PGN,
      orientation: "WHITE",
      missing: false,
    },
  },
  {
    id: "b3",
    kind: "LESSON_REF",
    visibility: "AFTER",
    isNew: false,
    lesson: {
      id: "20000005",
      name: "El Peón Envenenado",
      href: "/cursos/00020212/1/20000005",
      pgn: PGN,
      orientation: "WHITE",
      missing: false,
    },
  },
  {
    id: "b4",
    kind: "TEXT",
    visibility: "TEACHER",
    title: "Preguntas para abrir",
    isNew: false,
    caption: "Preguntas para abrir",
    text: "¿Por qué 5...a6?",
  },
  {
    id: "b5",
    kind: "EXERCISE",
    visibility: "BEFORE",
    isNew: false,
    caption: "Dos mates para calentar antes de la clase.",
    exercises: [
      {
        id: "dmEjer01",
        n: 1,
        title: "El pasillo abierto",
        facts: "Mate en 1 · 900",
        startFen: "6k1/5ppp/8/8/8/8/5PPP/3R2K1 w - - 0 1",
        orientation: "white",
        mark: null,
        solvedLabel: "1 de 1 lo resolvió",
      },
      {
        id: "dmEjer02",
        n: 2,
        title: "El mate de Philidor",
        facts: "Mate en 2 · 1400",
        startFen: "r6k/6pp/7N/8/2Q5/8/6PP/6K1 w - - 0 1",
        orientation: "white",
        mark: null,
        solvedLabel: "0 de 1 lo resolvieron",
      },
    ],
  },
] as ClassBlockView[];

const stubs = {
  addClassBlock: async () => popupFormDone("blockAdded"),
  updateClassBlock: async () => popupFormDone("blockSaved"),
  deleteClassBlock: async () => undefined,
  reorderClassBlocks: async () => ({ ok: true }),
  fetchReferencePgn: async () => PGN,
};

const meta = {
  title: "platform/sections/teacher/classes/ClassBlockList",
  component: ClassBlockList,
  parameters: {
    docs: {
      description: {
        component: `
The class's material as the teacher edits it: three sections, each a
sortable list of blocks drawn as the student sees them and folded to a
line, with its «…» and, at the foot, what can be added. «Ver como alumno»
draws only what the student sees now. The actions come as props; the
stories pass stubs.

Source: \`components/platform/sections/teacher/classes/class-block-list/class-block-list.comp.tsx\`.
Reference page: [Components › ClassBlockList](/components/platform/sections/teacher/classes/class-block-list) in the docs site.
`,
      },
    },
  },
  args: {
    classId: "c2",
    blocks: BLOCKS,
    views: VIEWS,
    phase: CLASS_PHASE.OPEN,
    editable: true,
    studentLabel: "Alumno Demo",
    groupSize: 1,
    endHour: "13:00",
    options: {
      games: [],
      exercises: [
        { id: "dmEjer01", title: "El pasillo abierto", facts: "Mate en 1 · 900", topics: "Táctica" },
        { id: "dmEjer02", title: "El mate de Philidor", facts: "Mate en 2 · 1400", topics: "Táctica" },
      ],
    },
    actions: stubs,
  },
  argTypes: { blocks: { control: "object" }, views: { control: "object" } },
  decorators: [
    (Story) => (
      <div className="platform-theme platform-card" style={{ maxWidth: 820 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof ClassBlockList>;

export default meta;
type Story = StoryObj<typeof meta>;

/** The three sections, each with its blocks and what can be added. */
export const ThreeSections: Story = { name: "Three sections" };

/** No blocks yet. */
export const Empty: Story = { args: { blocks: [], views: [] } };

/** «Subir» from the second block's menu: it takes the first place, said in the status line. */
export const Reordering: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: /Opciones del bloque 2/ }));
    await userEvent.click(await canvas.findByRole("menuitem", { name: "Subir" }));
  },
};

/** «Ver como alumno»: only «Para preparar» while the class has not ended, as the student sees it. */
export const AsStudent: Story = {
  name: "As student",
  play: async ({ canvasElement }) => {
    await userEvent.click(within(canvasElement).getByRole("switch", { name: "Ver como alumno" }));
  },
};
