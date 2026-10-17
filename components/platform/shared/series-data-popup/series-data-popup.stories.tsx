import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { userEvent, within } from "storybook/test";
import { popupFormDone, popupFormError } from "@/services/shared/form-state";
import { EditSeriesButton, NewSeriesButton } from "./series-data-popup.comp";

const meta = {
  title: "platform/sections/teacher/exercises/SeriesDataPopup",
  component: EditSeriesButton,
  parameters: {
    docs: {
      description: {
        component: `
The title and the description of a series, the two things its students read
before they start: «Nueva serie» from the bank (\`NewSeriesButton\`), «Editar
la serie» from the pen beside its title (\`EditSeriesButton\`). The action
comes as a prop; the stories pass a stub.

Source: \`components/platform/sections/teacher/exercises/series-data-popup/series-data-popup.comp.tsx\`.
Reference page: [Components › SeriesDataPopup](/components/platform/sections/teacher/exercises/series-data-popup) in the docs site.
`,
      },
    },
  },
  args: {
    series: {
      title: "Táctica de la semana",
      description: "Cinco ejercicios para el lunes: resuélvelos en orden y sin mover las piezas en un tablero.",
    },
    save: async () => popupFormDone("seriesSaved"),
  },
  decorators: [
    (Story) => (
      <div className="platform-theme" style={{ padding: 16 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof EditSeriesButton>;

export default meta;
type Story = StoryObj<typeof meta>;

const open =
  (name: string) =>
  async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    await userEvent.click(within(canvasElement).getByRole("button", { name }));
  };

/** «Editar la serie», open on what is stored. */
export const Edit: Story = { play: open("Editar la serie") };

/** «Nueva serie»: the same popup, empty, from the bank's secondary button. */
export const New: Story = {
  render: (args) => <NewSeriesButton save={args.save} />,
  play: open("Nueva serie"),
};

/** A refused save: the title came back empty, said under its field, with what was written kept. */
export const Refused: Story = {
  args: {
    save: async () =>
      popupFormError(
        { title: { code: "seriesTitle" } },
        { title: " ", description: "Cinco ejercicios para el lunes." },
      ),
  },
  play: async ({ canvasElement }) => {
    await open("Editar la serie")({ canvasElement });
    const dialog = canvasElement.querySelector("dialog");
    if (dialog) await userEvent.click(within(dialog).getByRole("button", { name: "Guardar la serie" }));
  },
};
