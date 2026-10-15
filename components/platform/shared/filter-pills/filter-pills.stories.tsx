import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { FilterPills } from "./filter-pills.comp";

const meta = {
  title: "platform/shared/FilterPills",
  component: FilterPills,
  parameters: {
    docs: {
      description: {
        component: `
A row of filters that are links: each pill changes the address, so a filter
can be shared and the back button undoes it. The active one is in the
accent's tint with a tick and \`aria-current\`; a count may sit beside a label.

Source: \`components/platform/shared/filter-pills/filter-pills.comp.tsx\`.
Reference page: [Components › FilterPills](/components/platform/shared/filter-pills) in the docs site.
`,
      },
    },
  },
  args: {
    label: "Vista",
    pills: [
      { label: "Próximas", href: "?vista=proximas", active: true },
      { label: "Pasadas", href: "?vista=pasadas", active: false },
      { label: "Canceladas", href: "?vista=canceladas", active: false },
    ],
  },
  argTypes: {
    label: { control: "text", description: "The nav's accessible name: what is being filtered." },
    pills: { control: "object" },
  },
} satisfies Meta<typeof FilterPills>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Three views, the first active. */
export const Default: Story = {};

/** With counts beside the labels: what each queue holds. */
export const WithCount: Story = {
  name: "With count",
  args: {
    label: "Estado",
    pills: [
      { label: "Todas", href: "?estado=", count: 20, active: false },
      { label: "Por finalizar", href: "?estado=por-finalizar", count: 1, active: true },
      { label: "Sin enlace", href: "?estado=sin-enlace", count: 1, active: false },
      { label: "Sin pago", href: "?estado=sin-pago", count: 1, active: false },
    ],
  },
};

/** Many pills in a narrow column: the row wraps. */
export const Wrapped: Story = {
  args: {
    label: "Profesor",
    pills: ["Todos", "GM Profesor Demo", "MI Ana Torres", "FM Luis Mora", "WGM Sofía Lara", "CM Pedro Nava"].map(
      (label, index) => ({ label, href: `?profesor=${index}`, active: index === 1 }),
    ),
  },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 360 }}>
        <Story />
      </div>
    ),
  ],
};
