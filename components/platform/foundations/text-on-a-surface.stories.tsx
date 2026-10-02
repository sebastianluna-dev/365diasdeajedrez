import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { FILLS, TEXT_MINIMUM, TEXT_PAIRS, THEMES, readTokens, tokenContrast, type Theme } from "@/lib/platform-tokens";
import { PLATFORM_CSS } from "./platform-stylesheets.const";
import { useSchemeOnScreen } from "./use-scheme-on-screen.hook";
import "./foundations.css";

const token = (name: string) => `--platform-${name}`;

/** The backgrounds of TEXT_PAIRS in the order they first appear, each with the texts allowed on it. */
function textsByBackground(): [background: string, texts: string[]][] {
  const byBackground = new Map<string, string[]>();
  for (const [text, background] of TEXT_PAIRS) {
    byBackground.set(background, [...(byBackground.get(background) ?? []), text]);
  }
  return [...byBackground];
}

interface LineProps {
  text: string;
  background: string;
  tokens: Map<string, string>;
  theme: Theme;
}

/** One line of real text in its colour, with its contrast in the theme on screen and the other one beside it. */
function ContrastLine({ text, background, tokens, theme }: LineProps) {
  const other = THEMES.find((each) => each !== theme) ?? "dark";
  const onScreen = tokenContrast(tokens, token(text), token(background), theme);
  const otherwise = tokenContrast(tokens, token(text), token(background), other);
  const below = onScreen < TEXT_MINIMUM;
  return (
    <p
      className={`foundations__line${below ? " foundations__line_state_below" : ""}`}
      style={{ color: `var(${token(text)})` }}
    >
      <span className="foundations__label">
        <span className="foundations__sample">Siguiente lección</span>
        <code className="foundations__token">{text}</code>
      </span>
      <span className="foundations__figures">
        <span className="foundations__ratio">
          {onScreen.toFixed(2)}:1{below ? " — under 4.5" : ""}
        </span>
        <span className="foundations__other">
          {other} {otherwise.toFixed(2)}:1
        </span>
      </span>
    </p>
  );
}

function TextOnASurfacePage({ scheme }: { scheme: unknown }) {
  const theme = useSchemeOnScreen(scheme);
  const tokens = readTokens(PLATFORM_CSS);
  return (
    <div className="platform-page foundations">
      <header className="platform-page__head">
        <h1 className="platform-page__title">Text on a surface</h1>
        <p className="platform-page__subtitle">
          May I write this grey on that fill? If the pair is here, yes, in both themes.
        </p>
      </header>
      <p className="foundations__lead">
        Each panel is a background, painted with its token, and each line is a text colour that may be written on it,
        with the contrast it measures in the theme on screen ({theme}) and, beside it, in the other one. A text reaches{" "}
        {TEXT_MINIMUM}:1 on what it is written on, in both themes (WCAG 2.2, 1.4.3), and every pair here does:{" "}
        <code>components/platform/platform-tokens.test.ts</code> fails otherwise. The list is <code>TEXT_PAIRS</code> in{" "}
        <code>lib/platform-tokens.ts</code>, and it is what is measured as a pair of tokens. The test also measures
        every rule that sets both its own colour and its own fill, listed here or not; a text that inherits its colour
        onto a fill set elsewhere is measured only if its pair is in the list, so a new pair goes there.
      </p>
      <ul className="foundations__fills">
        {textsByBackground().map(([background, texts]) => (
          <li key={background} className="foundations__fill" style={{ background: `var(${token(background)})` }}>
            <h2 className="foundations__fill-name" style={{ color: `var(${token(texts[0] ?? "text")})` }}>
              on {background}
            </h2>
            {texts.map((text) => (
              <ContrastLine key={text} text={text} background={background} tokens={tokens} theme={theme} />
            ))}
          </li>
        ))}
      </ul>
      <section className="foundations__group" aria-labelledby="text-not-allowed">
        <h2 id="text-not-allowed" className="foundations__group-title">
          Not allowed: the subtle grey on a fill
        </h2>
        <p className="foundations__lead">
          <code>text-subtle</code> is for the white surfaces only. On a grey or tinted fill it falls under the minimum
          in the light theme, and <code>text-muted</code> is used instead. A line under the minimum on screen says so,
          and is left out of the Accessibility panel&apos;s scan: it is here to be seen failing.
        </p>
        <ul className="foundations__fills">
          {FILLS.map((background) => (
            <li key={background} className="foundations__fill" style={{ background: `var(${token(background)})` }}>
              <h3 className="foundations__fill-name" style={{ color: `var(${token("text")})` }}>
                on {background}
              </h3>
              <ContrastLine text="text-subtle" background={background} tokens={tokens} theme={theme} />
              <ContrastLine text="text-muted" background={background} tokens={tokens} theme={theme} />
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

const meta = {
  title: "platform/foundations/Text on a surface",
  parameters: {
    docs: {
      description: {
        component: `
Every text colour of the platform on every background it may be written on,
with the contrast each pair measures in both themes. The pairs are
\`TEXT_PAIRS\` of \`lib/platform-tokens.ts\` and the values are read from
\`app/(platform)/platform.css\`: the same list and the same reading as the
convention test that holds every pair at 4.5:1.

Reference: [Conventions](/conventions) ("A text reaches 4.5:1 on what it is written on") and [Styling & design tokens](/ui/styling#tokens) in the docs site.
`,
      },
    },
    // The counter-examples are drawn under the minimum on purpose.
    a11y: { context: { exclude: [".foundations__line_state_below"] } },
  },
  render: (_args, { globals }) => <TextOnASurfacePage scheme={globals.scheme} />,
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

/** Every allowed pair of text and background, measured in the theme on screen. */
export const TextOnASurface: Story = { name: "Text on a surface" };
