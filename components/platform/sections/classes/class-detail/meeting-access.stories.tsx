import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { getRouter } from "@storybook/nextjs-vite/navigation.mock";
import { expect, waitFor, within } from "storybook/test";
import { MeetingAccess } from "./meeting-access.comp";

const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

const meta = {
  title: "platform/sections/classes/class-detail/MeetingAccess",
  component: MeetingAccess,
  parameters: {
    docs: {
      description: {
        component: `
Access to a class's video call, in the head of the class's page while the
class is scheduled or live. The link never reaches the browser ahead of time:
until the instant the teacher set, the service sends only that instant and
this piece counts down to it, second by second; at zero it asks the router
for a refresh, and the page comes back from the server with the link, drawn
as the platform's button. With neither a link nor an instant it says the
link is not available yet.

The props take an ISO instant and no clock, so the countdown stories set
theirs relative to when the story loads (a loader reads \`Date.now()\`) and
the countdown runs on the real clock: what they print changes by the second.
Storybook's router is a mock, so at zero the refresh is only recorded — in
the Actions panel, once a second — and the link never arrives; the story with
the link passes it as the server would.

Source: \`components/platform/sections/classes/class-detail/meeting-access.comp.tsx\`.
Reference page: [Components › MeetingAccess](/components/platform/sections/classes/class-detail/meeting-access) in the docs site.
`,
      },
    },
  },
  args: { providerLabel: "Zoom" },
  argTypes: {
    meetingUrl: {
      control: "text",
      description: "The call's URL, present only once the server has authorised showing it.",
    },
    meetingVisibleFromIso: {
      control: false,
      description:
        "ISO instant when the link becomes visible, for the countdown; the countdown stories set it relative to when they load.",
    },
    providerLabel: { control: "text", description: "The provider's label, appended to the button's text." },
  },
} satisfies Meta<typeof MeetingAccess>;

export default meta;
type Story = StoryObj<typeof meta>;

/** A countdown to the instant `ms` after the story loads: the props take no clock, so it runs on the real one. */
function opensIn(ms: number): Pick<Story, "loaders" | "render"> {
  return {
    loaders: [async () => ({ visibleFromIso: new Date(Date.now() + ms).toISOString() })],
    render: (args, { loaded }) => <MeetingAccess {...args} meetingVisibleFromIso={loaded.visibleFromIso as string} />,
  };
}

/** Before the instant, a day or more ahead: the countdown in days, hours and minutes. */
export const Countdown: Story = opensIn(DAY + 3 * HOUR + 20 * MINUTE + 30_000);

/** The last hour: the countdown drops the hours and counts the seconds. */
export const LastMinutes: Story = opensIn(4 * MINUTE + 30_000);

/** At the instant: the countdown at zero asks the router for a refresh, which here is recorded and brings no link. */
export const AtTheInstant: Story = {
  ...opensIn(0),
  play: async ({ canvasElement }) => {
    await within(canvasElement).findByText("El enlace estará disponible en 0 min 00 s");
    await waitFor(() => expect(getRouter().refresh).toHaveBeenCalled());
  },
};

/** After it: the page came back from the server with the link, drawn as the platform's button with the provider's name. */
export const LinkReady: Story = {
  args: { meetingUrl: "https://zoom.us/j/00000000000" },
};

/** Neither a link nor an instant to count down to: the link is said not to be available yet, with no countdown. */
export const NotAvailable: Story = {};
