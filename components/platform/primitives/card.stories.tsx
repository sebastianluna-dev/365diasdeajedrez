import type { Meta, StoryObj } from "@storybook/nextjs-vite";

interface CardArgs {
  title: string;
  text: string;
}

const meta = {
  title: "platform/primitives/Card",
  parameters: {
    docs: {
      description: {
        component: `
\`.platform-card\` and its \`__title\`: a global class of
\`app/(platform)/platform.css\`, written straight into the markup (there is no
component). A card declares no outline: it is told from the page by its fill,
and in the dark theme by the hairline \`--platform-shadow-card\` draws for it.

Reference: [Styling & design tokens › Cards in the platform](/ui/styling#cards-in-the-platform) in the docs site.
`,
      },
    },
  },
  args: {
    title: "Próxima clase",
    text: "Martes a las 18:00, con Fernanda. Repasaremos los finales de torres de la semana pasada.",
  },
  argTypes: {
    title: { control: "text", description: "`.platform-card__title`; empty, the card has none." },
    text: { control: "text", description: "Whatever the card holds." },
  },
  render: ({ title, text }) => (
    <section className="platform-card" style={{ maxWidth: 420 }}>
      {title && <h2 className="platform-card__title">{title}</h2>}
      <p>{text}</p>
    </section>
  ),
} satisfies Meta<CardArgs>;

export default meta;
type Story = StoryObj<typeof meta>;

/** A card: the surface, over the card shadow (`--platform-shadow-card`). */
export const Default: Story = {};

/** Without `.platform-card__title`: the padding alone frames what it holds. */
export const WithoutTitle: Story = { name: "Without title", args: { title: "" } };

/**
 * A card is the surface on the page's canvas (`--platform-surface` on `--platform-bg`: white on grey in the light
 * theme, a near-black a step lighter than the canvas's in the dark one), over the card shadow where it has one.
 */
export const OnTheCanvas: Story = {
  name: "On the canvas",
  render: ({ title, text }) => (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 20 }}>
      {[title, "Racha diaria", "Mis estudios"].map((each) => (
        <section key={each} className="platform-card">
          <h2 className="platform-card__title">{each}</h2>
          <p>{text}</p>
        </section>
      ))}
    </div>
  ),
};
