import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { CLASS_PHASE } from "@/constants/platform/class-codes.const";
import { CLASSES_NOW, CLASSES_TIME_ZONE, cdmx } from "@/lib/testing/fixtures/classes";
import { MeetingJoinCard } from "./meeting-join-card.comp";

const NOON = {
  phase: CLASS_PHASE.OPEN,
  meetingUrl: "https://zoom.us/j/11111111111",
  hasLink: true,
  providerLabel: "Zoom",
  startIso: cdmx("2026-10-14", "12:00").toISOString(),
  endIso: cdmx("2026-10-14", "13:00").toISOString(),
  visibleFromIso: cdmx("2026-10-14", "11:30").toISOString(),
  untilIso: cdmx("2026-10-14", "13:30").toISOString(),
  nowIso: CLASSES_NOW.toISOString(),
  timeZone: CLASSES_TIME_ZONE,
  whatsappHref: "https://wa.me/522291348338?text=Hola",
};

const meta = {
  title: "platform/shared/MeetingJoinCard",
  component: MeetingJoinCard,
  parameters: {
    docs: {
      description: {
        component: `
How a class is joined, for whoever reads it: «Entrar a la clase» while the
link is open, the countdown, the link to copy; before it opens, when; without
one, that the staff will add it. Three densities. The staff only copies.

Source: \`components/platform/shared/meeting-join-card/meeting-join-card.comp.tsx\`.
Reference page: [Components › MeetingJoinCard](/components/platform/shared/meeting-join-card) in the docs site.
`,
      },
    },
  },
  args: { ...NOON, audience: "student", density: "full" },
  decorators: [
    (Story) => (
      <div className="platform-theme platform-card" style={{ maxWidth: 640 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof MeetingJoinCard>;

export default meta;
type Story = StoryObj<typeof meta>;

/** The student, the link open twenty minutes before: «Entrar a la clase». */
export const StudentOpen: Story = { name: "Student, open" };

/** The teacher, the same instant. */
export const TeacherOpen: Story = { name: "Teacher, open", args: { audience: "teacher" } };

/** The staff: the link to copy, no button. */
export const StaffOpen: Story = { name: "Staff, open", args: { audience: "staff" } };

/** Ahead of the link: the student is told when it opens; the link itself has not travelled. */
export const Upcoming: Story = {
  args: { phase: CLASS_PHASE.UPCOMING, meetingUrl: null, nowIso: cdmx("2026-10-14", "09:00").toISOString() },
};

/** The class running: «La clase ya empezó». */
export const InProgress: Story = {
  name: "In progress",
  args: { phase: CLASS_PHASE.IN_PROGRESS, nowIso: cdmx("2026-10-14", "12:10").toISOString() },
};

/** The tail: ended ten minutes ago, «Volver a entrar» still offered. */
export const AfterEnd: Story = {
  name: "After end",
  args: { phase: CLASS_PHASE.AWAITING_CLOSE, nowIso: cdmx("2026-10-14", "13:10").toISOString() },
};

/** Over: half an hour after the end, nothing to enter. */
export const Closed: Story = {
  args: { phase: CLASS_PHASE.DONE, nowIso: cdmx("2026-10-14", "14:00").toISOString() },
};

/** No link yet: the staff will add it, and «Escríbenos». */
export const NoLink: Story = {
  name: "No link",
  args: {
    phase: CLASS_PHASE.UPCOMING,
    meetingUrl: null,
    hasLink: false,
    providerLabel: null,
    visibleFromIso: null,
    untilIso: null,
  },
};

/** Compact, for a lane. */
export const Compact: Story = { args: { audience: "teacher", density: "compact" } };

/** The bar's density, as the fixed bar draws it. */
export const Bar: Story = { args: { density: "bar" } };

/** The bar on a page moved to the new design system: Material's filled button and roles (`look="material"`). */
export const MaterialBar: Story = { name: "Material bar", args: { density: "bar", look: "material" } };
