import { useRef } from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { userEvent, within } from "storybook/test";
import {
  PlatformPopup,
  type PlatformPopupHandle,
} from "@/components/platform/shared/platform-popup/platform-popup.comp";
import {
  PlatformConfirmPopup,
  type PlatformConfirmPopupHandle,
  type PlatformConfirmVerb,
} from "./platform-confirm-popup.comp";

interface ConfirmArgs {
  verb: PlatformConfirmVerb;
  subject: string;
  title?: string;
  description: string;
  consequences: string[];
  /** The box's label; empty for a confirmation that asks for nothing more. */
  acknowledgement: string;
  confirmLabel: string;
  /** Whether the action settles: a pending one shows the button on its way. */
  settles: boolean;
  /** Whether it is opened over a popup, as from a form's foot, or alone, as from a card. */
  stacked: boolean;
  /** Fields to fill before confirming: the reason of a cancellation. */
  withFields: boolean;
}

/** A confirmation behind its trigger; stacked, the trigger is the red word at the foot of a popup. */
function ConfirmSample({
  verb,
  subject,
  title,
  description,
  consequences,
  acknowledgement,
  confirmLabel,
  settles,
  stacked,
  withFields,
}: ConfirmArgs) {
  const popup = useRef<PlatformPopupHandle>(null);
  const confirm = useRef<PlatformConfirmPopupHandle>(null);
  const action = settles ? async () => undefined : () => new Promise<void>(() => undefined);
  const confirmation = (
    <PlatformConfirmPopup
      ref={confirm}
      verb={verb}
      subject={subject}
      title={title || undefined}
      description={description}
      consequences={consequences}
      acknowledgement={acknowledgement ? { name: "confirmDelete", label: acknowledgement } : undefined}
      fields={
        withFields
          ? [
              {
                name: "reason",
                label: "Motivo",
                required: true,
                maxLength: 300,
                hint: "Lo ve el profesor, no el alumno.",
              },
              { name: "note", label: "Nota para los alumnos", maxLength: 300 },
            ]
          : undefined
      }
      action={action}
      confirmLabel={confirmLabel}
      onDone={() => popup.current?.close()}
    />
  );
  if (!stacked) {
    return (
      <>
        <button type="button" className="platform-button" onClick={() => confirm.current?.open()}>
          {confirmLabel}
        </button>
        {confirmation}
      </>
    );
  }
  return (
    <>
      <button type="button" className="platform-button" onClick={(event) => popup.current?.open(event)}>
        Editar el estudio
      </button>
      <PlatformPopup ref={popup} title="Editar el estudio" size="sm">
        <div style={{ display: "flex", flexDirection: "column", gap: 16, padding: 24 }}>
          <label style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            Nombre
            <input type="text" defaultValue={subject} />
          </label>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 12 }}>
            <button type="button" className="platform-button" onClick={() => popup.current?.close()}>
              Cancelar
            </button>
            <button type="button" className="platform-button platform-button_variant_ink">
              Guardar
            </button>
          </div>
        </div>
        <div style={{ padding: "16px 24px 20px", borderTop: "1px solid var(--platform-border)" }}>
          <button
            type="button"
            className="platform-row-action platform-row-action_variant_danger"
            onClick={() => confirm.current?.open()}
          >
            {confirmLabel}
          </button>
        </div>
      </PlatformPopup>
      {confirmation}
    </>
  );
}

/** The confirmation's element, to query inside it when the trigger or the popup beneath says the same words. */
const confirmationOf = (canvasElement: HTMLElement) =>
  canvasElement.querySelector<HTMLElement>(".platform-confirm-popup") ?? canvasElement;

const openAlone = async ({ canvasElement }: { canvasElement: HTMLElement }) => {
  await userEvent.click(within(canvasElement).getByRole("button", { name: "Eliminar estudio" }));
};

const openStacked = async ({ canvasElement }: { canvasElement: HTMLElement }) => {
  const canvas = within(canvasElement);
  await userEvent.click(canvas.getByRole("button", { name: "Editar el estudio" }));
  await userEvent.click(canvas.getByRole("button", { name: "Eliminar estudio" }));
};

