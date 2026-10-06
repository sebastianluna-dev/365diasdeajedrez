import { useRef, useState } from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { userEvent, within } from "storybook/test";
import {
  PlatformPopup,
  type PlatformPopupHandle,
} from "@/components/platform/shared/platform-popup/platform-popup.comp";
import type { ContentTypeOption } from "@/services/staff-courses/staff-courses.types";
import { NewCourseForm } from "./new-course-form.comp";
import "./new-course.comp.css";

const CONTENT_TYPES: ContentTypeOption[] = [
  {
    code: "OPENINGS",
    label: "Aperturas",
    shortLabel: "Aperturas",
    description: "Principios, repertorio, variantes y planes típicos al comenzar la partida.",
  },
  {
    code: "STRATEGY",
    label: "Estrategia y juego posicional",
    shortLabel: "Estrategia",
    description: "Evaluar posiciones y construir planes.",
  },
  {
    code: "ENDGAMES",
    label: "Finales",
    shortLabel: "Finales",
    description: "Técnica y posiciones teóricas con pocas piezas.",
  },
];

interface NewCourseArgs {
  contentTypes: ContentTypeOption[];
}

/**
 * The trigger and the popup as `NewCourse` mounts them, with a stub in place
 * of `createCourse`: the form is remounted on every closing.
 */
function NewCourseSample({ contentTypes }: NewCourseArgs) {
  const popup = useRef<PlatformPopupHandle>(null);
  const [opening, setOpening] = useState(0);
  return (
    <div className="new-course">
      <button type="button" className="platform-button" onClick={(event) => popup.current?.open(event)}>
        Nuevo curso
      </button>
      <PlatformPopup ref={popup} title="Nuevo curso" size="lg" onClose={() => setOpening((count) => count + 1)}>
        <NewCourseForm
          key={opening}
          contentTypes={contentTypes}
          action={() => undefined}
          onClose={() => popup.current?.close()}
          onSubmit={() => popup.current?.close()}
        />
      </PlatformPopup>
    </div>
  );
}

const open = async ({ canvasElement }: { canvasElement: HTMLElement }) => {
  await userEvent.click(within(canvasElement).getByRole("button", { name: "Nuevo curso" }));
};

const meta = {
  title: "platform/sections/staff/courses/NewCourse",
  parameters: {
    docs: {
      description: {
        component: `
The «Nuevo curso» trigger and its popup, a \`PlatformPopup\` with
\`NewCourseForm\` inside and a stub in place of \`createCourse\`. Under the strip,
the subtitle, the three fields the course is born with (name, slug, content
types as \`PlatformCheckCards\`) on \`PlatformForm\` and the footer band; the slug
writes itself from the name when the name loses focus, and the submit stays off
until it has a name, a slug and at least one content type. Each story opens the
popup with its \`play\`.

Source: \`components/platform/sections/staff/courses/new-course/\`.
Reference page: [Components › NewCourse](/components/platform/sections/staff/courses/new-course) in the docs site.
`,
      },
    },
  },
  args: { contentTypes: CONTENT_TYPES },
  argTypes: {
    contentTypes: { control: "object", description: "The content types on offer, from the catalog." },
  },
  render: (args) => <NewCourseSample {...args} />,
} satisfies Meta<NewCourseArgs>;

export default meta;
type Story = StoryObj<typeof meta>;

/** As it opens: nothing chosen, the submit off until name, slug and a content type are there. */
export const Empty: Story = { play: open };

/** A name typed and the field left, a card chosen: the slug writes itself and the submit is on. */
export const Filled: Story = {
  play: async ({ canvasElement }) => {
    await open({ canvasElement });
    const canvas = within(canvasElement);
    await userEvent.type(canvas.getByLabelText("Nombre"), "Fundamentos de la Defensa Siciliana");
    await userEvent.tab();
    await userEvent.click(canvas.getByRole("checkbox", { name: /Aperturas/ }));
  },
};

/** A slug typed by hand is left alone when the name changes afterwards. */
export const OwnSlug: Story = {
  play: async ({ canvasElement }) => {
    await open({ canvasElement });
    const canvas = within(canvasElement);
    await userEvent.type(canvas.getByLabelText("Identificador (slug)"), "siciliana-basica");
    await userEvent.type(canvas.getByLabelText("Nombre"), "Fundamentos de la Defensa Siciliana");
    await userEvent.tab();
  },
};

/** A slug with spaces and capitals: the field shows its message on submit. */
export const InvalidSlug: Story = {
  play: async ({ canvasElement }) => {
    await open({ canvasElement });
    const canvas = within(canvasElement);
    await userEvent.type(canvas.getByLabelText("Nombre"), "Finales de torre esenciales");
    await userEvent.type(canvas.getByLabelText("Identificador (slug)"), "Finales de torre");
    await userEvent.click(canvas.getByRole("button", { name: "Crear curso" }));
  },
};
