import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import {
  PlatformTable,
  PlatformTableCell,
  PlatformTableRow,
} from "@/components/platform/shared/platform-table/platform-table.comp";
import { ZOOM, otherLengths, zoomReaders } from "./scale-proposal.const";
import "./foundations.css";

/** A card of the platform drawn as it is today, and with the zoom undone. */
function Sample() {
  return (
    <section className="platform-card" style={{ width: 300 }}>
      <h3 className="platform-card__title">Continuar</h3>
      <p style={{ margin: "0 0 14px" }}>Finales de torres · Lección 3</p>
      <button type="button" className="platform-button platform-button_variant_accent">
        Aprender
      </button>
    </section>
  );
}

function WithoutZoomPage() {
  const lengths = otherLengths();
  const total = lengths.reduce((sum, row) => sum + row.count, 0);
  const readers = zoomReaders();
  return (
    <div className="platform-page foundations">
      <header className="platform-page__head">
        <h1 className="platform-page__title">Without the zoom</h1>
        <p className="platform-page__subtitle">What else the zoom enlarges today, and would stop enlarging.</p>
      </header>
      <p className="foundations__proposal">A proposal: nothing on this page is applied to the platform yet.</p>
      <p className="foundations__lead">
        <code>zoom: {ZOOM}</code> on the body enlarges everything the platform draws, not only its type and its spaces.
        The type and spacing scales fold the enlargement into their steps; every other length in px — a column&apos;s
        width, the bar&apos;s height, the board, a border, a shadow — would be drawn {Math.round((1 - 1 / ZOOM) * 100)}%
        smaller without the zoom unless it changes too. Below, how many there are and where the zoom is read today.
      </p>

      <section className="foundations__group" aria-labelledby="without-zoom-sample">
        <h2 id="without-zoom-sample" className="foundations__group-title">
          The same card, with the zoom and without it
        </h2>
        <p className="foundations__lead">
          Nothing changed but the zoom: on the right, what removing it alone would do, before the scales put the size
          back.
        </p>
        <div className="foundations__compare">
          <div className="foundations__compare-side">
            <span className="foundations__count">Today, at the zoom</span>
            <Sample />
          </div>
          <div className="foundations__compare-side">
            <span className="foundations__count">Without the zoom, nothing else changed</span>
            <div className="foundations__real-size">
              <Sample />
            </div>
          </div>
        </div>
      </section>

      <section className="foundations__group" aria-labelledby="without-zoom-lengths">
        <h2 id="without-zoom-lengths" className="foundations__group-title">
          Other lengths in px: {total}
        </h2>
        <p className="foundations__lead">
          By property, counting each value of a shorthand. Those that size the layout (the content&apos;s column, the
          bar, the board, a dialog&apos;s width) are decided one by one — multiplied by {ZOOM} and put on the 4px grid,
          or kept. The radii stay as they are (the corner rule is already in real px: 8px, 4px, all the way), and so do
          the borders and outlines of 1 or 2px.
        </p>
        <PlatformTable columns={["Property", { label: "Lengths in px", align: "right" }]} minWidth={320}>
          {lengths.map((row) => (
            <PlatformTableRow key={row.property}>
              <PlatformTableCell strong>
                <code>{row.property}</code>
              </PlatformTableCell>
              <PlatformTableCell align="right">{row.count}</PlatformTableCell>
            </PlatformTableRow>
          ))}
        </PlatformTable>
      </section>

      <section className="foundations__group" aria-labelledby="without-zoom-readers">
        <h2 id="without-zoom-readers" className="foundations__group-title">
          Where the zoom is read: {readers.reduce((sum, row) => sum + row.count, 0)} times
        </h2>
        <p className="foundations__lead">
          A viewport unit is not scaled by the zoom, so whatever is measured against the window divides by it, and the
          chess pieces shared with the public site read it with a fallback of 1. Without the zoom these become plain
          values.
        </p>
        <ul className="foundations__steps">
          {readers.map((row) => (
            <li key={row.path} className="foundations__size">
              <span className="foundations__size-value">{row.count}×</span>
              <code className="foundations__name">{row.path}</code>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

const meta = {
  title: "platform/foundations/Without the zoom",
  parameters: {
    docs: {
      description: {
        component: `
**A proposal, not applied** (TODOS T43): what the platform's \`zoom\` enlarges
today beyond its type and its spaces, counted from the stylesheets, and where
the stylesheets read the zoom to undo it. The type and spacing scales fold the
enlargement into their steps; this page is what is left to decide for the rest.

Reference: [Styling & design tokens › The platform is drawn a tenth larger](/ui/styling#the-platform-is-drawn-a-tenth-larger) in the docs site.
`,
      },
    },
  },
  render: () => <WithoutZoomPage />,
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

/** The lengths the zoom enlarges beyond type and spacing, and where it is read. */
export const WithoutTheZoom: Story = { name: "Without the zoom" };