const meta = {
  title: "platform/shared/PlatformConfirmPopup",
  parameters: {
    docs: {
      description: {
        component: `
The popup that asks before something is destroyed, or taken out of where it
is: the heavier of the platform's two popups, with no strip and no cross, a
disc with the bin, a rule in the danger colour along its top and a darker
backdrop of its own. Opened over a \`PlatformPopup\`, it stacks on top of it
in the top layer and the popup beneath recedes under its backdrop; «Cancelar»
and Escape close only this one, and confirming runs the action, closes this
one and tells the host through \`onDone\`, which closes the other.

Source: \`components/platform/shared/platform-confirm-popup/platform-confirm-popup.comp.tsx\`.
Reference page: [Components › PlatformConfirmPopup](/components/platform/shared/platform-confirm-popup) in the docs site.
`,
      },
    },
  },
  args: {
    withFields: false,
    verb: "Eliminar",
    subject: "Finales de torres",
    title: "",
    description: "Se elimina el estudio con sus 12 partidas, y con ellas sus variantes, comentarios y flechas.",
    consequences: [],
    acknowledgement: "",
    confirmLabel: "Eliminar estudio",
    settles: true,
    stacked: false,
  },
  argTypes: {
    verb: { control: "inline-radio", options: ["Eliminar", "Quitar"] },
    subject: { control: "text", description: "What goes, by its name: the title reads «¿{verb} «{subject}»?»." },
    title: { control: "text", description: "The question, when it is not the one built from the subject." },
    description: { control: "text" },
    consequences: { control: "object", description: "What else goes or stays, one line each." },
    acknowledgement: { control: "text", description: "The box's label; empty, there is no box." },
    confirmLabel: { control: "text" },
    settles: { control: "boolean" },
    stacked: { control: "boolean" },
  },
  render: (args) => <ConfirmSample {...args} />,
} satisfies Meta<ConfirmArgs>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Open, alone, as from a card's cross: the disc, the question, what goes, the note and the two buttons. */
export const Open: Story = { play: openAlone };

/** «Quitar»: the minus instead of the bin, no note, and the question given whole. */
export const Quitar: Story = {
  args: {
    verb: "Quitar",
    subject: "Fundamentos de la siciliana",
    title: "¿Quitar «Fundamentos de la siciliana» de mis cursos?",
    description: "El curso sale de tus cursos con tu progreso: 7 lecciones aprendidas.",
    confirmLabel: "Quitar de mis cursos",
  },
  play: async ({ canvasElement }) => {
    await userEvent.click(within(canvasElement).getByRole("button", { name: "Quitar de mis cursos" }));
  },
};

/** With a box to tick: the confirming button waits for it, as the server does for the field the box sends. */
export const WithAcknowledgement: Story = {
  args: {
    acknowledgement: "Entiendo que se eliminará todo, y que 2 partidas citadas en clases dejarán esos bloques vacíos.",
  },
  play: openAlone,
};

/** With the list of what goes and what stays under the description. */
export const WithConsequences: Story = {
  args: {
    verb: "Eliminar",
    subject: "Fundamentos de la siciliana",
    title: "¿Eliminar mi progreso en «Fundamentos de la siciliana»?",
    description: "Vas a eliminar tu progreso en el curso: 7 lecciones aprendidas.",
    consequences: [
      "El curso vuelve a empezar desde la primera lección y sigue entre tus cursos.",
      "Tu racha y tu actividad no se tocan.",
    ],
    acknowledgement: "Sí, quiero eliminar mi progreso en este curso",
    confirmLabel: "Eliminar mi progreso",
  },
  play: async ({ canvasElement }) => {
    await userEvent.click(within(canvasElement).getByRole("button", { name: "Eliminar mi progreso" }));
  },
};

/** Confirmed, with an action that never settles: the button says «Eliminando…» and the popup stays on top. */
export const Pending: Story = {
  args: { settles: false },
  play: async ({ canvasElement }) => {
    await openAlone({ canvasElement });
    // The trigger says the same words: the button inside the popup is the one.
    await userEvent.click(within(confirmationOf(canvasElement)).getByRole("button", { name: "Eliminar estudio" }));
  },
};

/**
 * Opened from the red word at the foot of a popup: the second modal stacks over the first, its darker backdrop dims
 * the form beneath, which keeps what was typed. Escape closes only the confirmation.
 */
export const Stacked: Story = { args: { stacked: true }, play: openStacked };

/** Stacked and cancelled: the confirmation goes, the form is still open, and the focus is back on the red word. */
export const CancelKeepsPopup: Story = {
  args: { stacked: true },
  play: async ({ canvasElement }) => {
    await openStacked({ canvasElement });
    // The popup beneath has a «Cancelar» of its own: the confirmation's is the one.
    await userEvent.click(within(confirmationOf(canvasElement)).getByRole("button", { name: "Cancelar" }));
  },
};

/**
 * «Cancelar»: the ban sign, the note that another class is the way to give it another day, «Cancelando…», and the
 * way out says «Volver», never the same word as the button. With a reason to write first, which the browser requires.
 */
export const CancelWithReason: Story = {
  name: "Cancelar with reason",
  args: {
    verb: "Cancelar",
    subject: "Táctica de la semana",
    title: "¿Cancelar la clase «Táctica de la semana»?",
    description: "Diego Salas pierde la fecha; su clase pagada vuelve a su pago, por programar.",
    consequences: ["El profesor la deja de ver en su día.", "Lo preparado se conserva en la clase cancelada."],
    acknowledgement: "",
    confirmLabel: "Cancelar la clase",
    withFields: true,
  },
  play: async ({ canvasElement }) => {
    await userEvent.click(within(canvasElement).getByRole("button", { name: "Cancelar la clase" }));
  },
};
