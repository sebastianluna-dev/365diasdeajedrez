import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { CLASS_PHASE } from "@/constants/platform/class-codes.const";
import { CLASSES_NOW, CLASSES_TIME_ZONE } from "@/lib/testing/fixtures/classes";
import {
  STUDENT_BALANCE,
  STUDENT_GROUP_CARD,
  STUDENT_PAST_CARD,
  STUDENT_PLAIN_PAST_CARD,
  STUDENT_WHATSAPP,
  studentCard,
  studentCardAt,
  studentJoin,
} from "@/lib/testing/fixtures/student-classes";
import type { StudentClassesView } from "@/services/classes/classes.types";
import { ClassesListSection } from "./classes-list.section";

/** Tomorrow's class, its link not open yet. */
const TOMORROW = studentCardAt("2026-10-15", "17:00", 60, CLASS_PHASE.UPCOMING, {
  id: "c3",
  href: "/clases/c3",
  title: "Ataques al enroque",
  visibleBlocks: 0,
});

/** A make-up class on Saturday, without a link yet. */
const MAKE_UP = studentCardAt("2026-10-18", "11:00", 90, CLASS_PHASE.UPCOMING, {
  id: "c4",
  href: "/clases/c4",
  title: "La Najdorf con 6.Ae3",
  join: null,
  makeUpLabel: "Es la reposición de tu clase del vie 9 oct.",
});

const VIEW: StudentClassesView = {
  timeZone: CLASSES_TIME_ZONE,
  nowIso: CLASSES_NOW.toISOString(),
  today: [studentCard()],
  upcoming: [TOMORROW, STUDENT_GROUP_CARD, MAKE_UP],
  toSchedule: 1,
  past: [
    { key: "2026-10", label: "Octubre 2026", cards: [STUDENT_PAST_CARD] },
    { key: "2026-09", label: "Septiembre 2026", cards: [STUDENT_PLAIN_PAST_CARD] },
  ],
  pastTotal: 12,
  pastShown: 2,
  balance: STUDENT_BALANCE,
  joinOpen: studentJoin(),
  whatsappHref: STUDENT_WHATSAPP,
};

const meta = {
  title: "platform/sections/classes/ClassesListSection",
  component: ClassesListSection,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component: `
«Mis clases» in the new design system: the two views and «Tus clases
pagadas» in the side column; in the panel, the agenda by day — today's class
as a large band with «Entrar a la clase», a later one as a row — with the
classes paid without a date at the foot, or the past classes by month.

Source: \`components/platform/sections/classes/classes-list/classes-list.section.tsx\`.
Reference page: [Components › ClassesListSection](/components/platform/sections/classes/classes-list/classes-list-section) in the docs site.
`,
      },
    },
  },
  args: { view: VIEW, tab: "proximas", pastPages: 1 },
  decorators: [
    (Story) => (
      <div className="platform-theme platform-page platform-page_width_full platform-page_frame_bleed">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof ClassesListSection>;

export default meta;
type Story = StoryObj<typeof meta>;

/** «Próximas»: today's class with its link open, three later ones as rows, and one paid class without a date. */
export const Upcoming: Story = {};

/** «Próximas» with today's link still closed: the countdown, «Ver la clase», and nothing to copy. */
export const LinkClosed: Story = {
  name: "Link closed",
  args: {
    view: {
      ...VIEW,
      today: [
        studentCardAt("2026-10-14", "18:00", 60, CLASS_PHASE.UPCOMING, {
          id: "c2",
          href: "/clases/c2",
          title: "Finales de torres",
          isGroup: true,
          classmates: ["Ana Ruiz", "Diego Gómez", "Mateo Sosa"],
        }),
      ],
      joinOpen: null,
    },
  },
};

/** «Pasadas»: the months, newest first, each class beside its day; «Ver más» with 2 of 12. */
export const Past: Story = { args: { tab: "pasadas" } };

/** No class ever and nothing paid: the dashed box and the way to ask. */
export const Empty: Story = {
  args: {
    view: {
      ...VIEW,
      today: [],
      upcoming: [],
      toSchedule: 0,
      past: [],
      pastTotal: 0,
      pastShown: 0,
      balance: null,
      joinOpen: null,
    },
  },
};
