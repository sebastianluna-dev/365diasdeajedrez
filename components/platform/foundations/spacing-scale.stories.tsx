import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { SPACE_STEPS, spaceOffScale, usesOf } from "./scales.const";
import "./foundations.css";

const times = (count: number) => `written ${count} ${count === 1 ? "time" : "times"}`;

function SpacingScalePage() {
  const offScale = spaceOffScale();
  return (
    <div className="platform-page foundations">
      <header className="platform-page__head">
        <h1 className="platform-page__title">Spacing scale</h1>
        <p className="platform-page__subtitle">Every gap, padding and margin, on a 4px grid.</p>
      </header>
      <p className="foundations__lead">
        The spaces of the platform are these {SPACE_STEPS.length} tokens, from the <code>:root</code> of{" "}
        <code>app/(platform)/platform.css</code>: multiples of 4, and 2 for the tightest, so any two spaces on a screen
        agree. The name is the multiple of 4. Each bar is drawn at its width.
      </p>

      <section className="foundations__group" aria-labelledby="spacing-scale-steps">
        <h2 id="spacing-scale-steps" className="foundations__group-title">
          The steps
        </h2>
        <ul className="foundations__steps">
          {SPACE_STEPS.map((step) => (
            <li key={step.token} className="foundations__step">
              <code className="foundations__name">{step.token}</code>
              <span className="foundations__size-value">{step.px}px</span>
              <span className="foundations__bar" style={{ width: `var(${step.token})` }} />
              <span className="foundations__count">{times(usesOf(step.token))}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="foundations__group" aria-labelledby="spacing-scale-off">
        <h2 id="spacing-scale-off" className="foundations__group-title">
          Still written in px
        </h2>
        <p className="foundations__lead">
          A hairline of 1px is a line and not a space, and a px inside a <code>calc()</code> of geometry (a mark&apos;s
          centre, a step of indentation) belongs to what it measures:{" "}
          {offScale.length === 0 ? "none." : `${offScale.map(({ value, count }) => `${value} (${count})`).join("; ")}.`}
        </p>
      </section>
    </div>
  );
}

const meta = {
  title: "platform/foundations/Spacing scale",
  parameters: {
    docs: {
      description: {
        component: `
The platform's spacing scale: the space tokens (\`--platform-space-0-5\` to \`--platform-space-24\`) of
\`app/(platform)/platform.css\`, each drawn as a bar of its width with how many
times the stylesheets write it, and the spaces still written in px (hairlines
and the geometry inside a \`calc()\`). Read from the stylesheets, so the page
follows them.

Reference: [Styling & design tokens › Type and space](/ui/styling#type-and-space) in the docs site.
`,
      },
    },
  },
  render: () => <SpacingScalePage />,
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

/** The twelve spaces of the platform, each as a bar of its width, with how often it is written. */
export const SpacingScale: Story = { name: "Spacing scale" };
