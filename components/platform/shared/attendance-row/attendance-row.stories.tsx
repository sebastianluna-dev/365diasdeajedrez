import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { PlatformForm } from "@/components/platform/shared/platform-form/platform-form.comp";
import { AttendanceRow } from "./attendance-row.comp";

const VALENTINA = { id: "u-v", displayName: "Valentina Cruz" };
const DETAILS = ["valentina.demo@365diasdeajedrez.com", "Pago del mar 15 sep · clase 4 de 4"];

const meta = {
  title: "platform/shared/AttendanceRow",
  component: AttendanceRow,
  parameters: {
    docs: {
      description: {
        component: `
One student of a class and their attendance mark: to write, as «Asistió»
and «Faltó» in a line, or to read, with who marked and who changed it. The
same words for the staff and for the teacher; a moved seat and a mark the
staff overrode are read-only whatever the mode.

Source: \`components/platform/shared/attendance-row/attendance-row.comp.tsx\`.
Reference page: [Components › AttendanceRow](/components/platform/shared/attendance-row) in the docs site.
`,
      },
    },
  },
  args: { student: VALENTINA, details: DETAILS, mark: { attended: null }, mode: "read" },
  argTypes: { mark: { control: "object" }, details: { control: "object" } },
  decorators: [
    (Story) => (
      <div className="platform-theme" style={{ maxWidth: 720, padding: 16 }}>
        <PlatformForm onSubmit={(event) => event.preventDefault()}>
          <Story />
        </PlatformForm>
      </div>
    ),
  ],
} satisfies Meta<typeof AttendanceRow>;

export default meta;
type Story = StoryObj<typeof meta>;

/** To write, nothing chosen: the two cards wait for a mark. */
export const EditUnmarked: Story = { name: "Edit, unmarked", args: { mode: "edit" } };

/** To write, with the current mark chosen (changing one's own marks). */
export const EditMarked: Story = {
  name: "Edit, marked",
  args: { mode: "edit", defaultValue: "no", mark: { attended: false } },
};

/** The server refused the mark. */
export const WithError: Story = {
  name: "With error",
  args: { mode: "edit", serverError: "La plaza ya se reprogramó: su asistencia no se cambia." },
};

/** Read: «Asistió», with who marked. */
export const ReadAttended: Story = {
  name: "Read, attended",
  args: { mark: { attended: true, markedLine: "Marcó GM Profesor Demo · mié 14 oct, 20:12" } },
};

/** Read: «Faltó». */
export const ReadAbsent: Story = {
  name: "Read, absent",
  args: { mark: { attended: false, markedLine: "Marcó GM Profesor Demo · mié 14 oct, 20:12" } },
};

/** Read: nobody passed the list yet. */
export const ReadUnmarked: Story = { name: "Read, unmarked" };

/** Read: the staff changed the mark after a report, with its reason. */
export const ReadChangedByStaff: Story = {
  name: "Read, changed by staff",
  args: {
    mark: {
      attended: true,
      markedLine: "Marcó GM Profesor Demo · mié 14 oct, 20:12",
      changedLine:
        "Cambió Staff Demo · jue 15 oct, 10:05 · «Faltó» → «Asistió»: «Estuvo conectada; se le cayó el audio.»",
    },
  },
};

/** The teacher's view of that change: locked, read even in edit mode. */
export const Locked: Story = {
  args: {
    mode: "edit",
    mark: {
      attended: true,
      locked: true,
      markedLine: "Marcó GM Profesor Demo · mié 14 oct, 20:12",
      changedLine:
        "Cambió Staff Demo · jue 15 oct, 10:05 · «Faltó» → «Asistió»: «Estuvo conectada; se le cayó el audio.»",
    },
  },
};

/** A no-show given another date: the row is history, with a link to the new class. */
export const Moved: Story = {
  args: {
    mark: {
      attended: false,
      markedLine: "Marcó GM Profesor Demo · mié 14 oct, 20:12",
      moved: { label: "Faltó · reprogramada al vie 16 oct", href: "/administracion/clases/c-new" },
    },
  },
};

/** A no-show whose class went back to its payment. */
export const MovedBack: Story = {
  name: "Moved back",
  args: {
    mark: {
      attended: false,
      markedLine: "Marcó GM Profesor Demo · mié 14 oct, 20:12",
      moved: { label: "Faltó · devuelta a su pago" },
    },
  },
};
