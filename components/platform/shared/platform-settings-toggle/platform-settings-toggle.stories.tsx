import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, userEvent, within } from "storybook/test";
import {
  PlatformSettingsGroup,
  PlatformSettingsPanel,
} from "@/components/platform/shared/platform-settings-panel/platform-settings-panel.comp";
import { SETTINGS_ATTRIBUTE } from "@/components/platform/shared/platform-settings-panel/settings-panel-state";
import { PlatformSettingsToggle } from "./platform-settings-toggle.comp";

const meta = {
  title: "platform/shared/PlatformSettingsToggle",
  component: PlatformSettingsToggle,
  parameters: {
    docs: {
      description: {
        component: `
The gear in the bar, as Gmail's: opens and closes the page's settings panel
(\`PlatformSettingsPanel\`) through the root's \`data-settings\`, and is lit
while it is open. A page with settings puts it in the bar through
\`PlatformHeaderContext\`.

Source: \`components/platform/shared/platform-settings-toggle/platform-settings-toggle.comp.tsx\`.
Reference page: [Components › PlatformSettingsToggle](/components/platform/shared/platform-settings-toggle) in the docs site.
`,
      },
    },
  },
  decorators: [
    (Story) => {
      document.documentElement.removeAttribute(SETTINGS_ATTRIBUTE);
      return (
        // The panel it controls is on the page, as it is wherever the gear is.
        <div style={{ display: "flex", alignItems: "flex-start", gap: 16 }}>
          <div style={{ display: "flex", width: 120 }}>
            <Story />
          </div>
          <PlatformSettingsPanel title="Ajustes del curso">
            <PlatformSettingsGroup title="Qué aprender">
              <p className="platform-settings__note">Las opciones de la página.</p>
            </PlatformSettingsGroup>
          </PlatformSettingsPanel>
        </div>
      );
    },
  ],
} satisfies Meta<typeof PlatformSettingsToggle>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Closed: the gear at rest. */
export const Closed: Story = {};

/** Pressed by its `play` function: the panel beside it opens, and the gear is lit and pressed. */
export const Open: Story = {
  play: async ({ canvasElement }) => {
    const gear = within(canvasElement).getByRole("button", { name: "Ajustes" });
    await userEvent.click(gear);
    await expect(gear).toHaveAttribute("aria-pressed", "true");
    await expect(document.documentElement).toHaveAttribute(SETTINGS_ATTRIBUTE, "open");
  },
};
