import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { CLASS_PHASE, TRANSCRIPT_STATUS } from "@/constants/platform/class-codes.const";
import { cdmx } from "@/lib/testing/fixtures/classes";
import { studentDetail, studentJoin } from "@/lib/testing/fixtures/student-classes";
import type { ClassBlockView } from "@/services/classes/classes.types";
import { ClassReviewSection } from "./class-review.section";

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

const MATERIAL: ClassBlockView[] = [
  {
    id: "b1",
    kind: "TEXT",
    visibility: "BEFORE",
    title: "Antes de la clase",
    text: "Repasa los tres errores que dejan al rey en el centro.",
  },
  {
    id: "b2",
    kind: "GAME_REF",
    visibility: "AFTER",
    caption: "La Partida de la Ópera: desarrollo con amenaza y columnas abiertas.",
    game: {
      id: "g1",
      label: "Paul Morphy – Duque de Brunswick y conde Isouard",
      pgn: OPERA_GAME,
      players: {
        white: { name: "Paul Morphy", country: "USA" },
        black: { name: "Duque de Brunswick y conde Isouard" },
      },
      result: "1-0",
      orientation: "white",
    },
  },
  {
    id: "b3",
    kind: "TEXT",
    visibility: "AFTER",
    title: "Para la próxima",
    text: "Resuelve los cinco ejercicios de sacrificio en d7.",
    isNew: true,
  },
];

const review = studentDetail({
  id: "c1",
  href: "/clases/c1",
  title: "Ataques al rey en el centro",
  description: null,
  view: "review",
  startIso: cdmx("2026-10-07", "12:00").toISOString(),
  endIso: cdmx("2026-10-07", "13:00").toISOString(),
  join: studentJoin({
    phase: CLASS_PHASE.DONE,
    meetingUrl: null,
    startIso: cdmx("2026-10-07", "12:00").toISOString(),
    endIso: cdmx("2026-10-07", "13:00").toISOString(),
    visibleFromIso: cdmx("2026-10-07", "11:30").toISOString(),
    untilIso: cdmx("2026-10-07", "13:30").toISOString(),
  }),
  coverage: "Clase 1 de 4 de tu pago del 1 de octubre · Individual",
  attended: true,
  summary:
    "Vimos los tres errores típicos que dejan al rey en el centro y la técnica de Morphy para explotarlos: desarrollo con amenaza, apertura de columnas y sacrificio de calidad en d7.",
  recordingUrl: "https://zoom.us/rec/demo-ataques-al-rey",
  blocks: MATERIAL,
  transcript: {
    statusCode: TRANSCRIPT_STATUS.READY,
    statusLabel: "Lista",
    text: "Profesor: Hoy vamos a ver qué pasa cuando el rey se queda en el centro…\nAlumno: ¿Y si enroca largo?",
  },
});

const meta = {
  title: "platform/sections/classes/class-detail/ClassReviewSection",
  component: ClassReviewSection,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component: `
The class page once it is over (ALU-3): whether they came, the recording,
the summary, the material with its index, the transcript folded, and «Tu
clase» with what is left of the payment.

Source: \`components/platform/sections/classes/class-detail/class-review.section.tsx\`.
Reference page: [Components › ClassReviewSection](/components/platform/sections/classes/class-detail/class-review-section) in the docs site.
`,
      },
    },
  },
  args: {
    classDetail: review,
    saveGame: { studies: [{ id: "s1", name: "Mis partidas" }], action: async () => {} },
  },
  decorators: [
    (Story) => (
      <div className="platform-theme platform-page platform-page_width_wide">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof ClassReviewSection>;

export default meta;
type Story = StoryObj<typeof meta>;

/** «Asististe», the recording, the summary, the material with the game and «Guardar en un estudio». */
export const Attended: Story = {};

/** «No asististe»: the seat was spent. */
export const Absent: Story = {
  args: { classDetail: { ...review, attended: false, recordingUrl: null } },
};

/** The seat moved to another date: «No asististe · tu clase pasó al vie 16 oct». */
export const Moved: Story = {
  args: {
    classDetail: {
      ...review,
      attended: false,
      moved: { label: "No asististe · tu clase pasó al vie 16 oct", href: "/clases/c12" },
      coverage: "De tu pago del 1 de octubre · Individual",
    },
  },
};

/** The seat back in the payment. */
export const MovedBack: Story = {
  name: "Moved back",
  args: {
    classDetail: {
      ...review,
      attended: false,
      moved: { label: "No asististe · tu clase volvió a tu pago", href: null },
      coverage: "De tu pago del 1 de octubre · Individual",
    },
  },
};

/** Over but not finalized: «Finalizada» all the same, no mark yet, no summary. */
export const AwaitingClose: Story = {
  name: "Awaiting close",
  args: {
    classDetail: {
      ...review,
      phase: CLASS_PHASE.AWAITING_CLOSE,
      attended: null,
      summary: null,
      recordingUrl: null,
      transcript: null,
      blocks: MATERIAL.slice(0, 1),
    },
  },
};
