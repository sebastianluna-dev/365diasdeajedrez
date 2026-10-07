import type { CSSProperties } from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { userEvent } from "storybook/test";
import { ArrowRightIcon } from "@/components/icons/arrow-right-icon.comp";
import { CheckIcon } from "@/components/icons/check-icon.comp";
import { GearIcon } from "@/components/icons/gear-icon.comp";
import { PlusIcon } from "@/components/icons/plus-icon.comp";
import { SpinnerIcon } from "@/components/icons/spinner-icon.comp";
import { TrashCanIcon } from "@/components/icons/trash-can-icon.comp";

const VARIANTS = ["secondary", "accent", "soft", "ink", "danger"] as const;
const SIZES = ["lg", "md", "sm"] as const;

type Variant = (typeof VARIANTS)[number];
type Size = (typeof SIZES)[number];

interface ButtonArgs {
  label: string;
  variant: Variant;
  size: Size;
  icon: "none" | "left" | "right" | "only";
  disabled: boolean;
}

/** The word each variant is shown with, as the screens use it. */
const WORD: Record<Variant, string> = {
  secondary: "Guardar",
  accent: "Aprender",
  soft: "Continuar",
  ink: "Crear curso",
  danger: "Eliminar",
};

/** The classes a screen writes for a variant, a size and a square; the secondary medium one is the bare block. */
function classOf(variant: Variant, size: Size, square = false): string {
  return [
    "platform-button",
    variant === "secondary" ? null : `platform-button_variant_${variant}`,
    size === "md" ? null : `platform-button_size_${size}`,
    square ? "platform-button_shape_square" : null,
  ]
    .filter(Boolean)
    .join(" ");
}

function Button({ label, variant, size, icon, disabled }: ButtonArgs) {
  const glyph = <PlusIcon variant="classic-solid" className="platform-button__icon" />;
  if (icon === "only") {
    return (
      <button type="button" className={classOf(variant, size, true)} aria-label={label} disabled={disabled}>
        {glyph}
      </button>
    );
  }
  return (
    <button type="button" className={classOf(variant, size)} disabled={disabled}>
      {icon === "left" && glyph}
      {label}
      {icon === "right" && <ArrowRightIcon variant="classic-solid" className="platform-button__icon" />}
    </button>
  );
}

const ROW = { display: "flex", flexWrap: "wrap", alignItems: "center", gap: 12 } as const;
const GRID = { display: "grid", gap: 16 } as const;

const meta = {
  title: "platform/primitives/Button",
  parameters: {
    docs: {
      description: {
        component: `
\`.platform-button\`, the platform's button (only the platform's: the public
site has its own): a global class of \`app/(platform)/platform.css\`, written
straight into the markup. Three decisions: the variant (\`_variant_accent\`,
\`_variant_soft\`, \`_variant_ink\`, \`_variant_danger\`, \`_variant_quiet\`;
the bare block is the secondary one), the size (\`_size_lg\` 48px, the bare block 40px, \`_size_sm\`
32px) and an icon (\`.platform-button__icon\`, on the left, on the right, or
alone in a square: \`_shape_square\`). Radius 8px, bold type, the same states in
every variant. A row's action written as a word is \`platform-row-action\`.

Reference: [Styling & design tokens › Buttons](/ui/styling#buttons) in the docs site.
`,
      },
    },
  },
  args: { label: "Guardar cambios", variant: "secondary", size: "md", icon: "none", disabled: false },
  argTypes: {
    label: { control: "text", description: "The word on the button.", table: { category: "Copy" } },
    variant: {
      control: "inline-radio",
      options: VARIANTS,
      description: "`secondary` is the bare block; the others add `platform-button_variant_<name>`.",
      table: { category: "Modifiers" },
    },
    size: {
      control: "inline-radio",
      options: SIZES,
      description: "`md` (40px) is the bare block; `lg` (48px) and `sm` (32px) add `platform-button_size_<name>`.",
      table: { category: "Modifiers" },
    },
    icon: {
      control: "inline-radio",
      options: ["none", "left", "right", "only"],
      description: "An icon before the word, after it, or alone in a square (`platform-button_shape_square`).",
      table: { category: "Modifiers" },
    },
    disabled: { control: "boolean", table: { category: "State" } },
  },
  render: (args) => <Button {...args} />,
} satisfies Meta<ButtonArgs>;

export default meta;
type Story = StoryObj<typeof meta>;

/** The bare block: the secondary one, medium — the surface, a line of the strong border and the word in ink. */
export const Secondary: Story = {};

/** The primary one, flat since 2026-10-07: the action that is the screen, one per screen. */
export const Accent: Story = { args: { label: "Aprender", variant: "accent" } };

/** The soft one: what matters without being the screen's reason, in the accent's tint. */
export const Soft: Story = { args: { label: "Continuar", variant: "soft" } };

/** The ink one: the action of a popup whose page already has its primary. */
export const Ink: Story = { args: { label: "Crear estudio", variant: "ink" } };

