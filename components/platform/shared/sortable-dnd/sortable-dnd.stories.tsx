import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { expect, fn, userEvent, within } from "storybook/test";
import { GripDotsVerticalIcon } from "@/components/icons/grip-dots-vertical-icon.comp";
import { SortableDnd } from "./sortable-dnd.comp";
import { useSortableRows } from "./use-sortable-rows.hook";
import { useSortableStep } from "./use-sortable-step.hook";

/** Five openings of a made-up repertoire: what is sorted does not matter to the wiring. */
const OPENINGS = [
  { id: "ruy-lopez", name: "Apertura española" },
  { id: "sicilian", name: "Defensa siciliana" },
  { id: "queens-gambit", name: "Gambito de dama" },
  { id: "french", name: "Defensa francesa" },
  { id: "italian", name: "Apertura italiana" },
];

/** A row as plain as it gets: the grip dnd-kit picks up, the name, and the two steps. */
function Row({ id, name }: { id: string; name: string }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id, data: { name } });
  const steps = useSortableStep(id);
  return (
    <li
      ref={setNodeRef}
      style={{
        display: "flex",
        alignItems: "center",
        gap: "var(--platform-space-3)",
        padding: "var(--platform-space-2) var(--platform-space-4)",
        borderTop: "1px solid var(--platform-border)",
        background: "var(--platform-surface)",
        transform: CSS.Transform.toString(transform),
        transition,
      }}
    >
      <button
        type="button"
        className="platform-row-action"
        aria-label={`Mover la apertura «${name}»`}
        {...attributes}
        {...listeners}
      >
        <GripDotsVerticalIcon variant="duotone-solid" />
      </button>
      <span style={{ flex: 1 }}>{name}</span>
      <button
        type="button"
        className="platform-row-action"
        aria-label={`Subir «${name}»`}
        disabled={!steps.up}
        onClick={() => steps.up?.()}
      >
        Subir
      </button>
      <button
        type="button"
        className="platform-row-action"
        aria-label={`Bajar «${name}»`}
        disabled={!steps.down}
        onClick={() => steps.down?.()}
      >
        Bajar
      </button>
    </li>
  );
}

/** The list a screen would draw: its order in `useSortableRows`, the wiring in `SortableDnd`. */
function Openings({ onReorder }: { onReorder: (orderedIds: string[]) => Promise<void> }) {
  const { rows, moveById } = useSortableRows({ items: OPENINGS, isFixed: () => false, onReorder });
  return (
    <SortableDnd items={rows} noun="apertura" onMove={moveById}>
      <ul style={{ margin: 0, padding: 0, listStyle: "none", color: "var(--platform-text)" }}>
        {rows.map((row) => (
          <Row key={row.id} id={row.id} name={row.name} />
        ))}
      </ul>
    </SortableDnd>
  );
}

/** Stands in for the screen's server action: a spy records the order it is sent. */
const reorder = fn(async () => {}).mockName("onReorder");

const meta = {
  title: "platform/shared/SortableDnd",
  component: SortableDnd,
  parameters: {
    docs: {
      description: {
        component: `
The drag and drop of every sortable list of the platform: dnd-kit's sensors,
its sortable context and what is said out loud, in Spanish. It draws nothing
of its own but a status line only a screen reader hears; the rows are the
list it wraps. Here the list is the plainest one: drag a row by its grip,
pick it up with space and move it with the arrows, or press «Subir» or
«Bajar» — the step \`useSortableStep\` gives a row — and the order changes on
the spot; the spy in the Actions panel gets it, and nothing is saved.

Source: \`components/platform/shared/sortable-dnd/sortable-dnd.comp.tsx\`.
Reference page: [Components › SortableDnd](/components/platform/shared/sortable-dnd) in the docs site.
`,
      },
    },
  },
  args: {
    items: OPENINGS,
    noun: "apertura",
    onMove: fn(),
    children: null,
  },
  argTypes: {
    items: { table: { disable: true } },
    onMove: { table: { disable: true } },
    children: { table: { disable: true } },
  },
  render: () => <Openings onReorder={reorder} />,
  decorators: [
    (Story) => (
      <div style={{ padding: 32, background: "var(--platform-bg)" }}>
        <div className="platform-card" style={{ maxWidth: 480, margin: "0 auto", padding: 0, overflow: "hidden" }}>
          <Story />
        </div>
      </div>
    ),
  ],
} satisfies Meta<typeof SortableDnd>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Five rows to sort by dragging, by keyboard from the grip, or one place at a time with «Subir» and «Bajar». */
export const FiveRows: Story = {
  name: "Una lista de cinco",
};

/** «Bajar» pressed on the first row: it is now the second, the status line says so, and the order went to `onReorder` whole. */
export const SteppedWithoutDragging: Story = {
  name: "Un paso sin arrastrar",
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "Bajar «Apertura española»" }));

    await expect(canvas.getByText("«Apertura española» queda en la posición 2 de 5.")).toHaveAttribute(
      "role",
      "status",
    );
    await expect(reorder).toHaveBeenCalledWith(["sicilian", "ruy-lopez", "queens-gambit", "french", "italian"]);
  },
};
