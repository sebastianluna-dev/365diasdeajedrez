import { useRef, useState } from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { userEvent, within } from "storybook/test";
import { PlusIcon } from "@/components/icons/plus-icon.comp";
import {
  PlatformPopup,
  type PlatformPopupHandle,
} from "@/components/platform/shared/platform-popup/platform-popup.comp";
import { NewStudyForm } from "./new-study-form.comp";
import "./new-study.comp.css";

const STUDENT_KINDS = [
  { code: "STUDY", label: "Estudio" },
  { code: "TOURNAMENT", label: "Torneo" },
];

const TEACHER_KINDS = [...STUDENT_KINDS, { code: "COLLECTION", label: "Colección" }];

interface NewStudyArgs {
  kinds: { code: string; label: string }[];
}

/**
 * The trigger and the popup as `NewStudy` mounts them, with a stub in place
 * of `createStudy`: the form is remounted on every closing.
 */
function NewStudySample({ kinds }: NewStudyArgs) {
  const popup = useRef<PlatformPopupHandle>(null);
  const [opening, setOpening] = useState(0);
  return (
    // As wide as a cell of the library's grid.
    <div className="new-study" style={{ width: 280 }}>
      <button type="button" className="new-study__slot" onClick={(event) => popup.current?.open(event)}>
        <PlusIcon variant="classic-solid" className="new-study__slot-icon" />
        Nuevo estudio
      </button>
      <PlatformPopup ref={popup} title="Nuevo estudio" size="md" onClose={() => setOpening((count) => count + 1)}>
        <NewStudyForm
          key={opening}
          kinds={kinds}
          action={() => undefined}
          onClose={() => popup.current?.close()}
          onSubmit={() => popup.current?.close()}
        />
      </PlatformPopup>
    </div>
  );
}

const open = async ({ canvasElement }: { canvasElement: HTMLElement }) => {
  await userEvent.click(within(canvasElement).getByRole("button", { name: "Nuevo estudio" }));
};

const meta = {
  title: "platform/sections/studies/studies-list/NewStudy",
  parameters: {
    docs: {
      description: {
        component: `
The «Nuevo estudio» slot of the library's grid and its popup, a \`PlatformPopup\` with
\`NewStudyForm\` inside and a stub in place of \`createStudy\`. Under the strip,
the subtitle, the three fields on \`PlatformForm\` (the kind as
\`PlatformChoiceCards\`) and the footer band; the submit stays off until the
study has a name. Each story opens the popup with its \`play\`.

Source: \`components/platform/sections/studies/studies-list/new-study/\`.
Reference page: [Components › NewStudy](/components/platform/sections/studies/studies-list/new-study) in the docs site.
`,
      },
    },
  },
  args: { kinds: STUDENT_KINDS },
  argTypes: {
    kinds: { control: "object", description: "Kinds the viewer can create, from the catalog." },
  },
  render: (args) => <NewStudySample {...args} />,
} satisfies Meta<NewStudyArgs>;

export default meta;
type Story = StoryObj<typeof meta>;

/** What a student sees: two kinds, the first one chosen, the submit off until a name is typed. */
export const Student: Story = { play: open };

/** A teacher gets the collection too, so the cards are three across. */
export const Teacher: Story = {
  args: { kinds: TEACHER_KINDS },
  play: open,
};

/** A name typed and the second kind chosen: the submit is on. */
export const Filled: Story = {
  args: { kinds: TEACHER_KINDS },
  play: async ({ canvasElement }) => {
    await open({ canvasElement });
    const canvas = within(canvasElement);
    await userEvent.type(canvas.getByLabelText("Nombre"), "Nacional Abierto 2026");
    await userEvent.click(canvas.getByRole("radio", { name: /Torneo/ }));
  },
};

/** The slot that heads the grid of «Mis estudios», at rest: a dashed cell that opens the popup. */
export const AtRest: Story = {};
