import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { fn, userEvent, within } from "storybook/test";
import type { GameFieldValues } from "@/components/platform/shared/game-fields/game-fields.comp";
import { GAME_RESULT } from "@/constants/platform/study-codes.const";
import { EditGame } from "./edit-game.comp";

/** The results catalog as the seed writes it: the label IS the PGN token. */
const RESULTS = [
  { code: GAME_RESULT.WHITE_WINS, label: "1-0" },
  { code: GAME_RESULT.BLACK_WINS, label: "0-1" },
  { code: GAME_RESULT.DRAW, label: "1/2-1/2" },
  { code: GAME_RESULT.ONGOING, label: "*" },
];

const RECORD: GameFieldValues = {
  white: "Kasparov, Garry",
  whiteElo: 2812,
  whiteTitle: "GM",
  whiteCountry: "RUS",
  black: "Topalov, Veselin",
  blackElo: 2700,
  blackTitle: "GM",
  blackCountry: "BUL",
  resultCode: GAME_RESULT.WHITE_WINS,
  playedAtValue: "1999-01-20",
  event: "Hoogovens",
  site: "Wijk aan Zee NED",
  round: "4",
  eco: "B07",
};

/** Stands in for the screen's server action, already bound to its game: a spy records the FormData it is sent. */
const save = fn(async () => {}).mockName("updateGameDetails");

const open = async ({ canvasElement }: { canvasElement: HTMLElement }) => {
  await userEvent.click(within(canvasElement).getByRole("button", { name: /^Editar/ }));
};

const meta = {
  title: "platform/shared/EditGame",
  component: EditGame,
  parameters: {
    docs: {
      description: {
        component: `
«Editar» beside a game: the trigger and the popup (a \`PlatformPopup\`, the
widest) with the game's record (\`GameFields\`). It saves through the action it
is given — each screen brings its own, bound to its game and checking its own
border — and closes; the moves are edited on the board, not here. Here the
action is a spy listed in the Actions panel.

Source: \`components/platform/shared/edit-game/edit-game.comp.tsx\`.
Reference page: [Components › EditGame](/components/platform/shared/edit-game) in the docs site.
`,
      },
    },
  },
  args: {
    action: save,
    values: RECORD,
    results: RESULTS,
    titleHint: "Cómo identificas esta partida dentro del estudio. Si lo dejas vacío se usan los dos jugadores.",
  },
  argTypes: {
    action: { description: "The screen's server action, bound to the game; a spy here." },
    values: { control: "object", description: "`GameFieldValues`: the record as saved." },
    label: {
      control: "text",
      description: "The trigger's text; «Editar» (the default) is a row action, anything else the platform's button.",
    },
  },
} satisfies Meta<typeof EditGame>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Closed: «Editar», the action of a row, as it stands in the staff's chapter collection. */
export const Closed: Story = {};

/** Open, by its `play` function: the record in the popup, «Guardar datos» in ink beside «Cancelar». */
export const Open: Story = { play: open };

/**
 * With a label of its own the trigger is the platform's button, for a bar where it stands among buttons. No
 * screen passes one today: both mount it with «Editar».
 */
export const WithLabel: Story = { name: "With label", args: { label: "Editar datos" } };

/** With the pencil for a trigger, as in the head of the game's record beside a study's board: no word, named «Editar los datos de la partida». */
export const WithIcon: Story = { name: "With icon", args: { trigger: "icon" } };
