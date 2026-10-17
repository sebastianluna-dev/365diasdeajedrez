import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, userEvent, waitFor, within } from "storybook/test";
import { popupFormError, type PopupFormState } from "@/services/shared/form-state";
import type { StaffExerciseReview } from "@/services/staff-exercises/staff-exercises.types";
import { ExerciseReviewBar } from "./exercise-review-bar.comp";

const IN_REVIEW: StaffExerciseReview = {
  statusCode: "IN_REVIEW",
  statusLabel: "En revisión",
  owner: "teacher",
  authorLabel: "Profesor Demo",
  submittedLabel: "Propuesto el 14 de octubre, 2026",
  reviewedLabel: null,
  reviewNote: null,
  canApprove: true,
  canReturn: true,
  canRemove: false,
};

const actions = () => ({
  approve: fn(async () => undefined).mockName("approve"),
  returnWithNote: fn(async (_prev: PopupFormState, formData: FormData) =>
    popupFormError({ note: { code: "noteRequired" } }, { note: String(formData.get("note") ?? "") }),
  ).mockName("returnWithNote"),
  remove: fn(async () => undefined).mockName("remove"),
});

const meta = {
  title: "platform/sections/staff/exercises/ExerciseReviewBar",
  component: ExerciseReviewBar,
  parameters: {
    docs: {
      description: {
        component: `
The staff's decisions on a bank's exercise, under the read-only editor: who
wrote it and when it was proposed, the last decision with its note, and the
buttons the status allows — «Aprobar» and «Devolver» (a popup with the note
the teacher reads) on a proposal; «Quitar de la biblioteca» (a confirmation
with the verb «Quitar» and the note) on one in the library.

Source: \`components/platform/sections/staff/exercises/exercise-review-bar/exercise-review-bar.comp.tsx\`.
Reference page: [Components › ExerciseReviewBar](/components/platform/sections/staff/exercises/exercise-review-bar) in the docs site.
`,
      },
    },
  },
  args: { title: "El mate de Philidor", review: IN_REVIEW, actions: actions() },
  decorators: [
    (Story) => (
      <div className="platform-theme" style={{ maxWidth: 880, padding: 24 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof ExerciseReviewBar>;

export default meta;
type Story = StoryObj<typeof meta>;

/** A teacher's proposal: who and when, «Devolver» and «Aprobar» (the accent). */
export const Proposal: Story = {};

/** «Devolver» opens its popup: the note the teacher reads, required, and «Devolver al profesor». */
export const ReturnPopup: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "Devolver" }));
    const dialog = await canvas.findByRole("dialog", { name: "Devolver al profesor" });
    await waitFor(() => expect(dialog).toBeVisible());
  },
};

/** In the library, a teacher's: «Quitar de la biblioteca» alone, in the caution tone, and when it was approved. */
export const InLibrary: Story = {
  args: {
    review: {
      ...IN_REVIEW,
      statusCode: "PUBLISHED",
      statusLabel: "En la biblioteca",
      reviewedLabel: "Aprobado el 15 de octubre, 2026 por Staff Demo",
      canApprove: false,
      canReturn: false,
      canRemove: true,
    },
  },
};

/** «Quitar de la biblioteca» opens its confirmation, with the verb «Quitar» and the note to write. */
export const RemoveConfirm: Story = {
  args: InLibrary.args,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "Quitar de la biblioteca" }));
    const dialog = await canvas.findByRole("dialog", { name: "¿Quitar «El mate de Philidor» de la biblioteca?" });
    await waitFor(() => expect(dialog).toBeVisible());
  },
};

/** Returned to its teacher: the decision in words with its note, and nothing to decide until it is proposed again. */
export const Returned: Story = {
  args: {
    review: {
      ...IN_REVIEW,
      statusCode: "READY",
      statusLabel: "Listo",
      reviewedLabel: "Devuelto el 15 de octubre, 2026 por Staff Demo",
      reviewNote: "La explicación no dice por qué el rey no puede capturar en g8.",
      canApprove: false,
      canReturn: false,
    },
  },
};
