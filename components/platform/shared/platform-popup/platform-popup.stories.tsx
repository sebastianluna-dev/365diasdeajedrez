import { useRef, type ReactNode } from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, userEvent, within } from "storybook/test";
import { PlatformDatePicker } from "@/components/platform/shared/platform-date-picker/platform-date-picker.comp";
import { PlatformForm, PlatformFormField } from "@/components/platform/shared/platform-form/platform-form.comp";
import { popupButton, usePlatformLook } from "@/components/platform/shared/platform-look";
import { PlatformSelect } from "@/components/platform/shared/platform-select/platform-select.comp";
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
  /** Mounted on a page moved to the new design system (inside `.platform-workspace`): Material's dialog. */
  material: boolean;
}

const TEXT =
  "Un estudio guarda tus partidas con sus variantes, comentarios y flechas. Puedes compartirlo con tu profesor.";

/** The content's two buttons, in the popup's look: they read it from inside the popup. */
function SampleActions({ label, onClose, submit }: { label: string; onClose: () => void; submit: boolean }) {
  const look = usePlatformLook();
  return (
    <div style={{ display: "flex", justifyContent: "flex-end", gap: 12 }}>
      <button type="button" className={popupButton(look, "exit")} onClick={onClose}>
        Cancelar
      </button>
      {submit ? (
        <SubmitButton className={popupButton(look, "submit")}>{label}</SubmitButton>
      ) : (
        <button type="button" className={popupButton(look, "submit")} onClick={onClose}>
          {label}
        </button>
      )}
    </div>
  );
}

/** The frame of a page moved to the new design system, which the popup reads as it opens. */
function MovedPage({ material, children }: { material: boolean; children: ReactNode }) {
  if (!material) return children;
  return (
    <div className="platform-workspace" style={{ minHeight: 0, padding: 16 }}>
      {children}
    </div>
  );
}

/** A popup behind its trigger, with the content the story asks for. */
function PopupSample({ title, size, phone, content, paragraphs, material }: PopupArgs) {
  const popup = useRef<PlatformPopupHandle>(null);
  const close = () => popup.current?.close();
  return (
    <MovedPage material={material}>
      <button type="button" className="platform-button" onClick={(event) => popup.current?.open(event)}>
        Abrir el popup
      </button>
      <PlatformPopup ref={popup} title={title} size={size} phone={phone}>
        {content === "form" ? (
          <PlatformForm
            onSubmit={(event) => {
              event.preventDefault();
              close();
            }}
            style={{ display: "flex", flexDirection: "column", gap: material ? 20 : 16, padding: 24 }}
          >
            <PlatformFormField name="name" label="Nombre" messages={{ valueMissing: "Ponle un nombre al estudio." }}>
              <input type="text" maxLength={120} required />
            </PlatformFormField>
            <PlatformFormField
              name="description"
              label="Descripción"
              hint={material ? "Lo ven quienes lo compartan contigo." : undefined}
            >
              <textarea rows={3} maxLength={500} placeholder="Para qué te sirve este estudio" />
            </PlatformFormField>
            {material && (
              <>
                <PlatformFormField name="kindCode" label="Tipo">
                  <PlatformSelect
                    defaultValue="STUDY"
                    options={[
                      { value: "STUDY", label: "Estudio" },
                      { value: "TOURNAMENT", label: "Torneo" },
                      { value: "COLLECTION", label: "Colección" },
                    ]}
                  />
                </PlatformFormField>
                <PlatformFormField name="startsOn" label="Fecha">
                  <PlatformDatePicker defaultValue="2026-10-12" />
                </PlatformFormField>
              </>
            )}
            <SampleActions label="Guardar" onClose={close} submit />
          </PlatformForm>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 16, padding: 24 }}>
            {Array.from({ length: paragraphs }, (_, index) => (
              <p key={index} style={{ margin: 0 }}>
                {TEXT}
              </p>
            ))}
            <SampleActions label="Crear estudio" onClose={close} submit={false} />
          </div>
        )}
      </PlatformPopup>
    </MovedPage>
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

Mounted inside \`.platform-workspace\` — a page moved to the new design
system — it opens as Material 3's dialog instead, and hands its look to the
content: the fields turn outlined, the buttons Material's (\`popupButton\`).

Source: \`components/platform/shared/platform-popup/platform-popup.comp.tsx\`.
Reference page: [Components › PlatformPopup](/components/platform/shared/platform-popup) in the docs site.
`,
      },
    },
  },
  args: { title: "Nuevo estudio", size: "md", content: "text", paragraphs: 1, material: false },
  argTypes: {
    title: { control: "text", description: "What the strip says; the popup's accessible name." },
    size: {
      control: "inline-radio",
      options: ["sm", "md", "lg"],
      description: "480, 600 or 720px (800 in Material's).",
    },
    content: { control: "inline-radio", options: ["text", "form"] },
    paragraphs: {
      control: { type: "number", min: 1, max: 40 },
      description: "How many times the paragraph is repeated: enough of them and the popup scrolls inside.",
    },
    material: {
      control: "boolean",
      description: "Mounted inside `.platform-workspace`, as on a page moved to the new design system.",
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

/**
 * On a page moved to the new design system: Material 3's dialog of «Formulario A» — 28px corners, the headline in the
 * display font with no rule under it, Material's cross — with its fields outlined (the name required, the description
 * with «Opcional» and its hint on the supporting line, a select and a date picker in the same box) and its two
 * buttons Material's, «Cancelar» a text one and «Guardar» filled. The focus is on the name, in the primary at 2px.
 */
export const Material: Story = {
  args: { material: true, content: "form", size: "sm", title: "Editar el estudio" },
  play: async ({ canvasElement }) => {
    await open({ canvasElement });
    const dialog = canvasElement.querySelector<HTMLElement>(".platform-popup") ?? canvasElement;
    await expect(dialog).toHaveClass("platform-dialog_look_material");
    await expect(within(dialog).getByRole("textbox", { name: "Nombre" })).toHaveFocus();
  },
};

/** Material's dialog sent with the name empty: the field's outline, label and message in the error's red. */
export const MaterialInvalid: Story = {
  name: "Material invalid",
  args: { material: true, content: "form", size: "sm", title: "Editar el estudio" },
  play: async ({ canvasElement }) => {
    await open({ canvasElement });
    const dialog = canvasElement.querySelector<HTMLElement>(".platform-popup") ?? canvasElement;
    await userEvent.click(within(dialog).getByRole("button", { name: "Guardar" }));
    await expect(within(dialog).getByText("Ponle un nombre al estudio.")).toBeVisible();
  },
};

/** Material's dialog with text, the widest: `lg` takes the 800px of a form in two columns. */
export const MaterialLarge: Story = {
  name: "Material large",
  args: { material: true, size: "lg" },
  play: open,
};
