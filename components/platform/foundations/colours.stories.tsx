import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import {
  ALIAS,
  THEMES,
  TOKENS_FILE,
  colourOf,
  groupColours,
  readTokenDeclarations,
  readTokens,
  type Theme,
  type TokenDeclaration,
} from "@/lib/platform-tokens";
import { PLATFORM_CSS } from "./platform-stylesheets.const";
import { useSchemeOnScreen } from "./use-scheme-on-screen.hook";
import "./foundations.css";

/** The tokens that draw a layer's edge (`shadow-card`, `shadow-bar`): shown painted on a surface rather than as a colour. */
const isShadow = (name: string) => name.replace("--platform-", "").startsWith("shadow-");

function Swatch({ token, tokens, theme }: { token: TokenDeclaration; tokens: Map<string, string>; theme: Theme }) {
  const alias = ALIAS.exec(token.value)?.[1];
  return (
    <li className="foundations__swatch">
      <span className="foundations__chip" style={{ background: `var(${token.name})` }} aria-hidden="true" />
      <div className="foundations__swatch-body">
        <code className="foundations__name">{token.name}</code>
        {alias && <span className="foundations__alias">= {alias}</span>}
        <dl className="foundations__values">
          {THEMES.map((each) => (
            <div
              key={each}
              className={`foundations__value${each === theme ? " foundations__value_state_current" : ""}`}
            >
              <dt className="foundations__theme">{each}</dt>
              <dd className="foundations__hex">{colourOf(tokens, token.name, each)}</dd>
            </div>
          ))}
        </dl>
        {token.note && <p className="foundations__note">{token.note}</p>}
      </div>
    </li>
  );
}

function ColoursPage({ scheme }: { scheme: unknown }) {
  const theme = useSchemeOnScreen(scheme);
  const tokens = readTokens(PLATFORM_CSS);
  const shadows = readTokenDeclarations(PLATFORM_CSS).filter(({ name }) => isShadow(name));
  return (
    <div className="platform-page foundations">
      <header className="platform-page__head">
        <h1 className="platform-page__title">Colours</h1>
        <p className="platform-page__subtitle">
          Every colour of the platform, read from the <code>:root</code> of <code>{TOKENS_FILE}</code>.
        </p>
      </header>
      <p className="foundations__lead">
        Each swatch is painted with its token, so the light / dark toolbar repaints it, and the value the theme on
        screen draws is the one in ink. The note under a swatch is the comment written above the token in the
        stylesheet. A stylesheet never names one of these colours: it says <code>var(--platform-accent)</code>, and the
        theme decides.
      </p>
      {groupColours(PLATFORM_CSS).map((group) => (
        <section key={group.name} className="foundations__group" aria-labelledby={`colours-${group.name}`}>
          <h2 id={`colours-${group.name}`} className="foundations__group-title">
            {group.name}
          </h2>
          <ul className="foundations__grid">
            {group.tokens.map((token) => (
              <Swatch key={token.name} token={token} tokens={tokens} theme={theme} />
            ))}
          </ul>
        </section>
      ))}
      <section className="foundations__group" aria-labelledby="colours-shadows">
        <h2 id="colours-shadows" className="foundations__group-title">
          Shadows
        </h2>
        <p className="foundations__lead">
          What tells a layer from the canvas. The card&apos;s: on light, two soft shadows; on dark, where a shadow over
          near-black separates nothing, a hairline of the border inside the same token. The bar&apos;s: a hairline of
          the border in both themes.
        </p>
        <ul className="foundations__grid">
          {shadows.map((token) => (
            <li key={token.name} className="foundations__shadow" style={{ boxShadow: `var(${token.name})` }}>
              <code className="foundations__name">{token.name}</code>
              <span className="foundations__alias">{token.value}</span>
              {token.note && <p className="foundations__note">{token.note}</p>}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

const meta = {
  title: "platform/foundations/Colours",
  parameters: {
    docs: {
      description: {
        component: `
The platform's colours, drawn from the stylesheet that declares them: every
\`--platform-*\` colour of the \`:root\` of \`app/(platform)/platform.css\`, by
family, with its light and dark values. Nothing on this page is written by
hand — the stylesheet is imported as text (\`platform-stylesheets.const.ts\`)
and read by \`lib/platform-tokens.ts\`, the module the convention test
\`components/platform/platform-tokens.test.ts\` reads it with — so changing a
value in the stylesheet changes the page.

Reference: [Styling & design tokens](/ui/styling#tokens) and [Themes](/architecture/themes) in the docs site.
`,
      },
    },
  },
  render: (_args, { globals }) => <ColoursPage scheme={globals.scheme} />,
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

/** Every colour token, by family, with the value each theme draws. */
export const Colours: Story = {};
