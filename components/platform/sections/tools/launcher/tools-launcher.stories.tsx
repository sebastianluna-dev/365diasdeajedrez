import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, userEvent, within } from "storybook/test";
import { buildPlatformApps, type PlatformNavFeatures } from "@/constants/platform/nav-items.const";
import { ToolsLauncherSection } from "./tools-launcher.section";

const ALL_ON: PlatformNavFeatures = {
  play: true,
  analysisBoard: true,
  trainer: true,
  exercises: "all",
};
const ALL_OFF: PlatformNavFeatures = {
  play: false,
  analysisBoard: false,
  trainer: false,
  exercises: false,
};

const STUDENT = { isTeacher: false, isStaff: false };

const meta = {
  title: "platform/sections/tools/launcher/ToolsLauncherSection",
  component: ToolsLauncherSection,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component: `
«Herramientas» (\`/herramientas\`), in the new design system (the owner's
«Herramientas A · Lanzador»): no side column, the white panel with the
role's tools — the tools menu's own list, \`buildPlatformApps\` — in rows by
what they are for, each tile with its drawing, its name and its line, and
«Atajo» on the ones of «Tus atajos», explained by the strip at the foot.
The search narrows the tiles as one types. The stories pass what the page
would build for each role.

Source: \`components/platform/sections/tools/launcher/tools-launcher.section.tsx\`.
Reference page: [Components › ToolsLauncherSection](/components/platform/sections/tools/launcher/tools-launcher-section) in the docs site.
`,
      },
    },
  },
  args: { apps: buildPlatformApps(STUDENT, ALL_ON) },
  decorators: [
    (Story) => (
      <div className="platform-theme platform-page platform-page_width_full platform-page_frame_bleed">
        <div className="platform-workspace platform-workspace_side_none">
          <Story />
        </div>
      </div>
    ),
  ],
} satisfies Meta<typeof ToolsLauncherSection>;

export default meta;
type Story = StoryObj<typeof meta>;

/** A student with everything on: «Practicar», «Aprender» and «Analizar», the first six marked «Atajo». */
export const Student: Story = {};

/** A student with every switch off: no «Practicar», and «Analizar» with the explorer alone. */
export const StudentWithEverythingOff: Story = {
  name: "Student with everything off",
  args: { apps: buildPlatformApps(STUDENT, ALL_OFF) },
};

/** A teacher: «Enseñar» first, then «Aprender» and «Analizar», as their menu lists them. */
export const Teacher: Story = {
  args: { apps: buildPlatformApps({ isTeacher: true, isStaff: false }, ALL_ON) },
};

/** The staff: «Administrar» and «Banco de ejercicios». */
export const Staff: Story = {
  args: { apps: buildPlatformApps({ isTeacher: false, isStaff: true }, ALL_ON) },
};

/** «analisis» typed in the search, without its accent: only the tools that match are left, the board among them. */
export const Searching: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.type(canvas.getByRole("searchbox", { name: "Buscar una herramienta" }), "analisis");
    await expect(canvas.getByRole("link", { name: /Tablero de análisis/ })).toBeVisible();
    await expect(canvas.queryByRole("link", { name: /Jugar/ })).toBeNull();
  },
};

/** A search nothing matches: the rows go and a line says so. */
export const NoMatch: Story = {
  name: "No match",
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.type(canvas.getByRole("searchbox", { name: "Buscar una herramienta" }), "ajedrez chino");
    await expect(canvas.getByRole("status")).toHaveTextContent("Ninguna herramienta coincide con «ajedrez chino».");
  },
};
