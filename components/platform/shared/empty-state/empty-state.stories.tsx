import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { EmptyState } from "./empty-state.comp";

const meta = {
  title: "platform/shared/EmptyState",
  component: EmptyState,
  parameters: {
    docs: {
      description: {
        component: `
What a list or a panel shows when it has nothing in it: a title, a line that
says why or what to do, and at most one link to go and do it. A dashed box,
so it reads as a place that is waiting and not as a card of its own.

Source: \`components/platform/shared/empty-state/empty-state.comp.tsx\`.
Reference page: [Components › EmptyState](/components/platform/shared/empty-state) in the docs site.
`,
      },
    },
  },
  args: {
    title: "No tienes clases programadas",
    description: "Cuando tu profesor agende una clase aparecerá aquí.",
    actionLabel: "Ver mis clases",
    actionHref: "/clases",
  },
  argTypes: {
    title: { control: "text" },
    description: { control: "text", description: "Optional." },
    actionLabel: { control: "text", description: "The link's text; shown only with `actionHref`." },
    actionHref: { control: "text", description: "Where the link goes; shown only with `actionLabel`." },
  },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 560 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof EmptyState>;

export default meta;
type Story = StoryObj<typeof meta>;

/** The full state, as the dashboard's next-class card has it: title, why, and where to go. */
export const WithAction: Story = { name: "With action" };

/** Without a link, when there is nothing to go and do: the class games of a student whose classes have not commented one yet. */
export const WithoutAction: Story = {
  name: "Without action",
  args: {
    title: "Todavía no hay partidas de clase",
    description: "Cuando en una de tus clases se comente una partida, aparecerá aquí.",
    actionLabel: undefined,
    actionHref: undefined,
  },
};

/** The title alone: the past classes of a student who has taken none. */
export const TitleOnly: Story = {
  name: "Title only",
  args: {
    title: "Todavía no has tomado clases",
    description: undefined,
    actionLabel: undefined,
    actionHref: undefined,
  },
};

/** Inside a card, where most of them are: the dashboard's recent activity before there is any. */
export const InACard: Story = {
  name: "In a card",
  args: {
    title: "Sin actividad todavía",
    description: "Completa lecciones o resuelve ejercicios para ver tu actividad.",
    actionLabel: undefined,
    actionHref: undefined,
  },
  decorators: [
    (Story) => (
      <section className="platform-card">
        <h2 className="platform-card__title">Actividad reciente</h2>
        <Story />
      </section>
    ),
  ],
};
