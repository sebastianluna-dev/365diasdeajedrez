import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { userEvent, within } from "storybook/test";
import { CLASSES_NOW, CLASSES_TIME_ZONE, cdmx } from "@/lib/testing/fixtures/classes";
import { popupFormDone } from "@/services/shared/form-state";
import { ClassRowAction } from "./class-row-action.comp";

const meta = {
  title: "platform/shared/ClassRowAction",
  component: ClassRowAction,
  parameters: {
    docs: {
      description: {
        component: `
The action of a \`ClassRow\` that opens a popup instead of leading somewhere:
the meeting link in the staff's agenda. The only client leaf of a row; the
server action comes through \`serverActions\`, and without it the word leads
to the class.

Source: \`components/platform/shared/class-row-action/class-row-action.comp.tsx\`.
Reference page: [Components › ClassRowAction](/components/platform/shared/class-row-action) in the docs site.
`,
      },
    },
  },
  args: {
    action: {
      kind: "meeting",
      label: "Agregar",
      classId: "c3",
      current: {
        meetingUrl: null,
        visibleFromIso: null,
        startIso: cdmx("2026-10-14", "17:00").toISOString(),
        durationMin: 60,
      },
    },
    row: {
      href: "/administracion/clases/c3",
      title: "Plan de aperturas con blancas",
      timeZone: CLASSES_TIME_ZONE,
      nowIso: CLASSES_NOW.toISOString(),
    },
    serverActions: { setMeeting: async () => popupFormDone("meetingAdded", ["c3"]) },
  },
  argTypes: { action: { control: "object" }, row: { control: "object" } },
  decorators: [
    (Story) => (
      <div className="platform-theme" style={{ padding: 16 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof ClassRowAction>;

export default meta;
type Story = StoryObj<typeof meta>;

/** «Agregar» on a row without a link: it opens the meeting-link popup. */
export const Meeting: Story = {
  play: async ({ canvasElement }) => {
    await userEvent.click(within(canvasElement).getByRole("button", { name: "Agregar" }));
  },
};

/** Without the server action: the word is a link to the class, where the popup is. */
export const WithoutAction: Story = { name: "Without action", args: { serverActions: undefined } };
