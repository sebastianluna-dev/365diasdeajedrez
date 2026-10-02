import type { Meta, StoryObj } from "@storybook/nextjs-vite";

interface TagArgs {
  label: string;
  accent: boolean;
}

const meta = {
  title: "platform/primitives/Tag",
  parameters: {
    docs: {
      description: {
        component: `
\`.platform-tag\`, a pill label: a global class of
\`app/(platform)/platform.css\`, written straight into the markup (there is no
component), with \`_variant_accent\` for the one in the accent's tint.

Reference: [Styling & design tokens › Global helpers](/ui/styling#global-helpers) in the docs site.
`,
      },
    },
  },
  args: { label: "Sólo lectura", accent: false },
  argTypes: {
    label: { control: "text", description: "What the tag says." },
    accent: { control: "boolean", description: "Adds `platform-tag_variant_accent`." },
  },
  render: ({ label, accent }) => (
    <span className={`platform-tag${accent ? " platform-tag_variant_accent" : ""}`}>{label}</span>
  ),
} satisfies Meta<TagArgs>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Pill labels ("Sólo lectura", "Desactualizado"): the neutral one, in the neutral surface and the muted grey. */
export const Default: Story = {};

/** Pill labels ("Sólo lectura", "Desactualizado"): the accent one, in the accent's soft tint and its ink. */
export const Accent: Story = { args: { label: "Desactualizado", accent: true } };
