import { useRef } from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { fn, userEvent, within } from "storybook/test";
import type { PlatformPopupHandle } from "@/components/platform/shared/platform-popup/platform-popup.comp";
import { SaveToStudyPopup } from "./save-to-study-popup.comp";

const STUDIES = [
  { id: "demoAtaq", name: "Estudio: ataques al rey" },
  { id: "demoTorn", name: "Nacional Abierto 2026" },
];

interface SampleArgs {
  studies: { id: string; name: string }[];
  action: (formData: FormData) => void | Promise<void>;
}

/** The trigger and the popup, as a played game's page and the analysis board mount them. */
function Sample({ studies, action }: SampleArgs) {
  const popup = useRef<PlatformPopupHandle>(null);
  return (
    <>
      <button type="button" className="platform-button" onClick={(event) => popup.current?.open(event)}>
        Guardar en un estudio
      </button>
      <SaveToStudyPopup
        ref={popup}
        studies={studies}
        defaultTitle="Ana Torres – Don Chuy"
        action={action}
        onCancel={() => popup.current?.close()}
      />
    </>
  );
}

const open = async ({ canvasElement }: { canvasElement: HTMLElement }) => {
  await userEvent.click(within(canvasElement).getByRole("button", { name: "Guardar en un estudio" }));
};

const meta = {
  title: "platform/shared/SaveToStudyPopup",
  component: SaveToStudyPopup,
  parameters: {
    docs: {
      description: {
        component: `
«Guardar en un estudio»: a copy of a played game, or of what is on the
analysis board, into one of the person's studies — the study, a name, and
«Guardar». Without a study of their own, it says where to make one.

Source: \`components/platform/shared/save-to-study-popup/save-to-study-popup.comp.tsx\`.
Reference page: [Components › SaveToStudyPopup](/components/platform/shared/save-to-study-popup) in the docs site.
`,
      },
    },
  },
  args: {
    ref: { current: null },
    studies: STUDIES,
    defaultTitle: "Ana Torres – Don Chuy",
    action: fn(async () => {}).mockName("copyPlayedGameToStudy"),
    onCancel: fn(),
  },
  render: (args) => <Sample studies={args.studies} action={args.action} />,
} satisfies Meta<typeof SaveToStudyPopup>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Open, by its `play`: the person's studies in the select and the proposed name. */
export const Open: Story = { play: open };

/** Without a study of their own: the way to «Mis estudios» instead of the form. */
export const NoStudies: Story = { args: { studies: [] }, play: open };
