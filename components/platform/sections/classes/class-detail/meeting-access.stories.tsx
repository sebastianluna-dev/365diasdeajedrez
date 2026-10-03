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
for a refresh, once, and the page comes back from the server with the link,
drawn as the platform's button. A page that comes back without it means the
browser's clock is ahead of the server's: the piece asks again after 1 s,
2 s, 5 s, 10 s and then every 30 s, until the server's clock gets there. A
class without a link gets neither a link nor an instant, and this piece says
the link is not available yet.

The props take an ISO instant and no clock, so the countdown stories set
theirs relative to when the story loads (a loader reads \`Date.now()\`) and
the countdown runs on the real clock: what they print changes by the second.
Storybook's router is a mock, so the refreshes are only recorded, in the
Actions panel, and the link never arrives: the story at zero goes on as
against a server whose clock is behind, its waits growing. The story with the
link passes it as the server would.

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

/** At the instant: the countdown at zero asks the router for a refresh, once; the mock brings no link, so it asks again a second later, then two seconds after that. */
export const AtTheInstant: Story = {
  ...opensIn(0),
  play: async ({ canvasElement }) => {
    const { refresh } = getRouter();
    await within(canvasElement).findByText("El enlace estará disponible en 0 min 00 s");
    await waitFor(() => expect(refresh).toHaveBeenCalledTimes(1));
    await waitFor(() => expect(refresh).toHaveBeenCalledTimes(2), { timeout: 2_000 });
    const second = Date.now();
    await waitFor(() => expect(refresh).toHaveBeenCalledTimes(3), { timeout: 3_000 });
    // Refreshed every second, the third would have come a second after the second.
    await expect(Date.now() - second).toBeGreaterThan(1_500);
  },
};

/** After it: the page came back from the server with the link, drawn as the platform's button with the provider's name. */
export const LinkReady: Story = {
  args: { meetingUrl: "https://zoom.us/j/00000000000" },
};

/** A class without a link: neither a link nor an instant to count down to, so the link is said not to be available yet. */
export const NotAvailable: Story = {};
