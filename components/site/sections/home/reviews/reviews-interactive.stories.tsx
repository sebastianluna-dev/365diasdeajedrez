import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, userEvent, within } from "storybook/test";
import type { ReviewContent } from "@/services/home/home.types";
import { ReviewsInteractive } from "./reviews-interactive.comp";
import "./reviews.section.css";

const reviews: ReviewContent[] = [
  {
    avatarInitial: "M",
    avatarColor: "teal",
    name: "Mariana",
    time: "10:42",
    messages: [
      { text: "¡Gané mi primer torneo rápido!", reacted: false },
      { text: "Lo que vimos de finales de torres me salvó la última partida.", reacted: true },
    ],
    stat: { label: "ELO en Lichess", value: "+320", text: "en cuatro meses de clases" },
  },
  {
    avatarInitial: "J",
    avatarColor: "orange",
    name: "Javier",
    time: "18:05",
    messages: [{ text: "Por fin entiendo qué hacer después de la apertura.", reacted: true }],
    stat: { label: "Partidas analizadas", value: "48", text: "con su profesor, jugada a jugada" },
  },
  {
    avatarInitial: "L",
    avatarColor: "gold",
    name: "Lucía",
    time: "09:17",
    messages: [{ text: "Mi hijo espera la clase del sábado toda la semana.", reacted: false }],
    stat: { label: "Racha de estudio", value: "60 días", text: "sin saltarse uno" },
  },
];

const meta = {
  title: "site/sections/home/reviews/ReviewsInteractive",
  component: ReviewsInteractive,
  parameters: {
    docs: {
      description: {
        component: `
The home page's testimonials carousel. The reviews take turns every six
seconds, and the round button beside the dots pauses and plays them (WCAG
2.2.2); they also hold still while the pointer is over them or the keyboard's
focus is inside, and start paused under \`prefers-reduced-motion: reduce\`
(the toggle in the system, not in Storybook). Drawn here inside the
\`.section_theme_light\` and \`.reviews\` block that \`ReviewsSection\` gives
it, with sample reviews in place of the \`home-reviews\` Global.

Source: \`components/site/sections/home/reviews/reviews-interactive.comp.tsx\`.
Reference page: [Components › ReviewsInteractive](/components/site/sections/home/reviews/reviews-interactive) in the docs site.
`,
      },
    },
  },
  args: { reviews },
  decorators: [
    (Story) => (
      <section className="section section_theme_light reviews">
        <div className="section__inner">
          <Story />
        </div>
      </section>
    ),
  ],
} satisfies Meta<typeof ReviewsInteractive>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Taking turns every six seconds, with the pause button beside the dots. */
export const Playing: Story = {};

/** Paused with the button, by its `play` function: the review on screen stays, and the button offers to play them again. */
export const Paused: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "Pausar los testimonios" }));
    await expect(canvas.getByRole("button", { name: "Reproducir los testimonios" })).toBeInTheDocument();
  },
};