/** The danger one: outlined in the danger colour and filled with it under the pointer. */
export const Danger: Story = { args: { label: "Quitar de mis cursos", variant: "danger" } };

/** Every variant in the three sizes: 48, 40 and 32px. */
export const VariantsBySize: Story = {
  name: "Variants by size",
  render: () => (
    <div style={GRID}>
      {SIZES.map((size) => (
        <div key={size} style={ROW}>
          {VARIANTS.map((variant) => (
            <button key={variant} type="button" className={classOf(variant, size)}>
              {WORD[variant]}
            </button>
          ))}
        </div>
      ))}
    </div>
  ),
};

/** An icon on the left says what it does; on the right, where it leads. One icon per button, never two. */
export const WithIcon: Story = {
  name: "With an icon",
  render: () => (
    <div style={GRID}>
      <div style={ROW}>
        <button type="button" className="platform-button platform-button_variant_accent">
          <PlusIcon variant="classic-solid" className="platform-button__icon" />
          Agregar curso
        </button>
        <button type="button" className="platform-button">
          <CheckIcon variant="classic-solid" className="platform-button__icon" />
          Guardar
        </button>
        <button type="button" className="platform-button platform-button_variant_danger">
          <TrashCanIcon variant="classic-solid" className="platform-button__icon" />
          Eliminar
        </button>
      </div>
      <div style={ROW}>
        {SIZES.map((size) => (
          <button key={size} type="button" className={classOf("soft", size)}>
            Continuar
            <ArrowRightIcon variant="classic-solid" className="platform-button__icon" />
          </button>
        ))}
      </div>
    </div>
  ),
};

/** Only an icon: a square of the button's own height, in any variant, its name in `aria-label`. */
export const IconOnly: Story = {
  name: "Icon only",
  render: () => (
    <div style={GRID}>
      {SIZES.map((size) => (
        <div key={size} style={ROW}>
          {VARIANTS.map((variant) => (
            <button key={variant} type="button" className={classOf(variant, size, true)} aria-label="Ajustes">
              <GearIcon variant="classic-solid" className="platform-button__icon" />
            </button>
          ))}
        </div>
      ))}
    </div>
  ),
};

/** What the quiet one is laid on, by name, and what its container sets. */
const SURFACES: { name: string; style: CSSProperties }[] = [
  { name: "Blanco", style: { background: "var(--platform-surface)" } },
  { name: "Gris", style: { background: "var(--platform-bg)" } },
  {
    name: "Tinte del acento",
    style: {
      background: "var(--platform-accent-wash)",
      color: "var(--platform-accent-ink)",
      ["--quiet-ink" as string]: "var(--platform-accent-ink)",
    },
  },
];

/**
 * The quiet one on each background, at rest and lit (as under the pointer, or while its menu is open): a shade of its
 * own ink over whatever is under it, so it shows on grey and on rose alike; on the accent's tint the container hands it
 * the accent's ink with `--quiet-ink`.
 */
export const QuietOnBackgrounds: Story = {
  name: "Quiet on each background",
  render: () => (
    <div style={GRID}>
      {SURFACES.map(({ name, style }) => (
        <div key={name} style={{ ...ROW, ...style, padding: 12, borderRadius: 8 }}>
          <span style={{ minWidth: 140 }}>{name}</span>
          <button
            type="button"
            className="platform-button platform-button_variant_quiet platform-button_size_sm platform-button_shape_square"
            aria-label="Ajustes"
          >
            <GearIcon variant="classic-solid" className="platform-button__icon" />
          </button>
          <button
            type="button"
            className="platform-button platform-button_variant_quiet platform-button_size_sm platform-button_shape_square"
            aria-label="Ajustes"
            aria-expanded="true"
          >
            <GearIcon variant="classic-solid" className="platform-button__icon" />
          </button>
        </div>
      ))}
    </div>
  ),
};

/** Disabled: a light tone of each variant's colour, not the whole button at 60 %, and no answer to the pointer. */
export const Disabled: Story = {
  render: () => (
    <div style={ROW}>
      {VARIANTS.map((variant) => (
        <button key={variant} type="button" className={classOf(variant, "md")} disabled>
          {WORD[variant]}
        </button>
      ))}
    </div>
  ),
};

/** Loading (`aria-busy`, as `SubmitButton` sets it): the button's own colours, a turning ring and the gerund with «…». */
export const Loading: Story = {
  render: () => (
    <div style={ROW}>
      {VARIANTS.map((variant) => (
        <button key={variant} type="button" className={classOf(variant, "md")} disabled aria-busy="true">
          <SpinnerIcon variant="classic-solid" className="platform-button__icon platform-button__spinner" />
          Guardando…
        </button>
      ))}
    </div>
  ),
};

/**
 * Reached with the keyboard: the platform's ring — the accent's ink outside a form, the selection's blue inside
 * one (`.platform-theme form :focus-visible`).
 */
export const Focused: Story = {
  play: async () => {
    await userEvent.tab();
  },
};
