import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { PlatformSideNav } from "./platform-side-nav.comp";

const meta = {
  title: "platform/shared/PlatformSideNav",
  component: PlatformSideNav,
  parameters: {
    docs: {
      description: {
        component: `
The side column of a page moved to the new design system (Material 3 as
Gmail draws its labels): the page's main action on top, and its views in
groups under it, each a link with its count; the one on screen is lit and
carries \`aria-current\`. The page's own things, never the platform's
navigation.

Source: \`components/platform/shared/platform-side-nav/platform-side-nav.comp.tsx\`.
Reference page: [Components › PlatformSideNav](/components/platform/shared/platform-side-nav) in the docs site.
`,
      },
    },
  },
  decorators: [
    (Story) => (
      <div className="platform-workspace" style={{ minHeight: 0 }}>
        <div className="platform-workspace__side">
          <Story />
        </div>
      </div>
    ),
  ],
  args: {
    label: "Cursos",
    action: { label: "Seguir donde iba", href: "#continuar" },
    groups: [
      {
        title: "Tus cursos",
        links: [
          { label: "Todos", href: "?", count: 4, icon: "graduation-cap", current: true },
          { label: "En curso", href: "?estado=en-curso", count: 2, icon: "play" },
          { label: "Completados", href: "?estado=completados", count: 1, icon: "circle-check" },
          { label: "Sin empezar", href: "?estado=sin-empezar", count: 1, icon: "clock" },
        ],
      },
      {
        title: "Catálogo",
        links: [
          { label: "Todo el catálogo", href: "/cursos/catalogo", count: 10, icon: "book-open" },
          { label: "Principiante", href: "/cursos/catalogo?nivel=principiante", count: 3, level: 1 },
          { label: "Intermedio", href: "/cursos/catalogo?nivel=intermedio", count: 5, level: 3 },
          { label: "Avanzado", href: "/cursos/catalogo?nivel=avanzado", count: 2, level: 5 },
        ],
      },
    ],
  },
  argTypes: {
    label: { control: "text", description: "The nav's accessible name: what its links choose among." },
    action: { control: "object" },
    groups: { control: "object" },
  },
} satisfies Meta<typeof PlatformSideNav>;

export default meta;
type Story = StoryObj<typeof meta>;

/** «Cursos»: the main action, the student's courses by state and the catalog by level. */
export const Default: Story = {};

/** Another view on screen: «En curso» lit. */
export const OtherViewCurrent: Story = {
  name: "Other view current",
  args: {
    groups: [
      {
        title: "Tus cursos",
        links: [
          { label: "Todos", href: "?", count: 4, icon: "graduation-cap" },
          { label: "En curso", href: "?estado=en-curso", count: 2, icon: "play", current: true },
          { label: "Completados", href: "?estado=completados", count: 1, icon: "circle-check" },
        ],
      },
    ],
  },
};

/** No main action: the groups alone, as a page with nothing to resume. */
export const WithoutAction: Story = {
  name: "Without action",
  args: { action: undefined },
};

/** A course's chapters: each with its number, or a check once learned, and its lessons as a ratio. */
export const Chapters: Story = {
  args: {
    label: "El curso",
    action: { label: "Aprender", href: "#aprender" },
    groups: [
      {
        title: "Capítulos",
        links: [
          { label: "Ideas de la Siciliana", href: "#1", count: "1/1", badge: { text: "1", done: true } },
          { label: "La Najdorf", href: "#2", count: "1/3", badge: { text: "2" } },
          { label: "El Dragón", href: "#3", count: "0/1", badge: { text: "3" } },
        ],
      },
    ],
  },
};

/** «Mis estudios»: the kinds with their counts, and the order as a choice of one, each with its ring. */
export const Choices: Story = {
  args: {
    label: "Estudios",
    action: undefined,
    groups: [
      {
        title: "Tipos",
        links: [
          { label: "Todos", href: "/estudios", count: 8, icon: "chess-board", current: true },
          { label: "Mis partidas", href: "/estudios?tipo=mis-partidas", count: 1, icon: "user" },
          { label: "Estudios", href: "/estudios?tipo=estudios", count: 2, icon: "book-open" },
          { label: "Torneos", href: "/estudios?tipo=torneos", count: 2, icon: "trophy" },
          { label: "Recibidos", href: "/estudios?tipo=recibidos", count: 3, icon: "books" },
        ],
      },
      {
        title: "Ordenar",
        links: [
          { label: "Recientes", href: "/estudios", choice: true, current: true },
          { label: "Nombre", href: "/estudios?orden=nombre", choice: true },
          { label: "Más partidas", href: "/estudios?orden=partidas", choice: true },
        ],
      },
    ],
  },
};
