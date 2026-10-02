import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { TYPE_STEPS, typeOffScale, usesOf } from "./scales.const";
import "./foundations.css";

const SAMPLE = "Siguiente lección: la defensa siciliana";

const times = (count: number) => `written ${count} ${count === 1 ? "time" : "times"}`;

function TypeScalePage() {
  const offScale = typeOffScale();
  return (
    <div className="platform-page foundations">
      <header className="platform-page__head">
        <h1 className="platform-page__title">Type scale</h1>
        <p className="platform-page__subtitle">The platform&apos;s {TYPE_STEPS.length} font sizes, in real px.</p>
      </header>
      <p className="foundations__lead">
        Every font size of the platform is one of these tokens, from the <code>:root</code> of{" "}
        <code>app/(platform)/platform.css</code>, and a stylesheet never writes a px of its own. Four small steps a
        pixel apart, where nearly all of the text is, and the rest for the headings and the figures. Until 2026-10-02
        the body carried <code>zoom: 1.1</code> to draw everything larger; the steps carry that enlargement, and the
        platform has no zoom.
      </p>

      <section className="foundations__group" aria-labelledby="type-scale-steps">
        <h2 id="type-scale-steps" className="foundations__group-title">
          The steps
        </h2>
        <ul className="foundations__steps">
          {TYPE_STEPS.map((step) => (
            <li key={step.token} className="foundations__step">
              <code className="foundations__name">{step.token}</code>
              <span className="foundations__size-value">{step.px}px</span>
              <span className="foundations__step-specimen" style={{ fontSize: `var(${step.token})` }}>
                {SAMPLE}
              </span>
              <span className="foundations__count">{times(usesOf(step.token))}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="foundations__group" aria-labelledby="type-scale-off">
        <h2 id="type-scale-off" className="foundations__group-title">
          Off the scale
        </h2>
        <p className="foundations__lead">
          {offScale.length === 0
            ? "None: every font size is a token."
            : `${offScale.map(({ value, count }) => `${value} (${count})`).join("; ")}. The board's coordinates are drawn inside a square, where the smallest step crowds its corner.`}
        </p>
      </section>
    </div>
  );
}

const meta = {
  title: "platform/foundations/Type scale",
  parameters: {
    docs: {
      description: {
        component: `
The platform's type scale: the type tokens (\`--platform-type-2xs\` to \`--platform-type-5xl\`) of
\`app/(platform)/platform.css\`, each drawn at its size with how many times
the stylesheets write it, and what is still written off the scale. The steps
are read from the stylesheet and the uses counted in the stylesheets, so the
page follows them.

Reference: [Styling & design tokens › Type and space](/ui/styling#type-and-space) in the docs site.
`,
      },
    },
  },
  render: () => <TypeScalePage />,
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

/** The ten font sizes of the platform, each at its size, with how often it is written. */
export const TypeScale: Story = { name: "Type scale" };
