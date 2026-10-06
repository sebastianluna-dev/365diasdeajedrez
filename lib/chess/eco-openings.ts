// The opening an ECO code stands for, in Spanish.
//
// The ECO classification splits every opening into 500 codes, A00 to E99, in
// runs that belong to one opening each — B20 to B99 is the Sicilian. This
// table holds those runs and the name a Spanish speaker gives the opening,
// not its variations: a variation's name does not fit beside the code where
// it is shown, and the code already says which part of the opening it is.
//
// The runs were drawn from Lichess's opening table (github.com/lichess-org/
// chess-openings, public domain, CC0): each code's shortest line and the
// openings of its lines. Where one code holds several small openings — A00,
// 1.b4 and 1.g4 and the rest; C44, the Ponziani beside the Scotch Gambit —
// the run takes the general name those moves share.

/** First code of a run, last code of it, and the opening's name. */
const ECO_RUNS: readonly (readonly [from: string, to: string, name: string])[] = [
  ["A00", "A00", "Apertura irregular"],
  ["A01", "A01", "Apertura Larsen"],
  ["A02", "A03", "Apertura Bird"],
  ["A04", "A06", "Apertura Réti"],
  ["A07", "A08", "Ataque Indio de Rey"],
  ["A09", "A09", "Apertura Réti"],
  ["A10", "A39", "Apertura Inglesa"],
  ["A40", "A41", "Apertura de peón de dama"],
  ["A42", "A42", "Defensa Moderna"],
  ["A43", "A44", "Defensa Benoni antigua"],
  ["A45", "A50", "Defensa India"],
  ["A51", "A52", "Gambito Budapest"],
  ["A53", "A55", "Defensa India antigua"],
  ["A56", "A56", "Defensa Benoni"],
  ["A57", "A59", "Gambito Benko"],
  ["A60", "A79", "Defensa Benoni moderna"],
  ["A80", "A99", "Defensa Holandesa"],
  ["B00", "B00", "Apertura de peón de rey"],
  ["B01", "B01", "Defensa Escandinava"],
  ["B02", "B05", "Defensa Alekhine"],
  ["B06", "B06", "Defensa Moderna"],
  ["B07", "B09", "Defensa Pirc"],
  ["B10", "B19", "Defensa Caro-Kann"],
  ["B20", "B99", "Defensa Siciliana"],
  ["C00", "C19", "Defensa Francesa"],
  ["C20", "C20", "Apertura de peón de rey"],
  ["C21", "C22", "Apertura del centro"],
  ["C23", "C24", "Apertura de alfil"],
  ["C25", "C29", "Apertura Vienesa"],
  ["C30", "C30", "Gambito de Rey"],
  ["C31", "C32", "Contragambito Falkbeer"],
  ["C33", "C39", "Gambito de Rey aceptado"],
  ["C40", "C40", "Apertura de caballo de rey"],
  ["C41", "C41", "Defensa Philidor"],
  ["C42", "C43", "Defensa Petrov"],
  ["C44", "C44", "Apertura de caballo de rey"],
  ["C45", "C45", "Apertura Escocesa"],
  ["C46", "C46", "Apertura de los tres caballos"],
  ["C47", "C49", "Apertura de los cuatro caballos"],
  ["C50", "C50", "Apertura Italiana"],
  ["C51", "C52", "Gambito Evans"],
  ["C53", "C54", "Apertura Italiana"],
  ["C55", "C59", "Defensa de los dos caballos"],
  ["C60", "C99", "Apertura Española"],
  ["D00", "D00", "Apertura de peón de dama"],
  ["D01", "D01", "Ataque Veresov"],
  ["D02", "D02", "Apertura de peón de dama"],
  ["D03", "D03", "Ataque Torre"],
  ["D04", "D05", "Sistema Colle"],
  ["D06", "D06", "Gambito de Dama"],
  ["D07", "D07", "Defensa Chigorin"],
  ["D08", "D09", "Contragambito Albin"],
  ["D10", "D19", "Defensa Eslava"],
  ["D20", "D29", "Gambito de Dama aceptado"],
  ["D30", "D31", "Gambito de Dama rehusado"],
  ["D32", "D34", "Defensa Tarrasch"],
  ["D35", "D39", "Gambito de Dama rehusado"],
  ["D40", "D42", "Defensa Semi-Tarrasch"],
  ["D43", "D49", "Defensa Semieslava"],
  ["D50", "D69", "Gambito de Dama rehusado"],
  ["D70", "D79", "Defensa Neogrünfeld"],
  ["D80", "D99", "Defensa Grünfeld"],
  ["E00", "E00", "Defensa India"],
  ["E01", "E09", "Apertura Catalana"],
  ["E10", "E10", "Defensa India"],
  ["E11", "E11", "Defensa Bogoindia"],
  ["E12", "E19", "Defensa India de Dama"],
  ["E20", "E59", "Defensa Nimzoindia"],
  ["E60", "E99", "Defensa India de Rey"],
];

/** A code as PGN headers write it: a letter from A to E and two digits. */
const ECO_CODE = /^[A-E]\d\d$/;

/**
 * The name of the opening an ECO code belongs to («D94» → «Defensa
 * Grünfeld»), or undefined for anything that is not one of the 500 codes —
 * a header left as «?», a typo. Case and surrounding spaces do not matter.
 */
export function openingOfEco(eco: string): string | undefined {
  const code = eco.trim().toUpperCase();
  if (!ECO_CODE.test(code)) return undefined;
  // The codes compare as strings because they all have the same shape.
  return ECO_RUNS.find(([from, to]) => from <= code && code <= to)?.[2];
}

/** The runs, for the test that checks they cover every code exactly once. */
export const ECO_OPENING_RUNS = ECO_RUNS;
