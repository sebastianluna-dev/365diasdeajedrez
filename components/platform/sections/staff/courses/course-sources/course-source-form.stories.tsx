import { useRef, useState } from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, userEvent, waitFor, within } from "storybook/test";
import {
  PlatformConfirmPopup,
  type PlatformConfirmPopupHandle,
} from "@/components/platform/shared/platform-confirm-popup/platform-confirm-popup.comp";
import {
  PlatformPopup,
  type PlatformPopupHandle,
} from "@/components/platform/shared/platform-popup/platform-popup.comp";
import type { CatalogOption } from "@/services/staff-courses/staff-courses.types";
import type { CourseSourceAdmin } from "@/services/staff-sources/staff-sources.types";
import { CourseSourceForm } from "./course-source-form.comp";
import "./course-source-dialog.comp.css";

const SOURCE_TYPES: CatalogOption[] = [
  { code: "BOOK", label: "Libro" },
  { code: "DIGITAL_COURSE", label: "Curso digital" },
  { code: "VIDEO", label: "Vídeo o serie de vídeos" },
  { code: "OWN_MATERIAL", label: "Material de elaboración propia" },
];

const BOOK: CourseSourceAdmin = {
  id: "s1",
  order: 1,
  sourceTypeCode: "BOOK",
  sourceTypeLabel: "Libro",
  originalTitle: "Mi sistema",
  authors: "Aron Nimzowitsch",
  publicationYear: 1925,
  specificReference: "Capítulos 3 a 5",
};

interface CourseSourceArgs {
  sourceTypes: CatalogOption[];
  source?: CourseSourceAdmin;
}

/**
 * The trigger, the popup and, when editing, the confirmation beside it, as
 * `CourseSourceDialog` mounts them, with stubs in place of the actions.
 */
function CourseSourceSample({ sourceTypes, source }: CourseSourceArgs) {
  const popup = useRef<PlatformPopupHandle>(null);
  const confirm = useRef<PlatformConfirmPopupHandle>(null);
  const [opening, setOpening] = useState(0);
  const isEdit = source !== undefined;
  return (
    <div className="course-source-dialog">
      <button
        type="button"
        className={isEdit ? "platform-row-action" : "platform-button platform-button_size_compact"}
        onClick={(event) => popup.current?.open(event)}
      >
        {isEdit ? "Editar" : "Agregar fuente"}
      </button>
      <PlatformPopup
        ref={popup}
        title={isEdit ? "Editar fuente" : "Nueva fuente"}
        size="lg"
        onClose={() => setOpening((count) => count + 1)}
      >
        <CourseSourceForm
          key={opening}
          source={source}
          sourceTypes={sourceTypes}
          action={() => undefined}
          onDelete={isEdit ? () => confirm.current?.open() : undefined}
          onClose={() => popup.current?.close()}
          onSubmit={() => popup.current?.close()}
        />
      </PlatformPopup>
      {isEdit && (
        <PlatformConfirmPopup
          ref={confirm}
          subject={source.originalTitle ?? source.sourceTypeLabel}
          description="Se elimina la fuente del curso."
          action={async () => undefined}
          confirmLabel="Eliminar fuente"
          onDone={() => popup.current?.close()}
        />
      )}
    </div>
  );
}

const open = async ({ canvasElement }: { canvasElement: HTMLElement }) => {
  const canvas = within(canvasElement);
  await userEvent.click(
    canvas.queryByRole("button", { name: "Editar" }) ?? canvas.getByRole("button", { name: "Agregar fuente" }),
  );
};

const meta = {
  title: "platform/sections/staff/courses/course-sources/CourseSourceForm",
  parameters: {
    docs: {
      description: {
        component: `
The popup of one source of a course's «Procedencia del recurso»: a
\`PlatformPopup\` with \`CourseSourceForm\` inside and a stub in place of
\`saveCourseSource\`. Only the type is required. Editing, the foot's red word
«Eliminar fuente» opens a \`PlatformConfirmPopup\` on top of it. Each story
opens the popup with its \`play\`.

Source: \`components/platform/sections/staff/courses/course-sources/\`.
Reference page: [Components › CourseSources](/components/platform/sections/staff/courses/course-sources) in the docs site.
`,
      },
    },
  },
  args: { sourceTypes: SOURCE_TYPES },
  argTypes: {
    sourceTypes: { control: "object", description: "The kinds of resource, from the catalog." },
    source: { control: "object", description: "The source being edited; absent when adding one." },
  },
  render: (args) => <CourseSourceSample {...args} />,
} satisfies Meta<CourseSourceArgs>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Adding: the first type chosen, every other field empty. */
export const Adding: Story = { play: open };

/** Editing a book: the fields carry the source, and the foot has the red word. */
export const Editing: Story = { args: { source: BOOK }, play: open };

/** Another kind of resource chosen in the select. */
export const DigitalCourse: Story = {
  play: async ({ canvasElement }) => {
    await open({ canvasElement });
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("combobox", { name: "Tipo de fuente" }));
    await userEvent.click(canvas.getByRole("option", { name: "Curso digital" }));
    // The list leaves with an exit animation, and until it has gone Radix keeps
    // the rest of the popup aria-hidden: wait for it, so the state the story
    // ends in (and the one axe looks at) is the select closed on its new value.
    await waitFor(() => expect(canvas.queryByRole("listbox")).toBeNull());
  },
};

/** «Eliminar fuente» pressed: the confirmation stacks over the form, which stays open beneath. */
export const Deleting: Story = {
  args: { source: BOOK },
  play: async ({ canvasElement }) => {
    await open({ canvasElement });
    await userEvent.click(within(canvasElement).getByRole("button", { name: "Eliminar fuente" }));
  },
};
