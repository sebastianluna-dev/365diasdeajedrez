import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { userEvent, within } from "storybook/test";
import { popupFormDone } from "@/services/shared/form-state";
import { AfterNotesButton } from "./after-notes-popup.comp";

const meta = {
  title: "platform/sections/teacher/classes/AfterNotesPopup",
  component: AfterNotesButton,
  parameters: {
    docs: {
      description: {
        component: `
«Después de la clase»: the summary and the recording, both optional, once
the class is done. The action comes as a prop; the story passes a stub.

Source: \`components/platform/sections/teacher/classes/after-notes-popup/after-notes-popup.comp.tsx\`.
Reference page: [Components › AfterNotesPopup](/components/platform/sections/teacher/classes/after-notes-popup) in the docs site.
`,
      },
    },
  },
  args: {
    classId: "c1",
    summary: "Vimos los tres errores típicos que dejan al rey en el centro.",
    recordingUrl: null,
    updateClassAfterNotes: async () => popupFormDone("afterNotesSaved"),
  },
  decorators: [
    (Story) => (
      <div className="platform-theme" style={{ padding: 16 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof AfterNotesButton>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Open with the summary written and no recording. */
export const Open: Story = {
  play: async ({ canvasElement }) => {
    await userEvent.click(within(canvasElement).getByRole("button", { name: "Editar" }));
  },
};
