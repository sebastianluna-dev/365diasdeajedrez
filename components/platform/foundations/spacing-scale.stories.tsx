import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import {
  PlatformTable,
  PlatformTableCell,
  PlatformTableRow,
} from "@/components/platform/shared/platform-table/platform-table.comp";
import {
  SPACE_SCALES,
  ZOOM,
  isNoticeable,
  mappingOf,
  notInPx,
  spaceUsages,
  type Mapping,
  type Scale,
} from "./scale-proposal.const";
import "./foundations.css";

/** "+0.6 px (+3.6%)". */
function change({ delta, today }: Mapping): string {
  const sign = delta > 0 ? "+" : delta < 0 ? "−" : "±";
  return `${sign}${Math.abs(delta).toFixed(1)} px (${sign}${Math.abs((delta / today) * 100).toFixed(1)}%)`;
}

const round = (px: number) => Number(px.toFixed(2)).toString();

const uses = (count: number) => `${count} ${count === 1 ? "use" : "uses"}`;

/** Three cards a space apart, as a list of them is drawn. */
function Spaced({ gap }: { gap: number }) {
  return (
    <div style={{ display: "flex", gap: `${Math.abs(gap)}px` }}>
      {["Aperturas", "Táctica", "Finales"].map((label) => (
        <span key={label} className="platform-tag">
          {label}
        </span>
      ))}
    </div>
  );
}

function SpacingScalePage({ scale }: { scale: Scale }) {
  const usages = spaceUsages();
  const mapping = mappingOf(usages, scale.steps);
  const total = mapping.reduce((sum, row) => sum + row.count, 0);
  const noticeable = mapping.filter(isNoticeable);
  const mostUsed = [...mapping]
    .filter((row) => row.written > 0)
    .sort((first, second) => second.count - first.count)
    .slice(0, 6)
    .sort((first, second) => first.written - second.written);
  const manual = notInPx(usages);
  return (
    <div className="platform-page foundations">
      <header className="platform-page__head">
        <h1 className="platform-page__title">Spacing scale</h1>
        <p className="platform-page__subtitle">{scale.name}</p>
      </header>
      <p className="foundations__proposal">A proposal: nothing on this page is applied to the platform yet.</p>
      <p className="foundations__lead">
        The spaces of the platform — its gaps, paddings and margins — are written as {mapping.length} different px
        values, {total} times counting each side of a shorthand, and drawn {Math.round((ZOOM - 1) * 100)}% larger by the
        zoom. The proposal is a scale in real px, with no zoom, and every value in use goes to the step nearest to how
        it is drawn today; between two, the larger. A negative margin keeps its sign, and a value of 1px is a hairline,
        not a space: it stays 1px, off the scale. Every bar on this page is drawn at its real size.
      </p>
      <p className="foundations__lead">{scale.summary}</p>

      <section className="foundations__group" aria-labelledby="spacing-scale-steps">
        <h2 id="spacing-scale-steps" className="foundations__group-title">
          The steps
        </h2>
        <ul className="foundations__steps">
          {scale.steps.map((step) => {
            const takes = mapping.filter((row) => Math.abs(row.step.px) === step.px);
            return (
              <li key={step.token} className="foundations__step">
                <code className="foundations__name">{step.token}</code>
                <span className="foundations__size-value">{step.px}px</span>
                <span className="foundations__real-size">
                  <span className="foundations__bar" style={{ width: `${step.px}px` }} />
                </span>
                <span className="foundations__count">
                  {uses(takes.reduce((sum, row) => sum + row.count, 0))}, {takes.length}{" "}
                  {takes.length === 1 ? "value" : "values"}
                </span>
              </li>
            );
          })}
        </ul>
      </section>

      <section className="foundations__group" aria-labelledby="spacing-scale-mapping">
        <h2 id="spacing-scale-mapping" className="foundations__group-title">
          Today → proposed
        </h2>
        <p className="foundations__lead">
          {noticeable.length} of the {mapping.length} values, written{" "}
          {noticeable.reduce((sum, row) => sum + row.count, 0)} times, change by 1.5 px or more, or by a tenth of their
          size: they are tinted.
        </p>
        <PlatformTable
          columns={["Written", "Drawn today", "Step", "Change", { label: "Uses", align: "right" }]}
          minWidth={560}
        >
          {mapping.map((row) => (
            <PlatformTableRow
              key={row.written}
              className={isNoticeable(row) ? "foundations__row_state_noticeable" : undefined}
            >
              <PlatformTableCell strong>{row.written}px</PlatformTableCell>
              <PlatformTableCell>{round(row.today)}px</PlatformTableCell>
              <PlatformTableCell>
                {row.step.px}px · <code>{row.step.token}</code>
              </PlatformTableCell>
              <PlatformTableCell>{change(row)}</PlatformTableCell>
              <PlatformTableCell align="right">{row.count}</PlatformTableCell>
            </PlatformTableRow>
          ))}
        </PlatformTable>
      </section>

      <section className="foundations__group" aria-labelledby="spacing-scale-compare">
        <h2 id="spacing-scale-compare" className="foundations__group-title">
          Side by side: the six values most written, as a gap
        </h2>
        <div className="foundations__compare">
          <div className="foundations__compare-side">
            <span className="foundations__count">Today, at the zoom</span>
            {mostUsed.map((row) => (
              <div key={row.written}>
                <span className="foundations__count">{row.written}px</span>
                <Spaced gap={row.written} />
              </div>
            ))}
          </div>
          <div className="foundations__compare-side">
            <span className="foundations__count">Proposed, without it</span>
            {mostUsed.map((row) => (
              <div key={row.written}>
                <span className="foundations__count">{row.step.px}px</span>
                {/* Only the gap is set at its real size (divided by the zoom the
                    page is drawn at), so the tags are the same on both sides and
                    what differs is the space alone. */}
                <Spaced gap={row.step.px / ZOOM} />
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="foundations__group" aria-labelledby="spacing-scale-manual">
        <h2 id="spacing-scale-manual" className="foundations__group-title">
          Not in px: to move by hand
        </h2>
        <p className="foundations__lead">
          {manual.length === 0
            ? "None."
            : manual.map(({ value, count }) => `${value} (${count})`).join("; ") +
              ". Percentages and calc() follow what they measure; the variables are decided where they are set."}
        </p>
      </section>
    </div>
  );
}

const [SCALE_A, SCALE_B] = SPACE_SCALES;

const meta = {
  title: "platform/foundations/Spacing scale",
  parameters: {
    docs: {
      description: {
        component: `
**A proposal, not applied** (TODOS T43): the spacing scale the platform could
adopt for its gaps, paddings and margins, in real px with the zoom's
enlargement folded in. Each value in use is mapped to its step, with how much
it would change on screen. The steps are in
\`components/platform/foundations/scale-proposal.const.ts\`; the values in use
are read from the stylesheets.

Reference: [Styling & design tokens](/ui/styling#tokens) in the docs site.
`,
      },
    },
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

/** Proposal A, the recommended one: a 4px grid in twelve steps. */
export const ProposalA: Story = {
  name: "Proposal A — a 4px grid",
  render: () => (SCALE_A ? <SpacingScalePage scale={SCALE_A} /> : <p>No scale A.</p>),
};

/** Proposal B: the same grid keeping the steps in between, sixteen steps. */
export const ProposalB: Story = {
  name: "Proposal B — with the steps between",
  render: () => (SCALE_B ? <SpacingScalePage scale={SCALE_B} /> : <p>No scale B.</p>),
};
