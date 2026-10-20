import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, userEvent, waitFor, within } from "storybook/test";
import { buildPlatformApps, type PlatformNavFeatures } from "@/constants/platform/nav-items.const";
import { platformRoutes, staffRoutes, teacherRoutes } from "@/lib/platform-routes";
import { PlatformAppsMenu } from "./platform-apps-menu.comp";

/** The address a story stands on, as Storybook's router reports it to `usePathname`. */
const at = (pathname: string) => ({ nextjs: { navigation: { pathname } } });

const ALL_ON: PlatformNavFeatures = { play: true, analysisBoard: true, trainer: true, exercises: "all" };

const meta = {
  title: "platform/sections/shell/PlatformAppsMenu",
  component: PlatformAppsMenu,
  parameters: {
    ...at(teacherRoutes.calendar),
    docs: {
      description: {
        component: `
The platform's tools menu (2026-10-19, the Google-style header): the button
of nine squares at the right of the bar and the panel it opens — «Tus
atajos», the role's first six tools on a white card, and the rest under
it, each a tile with its drawing (\`NavArt\`), which tilts and moves when
pointed at. The shell composes the tools on the server with
\`buildPlatformApps(roles)\` — the widest role's — and the tile of the page
on screen is marked. The stories pass what the shell would build for each
role, with everything switched on, and open the panel.

Source: \`components/platform/sections/shell/platform-apps-menu.comp.tsx\`.
Reference page: [Components › PlatformAppsMenu](/components/platform/sections/shell/platform-apps-menu) in the docs site.
`,
      },
    },
  },
  args: { apps: buildPlatformApps({ isTeacher: true, isStaff: false }, ALL_ON) },
  decorators: [
    // The shell's bar (platform-shell.section.css): white over the page's grey, the button at its right end.
    (Story) => (
      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          padding: "var(--platform-space-3) var(--platform-space-4)",
          background: "var(--platform-surface)",
          boxShadow: "var(--platform-shadow-bar)",
        }}
      >
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof PlatformAppsMenu>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Opens the panel and waits for it to unfold. */
const openMenu: Story["play"] = async ({ canvasElement }) => {
  const canvas = within(canvasElement.ownerDocument.body);
  await userEvent.click(canvas.getByRole("button", { name: "Herramientas" }));
  const panel = await canvas.findByRole("dialog", { name: "Herramientas" });
  await waitFor(() => expect(within(panel).getByRole("heading", { name: "Tus atajos" })).toBeVisible());
};

/** The closed button: nine squares, quiet until pointed at. */
export const Closed: Story = {};

/** The teacher's tools, open on the calendar: its tile is marked, and «Clases prediseñadas» and the rest go under «Tus atajos». */
export const Teacher: Story = {
  play: openMenu,
};

/** The student's, open on a series' exercise: «Ejercicios» is marked, «Jugar» and the three ways to solve are their shortcuts. */
export const Student: Story = {
  args: { apps: buildPlatformApps({ isTeacher: false, isStaff: false }, ALL_ON) },
  parameters: at(platformRoutes.exerciseSeriesItem("serie-1", 2)),
  play: openMenu,
};

/** The staff's, open on the review queue: «Revisión» is marked, not «Ejercicios», whose address prefixes it. */
export const Staff: Story = {
  args: { apps: buildPlatformApps({ isTeacher: false, isStaff: true }, ALL_ON) },
  parameters: at(staffRoutes.exercisesReview),
  play: openMenu,
};

/** A student with everything off: four tools, all of them shortcuts, and nothing under the card. */
export const FewTools: Story = {
  args: {
    apps: buildPlatformApps(
      { isTeacher: false, isStaff: false },
      { play: false, analysisBoard: false, trainer: false, exercises: false },
    ),
  },
  parameters: at(platformRoutes.settings),
  play: openMenu,
};
