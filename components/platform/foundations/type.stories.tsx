import { useEffect, useRef, useState, type CSSProperties } from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { TOKENS_FILE, readTokenDeclarations } from "@/lib/platform-tokens";
import { PLATFORM_CSS, PLATFORM_STYLESHEETS, usagesOf, type Usage } from "./platform-stylesheets.const";
import "./foundations.css";

const FONT_TOKENS = /^--platform-font/;

/** A `font-family` that reads a token or inherits; anything else names a font itself. */
const READS_A_TOKEN = /^(var\(--platform-font[a-z-]*\)|inherit)$/;

function FontSpecimen({ name, value, note }: { name: string; value: string; note: string | null }) {
  const specimen = useRef<HTMLParagraphElement>(null);
  const [faces, setFaces] = useState<number[] | null>(null);
  useEffect(() => {
    if (!specimen.current) return;
    const unquote = (family: string) => family.trim().replace(/^["']|["']$/g, "");
    const family = unquote(getComputedStyle(specimen.current).fontFamily.split(",")[0] ?? "");
    const weights = [...document.fonts].filter((face) => unquote(face.family) === family).map((face) => face.weight);
    setFaces([...new Set(weights)].map(Number).sort((first, second) => first - second));
  }, [value]);
  return (
    <li className="foundations__corner">
      <p ref={specimen} className="foundations__specimen" style={{ fontFamily: `var(${name})` }}>
        Mis cursos 1. e4 e5
      </p>
      <code className="foundations__name">{name}</code>
      <span className="foundations__alias">{value}</span>
      <span className="foundations__count">
        {faces === null
          ? "…"
          : faces.length > 0
            ? `Faces declared: ${faces.join(", ")}`
            : "No face declared: the system's font"}
      </span>
      {note && <p className="foundations__note">{note}</p>}
    </li>
  );
}

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
  const named = usagesOf("font-family").filter(({ value }) => !READS_A_TOKEN.test(value));
  return (
    <div className="platform-page foundations">
      <header className="platform-page__head">
        <h1 className="platform-page__title">Type</h1>
        <p className="platform-page__subtitle">The font tokens, and the sizes and weights the stylesheets use today.</p>
      </header>
      <section className="foundations__group" aria-labelledby="type-fonts">
        <h2 id="type-fonts" className="foundations__group-title">
          Fonts
        </h2>
        <p className="foundations__lead">
          A stylesheet of the platform reads one of these tokens, from <code>{TOKENS_FILE}</code>, or inherits. A
          page&apos;s <code>h1</code> takes the display font through one rule, as the title of this page does. Under
          each token, the weights its first font has a face for: any other weight is made up by the browser.
        </p>
        <ul className="foundations__grid">
          {fonts.map((font) => (
            <FontSpecimen key={font.name} name={font.name} value={font.value} note={font.note} />
          ))}
        </ul>
        <p className="foundations__lead">
          {named.length === 0
            ? "No stylesheet names a font of its own."
            : `Stylesheets that name a font of their own instead, each an exception of type-and-space.test.ts with its reason: ${named
                .map(({ value, count }) => `${value} (${count})`)
                .join("; ")}.`}
        </p>
      </section>
      <section className="foundations__group" aria-labelledby="type-sizes">
        <h2 id="type-sizes" className="foundations__group-title">
          Sizes in use ({sizes.length})
        </h2>
        <p className="foundations__lead">
          Every <code>font-size</code> written in the {PLATFORM_STYLESHEETS.length} stylesheets of the platform, with
          how many times: the tokens of the type scale (drawn on the «Type scale» page), and whatever is still written
          otherwise.
        </p>
        <UsageRows usages={sizes} style={(value) => ({ fontSize: value })} />
      </section>
      <section className="foundations__group" aria-labelledby="type-weights">
        <h2 id="type-weights" className="foundations__group-title">
          Weights in use ({weights.length})
        </h2>
        <p className="foundations__lead">
          Every <code>font-weight</code> written in the same stylesheets, with how many times; the faces each font has
          are listed under its token above.
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
The platform's font tokens, each drawn in its font with the stack it names and
the weights its first font has a face for, and every font size, weight and
named font its stylesheets write today, counted. The tokens are read from
\`app/(platform)/platform.css\`, the faces from the browser
(\`document.fonts\`) and the rest from the platform's stylesheets themselves,
so the page follows them.

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
