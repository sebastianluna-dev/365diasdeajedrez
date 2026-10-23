import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { CourseSettingsArt } from "@/components/platform/sections/courses/course-study/course-settings-art.comp";
import { PlatformSettingsGroup, PlatformSettingsPanel } from "./platform-settings-panel.comp";
import { SETTINGS_ATTRIBUTE } from "./settings-panel-state";

const meta = {
  title: "platform/shared/PlatformSettingsPanel",
  component: PlatformSettingsPanel,
  parameters: {
    docs: {
      description: {
        component: `
A page's settings at the right of the workspace, as Gmail's «Configuración
rápida»: a white panel with its title and its ✕, opened by the gear in the
bar (\`PlatformSettingsToggle\`). Closed it is not drawn; the story opens it
by setting the root's \`data-settings\`. Each option is a row the page draws
with the block's elements: the control's mark, its words and a drawing of
what it does.

Source: \`components/platform/shared/platform-settings-panel/platform-settings-panel.comp.tsx\`.
Reference page: [Components › PlatformSettingsPanel](/components/platform/shared/platform-settings-panel) in the docs site.
`,
      },
    },
  },
  decorators: [
    (Story) => {
      document.documentElement.setAttribute(SETTINGS_ATTRIBUTE, "open");
      return (
        <div className="platform-workspace" style={{ minHeight: 0, justifyContent: "flex-end" }}>
          <Story />
        </div>
      );
    },
  ],
  args: { title: "Ajustes del curso", children: null },
  argTypes: {
    title: { control: "text", description: "Its name, at the top." },
    children: { control: false, description: "Its groups (`PlatformSettingsGroup`), each with its options." },
  },
} satisfies Meta<typeof PlatformSettingsPanel>;

export default meta;
type Story = StoryObj<typeof meta>;

/** A group of two options, the first chosen, each with its drawing; and a group with an option in the error's red. */
export const Default: Story = {
  render: (args) => (
    <PlatformSettingsPanel {...args}>
      <PlatformSettingsGroup title="Qué aprender">
        <button
          type="button"
          aria-pressed="true"
          className="platform-settings__option platform-settings__option_state_on"
        >
          <span className="platform-settings__ring" aria-hidden="true" />
          <span className="platform-settings__option-text">
            <span className="platform-settings__option-label">Todas las lecciones</span>
            <span className="platform-settings__option-hint">Cada lección del curso, en orden</span>
          </span>
          <span className="platform-settings__option-art">
            <CourseSettingsArt kind="all-lessons" />
          </span>
        </button>
        <button type="button" aria-pressed="false" className="platform-settings__option">
          <span className="platform-settings__ring" aria-hidden="true" />
          <span className="platform-settings__option-text">
            <span className="platform-settings__option-label">Sólo las prioritarias</span>
            <span className="platform-settings__option-hint">Las que el curso marca como prioritarias</span>
          </span>
          <span className="platform-settings__option-art">
            <CourseSettingsArt kind="priority-lessons" />
          </span>
        </button>
      </PlatformSettingsGroup>
      <PlatformSettingsGroup title="Tu progreso">
        <button type="button" className="platform-settings__option platform-settings__option_tone_danger">
          <span className="platform-settings__option-text">
            <span className="platform-settings__option-label">Quitar de mis cursos</span>
            <span className="platform-settings__option-hint">Sale de tus cursos con su progreso</span>
          </span>
          <span className="platform-settings__option-art">
            <CourseSettingsArt kind="remove-course" />
          </span>
        </button>
      </PlatformSettingsGroup>
    </PlatformSettingsPanel>
  ),
};
