import type { CSSProperties } from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { TOKENS_FILE, readTokenDeclarations } from "@/lib/platform-tokens";
import { PLATFORM_CSS, PLATFORM_STYLESHEETS, usagesOf, type Usage } from "./platform-stylesheets.const";
import "./foundations.css";

const FONT_TOKENS = /^--platform-font/;

/** Sizes in px first, the largest on top; anything relative (`em`, `inherit`, a `calc`) after them. */
function bySize(usages: Usage[]): Usage[] {
  const px = (value: string) => (/^[0-9.]+px$/.test(value) ? parseFloat(value) : -1);
  return [...usages].sort((first, second) => px(second.value) - px(first.value) || second.count - first.count);
}

function UsageRows({ usages, style }: { usages: Usage[]; style: (value: string) => CSSProperties }) {
  return (
    <ul className="foundations__sizes">
      {usages.map(({ value, count }) => (
        <li key={value} className="foundations__size">
          <span className="foundations__size-value">
            {value} · {count}×
          </span>
          <span className="foundations__size-sample" style={style(value)}>
            Siguiente lección: Defensa siciliana
          </span>
        </li>
      ))}
    </ul>
  );
}

function TypePage() {
  const fonts = readTokenDeclarations(PLATFORM_CSS).filter(({ name }) => FONT_TOKENS.test(name));
  const sizes = bySize(usagesOf("font-size"));
  const weights = [...usagesOf("font-weight")].sort((first, second) => first.value.localeCompare(second.value));
  return (
    <div className="platform-page foundations">
      <header className="platform-page__head">
        <h1 className="platform-page__title">Type</h1>
        <p className="platform-page__subtitle">Three fonts, and the sizes and weights the stylesheets use today.</p>
      </header>
      <section className="foundations__group" aria-labelledby="type-fonts">
        <h2 id="type-fonts" className="foundations__group-title">
          Fonts
        </h2>
        <p className="foundations__lead">
          A stylesheet of the platform never names a font: it reads one of these tokens, from <code>{TOKENS_FILE}</code>
          , or inherits. A page&apos;s <code>h1</code> takes the display font through one rule, as the title of this
          page does.
        </p>
        <ul className="foundations__grid">
          {fonts.map((font) => (
            <li key={font.name} className="foundations__corner">
              <p className="foundations__specimen" style={{ fontFamily: `var(${font.name})` }}>
                Mis cursos 1. e4 e5
              </p>
              <code className="foundations__name">{font.name}</code>
              <span className="foundations__alias">{font.value}</span>
              {font.note && <p className="foundations__note">{font.note}</p>}
            </li>
          ))}
        </ul>
      </section>
      <section className="foundations__group" aria-labelledby="type-sizes">
        <h2 id="type-sizes" className="foundations__group-title">
          Sizes in use ({sizes.length})
        </h2>
        <p className="foundations__lead">
          Every <code>font-size</code> written in the {PLATFORM_STYLESHEETS.length} stylesheets of the platform, with
          how many times. There is no type scale yet and no token for a size: this is the list as it is, which a scale
          would replace. Drawn here at the platform&apos;s zoom, as the app draws them.
        </p>
        <UsageRows usages={sizes} style={(value) => ({ fontSize: value })} />
      </section>
      <section className="foundations__group" aria-labelledby="type-weights">
        <h2 id="type-weights" className="foundations__group-title">
          Weights in use ({weights.length})
        </h2>
        <p className="foundations__lead">
          SF Pro Display is loaded at 400, 500, 600, 700 and 800, and Poppins at 600 and 700: the weights the
          stylesheets ask for (<code>app/(platform)/fonts.ts</code>).
        </p>
        <UsageRows usages={weights} style={(value) => ({ fontWeight: value })} />
      </section>
    </div>
  );
}

const meta = {
  title: "platform/foundations/Type",
  parameters: {
    docs: {
      description: {
        component: `
The platform's three font tokens, each drawn in its font with the stack it
names, and every font size and weight its stylesheets write today, counted.
The tokens are read from \`app/(platform)/platform.css\` and the sizes and
weights from the platform's stylesheets themselves, so the page follows them.

Reference: [Styling & design tokens › Fonts](/ui/styling#fonts) in the docs site.
`,
      },
    },
  },
  render: () => <TypePage />,
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

/** The fonts, and the sizes and weights in use, as they are. */
export const Type: Story = {};
