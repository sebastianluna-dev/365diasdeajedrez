import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { CalendarIcon } from "@/components/icons/calendar-icon.comp";

const VARIANTS = ["neutral", "accent", "warning", "success", "wash", "live"] as const;

interface TagArgs {
  label: string;
  variant: (typeof VARIANTS)[number];
  icon: boolean;
}

const meta = {
  title: "platform/primitives/Tag",
  parameters: {
    docs: {
      description: {
        component: `
\`.platform-tag\`, a pill label: a global class of
\`app/(platform)/platform.css\`, written straight into the markup (there is no
component). The block alone is the neutral one; \`_variant_accent\` is the one
in the accent's tint, and since 2026-10-15 there are four more tones for what a
class says of itself — \`_variant_warning\`, \`_variant_success\`,
\`_variant_wash\` and \`_variant_live\` — and an optional icon before the text,
\`.platform-tag__icon\`, in the tag's own colour.

Reference: [Styling & design tokens › Global helpers](/ui/styling#global-helpers) in the docs site.
`,
      },
    },
  },
  args: { label: "Sólo lectura", variant: "neutral", icon: false },
  argTypes: {
    label: { control: "text", description: "What the tag says." },
    variant: { control: "inline-radio", options: VARIANTS, description: "The tone: `platform-tag_variant_<tone>`." },
    icon: { control: "boolean", description: "Adds a `.platform-tag__icon` before the text." },
  },
  render: ({ label, variant, icon }) => (
    <span className={`platform-tag${variant === "neutral" ? "" : ` platform-tag_variant_${variant}`}`}>
      {icon && <CalendarIcon className="platform-tag__icon" variant="classic-solid" />}
      {label}
    </span>
  ),
} satisfies Meta<TagArgs>;

export default meta;
type Story = StoryObj<typeof meta>;

/** The neutral one, in the neutral surface and the muted grey: «Sólo lectura», «Cancelada». */
export const Default: Story = {};

/** The accent one, in the accent's soft tint and its ink: «Desactualizado». */
export const Accent: Story = { args: { label: "Desactualizado", variant: "accent" } };

/** The warning tone: what waits for somebody, «Por finalizar». */
export const Warning: Story = { args: { label: "Por finalizar", variant: "warning", icon: true } };

/** The success tone: what is done, «Finalizada», «Gratis». */
export const Success: Story = { args: { label: "Finalizada", variant: "success", icon: true } };

/** The wash tone: the accent's lightest tint, «Enlace abierto». */
export const Wash: Story = { args: { label: "Enlace abierto", variant: "wash", icon: true } };

/** The live tone: white on the danger red, «En vivo». */
export const Live: Story = { args: { label: "En vivo", variant: "live" } };

/** With its icon: the same colour as the text, before it. */
export const WithIcon: Story = { name: "With icon", args: { label: "Programada", icon: true } };
