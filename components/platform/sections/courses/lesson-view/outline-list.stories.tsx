import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, waitFor, within } from "storybook/test";
import { PROGRESS_STATUS } from "@/constants/platform/shared-codes.const";
import { platformRoutes } from "@/lib/platform-routes";
import type { LessonSibling } from "@/services/courses/courses.types";
import { OutlineList } from "./outline-list.comp";
// The list has no sheet of its own: its rows are drawn by the column's.
import "./lesson-outline.comp.css";

const COURSE = "finales-de-torres";
const CHAPTER = 2;

const href = (lessonId: string) => platformRoutes.lessonDetail(COURSE, CHAPTER, lessonId);

/** One lesson of the chapter, by its id and name. */
function lesson(id: string, name: string, statusCode: LessonSibling["statusCode"]): LessonSibling {
  return { id, name, href: href(id), statusCode };
}

const { COMPLETED, IN_PROGRESS, NOT_STARTED } = PROGRESS_STATUS;

/** A chapter of rook endings: two lessons done, the third being read, one done ahead of its turn. */
const LESSONS: LessonSibling[] = [
  lesson("lucena", "La posición de Lucena", COMPLETED),
  lesson("philidor", "La posición de Philidor", COMPLETED),
  lesson("torre-detras", "La torre, detrás del peón pasado", IN_PROGRESS),
  lesson("rey-cortado", "El rey cortado por una columna", NOT_STARTED),
  lesson("vancura", "La defensa Vancura", COMPLETED),
  lesson("peon-de-torre", "Torre y peón de torre", NOT_STARTED),
  lesson("repaso", "Repaso: ocho finales para resolver", NOT_STARTED),
];

/** A long chapter: sixteen lessons, the first twelve done. */
const LONG_CHAPTER: LessonSibling[] = [
  "Mate con dama",
  "Mate con torre",
  "La oposición",
  "La regla del cuadrado",
  "Rey y peón contra rey",
  "Peones pasados alejados",
  "La posición de Lucena",
  "La posición de Philidor",
  "La torre, detrás del peón pasado",
  "El rey cortado por una columna",
  "La defensa Vancura",
  "Torre y peón de torre",
  "Alfil y peón de torre: el color equivocado",
  "Caballo contra peón",
  "Dama contra peón en séptima",
  "Repaso del capítulo",
].map((name, index) => lesson(`leccion-${index + 1}`, name, index < 12 ? COMPLETED : NOT_STARTED));

const meta = {
  title: "platform/sections/courses/lesson-view/OutlineList",
  component: OutlineList,
  parameters: {
    nextjs: { navigation: { pathname: href("torre-detras") } },
    docs: {
      description: {
        component: `
The rows of the column beside a lesson, and the only client piece of it: it
marks the lesson being read from the pathname — that row is not a link, it
carries \`aria-current="page"\` and is painted in the accent — and every
lesson carries its stop on the dotted thread, the filled check once it is
done and an empty ring while it is not (in progress counts as not done). On
every change of pathname it brings the lesson being read back into view when
the column's scroll leaves it cut off, under the chapter's sticky head.

The list has no stylesheet of its own: the story imports the column's
(\`lesson-outline.comp.css\`) and mounts the list where \`LessonOutline\` does,
in the column's scroller under the chapter's head — which the decorator draws
as plain markup, since \`LessonOutline\` imports a server action. Storybook's
router reports the lesson's path.

Source: \`components/platform/sections/courses/lesson-view/outline-list.comp.tsx\`.
Reference page: [Components › OutlineList](/components/platform/sections/courses/lesson-view/outline-list) in the docs site.
`,
      },
    },
  },
  args: { lessons: LESSONS },
  argTypes: {
    lessons: {
      control: "object",
      description:
        "`LessonSibling[]` (`id`, `name`, `href`, `statusCode`) in reading order; the row whose `href` is the pathname is the one being read.",
    },
  },
  decorators: [
    (Story, { parameters }) => {
      // A height turns the column into what it is on a wide window: a panel
      // whose list scrolls under the chapter. Without one it grows with its
      // lessons, as it does once it drops under the lesson.
      const height = parameters.columnHeight as number | undefined;
      return (
        // In the app the column is pinned to the window's left edge; here it
        // is put back in the flow, at its own width.
        <nav
          className="lesson-outline"
          aria-label="Lecciones del capítulo"
          style={{ position: "static", width: "100%", maxWidth: 360, height }}
        >
          <div className="lesson-outline__body" style={height ? { overflow: "auto" } : undefined}>
            <div data-sticky-head="" className="lesson-outline__chapter">
              <span className="lesson-outline__chapter-name">Finales de torre que hay que saber</span>
            </div>
            <Story />
          </div>
        </nav>
      );
    },
  ],
} satisfies Meta<typeof OutlineList>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Midway through a chapter: two lessons done, the third being read (still in progress, so its ring is empty), and one done ahead of its turn. */
export const MidChapter: Story = {};

/** Going back to a lesson already done: the row being read carries its check, drawn on the accent. */
export const RereadingADoneLesson: Story = {
  parameters: { nextjs: { navigation: { pathname: href("philidor") } } },
};

/** A long chapter in a column that scrolls: the lesson being read, thirteenth of sixteen, is brought into view on mount and lands next to last. */
export const LongChapter: Story = {
  args: { lessons: LONG_CHAPTER },
  parameters: {
    columnHeight: 440,
    nextjs: { navigation: { pathname: href("leccion-13") } },
  },
  play: async ({ canvasElement }) => {
    const current = await within(canvasElement).findByText("Alfil y peón de torre: el color equivocado");
    await expect(current.closest("[aria-current]")).toHaveAttribute("aria-current", "page");
    const scroller = canvasElement.querySelector(".lesson-outline__body");
    await waitFor(() => expect(scroller?.scrollTop).toBeGreaterThan(0));
  },
};
