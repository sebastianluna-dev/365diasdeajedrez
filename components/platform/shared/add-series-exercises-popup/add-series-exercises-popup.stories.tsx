import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { userEvent, within } from "storybook/test";
import { popupFormDone, popupFormError } from "@/services/shared/form-state";
import type { SeriesPickOption } from "@/services/teacher-exercises/teacher-exercises.types";
import { AddSeriesExercisesButton } from "./add-series-exercises-popup.comp";

const EXERCISES: SeriesPickOption[] = [
  { id: "ex000001", title: "Mate del pasillo", facts: "Mate en 1 · 900", topics: "Táctica, Mate del pasillo" },
  { id: "ex000002", title: "El mate de Philidor", facts: "Mate en 2 · 1400", topics: "Táctica, Mate ahogado" },
  { id: "ex000003", title: "Las negras rematan", facts: "Mate en 1 · 1000", topics: "Táctica" },
  { id: "ex000004", title: "El caballo que ataca dos", facts: "Secuencia · 1200", topics: "Táctica, Ataque doble" },
  { id: "ex000005", title: "Desvía a la defensora", facts: "Secuencia · 1600", topics: "Táctica, Desviación" },
  { id: "ex000006", title: "La clavada absoluta", facts: "Secuencia · 1300", topics: "Táctica, Clavada" },
];

const meta = {
  title: "platform/sections/teacher/exercises/AddSeriesExercisesPopup",
  component: AddSeriesExercisesButton,
  parameters: {
    docs: {
      description: {
        component: `
«Agregar ejercicios», from a series' page: the exercises the teacher may give
that are not in the series yet, as cards to tick, with a search once there
are a few. What is chosen goes to the end of the series. The action comes as
a prop; the stories pass a stub.

Source: \`components/platform/sections/teacher/exercises/add-series-exercises-popup/add-series-exercises-popup.comp.tsx\`.
Reference page: [Components › AddSeriesExercisesPopup](/components/platform/sections/teacher/exercises/add-series-exercises-popup) in the docs site.
`,
      },
    },
  },
  args: {
    seriesId: "se000001",
    exercises: EXERCISES,
    itemCount: 2,
    addExercisesToSeries: async () => popupFormDone("seriesExercisesAdded"),
  },
  argTypes: { exercises: { control: "object" } },
  decorators: [
    (Story) => (
      <div className="platform-theme" style={{ padding: 16 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof AddSeriesExercisesButton>;

export default meta;
type Story = StoryObj<typeof meta>;

const open = async ({ canvasElement }: { canvasElement: HTMLElement }) => {
  await userEvent.click(within(canvasElement).getByRole("button", { name: "Agregar ejercicios" }));
};

/** Open on six exercises: the search over their titles and topics, nothing chosen yet. */
export const Open: Story = { play: open };

/** Two chosen: the line says how many and where they go. */
export const TwoChosen: Story = {
  name: "Two chosen",
  play: async ({ canvasElement }) => {
    await open({ canvasElement });
    const dialog = canvasElement.querySelector("dialog");
    if (!dialog) return;
    await userEvent.click(within(dialog).getByRole("checkbox", { name: /El mate de Philidor/ }));
    await userEvent.click(within(dialog).getByRole("checkbox", { name: /La clavada absoluta/ }));
  },
};

/** The series changed meanwhile: the race's refusal, over the cards. */
export const Changed: Story = {
  args: {
    addExercisesToSeries: async () => popupFormError({}, { exercises: ["ex000002"] }, { code: "seriesChanged" }),
  },
  play: async ({ canvasElement }) => {
    await open({ canvasElement });
    const dialog = canvasElement.querySelector("dialog");
    if (!dialog) return;
    await userEvent.click(within(dialog).getByRole("checkbox", { name: /El mate de Philidor/ }));
    await userEvent.click(within(dialog).getByRole("button", { name: "Agregar a la serie" }));
  },
};

/** Every ready exercise is already in the series: nothing to tick, and the popup says so. */
export const NothingLeft: Story = { name: "Nothing left", args: { exercises: [], itemCount: 5 }, play: open };
