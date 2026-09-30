import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import type { MyCourseItem } from "@/services/courses/courses.types";
import { MyCourseCard } from "../my-course-card.comp";
import { CardBand } from "./course-card-band.comp";
import { CardRing } from "./course-card-ring.comp";
import { CardThin } from "./course-card-thin.comp";
import { CardTile } from "./course-card-tile.comp";
import { CardUnderline } from "./course-card-underline.comp";

const COVER = "https://res.cloudinary.com/p7imx2kd/image/upload/c_fill,ar_21:9,g_auto/v1790616037/365-ajedrez/plataforma/azu0ebnjshvdqwlcirgi.png";
const THUMBNAIL = "https://res.cloudinary.com/p7imx2kd/image/upload/c_fill,ar_1:1,g_auto/v1790616037/365-ajedrez/plataforma/azu0ebnjshvdqwlcirgi.png";

/** Made-up courses: enough of a `MyCourseItem` for a card to draw itself. */
function course(name: string, percent: number, lessons: number, total = 61): MyCourseItem {
  return {
    id: "10000004",
    name,
    slug: "curso-de-prueba",
    cover: COVER,
    thumbnail: THUMBNAIL,
    contentTypes: [],
    levels: [],
    authorNames: ["Bobby Fischer"],
    isAdded: true,
    isCompleted: percent === 100,
    continueHref: "#",
    ctaLabel: "Continuar",
    href: "#",
    infoHref: "#",
    learnHref: "#",
    reviewCount: 0,
    reviewHref: "#",
    progress: {
      statusCode: "IN_PROGRESS",
      completedLessons: lessons,
      totalLessons: total,
      percent,
      completedMinutes: Math.round((1220 * percent) / 100),
      totalMinutes: 1220,
      minutesPercent: percent,
    },
  };
}

const COURSES = [
  course("Mis 60 memorables partidas", 62, 38),
  course("Finales de torre esenciales", 18, 11),
  course("Defensa siciliana: variante Najdorf", 95, 58),
];

const meta = {
  title: "platform/courses/Tarjeta de curso",
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component: `
Five designs on offer for the card of «Mis cursos», with made-up courses so
each one can be seen at three states of progress (18%, 62% and 95%).

None of them fills a button with the accent, and every bar runs the accent's
own scale. Use the toolbar to see them in the light and the dark theme.

The one that is chosen stays in \`my-courses/\` as the card; the other four go
with the folder \`card-variants/\`.
`,
      },
    },
  },
} satisfies Meta;

export default meta;
type Story = StoryObj;

/** What the list draws today, for comparison. */
export const Actual: Story = {
  name: "Actual",
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {COURSES.map((item) => (
        <MyCourseCard key={item.name} course={item} />
      ))}
    </div>
  ),
};

/** A · The row it is today, with the bars swapped for a ring. */
export const ARing: Story = {
  name: "A · Fila con anillo",
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {COURSES.map((item) => (
        <CardRing key={item.name} course={item} />
      ))}
    </div>
  ),
};

/** B · A grid of tiles, with the course's wide cover. */
export const BTile: Story = {
  name: "B · Mosaico",
  render: () => (
    <div className="tile-grid">
      {COURSES.map((item) => (
        <CardTile key={item.name} course={item} />
      ))}
    </div>
  ),
};

/** C · The progress underlines the card. */
export const CUnderline: Story = {
  name: "C · El progreso subraya",
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {COURSES.map((item) => (
        <CardUnderline key={item.name} course={item} />
      ))}
    </div>
  ),
};

/** D · The progress climbs the card's side. */
export const DBand: Story = {
  name: "D · Banda lateral",
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {COURSES.map((item) => (
        <CardBand key={item.name} course={item} />
      ))}
    </div>
  ),
};

/** E · One list, one row per course. */
export const EThin: Story = {
  name: "E · Fila fina de lista",
  render: () => (
    <div className="thin-list">
      {COURSES.map((item) => (
        <CardThin key={item.name} course={item} />
      ))}
    </div>
  ),
};

/** The five, one under the other, to compare them at a glance. */
export const Todas: Story = {
  name: "Las cinco juntas",
  render: () => {
    const label = { margin: "26px 0 10px", fontSize: 13, fontWeight: 700, letterSpacing: "0.04em", textTransform: "uppercase" as const, color: "var(--platform-text-subtle)" };
    const [first] = COURSES;
    return (
      <div>
        <p style={{ ...label, marginTop: 0 }}>A · Fila con anillo</p>
        <CardRing course={first!} />

        <p style={label}>B · Mosaico</p>
        <div className="tile-grid">
          {COURSES.map((item) => (
            <CardTile key={item.name} course={item} />
          ))}
        </div>

        <p style={label}>C · El progreso subraya</p>
        <CardUnderline course={first!} />

        <p style={label}>D · Banda lateral</p>
        <CardBand course={first!} />

        <p style={label}>E · Fila fina de lista</p>
        <div className="thin-list">
          {COURSES.map((item) => (
            <CardThin key={item.name} course={item} />
          ))}
        </div>
      </div>
    );
  },
};
