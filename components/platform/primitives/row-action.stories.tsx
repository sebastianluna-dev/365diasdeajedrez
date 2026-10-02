import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { userEvent } from "storybook/test";

interface RowActionArgs {
  label: string;
  danger: boolean;
  disabled: boolean;
}

const classOf = (danger: boolean) => `platform-row-action${danger ? " platform-row-action_variant_danger" : ""}`;

const meta = {
  title: "platform/primitives/RowAction",
  parameters: {
    docs: {
      description: {
        component: `
\`.platform-row-action\`, the action of a row: a global class of
\`app/(platform)/platform.css\`, written straight into the markup (there is no
component), with \`_variant_danger\` for the one that destroys. Hover a story
to see it go to the ink and underline itself.

What is NOT a row action: the one button of a card's header («Agregar
fuente», «Gestionar»), which is the platform's button, and the arrows that
move a row up and down, which are controls and keep their key.

Reference: [Styling & design tokens › Global helpers](/ui/styling#global-helpers) in the docs site.
`,
      },
    },
  },
  args: { label: "Editar", danger: false, disabled: false },
  argTypes: {
    label: { control: "text", description: "The word: the verb of what it does.", table: { category: "Copy" } },
    danger: {
      control: "boolean",
      description: "Adds `platform-row-action_variant_danger`.",
      table: { category: "Modifiers" },
    },
    disabled: { control: "boolean", table: { category: "State" } },
  },
  render: ({ label, danger, disabled }) => (
    <button type="button" className={classOf(danger)} disabled={disabled}>
      {label}
    </button>
  ),
} satisfies Meta<RowActionArgs>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * «Editar» beside a chapter, «Quitar» beside an author, «Eliminar» beside an exercise — what is done to ONE item
 * of a list. A word in the muted grey (14px/700) that goes to the ink and underlines itself under the pointer.
 */
export const Default: Story = {};

/** The danger one is the same in the danger colour. */
export const Danger: Story = { args: { label: "Eliminar", danger: true } };

/** Disabled: the faint grey, and no underline under the pointer. */
export const Disabled: Story = { args: { disabled: true } };

/**
 * It is not a button, and that is the point: a list is a column of rows, and a button on each one is a column of
 * boxes, so the list stops being read and becomes a form.
 */
export const InAList: Story = {
  name: "In a list",
  render: () => (
    // The rows' own layout belongs to each list's block; it is drawn inline here only to give the actions a list.
    <ul className="platform-card" style={{ maxWidth: 520, listStyle: "none" }}>
      {["Apertura española", "Defensa siciliana", "Gambito de dama"].map((chapter) => (
        <li
          key={chapter}
          style={{
            display: "flex",
            alignItems: "baseline",
            gap: 18,
            padding: "12px 0",
            boxShadow: "inset 0 -1px 0 var(--platform-border)",
          }}
        >
          <span style={{ flex: 1 }}>{chapter}</span>
          <button type="button" className={classOf(false)}>
            Editar
          </button>
          <button type="button" className={classOf(true)}>
            Eliminar
          </button>
        </li>
      ))}
    </ul>
  ),
};

/**
 * Reached with the keyboard: `.platform-theme :focus-visible` draws the ring in `--platform-accent-ink`, the
 * accent as text in whichever theme is drawn.
 */
export const Focused: Story = {
  play: async () => {
    await userEvent.tab();
  },
};
