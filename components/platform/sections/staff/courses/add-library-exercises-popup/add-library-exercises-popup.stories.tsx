import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, userEvent, waitFor, within } from "storybook/test";
import { popupFormDone } from "@/services/shared/form-state";
import { AddLibraryExercisesButton } from "./add-library-exercises-popup.comp";

const LIBRARY = [
  { id: "dmEjer06", title: "El pasillo abierto", facts: "Mate en 1 · 800", topics: "Mate del pasillo" },
  { id: "dmEjer07", title: "El mate de Philidor", facts: "Mate en 2 · 1400", topics: "Ataque de mate, Sacrificio" },
  { id: "dmEjer08", title: "Horquilla de caballo", facts: "Secuencia · 1100", topics: "Horquilla" },
];

const meta = {
  title: "platform/sections/staff/courses/AddLibraryExercisesPopup",
  component: AddLibraryExercisesButton,
  parameters: {
    docs: {
      description: {
        component: `
«Agregar desde la biblioteca» (D28): the library's exercises the lesson has
no copy of yet, as cards to tick with a search once there are a few. What is
chosen is copied into the lesson, owned by it and published at once, at the
end, in the order it was ticked.

Source: \`components/platform/sections/staff/courses/add-library-exercises-popup/add-library-exercises-popup.comp.tsx\`.
Reference page: [Components › AddLibraryExercisesPopup](/components/platform/sections/staff/courses/add-library-exercises-popup) in the docs site.
`,
      },
    },
  },
  args: {
    exercises: LIBRARY,
    addToLesson: fn(async () => popupFormDone("lessonExercisesCopied")).mockName("addToLesson"),
  },
  decorators: [
    (Story) => (
      <div className="platform-theme" style={{ padding: 24 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof AddLibraryExercisesButton>;

export default meta;
type Story = StoryObj<typeof meta>;

/** The button of the lesson's panel, closed. */
export const Button: Story = {};

/** Open: three library exercises to tick, and «Agregar a la lección» waiting for a choice. */
export const Open: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "Agregar desde la biblioteca" }));
    const dialog = await canvas.findByRole("dialog", { name: "Agregar desde la biblioteca" });
    await waitFor(() => expect(dialog).toBeVisible());
  },
};

/** Nothing to add: the lesson already holds a copy of every library exercise. */
export const Nothing: Story = {
  args: { exercises: [] },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "Agregar desde la biblioteca" }));
    await waitFor(() => expect(canvas.getByText(/No hay nada que agregar/)).toBeVisible());
  },
};
