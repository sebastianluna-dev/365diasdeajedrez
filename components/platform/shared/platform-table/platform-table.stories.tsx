import Link from "next/link";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { LocalDateTime } from "@/components/platform/shared/local-datetime/local-datetime.comp";
import { PlatformTable, PlatformTableCell, PlatformTableRow, type PlatformTableColumn } from "./platform-table.comp";

/** One row of the staff's class list, the shape `StaffClassSummary` gives that screen. */
interface ClassRow {
  id: string;
  title: string;
  teacherName: string;
  scheduledAtIso: string;
  dateLabel: string;
  statusLabel: string;
  students: number;
  attended: number;
}

const COLUMNS: readonly (string | PlatformTableColumn)[] = [
  "Clase",
  "Profesor",
  "Fecha",
  "Estado",
  { label: "Alumnos", align: "right" },
  { label: "Asistieron", align: "right" },
];

const ROWS: ClassRow[] = [
  {
    id: "1",
    title: "Finales de torres",
    teacherName: "Fernanda Ríos",
    scheduledAtIso: "2026-10-06T23:00:00.000Z",
    dateLabel: "6 de octubre de 2026 · 17:00",
    statusLabel: "Programada",
    students: 6,
    attended: 0,
  },
  {
    id: "2",
    title: "La defensa siciliana, variante Najdorf",
    teacherName: "Andrés Molina",
    scheduledAtIso: "2026-09-29T16:00:00.000Z",
    dateLabel: "29 de septiembre de 2026 · 10:00",
    statusLabel: "Finalizada",
    students: 8,
    attended: 7,
  },
  {
    id: "3",
    title: "Táctica: clavadas y descubiertas",
    teacherName: "Fernanda Ríos",
    scheduledAtIso: "2026-09-22T23:00:00.000Z",
    dateLabel: "22 de septiembre de 2026 · 17:00",
    statusLabel: "Finalizada",
    students: 5,
    attended: 5,
  },
];

interface TableArgs {
  rows: ClassRow[];
  emptyLabel: string;
  minWidth: number;
}

const meta = {
  title: "platform/shared/PlatformTable",
  parameters: {
    docs: {
      description: {
        component: `
The platform's table: a semantic \`<table>\` with one look for the teacher's
and the staff's listings. It is a container — the rows come as children,
\`PlatformTableRow\` and \`PlatformTableCell\` from the same file — and it holds
no state: filters and order go through the URL, on the server. Below
\`minWidth\` it scrolls sideways inside its box instead of squeezing the
columns.

Source: \`components/platform/shared/platform-table/platform-table.comp.tsx\`.
Reference page: [Components › PlatformTable](/components/platform/shared/platform-table) in the docs site.
`,
      },
    },
  },
  args: { rows: ROWS, emptyLabel: "Ninguna clase coincide con esos filtros.", minWidth: 880 },
  argTypes: {
    rows: { control: "object", description: "The classes, as the staff's class list receives them." },
    emptyLabel: { control: "text", description: "What the table says with no rows." },
    minWidth: {
      control: { type: "number", min: 320, step: 40 },
      description: "In px: narrower than this, the table scrolls sideways.",
    },
  },
  render: ({ rows, emptyLabel, minWidth }) => (
    <PlatformTable columns={COLUMNS} emptyLabel={emptyLabel} minWidth={minWidth}>
      {rows.map((row) => (
        <PlatformTableRow key={row.id}>
          <PlatformTableCell strong>
            <Link href={`/administracion/clases/${row.id}`}>{row.title}</Link>
          </PlatformTableCell>
          <PlatformTableCell>{row.teacherName}</PlatformTableCell>
          <PlatformTableCell>
            <LocalDateTime iso={row.scheduledAtIso} fallback={row.dateLabel} />
          </PlatformTableCell>
          <PlatformTableCell>
            <span className="platform-tag">{row.statusLabel}</span>
          </PlatformTableCell>
          <PlatformTableCell align="right">{row.students}</PlatformTableCell>
          <PlatformTableCell align="right">{row.attended}</PlatformTableCell>
        </PlatformTableRow>
      ))}
    </PlatformTable>
  ),
} satisfies Meta<TableArgs>;

export default meta;
type Story = StoryObj<typeof meta>;

/** The staff's class list: the first cell strong and linked, a tag, the counts aligned right. */
export const Default: Story = {};

/** No row: the table keeps its head and says so in one cell across it. */
export const Empty: Story = { args: { rows: [] } };

/** Narrower than its `minWidth`: the box scrolls sideways and the page does not. */
export const Scrolling: Story = {
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 420 }}>
        <Story />
      </div>
    ),
  ],
};
