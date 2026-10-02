import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import {
  PlatformTable,
  PlatformTableCell,
  PlatformTableRow,
} from "@/components/platform/shared/platform-table/platform-table.comp";
import {
  TYPE_SCALES,
  ZOOM,
  isNoticeable,
  mappingOf,
  notInPx,
  typeUsages,
  type Mapping,
  type Scale,
} from "./scale-proposal.const";
import "./foundations.css";

const SAMPLE = "Siguiente lección: la defensa siciliana";

/** "+0.6 px (+3.6%)". */
function change({ delta, today }: Mapping): string {
  const sign = delta > 0 ? "+" : delta < 0 ? "−" : "±";
  return `${sign}${Math.abs(delta).toFixed(1)} px (${sign}${Math.abs((delta / today) * 100).toFixed(1)}%)`;
}

const round = (px: number) => Number(px.toFixed(2)).toString();

const uses = (count: number) => `${count} ${count === 1 ? "use" : "uses"}`;

function TypeScalePage({ scale }: { scale: Scale }) {
  const usages = typeUsages();
  const mapping = mappingOf(usages, scale.steps);
  const total = mapping.reduce((sum, row) => sum + row.count, 0);
  const noticeable = mapping.filter(isNoticeable);
  const mostUsed = [...mapping]
    .sort((first, second) => second.count - first.count)
    .slice(0, 6)
    .sort((first, second) => first.written - second.written);
  const manual = notInPx(usages);
  return (
    <div className="platform-page foundations">
      <header className="platform-page__head">
        <h1 className="platform-page__title">Type scale</h1>
        <p className="platform-page__subtitle">{scale.name}</p>
      </header>
      <p className="foundations__proposal">A proposal: nothing on this page is applied to the platform yet.</p>
      <p className="foundations__lead">
        Today the platform&apos;s stylesheets write {mapping.length} different font sizes in px, {total} times, and the
        body draws all of it {Math.round((ZOOM - 1) * 100)}% larger (<code>zoom: {ZOOM}</code>). The proposal folds that
        enlargement into the sizes themselves: {scale.steps.length} steps in real px, and no zoom. Each size in use goes
        to the step nearest to how it is drawn today (written × {ZOOM}); between two, the larger. Everything on this
        page that shows a step is drawn at its real size.
      </p>
      <p className="foundations__lead">{scale.summary}</p>

      <section className="foundations__group" aria-labelledby="type-scale-steps">
        <h2 id="type-scale-steps" className="foundations__group-title">
          The steps
        </h2>
        <ul className="foundations__steps">
          {scale.steps.map((step) => {
            const takes = mapping.filter((row) => row.step.px === step.px);
            return (
              <li key={step.token} className="foundations__step">
                <code className="foundations__name">{step.token}</code>
                <span className="foundations__size-value">{step.px}px</span>
                <span className="foundations__real-size">
                  <span className="foundations__step-specimen" style={{ fontSize: `${step.px}px` }}>
                    {SAMPLE}
                  </span>
                </span>
                <span className="foundations__count">
                  {uses(takes.reduce((sum, row) => sum + row.count, 0))}, {takes.length}{" "}
                  {takes.length === 1 ? "size" : "sizes"}
                </span>
              </li>
            );
          })}
        </ul>
      </section>

      <section className="foundations__group" aria-labelledby="type-scale-mapping">
        <h2 id="type-scale-mapping" className="foundations__group-title">
          Today → proposed
        </h2>
        <p className="foundations__lead">
          {noticeable.length} of the {mapping.length} sizes, written{" "}
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

      <section className="foundations__group" aria-labelledby="type-scale-compare">
        <h2 id="type-scale-compare" className="foundations__group-title">
          Side by side: the six sizes most written
        </h2>
        <div className="foundations__compare">
          <div className="foundations__compare-side">
            <span className="foundations__count">Today, at the zoom</span>
            {mostUsed.map((row) => (
              <p key={row.written} className="foundations__compare-line" style={{ fontSize: `${row.written}px` }}>
                {row.written}px · {SAMPLE}
              </p>
            ))}
          </div>
          <div className="foundations__compare-side">
            <span className="foundations__count">Proposed, without it</span>
            {mostUsed.map((row) => (
              <div key={row.written} className="foundations__real-size">
                <p className="foundations__compare-line" style={{ fontSize: `${row.step.px}px` }}>
                  {row.step.px}px · {SAMPLE}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="foundations__group" aria-labelledby="type-scale-manual">
        <h2 id="type-scale-manual" className="foundations__group-title">
          Not in px: to move by hand
        </h2>
        <p className="foundations__lead">
          {manual.length === 0
            ? "None."
            : manual.map(({ value, count }) => `${value} (${count})`).join("; ") +
              ". Relative sizes follow their parent; the variables and calc() are decided where they are set."}
        </p>
      </section>
    </div>
  );
}

const [SCALE_A, SCALE_B] = TYPE_SCALES;

const meta = {
  title: "platform/foundations/Type scale",
  parameters: {
    docs: {
      description: {
        component: `
**A proposal, not applied** (TODOS T43): the type scale the platform could
adopt, with the enlargement the zoom gives today folded into its steps. Each
font size the stylesheets write is mapped to its step, with how much it would
change on screen. The steps and the two options are in
\`components/platform/foundations/scale-proposal.const.ts\`; the sizes in use
are read from the stylesheets, so the mapping follows them.

Reference: [Styling & design tokens › The platform is drawn a tenth larger](/ui/styling#the-platform-is-drawn-a-tenth-larger) in the docs site.
`,
      },
    },
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

/** Proposal A, the recommended one: ten steps, keeping today's distinctions among the small sizes. */
export const ProposalA: Story = {
  name: "Proposal A — ten steps",
  render: () => (SCALE_A ? <TypeScalePage scale={SCALE_A} /> : <p>No scale A.</p>),
};

/** Proposal B: eight steps, fewer and further apart. */
export const ProposalB: Story = {
  name: "Proposal B — eight steps",
  render: () => (SCALE_B ? <TypeScalePage scale={SCALE_B} /> : <p>No scale B.</p>),
};
