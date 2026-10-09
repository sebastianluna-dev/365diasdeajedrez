import { useRef } from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { userEvent, within } from "storybook/test";
import { PlatformForm, PlatformFormField } from "@/components/platform/shared/platform-form/platform-form.comp";
import { SubmitButton } from "@/components/platform/shared/submit-button/submit-button.comp";
import { PlatformPopup, type PlatformPopupHandle } from "./platform-popup.comp";

interface PopupArgs {
  title: string;
  size: "sm" | "md" | "lg";
  /** `sheet`: on a phone it comes up from the bottom edge. */
  phone?: "sheet";
  /** What the content is: a few paragraphs, or a form. */
  content: "text" | "form";
  paragraphs: number;
}

const TEXT =
  "Un estudio guarda tus partidas con sus variantes, comentarios y flechas. Puedes compartirlo con tu profesor.";

/** A popup behind its trigger, with the content the story asks for. */
function PopupSample({ title, size, phone, content, paragraphs }: PopupArgs) {
  const popup = useRef<PlatformPopupHandle>(null);
  return (
    <>
      <button type="button" className="platform-button" onClick={(event) => popup.current?.open(event)}>
        Abrir el popup
      </button>
      <PlatformPopup ref={popup} title={title} size={size} phone={phone}>
        {content === "form" ? (
          <PlatformForm
            onSubmit={(event) => {
              event.preventDefault();
              popup.current?.close();
            }}
            style={{ display: "flex", flexDirection: "column", gap: 16, padding: 24 }}
          >
            <PlatformFormField name="name" label="Nombre" messages={{ valueMissing: "Ponle un nombre al estudio." }}>
              <input type="text" maxLength={120} required />
            </PlatformFormField>
            <PlatformFormField name="description" label="Descripción">
              <textarea rows={3} maxLength={500} placeholder="Para qué te sirve este estudio" />
            </PlatformFormField>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 12 }}>
              <button type="button" className="platform-button" onClick={() => popup.current?.close()}>
                Cancelar
              </button>
              <SubmitButton className="platform-button platform-button_variant_ink">Guardar</SubmitButton>
            </div>
          </PlatformForm>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 16, padding: 24 }}>
            {Array.from({ length: paragraphs }, (_, index) => (
              <p key={index} style={{ margin: 0 }}>
                {TEXT}
              </p>
            ))}
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 12 }}>
              <button type="button" className="platform-button" onClick={() => popup.current?.close()}>
                Cancelar
              </button>
              <button
                type="button"
                className="platform-button platform-button_variant_ink"
                onClick={() => popup.current?.close()}
              >
                Crear estudio
              </button>
            </div>
          </div>
        )}
      </PlatformPopup>
    </>
  );
}

const open = async ({ canvasElement }: { canvasElement: HTMLElement }) => {
  await userEvent.click(within(canvasElement).getByRole("button", { name: "Abrir el popup" }));
};

const meta = {
  title: "platform/shared/PlatformPopup",
  parameters: {
    docs: {
      description: {
        component: `
The platform's modal popup, the one piece every popup of the platform is: a
native \`<dialog>\` on the frame \`.platform-dialog\` of platform.css (which
centres it, scrolls it inside and plays its entry and exit), with the strip at
the top (the name, the cross) as its only fixed part. What is under the strip
is the content's: its padding, its fields, its buttons. It has no trigger: the
host opens and closes it through its handle, which is what lets a
\`PlatformConfirmPopup\` be opened on top of it while it stays open.

Source: \`components/platform/shared/platform-popup/platform-popup.comp.tsx\`.
Reference page: [Components › PlatformPopup](/components/platform/shared/platform-popup) in the docs site.
`,
      },
    },
  },
  args: { title: "Nuevo estudio", size: "md", content: "text", paragraphs: 1 },
  argTypes: {
    title: { control: "text", description: "What the strip says; the popup's accessible name." },
    size: { control: "inline-radio", options: ["sm", "md", "lg"], description: "480, 600 or 720px." },
    content: { control: "inline-radio", options: ["text", "form"] },
    paragraphs: {
      control: { type: "number", min: 1, max: 40 },
      description: "How many times the paragraph is repeated: enough of them and the popup scrolls inside.",
    },
  },
  render: (args) => <PopupSample {...args} />,
} satisfies Meta<PopupArgs>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Closed: the button that opens it. Press it to see the entrance, and Escape, the cross or «Cancelar» to see the exit. */
export const Closed: Story = {};

/**
 * Open, by its `play`, so the Accessibility panel scans it: the strip with the name and the cross, and a content of
 * one paragraph and two buttons, which pads itself. The focus is on the first button of the content, not on the cross.
 */
export const Open: Story = { play: open };

/** A form inside: the focus lands on its first field on opening, and «Guardar» closes it once the browser lets it submit. */
export const WithForm: Story = { args: { content: "form", size: "sm" }, play: open };

/** The widest, `lg`, at 720px. */
export const Large: Story = { args: { size: "lg" }, play: open };

/** Scrolling inside past `100dvh - 40px`, with the strip scrolling along: the frame scrolls as a whole. */
export const Tall: Story = { args: { paragraphs: 24 }, play: open };

/**
 * `phone="sheet"` in a phone's width: the popup comes up from the bottom edge, as wide as the screen and rounded only
 * at the top, as «¿Abandonas la partida?» does over a board (P3). On a wider screen it is the ordinary popup.
 */
export const SheetOnPhone: Story = {
  name: "Sheet on phone",
  args: { title: "¿Abandonas la partida?", size: "sm", phone: "sheet" },
  globals: { viewport: { value: "mobile1", isRotated: false } },
  play: open,
};
