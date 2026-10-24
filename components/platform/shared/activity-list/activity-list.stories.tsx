import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import type { ActivityItem } from "@/services/dashboard/dashboard.types";
import { ActivityList } from "./activity-list.comp";

const ITEMS: ActivityItem[] = [
  {
    id: "a1",
    typeLabel: "Lección completada",
    subjectName: "Torre activa",
    topicLabel: "Finales",
    dateLabel: "1 de octubre, 2026",
  },
  {
    id: "a2",
    typeLabel: "Ejercicio superado",
    subjectName: "Clavada en la columna e",
    topicLabel: "Táctica",
    dateLabel: "30 de septiembre, 2026",
  },
  {
    id: "a3",
    typeLabel: "Clase asistida",
    subjectName: "La defensa siciliana, variante Najdorf",
    dateLabel: "29 de septiembre, 2026",
  },
];

const meta = {
  title: "platform/shared/ActivityList",
  component: ActivityList,
  parameters: {
    docs: {
      description: {
        component: `
The student's recent activity, one row per entry of the activity log: what
happened, on what, its topic and when — what it was about and its topic only
when the entry has them. The home page's «Actividad reciente» renders it, in
the new design system, already mapped by \`services/dashboard\`.

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
    // In the app the list sits on the home page's white panel, under «Actividad reciente».
    (Story) => (
      <section
        className="platform-theme"
        style={{ maxWidth: 560, padding: 24, background: "var(--platform-m3-panel)" }}
      >
        <Story />
      </section>
    ),
  ],
} satisfies Meta<typeof ActivityList>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Three entries, as the home page writes them: two with their topic, and an attended class, which has none. */
export const Default: Story = {};

/** A single entry. */
export const OneEntry: Story = { name: "One entry", args: { items: ITEMS.slice(0, 1) } };
