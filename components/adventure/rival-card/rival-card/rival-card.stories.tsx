import { useRef } from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { userEvent, within } from "storybook/test";
import {
  PlatformPopup,
  type PlatformPopupHandle,
} from "@/components/platform/shared/platform-popup/platform-popup.comp";
import { fixtureAdventureProgress } from "@/lib/testing/fixtures/adventure";
import { RivalCard } from "./rival-card.comp";

const progress = fixtureAdventureProgress({ attemptsOnNext: 1 });
const encounter = (order: number) => progress.encounters[order - 1]!;

/** The card where the map puts it: the content of a popup, opened by the story's `play`. */
function CardInPopup(props: React.ComponentProps<typeof RivalCard>) {
  const popup = useRef<PlatformPopupHandle>(null);
  return (
    <>
      <button type="button" className="platform-button" onClick={(event) => popup.current?.open(event)}>
        Abrir la ficha
      </button>
      <PlatformPopup
        ref={popup}
        title={`Ficha de rival · N.º ${String(props.encounter.order).padStart(2, "0")} de 12`}
        size="md"
        phone="sheet"
      >
        <RivalCard {...props} onCancel={() => popup.current?.close()} />
      </PlatformPopup>
    </>
  );
}

const open = async ({ canvasElement }: { canvasElement: HTMLElement }) => {
  await userEvent.click(within(canvasElement).getByRole("button", { name: "Abrir la ficha" }));
};

const meta = {
  title: "adventure/rival-card/RivalCard",
  component: RivalCard,
  parameters: {
    docs: {
      description: {
        component: `
A rival's card, the content of a \`PlatformPopup\` the map opens when its stamp
is pressed: a passport page with the stamp large on four corners of tape, the
name and the role, where the person stands (beaten with its postmark and the
length of the game, available with its attempt, locked with who to beat
first), the rival's phrase and the facts — level, difficulty, favourite
opening, style, where it is played, the stars it gives and the keepsake it
leaves, which is a sealed envelope until it is won. Under them the colour to
play with and the button: «Empezar» for the available rival, «Volver a retar»
for a beaten one, none for a locked one. With another game open, the card
warns, and the button asks the map to confirm before closing that game. Each
story opens the popup with its \`play\`.

Source: \`components/adventure/rival-card/rival-card/rival-card.comp.tsx\`.
Reference page: [Components › RivalCard](/components/adventure/rival-card/rival-card) in the docs site.
`,
      },
    },
  },
  args: {
    adventure: "cuaderno-del-viajero",
    encounter: encounter(5),
    postmark: "BIBLIOTECA",
    previousName: "Toñito Garza",
    playerName: "Alumno Demo",
    openGame: null,
    action: async () => undefined,
    onReplace: () => undefined,
    onCancel: () => undefined,
  },
  render: (args) => <CardInPopup {...args} />,
} satisfies Meta<typeof RivalCard>;

export default meta;
type Story = StoryObj<typeof meta>;

/** The rival to play on its second attempt: the pinned stamp, «Intento 2», the stars it would give and the sealed envelope. */
export const Available: Story = { play: open };

/** The rival to play for the first time: «Es tu próximo rival» and three stars to win. */
export const AvailableFirstTry: Story = {
  args: {
    encounter: fixtureAdventureProgress({ beaten: 0, stars: [] }).encounters[0]!,
    previousName: null,
    postmark: "PLAZA",
  },
  play: open,
};

/** A beaten rival: the postmark with its date, the length of the game, its stars and its keepsake, and «Volver a retar». */
export const Beaten: Story = {
  args: { encounter: encounter(2), previousName: "Don Chema", postmark: "PLAZA" },
  play: open,
};

/** A locked rival: the greyed stamp under a red padlock, who to beat first, and no button. */
export const Locked: Story = {
  args: { encounter: encounter(8), previousName: "Doña Cuca", postmark: "MALECÓN" },
  play: open,
};

/** The last page, locked: the wax seal under the padlock and «Supera a Valeria Soto». */
export const FinalLocked: Story = {
  args: { encounter: encounter(12), previousName: "Valeria Soto", postmark: "PALACIO" },
  play: open,
};

/** With a game against a bot already open: the card warns that starting this closes it. */
export const WithOpenGame: Story = {
  args: { openGame: fixtureAdventureProgress({ openGame: "free" }).openGame },
  play: open,
};
