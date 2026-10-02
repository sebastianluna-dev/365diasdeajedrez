import type { CSSProperties } from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import type { MoveQuality } from "@/lib/chess/types";
import { chessMoveQualityIconFor } from "./chess-move-quality-icon.comp";

/** Every quality code, from the best move to the worst, in the order of the `MoveQuality` type. */
const QUALITIES: MoveQuality[] = [
  "brilliant",
  "great",
  "best",
  "excellent",
  "good",
  "book",
  "inaccuracy",
  "mistake",
  "miss",
  "blunder",
];

/**
 * The badge of every code, looked up once through `chessMoveQualityIconFor`,
 * so that rendering one is reading it here and no component is picked during
 * a render (what react-hooks/static-components asks).
 */
const BADGE_OF = Object.fromEntries(QUALITIES.map((quality) => [quality, chessMoveQualityIconFor(quality)])) as Record<
  MoveQuality,
  ReturnType<typeof chessMoveQualityIconFor>
>;

/** The badge's own size: its `width` and `height` attributes. */
const OWN_SIZE = 20;

/** The size of the enlarged badges. */
const LARGE = 48;

interface BadgeArgs {
  quality: MoveQuality;
}

const rowStyle: CSSProperties = { display: "flex", flexWrap: "wrap", gap: "var(--platform-space-6)" };

const itemStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: "var(--platform-space-2)",
};

const codeStyle: CSSProperties = { fontSize: "var(--platform-type-2xs)", color: "var(--platform-text)" };

/**
 * One badge, `size` px across. A badge takes only a class and its box is its
 * caller's (the board's notation cell); with no stylesheet here, its <svg> is
 * nested in one whose viewBox is the badge's own 20×20, which scales the
 * drawing as a CSS width and height on it would.
 */
function Badge({ quality, size }: { quality: MoveQuality; size: number }) {
  const Icon = BADGE_OF[quality];
  if (size === OWN_SIZE) return <Icon />;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${OWN_SIZE} ${OWN_SIZE}`} aria-hidden="true">
      <Icon />
    </svg>
  );
}

/** The ten badges in a row, each with the quality code that picks it. */
function EveryBadge({ size }: { size: number }) {
  return (
    <ul style={rowStyle}>
      {QUALITIES.map((quality) => (
        <li key={quality} style={itemStyle}>
          <Badge quality={quality} size={size} />
          <code style={codeStyle}>{quality}</code>
        </li>
      ))}
    </ul>
  );
}

const meta = {
  title: "chess/ChessMoveQualityIcon",
  parameters: {
    docs: {
      description: {
        component: `
The badges that mark a move as brilliant, best, a mistake and so on beside the
notation of an annotated game: chess.com's move-quality set, ten SVGs copied
path by path with their own colours, which no theme touches. The export is a
map of components keyed by name (\`ChessMoveQualityIcon.Best\`…), not a
component, and \`chessMoveQualityIconFor(quality)\` picks one from a
\`MoveQuality\` code, which is how the board's notation column uses it. Each
badge draws itself at 20×20 and is \`aria-hidden\`; the board puts it in a
19px cell beside the move.

Source: \`components/chess/chess-move-quality-icon.comp.tsx\`.
Reference page: [Components › ChessMoveQualityIcon](/components/chess/chess-move-quality-icon) in the docs site.
`,
      },
    },
  },
  args: { quality: "brilliant" },
  argTypes: {
    quality: {
      control: "select",
      options: QUALITIES,
      description: "The `MoveQuality` code that `chessMoveQualityIconFor` turns into a badge.",
    },
  },
  render: ({ quality }) => <Badge quality={quality} size={OWN_SIZE} />,
} satisfies Meta<BadgeArgs>;

export default meta;
type Story = StoryObj<typeof meta>;

/** The ten badges at the 20px they draw themselves, from the best move to the worst, each with its quality code. */
export const EveryKind: Story = {
  parameters: { controls: { disable: true } },
  render: () => <EveryBadge size={OWN_SIZE} />,
};

/** One badge, picked by `chessMoveQualityIconFor` from the code in the control: here a blunder. */
export const ForAQuality: Story = { args: { quality: "blunder" } };

/** The ten badges at 48px, to read each drawing: the disc, the shadow under it, the white glyph and the glyph's own shadow. */
export const Enlarged: Story = {
  parameters: { controls: { disable: true } },
  render: () => <EveryBadge size={LARGE} />,
};
