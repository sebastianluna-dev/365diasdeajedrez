import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { PracticeFilters } from "./practice-filters.comp";

const FILTERS = {
  topics: [
    { code: "TACTICS", label: "Táctica", parentCode: null },
    { code: "FORK", label: "Horquilla", parentCode: "TACTICS" },
    { code: "SKEWER", label: "Enfilada", parentCode: "TACTICS" },
    { code: "BACK_RANK_MATE", label: "Mate del pasillo", parentCode: "TACTICS" },
    { code: "ENDGAME", label: "Finales", parentCode: null },
  ],
  levels: [
    { slug: "principiante", name: "Principiante", range: "800–1199" },
    { slug: "intermedio", name: "Intermedio", range: "1200–1599" },
    { slug: "avanzado", name: "Avanzado", range: "1600 o más" },
  ],
  libraryEmpty: false,
};

const meta = {
  title: "platform/sections/exercises/PracticeFilters",
  component: PracticeFilters,
  parameters: {
    docs: {
      description: {
        component: `
The two choices of «Práctica libre»: the topic, with each parent's children
under its heading, and the level, by the Level catalog's bands. A filter, not
a form: the accent's tone, never a message. On the home's card the choice
waits for «Empezar»; on the practice page a change loads the next exercise.

Source: \`components/platform/sections/exercises/practice-filters/practice-filters.comp.tsx\`.
Reference page: [Components › PracticeFilters](/components/platform/sections/exercises/practice-filters) in the docs site.
`,
      },
    },
  },
  args: { filters: FILTERS, choice: { topicCode: null, levelSlug: null }, variant: "home", accent: true },
  decorators: [
    (Story) => (
      <div className="platform-theme" style={{ maxWidth: 720, padding: 24 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof PracticeFilters>;

export default meta;
type Story = StoryObj<typeof meta>;

/** The home's card with nothing chosen: both selects and «Empezar» waiting, the accent. */
export const Home: Story = {};

/** The home's card with a choice already made: «Empezar» leads to the practice with it. */
export const HomeChosen: Story = {
  args: { choice: { topicCode: "TACTICS", levelSlug: "intermedio" } },
};

/** On the practice page: the choice in the selects, no «Empezar» — a change loads the next exercise. */
export const Page: Story = {
  args: { variant: "page", choice: { topicCode: "FORK", levelSlug: "principiante" } },
};

/** The library holds nothing yet: a line says so instead of the selects. */
export const EmptyLibrary: Story = {
  args: { filters: { topics: [], levels: [], libraryEmpty: true } },
};
