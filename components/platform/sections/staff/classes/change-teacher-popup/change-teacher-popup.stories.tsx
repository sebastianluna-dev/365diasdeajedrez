import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { userEvent, within } from "storybook/test";
import { popupFormDone } from "@/services/shared/form-state";
import { ChangeTeacherButton } from "./change-teacher-popup.comp";

const meta = {
  title: "platform/sections/staff/classes/ChangeTeacherPopup",
  component: ChangeTeacherButton,
  parameters: {
    docs: {
      description: {
        component: `
«Cambiar profesor»: one of the active teachers; the content stays with the
class. The action comes as a prop; the stories pass a stub.

Source: \`components/platform/sections/staff/classes/change-teacher-popup/change-teacher-popup.comp.tsx\`.
Reference page: [Components › ChangeTeacherPopup](/components/platform/sections/staff/classes/change-teacher-popup) in the docs site.
`,
      },
    },
  },
  args: {
    classId: "c5",
    classTitle: "Taller de finales de torre",
    current: { id: "t-1", displayName: "GM Profesor Demo", isActive: true },
    teachers: [
      { id: "t-1", displayName: "GM Profesor Demo" },
      { id: "t-2", displayName: "MI Ana Torres" },
    ],
    setClassTeacher: async () => popupFormDone("teacherChanged"),
  },
  decorators: [
    (Story) => (
      <div className="platform-theme" style={{ padding: 16 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof ChangeTeacherButton>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Open with the current teacher chosen. */
export const Open: Story = {
  play: async ({ canvasElement }) => {
    await userEvent.click(within(canvasElement).getByRole("button", { name: "Cambiar" }));
  },
};
