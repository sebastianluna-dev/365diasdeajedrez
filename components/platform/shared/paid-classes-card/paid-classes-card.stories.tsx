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
«Tus clases pagadas»: how many classes the student still has, of which
payment, how they stand (taken, scheduled, to schedule) and the way to ask
for more. Never an amount.

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

/** One payment: «3 clases por tomar», the sentence, the bar «● 1 tomada ● 2 programadas ○ 1 por programar». */
export const OnePayment: Story = { name: "One payment" };

/** Two payments, the oldest spent first. */
export const SeveralPayments: Story = {
  name: "Several payments",
  args: {
    balance: {
      left: 5,
      taken: 3,
      scheduled: 2,
      toSchedule: 3,
      line: "Te quedan 5 clases de tus pagos del 3 de septiembre y del 1 de octubre: 2 programadas y 3 por programar.",
      whatsappHref: STUDENT_WHATSAPP,
    },
  },
};

/** Everything taken: «Sin clases por tomar». */
export const Zero: Story = {
  args: {
    balance: {
      left: 0,
      taken: 4,
      scheduled: 0,
      toSchedule: 0,
      line: "Ya tomaste las 4 clases de tu pago del 1 de octubre.",
      whatsappHref: STUDENT_WHATSAPP,
    },
  },
};

/** No payment yet. */
export const NoPayments: Story = { name: "No payments", args: { balance: null } };
