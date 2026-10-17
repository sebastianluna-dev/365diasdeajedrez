import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, userEvent, within } from "storybook/test";
import { PlatformForm } from "@/components/platform/shared/platform-form/platform-form.comp";
import { ExercisePicker } from "./exercise-picker.comp";
import type { ExercisePickOption } from "./exercise-picker.types";

const EXERCISES: ExercisePickOption[] = [
  { id: "ex000001", title: "Mate del pasillo", facts: "Mate en 1 · 900", topics: "Táctica, Mate del pasillo" },
  { id: "ex000002", title: "El mate de Philidor", facts: "Mate en 2 · 1400", topics: "Táctica, Mate ahogado" },
  { id: "ex000003", title: "Las negras rematan", facts: "Mate en 1 · 1000", topics: "Táctica" },
  { id: "ex000004", title: "El caballo que ataca dos", facts: "Secuencia · 1200", topics: "Táctica, Ataque doble" },
  { id: "ex000005", title: "Desvía a la defensora", facts: "Secuencia · 1600", topics: "Táctica, Desviación" },
  { id: "ex000006", title: "La clavada absoluta", facts: "Secuencia · 1300", topics: "Táctica, Clavada" },
];

/** A host that keeps the chosen set, as the popups do, inside a form so the hidden inputs have somewhere to go. */
function Host({
  exercises,
  unavailable,
  initial = [],
  serverError,
}: {
  exercises: ExercisePickOption[];
  unavailable?: ExercisePickOption[];
  initial?: string[];
  serverError?: string;
}) {
  const [chosen, setChosen] = useState<string[]>(initial);
  return (
    <PlatformForm onSubmit={(event) => event.preventDefault()}>
      <ExercisePicker
        name="exercises"
        exercises={exercises}
        unavailable={unavailable}
        value={chosen}
        onValueChange={setChosen}
        label="Ejercicios"
        serverError={serverError}
      />
    </PlatformForm>
  );
}

const meta = {
  title: "platform/shared/ExercisePicker",
  component: Host,
  parameters: {
    docs: {
      description: {
        component: `
Exercises to tick, for a series or a class block: cards with each one's title,
facts and topics, a search over title and topics once there are six, and the
chosen ids sent as hidden inputs in the order they were ticked; what the
container holds and can no longer be picked is set apart, ticked, to untick or
to keep. Controlled: the host keeps the set and submits by hand.

Source: \`components/platform/shared/exercise-picker/exercise-picker.comp.tsx\`.
Reference page: [Components › ExercisePicker](/components/platform/shared/exercise-picker) in the docs site.
`,
      },
    },
  },
  args: { exercises: EXERCISES },
  argTypes: { exercises: { control: "object" } },
  decorators: [
    (Story) => (
      <div className="platform-theme" style={{ maxWidth: 560, padding: 16 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Host>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Six exercises: the search over their titles and topics, nothing chosen yet. */
export const Six: Story = {};

/** Three exercises: no search, the cards alone. */
export const Three: Story = { args: { exercises: EXERCISES.slice(0, 3) } };

/** Two ticked, the second first: the hidden inputs carry them in that order. */
export const TickOrder: Story = {
  name: "Tick order",
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("checkbox", { name: /La clavada absoluta/ }));
    await userEvent.click(canvas.getByRole("checkbox", { name: /Mate del pasillo/ }));
    const sent = [...canvasElement.querySelectorAll<HTMLInputElement>('input[name="exercises"]')].map((i) => i.value);
    await expect(sent).toEqual(["ex000006", "ex000001"]);
  },
};

/** A search that narrows the cards to one; a chosen card the search hides is still sent. */
export const Searching: Story = {
  args: { initial: ["ex000002"] },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.type(canvas.getByRole("searchbox", { name: "Buscar ejercicio" }), "clavada");
    await expect(canvas.getByRole("checkbox", { name: /La clavada absoluta/ })).toBeVisible();
    await expect(canvasElement.querySelectorAll('input[name="exercises"]')).toHaveLength(1);
  },
};

/** The server refused the group: its message under the label. */
export const ServerError: Story = {
  name: "Server error",
  args: { exercises: EXERCISES.slice(0, 3), serverError: "Elige de 1 a 10 ejercicios." },
};

const UNAVAILABLE: ExercisePickOption[] = [
  { id: "ex000007", title: "El molino", facts: "Secuencia · 1500", topics: "Táctica, Molino" },
  { id: "ex000008", title: "Mate de la coz", facts: "Mate en 2 · 1100", topics: "Táctica, Mate de la coz" },
];

/**
 * A block edited after two of its exercises were archived or left the library: they stay ticked under their
 * warning, apart from what may be picked; unticking one takes it off the screen and out of what is sent.
 */
export const Unavailable: Story = {
  args: { exercises: EXERCISES.slice(0, 3), unavailable: UNAVAILABLE, initial: ["ex000001", "ex000007", "ex000008"] },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("checkbox", { name: /Mate de la coz/ }));
    await expect(canvas.queryByRole("checkbox", { name: /Mate de la coz/ })).toBeNull();
    const sent = [...canvasElement.querySelectorAll<HTMLInputElement>('input[name="exercises"]')].map((i) => i.value);
    await expect(sent).toEqual(["ex000001", "ex000007"]);
  },
};
