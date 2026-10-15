import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { CLASS_PHASE } from "@/constants/platform/class-codes.const";
import { ClassStatusTag } from "./class-status-tag.comp";

const meta = {
  title: "platform/shared/ClassStatusTag",
  component: ClassStatusTag,
  parameters: {
    docs: {
      description: {
        component: `
The phase of a class as a tag — a word, its icon and its tone —, the same on
every screen of the three roles. The phase is what the clock makes of the
class (\`classPhase\`), never the stored status.

Source: \`components/platform/shared/class-status-tag/class-status-tag.comp.tsx\`.
Reference page: [Components › ClassStatusTag](/components/platform/shared/class-status-tag) in the docs site.
`,
      },
    },
  },
  args: { phase: CLASS_PHASE.UPCOMING, audience: "staff" },
  argTypes: {
    phase: { control: "select", options: Object.values(CLASS_PHASE) },
    audience: { control: "inline-radio", options: ["student", "teacher", "staff"] },
  },
} satisfies Meta<typeof ClassStatusTag>;

export default meta;
type Story = StoryObj<typeof meta>;

/** «Programada»: the neutral tag with the calendar. */
export const Upcoming: Story = {};

/** «Enlace abierto»: the accent's wash with the camera, from half an hour before the class. */
export const Open: Story = { args: { phase: CLASS_PHASE.OPEN } };

/** «En vivo»: white on the danger red with a beating dot, still under reduced motion. */
export const InProgress: Story = { name: "In progress", args: { phase: CLASS_PHASE.IN_PROGRESS } };

/** «Por finalizar»: the warning tone with the hourglass, for the teacher and the staff. */
export const AwaitingClose: Story = { name: "Awaiting close", args: { phase: CLASS_PHASE.AWAITING_CLOSE } };

/** The same phase seen by the student: «Finalizada», since there is nothing for them to do. */
export const AwaitingCloseForStudent: Story = {
  name: "Awaiting close, for the student",
  args: { phase: CLASS_PHASE.AWAITING_CLOSE, audience: "student" },
};

/** «Finalizada»: the success tone with the tick. */
export const Done: Story = { args: { phase: CLASS_PHASE.DONE } };

/** «Cancelada»: the neutral tag with the ban sign, muted on its grey. */
export const Cancelled: Story = { args: { phase: CLASS_PHASE.CANCELLED } };
