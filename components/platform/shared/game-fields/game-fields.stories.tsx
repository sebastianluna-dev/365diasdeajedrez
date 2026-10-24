import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { PlatformForm } from "@/components/platform/shared/platform-form/platform-form.comp";
import { PlatformLookContext } from "@/components/platform/shared/platform-look";
import { GAME_RESULT } from "@/constants/platform/study-codes.const";
import { GameFields, type GameFieldValues } from "./game-fields.comp";

/** The results catalog as the seed writes it: the label IS the PGN token. */
const RESULTS = [
  { code: GAME_RESULT.WHITE_WINS, label: "1-0" },
  { code: GAME_RESULT.BLACK_WINS, label: "0-1" },
  { code: GAME_RESULT.DRAW, label: "1/2-1/2" },
  { code: GAME_RESULT.ONGOING, label: "*" },
];

/** A game's record as a study's game carries it. */
const FILLED: GameFieldValues = {
  title: "Una inmortal en Wijk aan Zee",
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

const TITLE_HINT = "Cómo identificas esta partida dentro del estudio. Si lo dejas vacío se usan los dos jugadores.";

const meta = {
  title: "platform/shared/GameFields",
  component: GameFields,
  parameters: {
    docs: {
      description: {
        component: `
A game's record, in one place: every form that writes it — a student's study
and the staff's chapter collections — offers exactly these fields, so nothing
set in one can be trapped where another cannot correct it. Every field is
optional. A title or a federation the PGN brings and the lists do not have is
kept as one more option, «(del PGN)», so saving without touching it does not
turn it into another. Each is a \`PlatformFormField\`, so they render inside a
\`PlatformForm\` (here one that never submits); the dropdowns are
\`PlatformSelect\` and the date is \`PlatformDatePicker\`; \`EditGame\` puts
these fields in its dialog's form.

Source: \`components/platform/shared/game-fields/game-fields.comp.tsx\`.
Reference page: [Components › GameFields](/components/platform/shared/game-fields) in the docs site.
`,
      },
    },
  },
  args: { values: FILLED, results: RESULTS, titleHint: TITLE_HINT },
  argTypes: {
    values: { control: "object", description: "`GameFieldValues`: the record as saved." },
    results: { control: "object", description: "The results catalog; its label is the PGN token." },
    titleHint: { control: "text", description: "What the name is for on this screen." },
  },
  // The fields are `PlatformFormField`s, which need a form's context: here a
  // `PlatformForm` that never submits stands for `EditGame`'s.
  decorators: [
    (Story) => (
      <div className="platform-card" style={{ maxWidth: 680 }}>
        <PlatformForm onSubmit={(event) => event.preventDefault()}>
          <Story />
        </PlatformForm>
      </div>
    ),
  ],
} satisfies Meta<typeof GameFields>;

export default meta;
type Story = StoryObj<typeof meta>;

/** A game whose record is complete: every field filled. */
export const Filled: Story = {};

/** A game with no record yet, as one that was just started on the board: every field empty, the result «*». */
export const Empty: Story = { args: { values: {} } };

/** A PGN whose title and federation are not in the lists («AGM», «FAI»): each kept as one more option. */
export const ValuesFromThePgn: Story = {
  name: "Values from the PGN",
  args: { values: { ...FILLED, whiteTitle: "AGM", whiteCountry: "FAI" } },
};

/**
 * `look="material"`, as `EditGame` lays it out in a popup of a page moved to the new design system («Formulario A»):
 * three sections titled in the primary and divided by a rule, two columns, each player a row of name, Elo, title and
 * federation, every field outlined (the popup's look, set here by hand, on the dialog's surface).
 */
export const Material: Story = {
  args: { look: "material" },
  decorators: [
    (Story) => (
      <PlatformLookContext value="material">
        <div style={{ maxWidth: 752, padding: 24, borderRadius: 28, background: "var(--platform-m3-dialog)" }}>
          <Story />
        </div>
      </PlatformLookContext>
    ),
  ],
};
