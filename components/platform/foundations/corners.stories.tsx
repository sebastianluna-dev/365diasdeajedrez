import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { usagesOf } from "./platform-stylesheets.const";
import "./foundations.css";

/**
 * The radii of the platform, as `styling.mdx` ("Corners in the platform")
 * states them; the rule itself is `components/platform/border-radius.test.ts`.
 */
const RADII = [
  { value: "8px", shape: "card", when: "Every corner that is rounded and is not a pill nor a circle." },
  {
    value: "4px",
    shape: "box",
    when: "Only a control of about 20px or less, where 8 is all but a circle: a checkbox at 8px reads as a radio, as something one of which is chosen.",
  },
  { value: "1000px", shape: "pill", when: "All the way: a pill, a progress track, a count." },
  { value: "50%", shape: "circle", when: "All the way, for a circle: an avatar, a dot, a round button." },
] as const;

/** Values that draw no radius of their own: a side left square, a corner taken from the parent. */
const NO_RADIUS = ["0", "inherit"];

function CornersPage() {
  const usages = usagesOf("border(?:-[a-z]+)*-radius", true);
  const countOf = (value: string) => usages.find((usage) => usage.value === value)?.count ?? 0;
  const known = new Set<string>([...RADII.map(({ value }) => value), ...NO_RADIUS]);
  const others = usages.filter(({ value }) => !known.has(value));
  return (
    <div className="platform-page foundations">
      <header className="platform-page__head">
        <h1 className="platform-page__title">Corners</h1>
        <p className="platform-page__subtitle">8px, or all the way — and 4px for a control too small for 8.</p>
      </header>
      <p className="foundations__lead">
        It holds for anything — a card, a button, a field, a tag, a dialog, a menu, a cover — and whatever its size: a
        large card does not get a larger radius. The counts are how many times each value is written in the
        platform&apos;s stylesheets today, read from them (a value of several corners, <code>8px 8px 0 0</code>, counts
        each); <code>components/platform/border-radius.test.ts</code> fails on any other value.
      </p>
      <ul className="foundations__grid">
        {RADII.map(({ value, shape, when }) => (
          <li key={value} className="foundations__corner">
            <div className="foundations__stage">
              <span className={`foundations__shape foundations__shape_kind_${shape}`} aria-hidden="true" />
            </div>
            <code className="foundations__name">{value}</code>
            <p className="foundations__note">{when}</p>
            <span className="foundations__count">
              Written {countOf(value)} {countOf(value) === 1 ? "time" : "times"}
            </span>
          </li>
        ))}
      </ul>
      <p className="foundations__lead">
        Without a radius of their own: {NO_RADIUS.map((value) => `${value} (${countOf(value)})`).join(", ")}.
        {others.length > 0
          ? ` Outside the rule: ${others.map(({ value, count }) => `${value} (${count})`).join(", ")}.`
          : " Outside the rule: none."}
      </p>
    </div>
  );
}

const meta = {
  title: "platform/foundations/Corners",
  parameters: {
    docs: {
      description: {
        component: `
The platform rounds a corner in one of three ways, each drawn on the shape it
is for, with how many times the platform's stylesheets write it today
(counted from the stylesheets themselves, so the figures follow them).

Reference: [Styling & design tokens › Corners in the platform](/ui/styling#corners-in-the-platform) in the docs site.
`,
      },
    },
  },
  render: () => <CornersPage />,
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

/** The three radii and the exception, each on its shape, with the corners that use it. */
export const Corners: Story = {};
