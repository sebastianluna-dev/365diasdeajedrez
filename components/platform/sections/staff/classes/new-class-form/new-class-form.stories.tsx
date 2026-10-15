import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { userEvent, within } from "storybook/test";
import { CLASS_FORMAT } from "@/constants/platform/class-codes.const";
import { CLASSES_NOW, CLASSES_TIME_ZONE, cdmx } from "@/lib/testing/fixtures/classes";
import { popupFormDone, popupFormError } from "@/services/shared/form-state";
import type { NewClassDefaults, SchedulableStudent } from "@/services/staff-classes/staff-classes.types";
import { NewClassForm } from "./new-class-form.comp";

const STUDENTS: SchedulableStudent[] = [
  {
    id: "u-d",
    displayName: "Alumno Demo",
    email: "alumno.demo@365diasdeajedrez.com",
    teacherId: "t-1",
    teacherName: "GM Profesor Demo",
    toSchedule: 2,
    oldestPaymentLabel: "pago del jue 1 oct",
    hasPayments: true,
  },
  {
    id: "u-m",
    displayName: "Mateo Ríos",
    email: "mateo.rios@ejemplo.com",
    teacherId: "t-1",
    teacherName: "GM Profesor Demo",
    toSchedule: 1,
    oldestPaymentLabel: "pago del lun 12 oct",
    hasPayments: true,
  },
  {
    id: "u-s",
    displayName: "Diego Salas",
    email: "diego.salas@ejemplo.com",
    teacherId: "t-1",
    teacherName: "GM Profesor Demo",
    toSchedule: 1,
    oldestPaymentLabel: "pago del lun 5 oct",
    hasPayments: true,
  },
  {
    id: "u-l",
    displayName: "Lucía Herrera",
    email: "lucia.herrera@ejemplo.com",
    teacherId: null,
    teacherName: null,
    toSchedule: 0,
    oldestPaymentLabel: null,
    hasPayments: false,
  },
  {
    id: "u-v",
    displayName: "Valentina Cruz",
    email: "valentina.demo@365diasdeajedrez.com",
    teacherId: "t-1",
    teacherName: "GM Profesor Demo",
    toSchedule: 0,
    oldestPaymentLabel: null,
    hasPayments: true,
  },
];

const MANY: SchedulableStudent[] = [
  ...STUDENTS,
  ...["Ana Paz", "Bruno Vega", "Carla Díaz", "Dante Ruiz"].map((name, index) => ({
    id: `u-x${index}`,
    displayName: name,
    email: `${name.toLowerCase().replace(" ", ".")}@ejemplo.com`,
    teacherId: "t-1",
    teacherName: "GM Profesor Demo",
    toSchedule: 0,
    oldestPaymentLabel: null,
    hasPayments: false,
  })),
];

const GROUP: NewClassDefaults = {
  format: CLASS_FORMAT.GROUP,
  capacity: 6,
  title: "Taller de finales de torre",
  description: "Lucena, Philidor y la regla de la cuarta fila, con ejercicios por parejas.",
  teacherId: "t-1",
  date: "2026-10-17",
  time: "10:00",
  durationMin: 90,
  meetingUrl: "",
  studentId: null,
  duplicateOf: null,
};

const INDIVIDUAL: NewClassDefaults = {
  ...GROUP,
  format: CLASS_FORMAT.INDIVIDUAL,
  capacity: null,
  title: "",
  description: "",
  date: "2026-10-21",
  time: "12:00",
  durationMin: 60,
  studentId: "u-d",
};

const meta = {
  title: "platform/sections/staff/classes/NewClassForm",
  component: NewClassForm,
  parameters: {
    docs: {
      description: {
        component: `
«Crear clase» (ADM-3): the format, the topic, when, who gives it and how it
is joined, the students — each with how they enter (D6) — and the summary
with the button, sticky beside the fields. The actions come as props; the
stories pass stubs.

Source: \`components/platform/sections/staff/classes/new-class-form/new-class-form.comp.tsx\`.
Reference page: [Components › NewClassForm](/components/platform/sections/staff/classes/new-class-form) in the docs site.
`,
      },
    },
  },
  args: {
    defaults: GROUP,
    teachers: [
      { id: "t-1", displayName: "GM Profesor Demo" },
      { id: "t-2", displayName: "MI Ana Torres" },
    ],
    students: STUDENTS,
    timeZone: CLASSES_TIME_ZONE,
    nowIso: CLASSES_NOW.toISOString(),
    createClass: async () => popupFormDone("classCreated"),
    loadTeacherBusy: async () => [
      {
        title: "Clase de Andrea López",
        startIso: cdmx("2026-10-17", "10:00").toISOString(),
        endIso: cdmx("2026-10-17", "11:00").toISOString(),
      },
    ],
  },
  argTypes: { defaults: { control: "object" }, students: { control: "object" } },
  decorators: [
    (Story) => (
      <div className="platform-theme" style={{ padding: 16 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof NewClassForm>;

export default meta;
type Story = StoryObj<typeof meta>;

const tick =
  (names: RegExp[]) =>
  async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    for (const name of names) await userEvent.click(within(canvasElement).getByRole("checkbox", { name }));
  };

/** The workshop: «Grupal», six seats, four students ticked, Lucía with the payment pending. */
export const Group: Story = { play: tick([/Alumno Demo/, /Mateo Ríos/, /Diego Salas/, /Lucía Herrera/]) };

/** «Individual», with Alumno Demo chosen and his payment. */
export const Individual: Story = { args: { defaults: INDIVIDUAL } };

/** A free diagnosis: «Individual», Lucía, «Gratis». */
export const IndividualFree: Story = {
  name: "Individual, free",
  args: { defaults: { ...INDIVIDUAL, title: "Clase de diagnóstico", studentId: "u-l" } },
  play: async ({ canvasElement }) => {
    await userEvent.click(within(canvasElement).getByRole("radio", { name: "Gratis" }));
  },
};

/** Opened with `?duplicar=`: a week later, the subtitle says what it copies, no students. */
export const Duplicate: Story = {
  args: {
    defaults: { ...GROUP, date: "2026-10-24", duplicateOf: "Copia de «Taller de finales de torre» (sáb 17 oct)" },
  },
};

/** The server refused: three students for two seats, with what was typed kept. */
export const WithErrors: Story = {
  name: "With errors",
  args: {
    defaults: { ...GROUP, capacity: 2 },
    createClass: async () =>
      popupFormError(
        { students: { code: "tooManyStudents", args: { chosen: 3, capacity: 2 } } },
        { format: "group", title: "Taller de finales de torre", capacity: "2", students: ["u-d", "u-m", "u-s"] },
      ),
  },
  play: async ({ canvasElement }) => {
    await tick([/Alumno Demo/, /Mateo Ríos/, /Diego Salas/])({ canvasElement });
    await userEvent.click(within(canvasElement).getByRole("button", { name: "Crear clase" }));
  },
};

/** Nine students: the search box appears and hides the cards that do not match, keeping the ticked ones. */
export const ManyStudents: Story = {
  name: "Many students",
  args: { students: MANY },
  play: async ({ canvasElement }) => {
    await tick([/Alumno Demo/])({ canvasElement });
    await userEvent.type(within(canvasElement).getByRole("searchbox", { name: "Buscar alumno" }), "ru");
  },
};
