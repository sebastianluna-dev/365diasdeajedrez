import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import type { PackagePlanContent } from "@/services/home/home.types";
import { PlanCard } from "./plan-card.comp";

// The component takes one `plan` object. For the controls panel every field of
// that object is a top-level arg, so each one gets its own control (text,
// number, boolean, select) instead of a single JSON editor; `render` folds
// them back into `plan`.
type PlanArgs = Omit<PackagePlanContent, "features"> & { features: string };

const defaults: PlanArgs = {
  name: "Mensual",
  price: 1200,
  previousPrice: undefined,
  currency: "MXN",
  period: "mes",
  description: "Cuatro clases individuales al mes con plan de estudio y análisis de partidas.",
  features: "4 clases de 60 minutos\nPlan de estudio personalizado\nAnálisis de tus partidas\nAcceso a la plataforma",
  ctaLabel: "Quiero este plan",
  ctaUrl: "https://wa.me/5215555555555",
  featured: false,
};

const meta = {
  title: "site/sections/home/plans/PlanCard",
  // No `component`: the args are the flat fields above, not `PlanCardProps`, and
  // setting it would make Storybook merge both and demand `plan` in every story.
  parameters: {
    docs: {
      description: {
        component: `
One pricing card of the home page. Rendered by \`PlansSection\` (desktop grid)
and \`PlansMobileSection\` (one card behind tabs), always inside
\`.section_theme_light\`, from which it inherits its text colour.

- \`featured\` is a CMS flag: it adds \`.plan-card_featured\` and switches the
  button to \`.plan-card__button_variant_alt\`. There is no separate component
  for the highlighted plan.
- The discount row renders only when \`previousPrice\` is set.
- Prices are formatted with \`toLocaleString("en-US")\` and a \`$\` prefix; the
  currency and period come from the CMS as text.
- The CTA opens \`ctaUrl\` in a new tab (WhatsApp in production).

Source: \`components/site/sections/home/plans/plan-card/plan-card.comp.tsx\`.
Reference page: [Components › PlanCard](/components/site/sections/home/plans/plan-card) in the docs site.
`,
      },
    },
  },
  args: defaults,
  argTypes: {
    name: { control: "text", description: "Plan name (title of the card).", table: { category: "Copy" } },
    description: { control: "text", description: "One sentence under the price.", table: { category: "Copy" } },
    features: {
      control: "text",
      description: "One feature per line.",
      table: { category: "Copy", type: { summary: "string[]" } },
    },
    ctaLabel: { control: "text", description: "Button text.", table: { category: "CTA" } },
    ctaUrl: { control: "text", description: "Button target, opened in a new tab.", table: { category: "CTA" } },
    price: {
      control: { type: "number", min: 0, step: 50 },
      description: "Current price, formatted with a thousands separator.",
      table: { category: "Price" },
    },
    previousPrice: {
      control: { type: "number", min: 0, step: 50 },
      description: "When set, shown struck through under the price.",
      // Its default is `undefined`, which autodocs would otherwise report as `object`.
      table: { category: "Price", type: { summary: "number" } },
    },
    currency: {
      control: "select",
      options: ["MXN", "USD", "EUR"],
      description: "Shown after the price and inside the discount row.",
      table: { category: "Price" },
    },
    period: {
      control: "select",
      options: ["mes", "trimestre", "semestre", "año"],
      description: "Billing period, printed as `currency / period`.",
      table: { category: "Price" },
    },
    featured: {
      control: "boolean",
      description: "Highlighted card: `.plan-card_featured` and the alternative button.",
      table: { category: "State" },
    },
  },
  render: ({ features, ...rest }) => <PlanCard plan={{ ...rest, features: features.split("\n").filter(Boolean) }} />,
  decorators: [
    // In the app the card sits inside `.section_theme_light` (plans.section.tsx)
    // and inherits its colour; without it the non-featured card is unreadable.
    (Story) => (
      <section className="section section_theme_light" style={{ padding: 32 }}>
        <div style={{ maxWidth: 360 }}>
          <Story />
        </div>
      </section>
    ),
  ],
} satisfies Meta<PlanArgs>;

export default meta;
type Story = StoryObj<typeof meta>;

/** The regular plan as the CMS ships it: no discount, dark button. */
export const Default: Story = {};

/** The highlighted plan: accent border and background, orange button. One per section at most. */
export const Featured: Story = {
  args: { name: "Trimestral", price: 3200, period: "trimestre", featured: true },
};

/** A plan with a previous price: the struck-through row appears under the price. */
export const WithDiscount: Story = {
  args: { previousPrice: 1500 },
};
