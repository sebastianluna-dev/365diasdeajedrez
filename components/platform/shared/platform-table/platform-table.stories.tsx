import Link from "next/link";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { LocalDateTime } from "@/components/platform/shared/local-datetime/local-datetime.comp";
import { CLASS_STATUS } from "@/constants/platform/class-codes.const";
import { staffRoutes } from "@/lib/platform-routes";
import type { StaffClassSummary } from "@/services/staff-classes/staff-classes.types";
import { PlatformTable, PlatformTableCell, PlatformTableRow, type PlatformTableColumn } from "./platform-table.comp";

const COLUMNS: readonly (string | PlatformTableColumn)[] = [
  "Clase",
  "Profesor",
  "Fecha",
  "Estado",
  { label: "Alumnos", align: "right" },
  { label: "Asistieron", align: "right" },
];

/** The staff's class list, as `services/staff-classes` hands it to that screen; the labels as the server, in UTC, writes them. */
const ROWS: StaffClassSummary[] = [
  {
    id: "1",
    title: "Finales de torres",
    teacherId: "t1",
    teacherName: "Fernanda Ríos",
    scheduledAtIso: "2026-10-06T23:00:00.000Z",
    dateLabel: "6 de octubre, 2026",
    timeLabel: "23:00 h",
    durationMin: 60,
    statusCode: CLASS_STATUS.SCHEDULED,
    statusLabel: "Programada",
    participantCount: 6,
    attendedCount: 0,
    href: staffRoutes.staffClassDetail("1"),
  },
  {
    id: "2",
    title: "La defensa siciliana, variante Najdorf",
    teacherId: "t2",
    teacherName: "Andrés Molina",
    scheduledAtIso: "2026-09-29T16:00:00.000Z",
    dateLabel: "29 de septiembre, 2026",
    timeLabel: "16:00 h",
    durationMin: 90,
    statusCode: CLASS_STATUS.COMPLETED,
    statusLabel: "Finalizada",
    participantCount: 8,
    attendedCount: 7,
    href: staffRoutes.staffClassDetail("2"),
  },
  {
    id: "3",
    title: "Táctica: clavadas y descubiertas",
    teacherId: "t1",
    teacherName: "Fernanda Ríos",
    scheduledAtIso: "2026-09-22T23:00:00.000Z",
    dateLabel: "22 de septiembre, 2026",
    timeLabel: "23:00 h",
    durationMin: 60,
    statusCode: CLASS_STATUS.COMPLETED,
    statusLabel: "Finalizada",
    participantCount: 5,
    attendedCount: 5,
    href: staffRoutes.staffClassDetail("3"),
  },
];

interface TableArgs {
  rows: StaffClassSummary[];
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
    rows: {
      control: "object",
      description: "`StaffClassSummary[]`: the classes, as the staff's class list receives them.",
    },
    emptyLabel: { control: "text", description: "What the table says with no rows." },
    minWidth: {
      control: { type: "number", min: 320, step: 40 },
      description: "In px: narrower than this, the table scrolls sideways.",
    },
  },
  // The rows as staff-classes.section.tsx writes them.
  render: ({ rows, emptyLabel, minWidth }) => (
    <PlatformTable columns={COLUMNS} emptyLabel={emptyLabel} minWidth={minWidth}>
      {rows.map((item) => (
        <PlatformTableRow key={item.id}>
          <PlatformTableCell strong>
            <Link href={item.href}>{item.title}</Link>
          </PlatformTableCell>
          <PlatformTableCell>{item.teacherName}</PlatformTableCell>
          <PlatformTableCell>
            <LocalDateTime iso={item.scheduledAtIso} fallback={`${item.dateLabel} · ${item.timeLabel}`} />
          </PlatformTableCell>
          <PlatformTableCell>
            <span className="platform-tag">{item.statusLabel}</span>
          </PlatformTableCell>
          <PlatformTableCell align="right">{item.participantCount}</PlatformTableCell>
          <PlatformTableCell align="right">{item.attendedCount}</PlatformTableCell>
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
