import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { userEvent, within } from "storybook/test";
import { popupFormDone, popupFormError } from "@/services/shared/form-state";
import { FinalizeClassButton } from "./finalize-class-popup.comp";
import type { FinalizeClassStudent } from "./finalize-class-popup.types";

const DIEGO: FinalizeClassStudent = { id: "u-s", displayName: "Diego Salas", mark: { attended: null } };
const GROUP: FinalizeClassStudent[] = [
  { id: "u-d", displayName: "Alumno Demo", mark: { attended: null } },
  { id: "u-m", displayName: "Mateo Ríos", mark: { attended: null } },
  { id: "u-s", displayName: "Diego Salas", mark: { attended: null } },
  {
    id: "u-l",
    displayName: "Lucía Herrera",
    details: ["No es tu alumna: ve su nombre, no su ficha"],
    mark: { attended: null },
  },
];

const meta = {
  title: "platform/shared/FinalizeClassPopup",
  component: FinalizeClassButton,
  parameters: {
    docs: {
      description: {
        component: `
«Finalizar la clase» (PROF-3) and its two other uses: the attendance of
every student as rows to write, «Marcar a todos», the count, and — when
finalizing — the summary and the recording; the staff's mode adds the
reason. The action comes as a prop; the stories pass stubs.

Source: \`components/platform/shared/finalize-class-popup/finalize-class-popup.comp.tsx\`.
Reference page: [Components › FinalizeClassPopup](/components/platform/shared/finalize-class-popup) in the docs site.
`,
      },
    },
  },
  args: {
    classId: "c6",
    classTitle: "Defensa Caro-Kann: ideas",
    whenLine: "lun 12 oct · 17:00–18:00 · Diego Salas",
    isGroup: false,
    teacherName: "GM Profesor Demo",
    students: [DIEGO],
    summary: null,
    recordingUrl: null,
    mode: "finalize",
    action: async () => popupFormDone("classFinalized"),
  },
  argTypes: { students: { control: "object" } },
  decorators: [
    (Story) => (
      <div className="platform-theme" style={{ padding: 16 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof FinalizeClassButton>;

export default meta;
type Story = StoryObj<typeof meta>;

const open = async ({ canvasElement }: { canvasElement: HTMLElement }) => {
  await userEvent.click(
    within(canvasElement).getByRole("button", { name: /Finalizar la clase|Cambiar la asistencia/ }),
  );
};

/** An individual class: one row, the summary and the recording, the line. */
export const FinalizeIndividual: Story = { name: "Finalize, individual", play: open };

/** A group class: a row per student, «Marcar a todos», «0 de 4 asistieron». */
export const FinalizeGroup: Story = {
  name: "Finalize, group",
  args: {
    classTitle: "Taller de finales de torre",
    whenLine: "sáb 17 oct · 10:00–11:30 · 4 alumnos",
    isGroup: true,
    students: GROUP,
  },
  play: open,
};

/** Sent without a mark: the server's «Falta marcar a algún alumno.» and the row's own message. */
export const MissingMark: Story = {
  name: "Missing mark",
  args: {
    action: async () => popupFormError({ "attendance.u-s": { code: "missingMark" } }, {}, { code: "missingMark" }),
  },
  play: async ({ canvasElement }) => {
    await open({ canvasElement });
    const dialog = canvasElement.querySelector("dialog");
    if (dialog) await userEvent.click(within(dialog).getByRole("button", { name: "Finalizar la clase" }));
  },
};

/** The teacher changes their own marks of a finished class: only the group, the current marks chosen. */
export const Change: Story = {
  args: {
    mode: "change",
    students: [{ ...DIEGO, mark: { attended: false, markedLine: "Marcó GM Profesor Demo · lun 12 oct, 18:05" } }],
  },
  play: open,
};

/** A mark the staff overrode reads, locked; the other row can still be changed. */
export const ChangeWithLockedRow: Story = {
  name: "Change, with a locked row",
  args: {
    mode: "change",
    isGroup: true,
    students: [
      { ...GROUP[0]!, mark: { attended: true, markedLine: "Marcó GM Profesor Demo · sáb 17 oct, 11:35" } },
      {
        ...GROUP[1]!,
        mark: {
          attended: true,
          locked: true,
          markedLine: "Marcó GM Profesor Demo · sáb 17 oct, 11:35",
          changedLine: "Cambió Staff Demo · dom 18 oct, 10:05 · «Faltó» → «Asistió»: «Mandó captura.»",
        },
      },
    ],
  },
  play: open,
};

/** A seat given another date reads as history. */
export const ChangeWithMovedRow: Story = {
  name: "Change, with a moved row",
  args: {
    mode: "change",
    isGroup: true,
    students: [
      { ...GROUP[0]!, mark: { attended: true, markedLine: "Marcó GM Profesor Demo · sáb 17 oct, 11:35" } },
      { ...GROUP[2]!, mark: { attended: false, moved: { label: "Faltó · se le dará otra fecha" } } },
    ],
  },
  play: open,
};

/** The staff finalizes on the teacher's behalf: only the list, and the reason. */
export const Staff: Story = {
  args: { mode: "staff", action: async () => popupFormDone("classFinalized") },
  play: open,
};
