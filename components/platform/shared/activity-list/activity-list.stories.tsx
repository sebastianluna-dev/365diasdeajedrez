import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import type { ActivityItem } from "@/services/dashboard/dashboard.types";
import { ActivityList } from "./activity-list.comp";

const ITEMS: ActivityItem[] = [
  {
    id: "a1",
    typeLabel: "Lección completada",
    subjectName: "Torre activa",
    topicLabel: "Finales",
    dateLabel: "1 de octubre de 2026",
  },
  {
    id: "a2",
    typeLabel: "Ejercicio superado",
    subjectName: "Clavada en la columna e",
    topicLabel: "Táctica",
    dateLabel: "30 de septiembre de 2026",
  },
  { id: "a3", typeLabel: "Clase asistida", dateLabel: "29 de septiembre de 2026" },
];

const meta = {
  title: "platform/shared/ActivityList",
  component: ActivityList,
  parameters: {
    docs: {
      description: {
        component: `
The student's recent activity, one row per entry of the activity log: what
happened, on what, its topic and when — the last three only when the entry has
them. The dashboard's «Actividad reciente» card renders it, already mapped by
\`services/dashboard\`.

Source: \`components/platform/shared/activity-list/activity-list.comp.tsx\`.
Reference page: [Components › ActivityList](/components/platform/shared/activity-list) in the docs site.
`,
      },
    },
  },
  args: { items: ITEMS },
  argTypes: {
    items: { control: "object", description: "`ActivityItem[]` from `services/dashboard/dashboard.types`." },
  },
  decorators: [
    // In the app the list sits in the dashboard's card, under its title.
    (Story) => (
      <section className="platform-card" style={{ maxWidth: 560 }}>
        <h2 className="platform-card__title">Actividad reciente</h2>
        <Story />
      </section>
    ),
  ],
} satisfies Meta<typeof ActivityList>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Three entries: two with what they were about and its topic, and an attended class with neither. */
export const Default: Story = {};

/** A single entry. */
export const OneEntry: Story = { name: "One entry", args: { items: ITEMS.slice(0, 1) } };
