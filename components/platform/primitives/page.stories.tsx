import { useEffect, useRef, useState } from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import "@/components/platform/sections/shell/platform-shell.section.css";

const WIDTHS = ["default", "wide", "full"] as const;

interface PageArgs {
  title: string;
  subtitle: string;
  width: (typeof WIDTHS)[number];
  actions: boolean;
}

/** How wide the page it sits in is drawn, kept up to date as the window changes. */
function MeasuredWidth() {
  const ref = useRef<HTMLParagraphElement>(null);
  const [width, setWidth] = useState<number | null>(null);
  useEffect(() => {
    const page = ref.current?.closest(".platform-page");
    if (!page) return;
    const observer = new ResizeObserver(([entry]) => setWidth(Math.round(entry?.contentRect.width ?? 0)));
    observer.observe(page);
    return () => observer.disconnect();
  }, []);
  return (
    <p ref={ref} className="platform-page__subtitle">
      {width === null ? "…" : `Esta página mide ${width}px de ancho.`}
    </p>
  );
}

const meta = {
  title: "platform/primitives/Page",
  parameters: {
    docs: {
      description: {
        component: `
\`.platform-page\` and its \`__head\`, \`__title\` and \`__subtitle\`: global
classes of \`app/(platform)/platform.css\`, written straight into the markup
(there is no component) by every page of the platform, inside the shell's
\`<main>\`. A head with \`__actions\` (2026-10-15) becomes a row: the title and
the subtitle on the left, the buttons on the right, and under 640px the
buttons take the whole width under the text. The stories put it in that \`<main>\`
(\`.platform-shell__content\`, from \`platform-shell.section.css\`), which is
what caps a page that does not cap itself; widen the window to see the three
widths part. The fourth modifier, \`_height_screen\`, is the lesson's and needs
the whole shell.

Reference: [Styling & design tokens › Global helpers](/ui/styling#global-helpers) in the docs site.
`,
      },
    },
  },
  args: { title: "Mis cursos", subtitle: "Los cursos que estás siguiendo.", width: "default", actions: false },
  argTypes: {
    title: { control: "text", description: "`.platform-page__title`, the page's `h1`." },
    subtitle: { control: "text", description: "`.platform-page__subtitle`." },
    width: {
      control: "inline-radio",
      options: WIDTHS,
      description: "`wide` adds `platform-page_width_wide`, `full` adds `platform-page_width_full`.",
    },
    actions: { control: "boolean", description: "Adds a `.platform-page__actions` with two buttons to the head." },
  },
  decorators: [
    // The shell's frame without its bar; its full-window height is left out so
    // that a story is as tall as its page.
    (Story) => (
      <div className="platform-shell" style={{ minHeight: 0 }}>
        <main className="platform-shell__content">
          <Story />
        </main>
      </div>
    ),
  ],
  render: ({ title, subtitle, width, actions }) => (
    <div className={`platform-page${width === "default" ? "" : ` platform-page_width_${width}`}`}>
      <header className="platform-page__head">
        <h1 className="platform-page__title">{title}</h1>
        <p className="platform-page__subtitle">{subtitle}</p>
        {actions && (
          <div className="platform-page__actions">
            <button type="button" className="platform-button">
              Registrar pago
            </button>
            <button type="button" className="platform-button platform-button_variant_accent">
              Crear clase
            </button>
          </div>
        )}
      </header>
      <section className="platform-card">
        <h2 className="platform-card__title">Continuar</h2>
        <MeasuredWidth />
      </section>
    </div>
  ),
} satisfies Meta<PageArgs>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * The vertical layout of every platform page: 28 px gaps, 39.5 px balanced title, muted subtitle. The root fades
 * in with a 6 px rise on mount, so taking the place of a segment's loading fallback is not a cut. Its width is
 * the shell's.
 */
export const Default: Story = {};

/** `_width_wide`: a page of the board: it caps itself at 1240px and the shell's `<main>` steps aside for it. */
export const Wide: Story = { args: { title: "Defensa siciliana", subtitle: "Capítulo 3 · Lección 2", width: "wide" } };

/** `_width_full`: no cap at all. */
export const Full: Story = { args: { title: "El centro", subtitle: "Capítulo 1 · Lección 4", width: "full" } };

/** `__actions`: the head as a row, the buttons top-aligned on the right; narrow the window under 640px to see them drop under the text. */
export const Actions: Story = {
  args: { title: "Clases", subtitle: "Hoy · miércoles 14 de octubre", actions: true },
};
