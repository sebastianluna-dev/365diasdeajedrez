import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, userEvent, waitFor, within } from "storybook/test";
import { GameSettings, type GameSettingsActions } from "./game-settings.comp";

/** Stand in for the screen's server actions, already bound to their study: spies listed in the Actions panel. */
const ACTIONS: GameSettingsActions = {
  save: fn(async () => {}).mockName("updateGameSettings"),
  clearAnnotations: fn(async () => {}).mockName("clearGameAnnotations"),
  clearVariations: fn(async () => {}).mockName("clearGameVariations"),
  remove: fn(async () => {}).mockName("deleteStudyGame"),
};

/** The confirmation's element, to query inside it: the red word beneath says the same words as its button. */
const confirmationOf = (canvasElement: HTMLElement) =>
  canvasElement.querySelector<HTMLElement>(".platform-confirm-popup") ?? canvasElement;

const meta = {
  title: "platform/shared/GameSettings",
  component: GameSettings,
  parameters: {
    docs: {
      description: {
        component: `
The gear at the end of a game's row in \`GameList\` and the popup it opens:
the game's name, which side its board opens from, how a reader goes through
it and a comment pinned at the head of its notation; and the three things that destroy —
its annotations, its variations, the game itself —, each behind a
confirmation, a \`PlatformConfirmPopup\` opened on top of the settings with the words of
the step pressed, because none can be undone. What they do are server actions
it is given already bound to the study; here they are spies and nothing is
saved.

Source: \`components/platform/shared/game-settings/game-settings.comp.tsx\`.
Reference page: [Components › GameSettings](/components/platform/shared/game-settings) in the docs site.
`,
      },
    },
  },
  args: {
    game: {
      id: "g1",
      name: "Una celada en la apertura",
      title: "Una celada en la apertura",
      orientationCode: "WHITE",
    },
    isCurrent: false,
    actions: ACTIONS,
  },
  decorators: [
    (Story) => (
      <div style={{ padding: 32 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof GameSettings>;

export default meta;
type Story = StoryObj<typeof meta>;

/** The gear alone, as a row of the list ends: the popup is closed. */
export const Closed: Story = { name: "El engrane" };

/** «Configurar», Material's tonal button with the gear (`trigger="button"`), as the open game's card at the foot of a study's column shows it. */
export const ButtonTrigger: Story = {
  name: "El botón «Configurar»",
  args: { look: "material", trigger: "button" },
};

/** The popup, opened by the story: the name to change, focused, and, under a rule, the three ways to destroy. */
export const Open: Story = {
  name: "Los ajustes abiertos",
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "Ajustes de «Una celada en la apertura»" }));
    // The popup fades in: it is there at once and visible a moment later.
    const dialog = await canvas.findByRole("dialog", { name: "Ajustes de la partida" });
    await waitFor(() => expect(dialog).toBeVisible());
    const name = canvas.getByRole("textbox", { name: "Nombre" });
    await expect(name).toHaveValue("Una celada en la apertura");
    await expect(name).toHaveFocus();
  },
};

/** A game shown by its players: the name starts empty, with the pairing as its placeholder. */
export const Unnamed: Story = {
  name: "Una partida sin nombre",
  args: { game: { id: "g2", name: "Lombardy — Fischer", orientationCode: "WHITE" } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "Ajustes de «Lombardy — Fischer»" }));
    await expect(await canvas.findByRole("textbox", { name: "Nombre" })).toHaveValue("");
  },
};

/** A game set for Black, with its next moves hidden and a comment pinned: the popup opens on what was saved. */
export const WithSettings: Story = {
  name: "Con ajustes guardados",
  args: {
    game: {
      id: "g3",
      name: "La partida del siglo",
      title: "La partida del siglo",
      orientationCode: "BLACK",
      analysisModeCode: "CONCEAL",
      pinnedComment: "Juegan las negras: ¿qué harías en la jugada 17?",
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "Ajustes de «La partida del siglo»" }));
    await expect(await canvas.findByRole("textbox", { name: /Comentario fijo/ })).toHaveValue(
      "Juegan las negras: ¿qué harías en la jugada 17?",
    );
    await expect(canvas.getByRole("combobox", { name: "Orientación" })).toHaveTextContent("Negras");
    await expect(canvas.getByRole("combobox", { name: "Modo de análisis" })).toHaveTextContent(
      "Ocultar los siguientes movimientos",
    );
  },
};

/** «Eliminar variantes» pressed: the confirmation opens on top of the settings, with its question, and nothing is called yet. */
export const Confirming: Story = {
  name: "La confirmación antes de eliminar",
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "Ajustes de «Una celada en la apertura»" }));
    await userEvent.click(await canvas.findByRole("button", { name: "Eliminar variantes" }));
    const question = canvas.getByRole("dialog", { name: "¿Eliminar las variantes?" });
    await waitFor(() => expect(question).toBeVisible());
    await expect(canvas.getByRole("dialog", { name: "Ajustes de la partida" })).toBeVisible();
    await expect(args.actions.clearVariations).not.toHaveBeenCalled();
  },
};

/** Confirmed: only the confirmation's own button calls the action, and both popups close once it settles. */
export const Confirmed: Story = {
  name: "Las variantes eliminadas",
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "Ajustes de «Una celada en la apertura»" }));
    await userEvent.click(await canvas.findByRole("button", { name: "Eliminar variantes" }));
    // The red word beneath says the same words: the confirmation's button is the one.
    await userEvent.click(within(confirmationOf(canvasElement)).getByRole("button", { name: "Eliminar variantes" }));
    await expect(args.actions.clearVariations).toHaveBeenCalledWith("g1");
    await waitFor(() => expect(canvas.getByRole("dialog", { name: "Ajustes de la partida" })).not.toBeVisible());
  },
};

/** «Eliminar partida» on a game some class shows: the button waits for the box that says the class's block will be left empty, and the action gets that confirmation. */
export const DeletingCited: Story = {
  name: "Eliminar una partida citada en una clase",
  args: {
    game: {
      id: "g1",
      name: "Una celada en la apertura",
      title: "Una celada en la apertura",
      orientationCode: "WHITE",
      citedInClass: true,
    },
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "Ajustes de «Una celada en la apertura»" }));
    await userEvent.click(await canvas.findByRole("button", { name: "Eliminar partida" }));
    const confirmation = within(confirmationOf(canvasElement));
    const submit = confirmation.getByRole("button", { name: "Eliminar partida" });
    await waitFor(() => expect(submit).toBeVisible());
    await expect(submit).toBeDisabled();

    await userEvent.click(confirmation.getByRole("checkbox"));
    await expect(submit).toBeEnabled();
    await userEvent.click(submit);
    await waitFor(() => expect(args.actions.remove).toHaveBeenCalled());
    const call = (args.actions.remove as unknown as { mock: { calls: [string, FormData][] } }).mock.calls[0];
    await expect(call?.[0]).toBe("g1");
    await expect(call?.[1].get("confirmClassBlocks")).toBe("yes");
  },
};
