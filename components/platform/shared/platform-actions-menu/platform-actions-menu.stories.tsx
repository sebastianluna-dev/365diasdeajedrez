import { useRef } from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { userEvent, within } from "storybook/test";
import {
  PlatformPopup,
  type PlatformPopupHandle,
} from "@/components/platform/shared/platform-popup/platform-popup.comp";
import { PlatformActionsMenu, type PlatformActionsMenuItem } from "./platform-actions-menu.comp";

const ITEMS: PlatformActionsMenuItem[] = [
  { label: "Editar pago", onSelect: () => undefined },
  { label: "Registrar otro pago", href: "?registrar=1" },
  { label: "Eliminar pago", onSelect: () => undefined, tone: "danger" },
];

const meta = {
  title: "platform/shared/PlatformActionsMenu",
  component: PlatformActionsMenu,
  parameters: {
    docs: {
      description: {
        component: `
The «…» menu of a row or a card, on Radix's \`DropdownMenu\`: a quiet square
button that opens a short list of actions under it. Not modal and not
portalled, so it works inside a popup too. An item that cannot be chosen
stays on the list, greyed, with its reason as a second line.

Source: \`components/platform/shared/platform-actions-menu/platform-actions-menu.comp.tsx\`.
Reference page: [Components › PlatformActionsMenu](/components/platform/shared/platform-actions-menu) in the docs site.
`,
      },
    },
  },
  args: { label: "Acciones del pago", items: ITEMS },
  argTypes: { label: { control: "text" }, items: { control: "object" } },
  decorators: [
    (Story) => (
      <div
        className="platform-theme"
        style={{ display: "flex", justifyContent: "flex-end", padding: 16, minHeight: 220 }}
      >
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof PlatformActionsMenu>;

export default meta;
type Story = StoryObj<typeof meta>;

const openMenu = async ({ canvasElement }: { canvasElement: HTMLElement }) => {
  await userEvent.click(within(canvasElement).getByRole("button", { name: "Acciones del pago" }));
};

/** Closed: the quiet «…» button alone. */
export const Closed: Story = {};

/** Open: the list under the button, aligned to its right, the danger one in red. */
export const Open: Story = { play: openMenu };

/** With an action that cannot be chosen: greyed, and its reason under it. */
export const WithDisabledReason: Story = {
  name: "With disabled reason",
  args: {
    items: [
      ITEMS[0]!,
      ITEMS[1]!,
      { label: "Eliminar pago", tone: "danger", disabled: true, reason: "Ya tiene clases tomadas." },
    ],
  },
  play: openMenu,
};

/** Inside a modal popup: not portalled, the menu opens over the popup's content and stays usable. */
export const InsideDialog: Story = {
  name: "Inside dialog",
  render: (args) => <InDialog {...args} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "Abrir el pago" }));
    const dialog = canvasElement.querySelector("dialog");
    if (dialog) await userEvent.click(within(dialog).getByRole("button", { name: "Acciones del pago" }));
  },
};

function InDialog(args: { label: string; items: PlatformActionsMenuItem[] }) {
  const popup = useRef<PlatformPopupHandle>(null);
  return (
    <>
      <button type="button" className="platform-button" onClick={(event) => popup.current?.open(event)}>
        Abrir el pago
      </button>
      <PlatformPopup ref={popup} title="Pago del jue 1 oct" size="sm">
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: 24,
            minHeight: 200,
          }}
        >
          <span>$1,400.00 MXN · 4 clases</span>
          <PlatformActionsMenu {...args} />
        </div>
      </PlatformPopup>
    </>
  );
}
