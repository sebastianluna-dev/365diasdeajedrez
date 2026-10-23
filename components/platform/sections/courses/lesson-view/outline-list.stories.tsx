import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, waitFor, within } from "storybook/test";
import { PROGRESS_STATUS } from "@/constants/platform/shared-codes.const";
import { platformRoutes } from "@/lib/platform-routes";
import type { LessonSibling, OutlineChapter } from "@/services/courses/courses.types";
import { OutlineList } from "./outline-list.comp";

const COURSE = "finales-de-torres";
const CHAPTER = 2;

const href = (lessonId: string, chapter = CHAPTER) => platformRoutes.lessonDetail(COURSE, chapter, lessonId);

/** One lesson of the chapter, by its id and name. */
function lesson(id: string, name: string, statusCode: LessonSibling["statusCode"], chapter = CHAPTER): LessonSibling {
  return { id, name, href: href(id, chapter), statusCode };
}

/** A chapter of the course, by its order, name and lessons. */
function chapter(order: number, name: string, lessons: LessonSibling[]): OutlineChapter {
  return { id: `capitulo-${order}`, order, name, href: `/cursos/${COURSE}/${order}`, lessons };
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
The chapter in the lesson's side column (the new design system): its number
and name — a link to its page — and how many of its lessons are learned,
then its lessons. A lesson learned carries the blue check, the one being
read (not a link, \`aria-current="page"\`) a play, the rest an empty ring. On
every change of pathname the lesson being read is brought into view when
the column's scroll leaves it cut off.

The list has no stylesheet of its own: it imports the column's
(\`lesson-outline.comp.css\`), and the story mounts it in the column's
markup, which the decorator draws as plain markup, since \`LessonOutline\`
imports a server action. Storybook's router reports the lesson's path.

Source: \`components/platform/sections/courses/lesson-view/outline-list.comp.tsx\`.
Reference page: [Components › OutlineList](/components/platform/sections/courses/lesson-view/outline-list) in the docs site.
`,
      },
    },
  },
  args: {
    chapter: chapter(2, "Finales de torre que hay que saber", LESSONS),
  },
  argTypes: {
    chapter: {
      control: "object",
      description:
        "`OutlineChapter` (`id`, `order`, `name`, `href`, `lessons`), each lesson a `LessonSibling` (`id`, `name`, `href`, `statusCode`); the row whose `href` is the pathname is the one being read.",
    },
  },
  decorators: [
    (Story, { parameters }) => {
      // A height turns the column into what it is on a wide window: the
      // workspace's side, which scrolls on its own. Without one it grows with
      // its lessons, as it does once the page scrolls.
      const height = parameters.columnHeight as number | undefined;
      return (
        // The workspace's side is 256px wide.
        <nav className="lesson-outline" aria-label="Lecciones del capítulo" style={{ width: 256 }}>
          <div data-scroller style={height ? { height, overflow: "auto" } : undefined}>
            <Story />
          </div>
        </nav>
      );
    },
  ],
} satisfies Meta<typeof OutlineList>;

export default meta;
type Story = StoryObj<typeof meta>;

/** The chapter midway: two lessons learned, the third being read, one learned ahead of its turn, the rest to come. */
export const MidChapter: Story = {};

/** Going back to a lesson already done: the row being read carries its check, lit. */
export const RereadingADoneLesson: Story = {
  parameters: { nextjs: { navigation: { pathname: href("philidor") } } },
};

/** A long chapter in a column that scrolls: the lesson being read, the thirteenth, is brought into view on mount. */
export const LongChapter: Story = {
  args: { chapter: chapter(2, "Finales que hay que saber", LONG_CHAPTER) },
  parameters: {
    columnHeight: 440,
    nextjs: { navigation: { pathname: href("leccion-13") } },
  },
  play: async ({ canvasElement }) => {
    const current = await within(canvasElement).findByText("Alfil y peón de torre: el color equivocado");
    await expect(current.closest("[aria-current]")).toHaveAttribute("aria-current", "page");
    const scroller = canvasElement.querySelector("[data-scroller]");
    await waitFor(() => expect(scroller?.scrollTop).toBeGreaterThan(0));
  },
};
