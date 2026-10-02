import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { userEvent } from "storybook/test";

const VARIANTS = ["quiet", "accent", "ink", "danger"] as const;

interface ButtonArgs {
  label: string;
  variant: (typeof VARIANTS)[number];
  size: "regular" | "compact";
  disabled: boolean;
}

/** The classes a screen writes for a variant and a size; the quiet one is the bare block. */
function classOf({ variant, size }: Pick<ButtonArgs, "variant" | "size">): string {
  return [
    "platform-button",
    variant === "quiet" ? null : `platform-button_variant_${variant}`,
    size === "compact" ? "platform-button_size_compact" : null,
  ]
    .filter(Boolean)
    .join(" ");
}

const meta = {
  title: "platform/primitives/Button",
  parameters: {
    docs: {
      description: {
        component: `
\`.platform-button\`, the platform's button: a global class of
\`app/(platform)/platform.css\`, written straight into the markup (there is no
component). Its variants are modifiers — \`_variant_accent\`, \`_variant_ink\`,
\`_variant_danger\` — and \`_size_compact\` shrinks any of them. Hover a
story to see its pointer state.

Reference: [Styling & design tokens › Global helpers](/ui/styling#global-helpers) in the docs site.
`,
      },
    },
  },
  args: { label: "Guardar cambios", variant: "quiet", size: "regular", disabled: false },
  argTypes: {
    label: { control: "text", description: "The word on the button.", table: { category: "Copy" } },
    variant: {
      control: "inline-radio",
      options: VARIANTS,
      description: "`quiet` is the bare block; the others add `platform-button_variant_<name>`.",
      table: { category: "Modifiers" },
    },
    size: {
      control: "inline-radio",
      options: ["regular", "compact"],
      description: "`compact` adds `platform-button_size_compact`.",
      table: { category: "Modifiers" },
    },
    disabled: { control: "boolean", table: { category: "State" } },
  },
  render: ({ label, disabled, ...modifiers }) => (
    <button type="button" className={classOf(modifiers)} disabled={disabled}>
      {label}
    </button>
  ),
} satisfies Meta<ButtonArgs>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * The default one is quiet: the surface, a line of `--platform-border-strong` drawn with `box-shadow: inset`
 * (so it measures exactly like one without a line) and the word in ink; under the pointer the surface goes to
 * the canvas's grey.
 */
export const Quiet: Story = {};

/**
 * `_variant_accent` is that reason when a screen has one — signing in, adding the course one is reading about,
 * «Continuar» on the dashboard, «Aprender» on a course — raised on the hard edge of `--platform-accent-deep` and
 * sinking onto it while held, like the button of the blog's header; it is meant to be rare.
 */
export const Accent: Story = { args: { label: "Aprender", variant: "accent" } };

/**
 * `_variant_ink` is the inverted one — filled with the text colour and written in the surface's, so dark on the
 * light theme and light on the dark one —, for the confirming action of a dialog, whose «Cancelar» is right
 * beside it and would otherwise be its twin.
 */
export const Ink: Story = { args: { label: "Crear estudio", variant: "ink" } };

/** `_variant_danger` outlines in the danger colour and fills with it on hover. */
export const Danger: Story = { args: { label: "Quitar de mis cursos", variant: "danger" } };

/**
 * `_size_compact` (9/15 px) shrinks any of them for a card's header; it comes last in the file so it also wins
 * over the variants that set their own padding.
 */
export const Compact: Story = { args: { label: "Gestionar", size: "compact" } };

/**
 * The outline goes in `box-shadow` and not in `border` on purpose: the button then measures exactly the same
 * with it and without it, so a row of buttons of different variants lines up.
 */
export const SideBySide: Story = {
  name: "Side by side",
  render: ({ size, disabled }) => (
    <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 12 }}>
      {VARIANTS.map((variant) => (
        <button key={variant} type="button" className={classOf({ variant, size })} disabled={disabled}>
          {variant === "quiet"
            ? "Cancelar"
            : variant === "accent"
              ? "Aprender"
              : variant === "ink"
                ? "Crear"
                : "Eliminar"}
        </button>
      ))}
    </div>
  ),
};

/**
 * Disabled covers both "not allowed yet" and "on its way" (`SubmitButton` while the form is pending): same
 * look, no hover reaction.
 */
export const Disabled: Story = {
  args: { disabled: true },
  render: SideBySide.render,
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
