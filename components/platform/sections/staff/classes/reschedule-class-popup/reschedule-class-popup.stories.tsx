import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { userEvent, within } from "storybook/test";
import { CLASSES_NOW, CLASSES_TIME_ZONE, cdmx } from "@/lib/testing/fixtures/classes";
import { popupFormDone } from "@/services/shared/form-state";
import type { BusySlotView } from "@/services/staff-payments/staff-payments.types";
import { RescheduleClassButton } from "./reschedule-class-popup.comp";

const meta = {
  title: "platform/sections/staff/classes/RescheduleClassPopup",
  component: RescheduleClassButton,
  parameters: {
    docs: {
      description: {
        component: `
«Reprogramar la clase»: another day, hour or duration for the whole class,
with «Antes → Ahora», the teacher's overlaps said and never blocking, and a
note the students read. The actions come as props; the stories pass stubs.

Source: \`components/platform/sections/staff/classes/reschedule-class-popup/reschedule-class-popup.comp.tsx\`.
Reference page: [Components › RescheduleClassPopup](/components/platform/sections/staff/classes/reschedule-class-popup) in the docs site.
`,
      },
    },
  },
  args: {
    classId: "c5",
    classTitle: "Taller de finales de torre",
    startIso: cdmx("2026-10-17", "10:00").toISOString(),
    durationMin: 90,
    teacherId: "t-1",
    teacherName: "GM Profesor Demo",
    timeZone: CLASSES_TIME_ZONE,
    nowIso: CLASSES_NOW.toISOString(),
    rescheduleClass: async () => popupFormDone("classRescheduled"),
    loadTeacherBusy: async (): Promise<BusySlotView[]> => [],
  },
  decorators: [
    (Story) => (
      <div className="platform-theme" style={{ padding: 16 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof RescheduleClassButton>;

export default meta;
type Story = StoryObj<typeof meta>;

const open = async ({ canvasElement }: { canvasElement: HTMLElement }) => {
  await userEvent.click(within(canvasElement).getByRole("button", { name: "Reprogramar" }));
};

/** Open on the class's own day and hour, with the line «Antes → Ahora». */
export const Open: Story = { play: open };

/** The teacher already has a class then: the warning under the fields, said and not blocking. */
export const WithOverlap: Story = {
  name: "With overlap",
  args: {
    loadTeacherBusy: async () => [
      {
        title: "Clase de Andrea López",
        startIso: cdmx("2026-10-17", "10:00").toISOString(),
        endIso: cdmx("2026-10-17", "11:00").toISOString(),
      },
    ],
  },
  play: open,
};
