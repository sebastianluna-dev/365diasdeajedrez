import { useRef } from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { userEvent, within } from "storybook/test";

interface DialogArgs {
  title: string;
  text: string;
  paragraphs: number;
}

function DialogSample({ title, text, paragraphs }: DialogArgs) {
  const dialog = useRef<HTMLDialogElement>(null);
  return (
    <>
      <button type="button" className="platform-button" onClick={() => dialog.current?.showModal()}>
        Abrir el diálogo
      </button>
      <dialog ref={dialog} className="platform-dialog" aria-labelledby="dialog-sample-title">
        {/* The frame has no padding of its own: each dialog's block pads what it holds. */}
        <form method="dialog" style={{ display: "flex", flexDirection: "column", gap: 16, padding: 28, maxWidth: 460 }}>
          <h2 id="dialog-sample-title" className="platform-card__title" style={{ margin: 0 }}>
            {title}
          </h2>
          {Array.from({ length: paragraphs }, (_, index) => (
            <p key={index}>{text}</p>
          ))}
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
            <button type="submit" value="cancel" className="platform-button">
              Cancelar
            </button>
            <button type="submit" value="confirm" className="platform-button platform-button_variant_ink">
              Crear estudio
            </button>
          </div>
        </form>
      </dialog>
    </>
  );
}

const open = async ({ canvasElement }: { canvasElement: HTMLElement }) => {
  await userEvent.click(within(canvasElement).getByRole("button", { name: "Abrir el diálogo" }));
};

const meta = {
  title: "platform/primitives/Dialog",
  parameters: {
    docs: {
      description: {
        component: `
\`.platform-dialog\`, the frame of every dialog of the platform: a global class
of \`app/(platform)/platform.css\` on a native \`<dialog>\` opened with
\`showModal()\`, which brings the focus trap, Escape and the backdrop. Its
motion is the class's own, in CSS alone; see it played on
platform/foundations/Motion.

Reference: [Styling & design tokens › Global helpers](/ui/styling#global-helpers) and [Popups come in and go out animated](/ui/styling#popups-come-in-and-go-out-animated) in the docs site.
`,
      },
    },
  },
  args: {
    title: "Nuevo estudio",
    text: "Un estudio guarda tus partidas con sus variantes, comentarios y flechas. Puedes compartirlo con tu profesor.",
    paragraphs: 1,
  },
  argTypes: {
    title: { control: "text", description: "The dialog's heading, which names it." },
    text: { control: "text", description: "One paragraph of what it holds." },
    paragraphs: {
      control: { type: "number", min: 1, max: 40 },
      description: "How many times the paragraph is repeated: enough of them and the dialog scrolls inside.",
    },
  },
  render: (args) => <DialogSample {...args} />,
} satisfies Meta<DialogArgs>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Closed: the button that opens it. Press it to see the entrance, and Escape or «Cancelar» to see the exit. */
export const Closed: Story = {};

/**
 * A native `<dialog>` centred with `inset: 0; margin: auto`, with the shared backdrop. It fades in with a short
 * rise and out the same way, in CSS alone; `prefers-reduced-motion` removes both. Opened by its `play` function,
 * so the Accessibility panel scans it.
 */
export const Open: Story = { play: open };

/** Scrolling inside past `100dvh - 40px`. */
export const Tall: Story = { args: { paragraphs: 24 }, play: open };
