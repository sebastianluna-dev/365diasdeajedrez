import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { userEvent, within } from "storybook/test";
import { popupFormDone, popupFormError } from "@/services/shared/form-state";
import { ChangeAttendanceButton } from "./change-attendance-popup.comp";

const meta = {
  title: "platform/sections/staff/classes/ChangeAttendancePopup",
  component: ChangeAttendanceButton,
  parameters: {
    docs: {
      description: {
        component: `
«Cambiar la asistencia de …» (ADM-9): the staff's override after a report,
with a reason the teacher reads and the lines that say what it does. The
action comes as a prop; the stories pass stubs.

Source: \`components/platform/sections/staff/classes/change-attendance-popup/change-attendance-popup.comp.tsx\`.
Reference page: [Components › ChangeAttendancePopup](/components/platform/sections/staff/classes/change-attendance-popup) in the docs site.
`,
      },
    },
  },
  args: {
    classId: "c4",
    student: { id: "u-v", displayName: "Valentina Cruz" },
    context: "Clase de Valentina Cruz · mié 14 oct · 19:00–20:00 · GM Profesor Demo marcó «Faltó»",
    attended: false,
    teacherName: "GM Profesor Demo",
    staffName: "Staff Demo",
    changeAttendance: async () => popupFormDone("attendanceChanged", ["u-v"]),
  },
  decorators: [
    (Story) => (
      <div className="platform-theme" style={{ padding: 16 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof ChangeAttendanceButton>;

export default meta;
type Story = StoryObj<typeof meta>;

const open = async ({ canvasElement }: { canvasElement: HTMLElement }) => {
  await userEvent.click(within(canvasElement).getByRole("button", { name: "Cambiar" }));
};

/** Open with «Faltó» chosen, as the teacher marked. */
export const Open: Story = { play: open };

/** The server wants the reason: its message under the field, with «Asistió» kept. */
export const ReasonMissing: Story = {
  name: "Reason missing",
  args: { changeAttendance: async () => popupFormError({ reason: { code: "reasonRequired" } }, { attended: "yes" }) },
  play: async ({ canvasElement }) => {
    await open({ canvasElement });
    const dialog = canvasElement.querySelector("dialog");
    if (!dialog) return;
    await userEvent.click(within(dialog).getByRole("radio", { name: "Asistió" }));
    await userEvent.type(within(dialog).getByLabelText("Motivo del cambio"), "x");
    await userEvent.click(within(dialog).getByRole("button", { name: "Guardar el cambio" }));
  },
};
