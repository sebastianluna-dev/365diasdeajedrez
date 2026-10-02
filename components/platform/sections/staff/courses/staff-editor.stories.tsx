import Link from "next/link";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { platformRoutes } from "@/lib/platform-routes";
import { StaffEditorHead, StaffEditorLayout } from "./staff-editor.comp";
import { StaffPanel } from "./staff-panel.comp";

// The slots are filled with plain markup: in the app the course's status is a
// menu that changes it and the catalog's actions open dialogs, each with its
// server action, and the head only places them.

const meta = {
  title: "platform/sections/staff/courses/StaffEditorHead",
  component: StaffEditorHead,
  parameters: {
    docs: {
      description: {
        component: `
The header of the courses panel's screens: the title, a badge on its row,
short facts under it and the actions at the top right. There is no trail
above the title: what says where one is is its size — \`level="root"\` for the
catalog, a screen of the menu that weighs the same as «Alumnos», and
\`nested\` (the default) for a course, a chapter or a lesson, a step down.

The same file exports \`StaffEditorLayout\`, the two columns under it: the work
on the left and, on the right, a 360px column of what is glanced at. The last
story draws the two together.

\`badge\`, \`meta\` and \`actions\` are slots from before the rule that a
component receives data: here they are filled with plain markup.

Source: \`components/platform/sections/staff/courses/staff-editor.comp.tsx\`.
Reference page: [Components › StaffEditorHead](/components/platform/sections/staff/courses/staff-editor) in the docs site.
`,
      },
    },
  },
  args: {
    title: "Fundamentos de la Defensa Siciliana",
    badge: <span className="platform-tag platform-tag_variant_accent">Publicado</span>,
    actions: (
      <Link href={platformRoutes.courseInfo("fundamentos-de-la-siciliana")} className="platform-button">
        Ver en la plataforma
      </Link>
    ),
  },
  argTypes: {
    title: { control: "text", description: "The `<h1>`." },
    level: {
      control: "inline-radio",
      options: ["root", "nested"],
      description: "`root` for a screen of the menu (the catalog); `nested`, the default, for what hangs from one.",
    },
    description: { control: "text", description: "One sentence under the title." },
    badge: { control: false, description: "Beside the title, on its row: a course's status." },
    meta: { control: false, description: "Short facts under the title." },
    actions: { control: false, description: "What can be done with the record, at the top right." },
  },
  decorators: [
    // The page's column in the shell (platform-shell.section.css).
    (Story) => (
      <div style={{ maxWidth: 1040 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof StaffEditorHead>;

export default meta;
type Story = StoryObj<typeof meta>;

/** A published course: its name a step below the menu's titles, the status on its row and «Ver en la plataforma». */
export const Course: Story = {};

/** The catalog, a screen of the menu: the big title, the sentence under it and the two buttons that open dialogs. */
export const Catalog: Story = {
  args: {
    title: "Cursos",
    level: "root",
    badge: undefined,
    description: "Los cursos nacen en borrador y sólo se ven en la plataforma al publicarlos.",
    actions: (
      <>
        <button type="button" className="platform-button">
          Autores
        </button>
        <button type="button" className="platform-button">
          Nuevo curso
        </button>
      </>
    ),
  },
};

/** A chapter: no badge and no actions, and the facts under the title, the last one a tag. */
export const Chapter: Story = {
  args: {
    title: "Columnas abiertas y la séptima",
    badge: undefined,
    actions: undefined,
    meta: (
      <>
        <span>Capítulo 3</span>
        <span>Estrategia para el club</span>
        <span className="platform-tag platform-tag_variant_accent">Prioridad</span>
      </>
    ),
  },
};

/** The head over `StaffEditorLayout`: a lesson's form on the left and the 360px column of what is glanced at. */
export const WithLayout: Story = {
  args: {
    title: "El peón retrasado",
    badge: undefined,
    actions: undefined,
    meta: (
      <>
        <span>Lección 2</span>
        <span>Con contenido</span>
      </>
    ),
  },
  render: (args) => (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--platform-space-6)" }}>
      <StaffEditorHead {...args} />
      <StaffEditorLayout
        aside={
          <StaffPanel title="Estado">
            <p style={{ margin: 0, fontSize: "var(--platform-type-sm)", color: "var(--platform-text-muted)" }}>
              PGN actualizado el 28 de septiembre · 3 ejercicios
            </p>
          </StaffPanel>
        }
      >
        <StaffPanel title="Metadatos">
          <p style={{ margin: 0, color: "var(--platform-text-muted)" }}>
            El nombre, la descripción y los minutos de la lección; en la plataforma, un formulario.
          </p>
        </StaffPanel>
      </StaffEditorLayout>
    </div>
  ),
};
