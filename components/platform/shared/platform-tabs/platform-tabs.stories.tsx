import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, userEvent, within } from "storybook/test";
import { PlatformTabPanel, PlatformTabs, type PlatformTab } from "./platform-tabs.comp";

const STEPS: PlatformTab[] = [
  { value: "position", label: "Posición" },
  { value: "solution", label: "Solución" },
  { value: "data", label: "Datos" },
];

const TEXTS: Record<string, string> = {
  position: "Coloca las piezas, pega un FEN o elige una jugada de tus partidas.",
  solution: "Juega la solución en el tablero: tus jugadas y las respuestas del rival.",
  data: "Título, enunciado, dificultad, temas, pistas y explicación.",
};

/** The tabs with their state, as a host keeps it: the open one is the host's. */
function Steps({ tabs, initial }: { tabs: PlatformTab[]; initial: string }) {
  const [value, setValue] = useState(initial);
  return (
    <PlatformTabs label="Pasos del ejercicio" tabs={tabs} value={value} onValueChange={setValue}>
      {tabs.map((tab) => (
        <PlatformTabPanel key={tab.value} value={tab.value}>
          <p style={{ margin: 0 }}>{TEXTS[tab.value]}</p>
        </PlatformTabPanel>
      ))}
    </PlatformTabs>
  );
}

const meta = {
  title: "platform/shared/PlatformTabs",
  component: PlatformTabs,
  parameters: {
    docs: {
      description: {
        component: `
The steps of one screen as tabs, on Radix's \`Tabs\`: the arrows move between
them and only the open tab's panel is mounted, so the host keeps every value
outside the panels and decides which tab is open. A tab with an error carries
the danger's mark and «con errores» in its name until it is fixed. The exercise
editor's «Posición · Solución · Datos» are these; a record's pages are
\`StaffTabs\`, which are links.

Source: \`components/platform/shared/platform-tabs/platform-tabs.comp.tsx\`.
Reference page: [Components › PlatformTabs](/components/platform/shared/platform-tabs) in the docs site.
`,
      },
    },
  },
  args: {
    label: "Pasos del ejercicio",
    tabs: STEPS,
    value: "position",
    onValueChange: () => undefined,
    children: null,
  },
  render: (args) => <Steps tabs={args.tabs} initial={args.value} />,
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 720 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof PlatformTabs>;

export default meta;
type Story = StoryObj<typeof meta>;

/** The editor's three steps, on «Posición»: the accent's underline on the open tab. */
export const Default: Story = {};

/** An error on a tab nobody is looking at: «Datos» carries the danger's mark and is heard as «Datos, con errores» while «Posición» is open. */
export const ErrorOnAHiddenTab: Story = {
  args: { tabs: STEPS.map((tab) => (tab.value === "data" ? { ...tab, invalid: true } : tab)) },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("tab", { name: "Datos, con errores" })).toHaveAttribute("aria-selected", "false");
  },
};

/** From the keyboard: the arrow moves to «Solución» and opens it; its panel replaces the first. */
export const Keyboard: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("tab", { name: "Posición" }));
    await userEvent.keyboard("{ArrowRight}");
    await expect(canvas.getByRole("tab", { name: "Solución" })).toHaveAttribute("aria-selected", "true");
    await expect(canvas.getByText(TEXTS.solution ?? "")).toBeVisible();
  },
};
