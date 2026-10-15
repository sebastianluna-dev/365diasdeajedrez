import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { userEvent, within } from "storybook/test";
import { CLASSES_NOW, CLASSES_TIME_ZONE, cdmx } from "@/lib/testing/fixtures/classes";
import { popupFormDone, popupFormError } from "@/services/shared/form-state";
import { MeetingLinkButton } from "./meeting-link-popup.comp";

const UPCOMING = {
  meetingUrl: null,
  visibleFromIso: null,
  startIso: cdmx("2026-10-14", "17:00").toISOString(),
  durationMin: 60,
};

const meta = {
  title: "platform/shared/MeetingLinkPopup",
  component: MeetingLinkButton,
  parameters: {
    docs: {
      description: {
        component: `
«Agregar el enlace de la reunión», or «Cambiar …» when the class has one:
the link, and when the students get to see it. The staff puts the link on
every class (O2); the action comes as a prop, and the stories pass a stub.

Source: \`components/platform/shared/meeting-link-popup/meeting-link-popup.comp.tsx\`.
Reference page: [Components › MeetingLinkPopup](/components/platform/shared/meeting-link-popup) in the docs site.
`,
      },
    },
  },
  args: {
    classId: "c3",
    classTitle: "Plan de aperturas con blancas",
    current: UPCOMING,
    timeZone: CLASSES_TIME_ZONE,
    nowIso: CLASSES_NOW.toISOString(),
    setMeeting: async () => popupFormDone("meetingAdded", ["c3"]),
  },
  argTypes: { current: { control: "object" } },
  decorators: [
    (Story) => (
      <div className="platform-theme" style={{ padding: 16 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof MeetingLinkButton>;

export default meta;
type Story = StoryObj<typeof meta>;

const open = async ({ canvasElement }: { canvasElement: HTMLElement }) => {
  await userEvent.click(within(canvasElement).getByRole("button", { name: /Agregar|Cambiar/ }));
};

/** A class without a link: «Agregar», the empty field and «30 minutos antes de empezar». */
export const Add: Story = { play: open };

/** A class with a link: «Cambiar», the field filled, and the instant the staff chose kept as an option. */
export const Change: Story = {
  args: {
    current: {
      meetingUrl: "https://zoom.us/j/22222222222",
      visibleFromIso: cdmx("2026-10-14", "15:45").toISOString(),
      startIso: UPCOMING.startIso,
      durationMin: 60,
    },
  },
  play: open,
};

/** The server refused the instant: the link would open after the class starts. */
export const OpensLate: Story = {
  name: "Opens late",
  args: {
    setMeeting: async () =>
      popupFormError(
        { visibleFrom: { code: "meetingOpensLate" } },
        { meetingUrl: "https://meet.google.com/abc-defg-hij" },
      ),
  },
  play: async ({ canvasElement }) => {
    await open({ canvasElement });
    const dialog = canvasElement.querySelector("dialog");
    if (!dialog) return;
    await userEvent.type(within(dialog).getByLabelText("Enlace de la reunión"), "https://meet.google.com/abc-defg-hij");
    await userEvent.click(within(dialog).getByRole("button", { name: "Agregar el enlace" }));
  },
};
