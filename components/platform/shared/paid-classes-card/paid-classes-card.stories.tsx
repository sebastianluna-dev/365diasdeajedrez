import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { STUDENT_BALANCE, STUDENT_WHATSAPP } from "@/lib/testing/fixtures/student-classes";
import { PaidClassesCard } from "./paid-classes-card.comp";

const meta = {
  title: "platform/shared/PaidClassesCard",
  component: PaidClassesCard,
  parameters: {
    docs: {
      description: {
        component: `
«Tus clases pagadas» as counts: how many classes the student still has, one
plain square per class (taken, scheduled, to schedule), the counts in words
and the way to ask for more. Never an amount, never which payment a class
belongs to.

Source: \`components/platform/shared/paid-classes-card/paid-classes-card.comp.tsx\`.
Reference page: [Components › PaidClassesCard](/components/platform/shared/paid-classes-card) in the docs site.
`,
      },
    },
  },
  args: { balance: STUDENT_BALANCE, whatsappHref: STUDENT_WHATSAPP },
  decorators: [
    (Story) => (
      <div className="platform-theme" style={{ maxWidth: 320 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof PaidClassesCard>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Four classes: «3 clases por tomar», one taken, two scheduled and one to schedule as squares, the counts in words. */
export const OnePayment: Story = { name: "One payment" };

/** Two payments still open: the classes counted together, eight squares on two rows, no payment named. */
export const SeveralPayments: Story = {
  name: "Several payments",
  args: {
    balance: {
      left: 5,
      taken: 3,
      scheduled: 2,
      toSchedule: 3,
      line: "Te quedan 5 clases: 2 programadas y 3 por programar.",
      whatsappHref: STUDENT_WHATSAPP,
    },
  },
};

/** Twenty classes: too many to draw one by one, so the card says the counts alone. */
export const ManyClasses: Story = {
  name: "Many classes",
  args: {
    balance: {
      left: 14,
      taken: 6,
      scheduled: 4,
      toSchedule: 10,
      line: "Te quedan 14 clases: 4 programadas y 10 por programar.",
      whatsappHref: STUDENT_WHATSAPP,
    },
  },
};

/** Everything taken: «Sin clases por tomar», four ticked squares. */
export const Zero: Story = {
  args: {
    balance: {
      left: 0,
      taken: 4,
      scheduled: 0,
      toSchedule: 0,
      line: "Ya tomaste tus clases pagadas.",
      whatsappHref: STUDENT_WHATSAPP,
    },
  },
};

/** No payment yet. */
export const NoPayments: Story = { name: "No payments", args: { balance: null } };
