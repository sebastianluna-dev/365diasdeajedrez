// Chess federations: from the PGN code to its flag.
//
// FIDE uses the three-letter Olympic code, which is NOT ISO-3166 alpha-3 and
// differs in quite a few countries: CHI is Chile (not China, which is CHN),
// SUI is Switzerland, GER Germany, NED the Netherlands, LAT Latvia.
// Translating blindly would give the wrong flags, so the table is explicit.
//
// Most active federations are here, not all: whatever is missing goes without
// a flag and shows its code, which is still the real data.

interface Federation {
  /** ISO-3166 alpha-2, from which the flag is composed. */
  iso: string;
  /** Name in Spanish, so the federation can be chosen by its country. */
  name: string;
}

const FEDERATIONS: Record<string, Federation> = {
  ALG: { iso: "DZ", name: "Argelia" },
  ARG: { iso: "AR", name: "Argentina" },
  ARM: { iso: "AM", name: "Armenia" },
  AUS: { iso: "AU", name: "Australia" },
  AUT: { iso: "AT", name: "Austria" },
  AZE: { iso: "AZ", name: "Azerbaiyán" },
  BAN: { iso: "BD", name: "Bangladés" },
  BEL: { iso: "BE", name: "Bélgica" },
  BIH: { iso: "BA", name: "Bosnia y Herzegovina" },
  BLR: { iso: "BY", name: "Bielorrusia" },
  BOL: { iso: "BO", name: "Bolivia" },
  BRA: { iso: "BR", name: "Brasil" },
  BUL: { iso: "BG", name: "Bulgaria" },
  CAN: { iso: "CA", name: "Canadá" },
  CHI: { iso: "CL", name: "Chile" },
  CHN: { iso: "CN", name: "China" },
  COL: { iso: "CO", name: "Colombia" },
  CRC: { iso: "CR", name: "Costa Rica" },
  CRO: { iso: "HR", name: "Croacia" },
  CUB: { iso: "CU", name: "Cuba" },
  CYP: { iso: "CY", name: "Chipre" },
  CZE: { iso: "CZ", name: "Chequia" },
  DEN: { iso: "DK", name: "Dinamarca" },
  DOM: { iso: "DO", name: "República Dominicana" },
  ECU: { iso: "EC", name: "Ecuador" },
  EGY: { iso: "EG", name: "Egipto" },
  ESA: { iso: "SV", name: "El Salvador" },
  ESP: { iso: "ES", name: "España" },
  EST: { iso: "EE", name: "Estonia" },
  ETH: { iso: "ET", name: "Etiopía" },
  FIN: { iso: "FI", name: "Finlandia" },
  FRA: { iso: "FR", name: "Francia" },
  GEO: { iso: "GE", name: "Georgia" },
  GER: { iso: "DE", name: "Alemania" },
  GRE: { iso: "GR", name: "Grecia" },
  GUA: { iso: "GT", name: "Guatemala" },
  HKG: { iso: "HK", name: "Hong Kong" },
  HON: { iso: "HN", name: "Honduras" },
  HUN: { iso: "HU", name: "Hungría" },
  INA: { iso: "ID", name: "Indonesia" },
  IND: { iso: "IN", name: "India" },
  IRI: { iso: "IR", name: "Irán" },
  IRL: { iso: "IE", name: "Irlanda" },
  IRQ: { iso: "IQ", name: "Irak" },
  ISL: { iso: "IS", name: "Islandia" },
  ISR: { iso: "IL", name: "Israel" },
  ITA: { iso: "IT", name: "Italia" },
  JPN: { iso: "JP", name: "Japón" },
  KAZ: { iso: "KZ", name: "Kazajistán" },
  KEN: { iso: "KE", name: "Kenia" },
  KGZ: { iso: "KG", name: "Kirguistán" },
  KOR: { iso: "KR", name: "Corea del Sur" },
  KSA: { iso: "SA", name: "Arabia Saudí" },
  KUW: { iso: "KW", name: "Kuwait" },
  LAT: { iso: "LV", name: "Letonia" },
  LBN: { iso: "LB", name: "Líbano" },
  LTU: { iso: "LT", name: "Lituania" },
  LUX: { iso: "LU", name: "Luxemburgo" },
  MAR: { iso: "MA", name: "Marruecos" },
  MAS: { iso: "MY", name: "Malasia" },
  MDA: { iso: "MD", name: "Moldavia" },
  MEX: { iso: "MX", name: "México" },
  MGL: { iso: "MN", name: "Mongolia" },
  MKD: { iso: "MK", name: "Macedonia del Norte" },
  MNE: { iso: "ME", name: "Montenegro" },
  MYA: { iso: "MM", name: "Myanmar" },
  NED: { iso: "NL", name: "Países Bajos" },
  NGR: { iso: "NG", name: "Nigeria" },
  NOR: { iso: "NO", name: "Noruega" },
  NZL: { iso: "NZ", name: "Nueva Zelanda" },
  PAN: { iso: "PA", name: "Panamá" },
  PAR: { iso: "PY", name: "Paraguay" },
  PER: { iso: "PE", name: "Perú" },
  PHI: { iso: "PH", name: "Filipinas" },
  POL: { iso: "PL", name: "Polonia" },
  POR: { iso: "PT", name: "Portugal" },
  PUR: { iso: "PR", name: "Puerto Rico" },
  QAT: { iso: "QA", name: "Catar" },
  ROU: { iso: "RO", name: "Rumanía" },
  RSA: { iso: "ZA", name: "Sudáfrica" },
  RUS: { iso: "RU", name: "Rusia" },
  SGP: { iso: "SG", name: "Singapur" },
  SLO: { iso: "SI", name: "Eslovenia" },
  SRB: { iso: "RS", name: "Serbia" },
  SUI: { iso: "CH", name: "Suiza" },
  SVK: { iso: "SK", name: "Eslovaquia" },
  SWE: { iso: "SE", name: "Suecia" },
  SYR: { iso: "SY", name: "Siria" },
  THA: { iso: "TH", name: "Tailandia" },
  TUN: { iso: "TN", name: "Túnez" },
  TUR: { iso: "TR", name: "Turquía" },
  UAE: { iso: "AE", name: "Emiratos Árabes Unidos" },
  UKR: { iso: "UA", name: "Ucrania" },
  URU: { iso: "UY", name: "Uruguay" },
  USA: { iso: "US", name: "Estados Unidos" },
  UZB: { iso: "UZ", name: "Uzbekistán" },
  VEN: { iso: "VE", name: "Venezuela" },
  VIE: { iso: "VN", name: "Vietnam" },
  ZAM: { iso: "ZM", name: "Zambia" },
  ZIM: { iso: "ZW", name: "Zimbabue" },
};

/**
 * Flag of a federation, or `null` if it is not in the table.
 *
 * The emoji is composed from the two regional indicators of the ISO code: there
 * is no list of flags to maintain, only the mapping above.
 */
export function federationFlag(code: string | null | undefined): string | null {
  if (!code) return null;
  const iso = FEDERATIONS[code.trim().toUpperCase()]?.iso;
  if (!iso) return null;

  const REGIONAL_INDICATOR_A = 0x1f1e6;
  const LETTER_A = 65;
  return String.fromCodePoint(
    ...[...iso].map((letter) => REGIONAL_INDICATOR_A + letter.charCodeAt(0) - LETTER_A),
  );
}

/** FIDE titles that are accepted; anything else is stored as is. */
export const FIDE_TITLES = ["GM", "IM", "FM", "CM", "WGM", "WIM", "WFM", "WCM"] as const;

/** What each title is called, so it can be chosen without knowing the acronyms. */
export const FIDE_TITLE_LABELS: Record<string, string> = {
  GM: "Gran Maestro",
  IM: "Maestro Internacional",
  FM: "Maestro FIDE",
  CM: "Maestro Candidato",
  WGM: "Gran Maestra",
  WIM: "Maestra Internacional",
  WFM: "Maestra FIDE",
  WCM: "Maestra Candidata",
};

/**
 * Country name of a federation, or null if the code is not in the table.
 *
 * The names are written here and do NOT come from `Intl.DisplayNames`: Node's
 * locale data and the browser's are not the same — "Hong Kong" in one, "RAE de
 * Hong Kong (China)" in the other — and with the list sorted by name that
 * changed the order of the options between server and client, breaking
 * hydration. Besides, this way what each country is called in the product is a
 * choice instead of being inherited from whichever ICU version is around.
 */
export function federationName(code: string | null | undefined): string | null {
  if (!code) return null;
  return FEDERATIONS[code.trim().toUpperCase()]?.name ?? null;
}

export interface FederationOption {
  code: string;
  label: string;
}

let cachedOptions: FederationOption[] | null = null;

/**
 * Sort key without accents or capitals.
 *
 * Sorting uses this and not `localeCompare`, which consults the environment's
 * collation data: since this listing is rendered on the server and hydrated in
 * the browser, the order has to come out the same in both even if they have
 * different ICU versions.
 */
function sortKey(label: string): string {
  return label
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toUpperCase();
}

/**
 * The federations for a dropdown, in alphabetical order of country.
 *
 * Sorted by NAME and not by code because that is what is read: nobody looks for
 * "NED" among the Ns, they look for "Países Bajos" among the Ps.
 */
export function federationOptions(): FederationOption[] {
  if (cachedOptions) return cachedOptions;

  cachedOptions = Object.keys(FEDERATIONS)
    .map((code) => ({ code, label: `${federationName(code) ?? code} (${code})`, key: "" }))
    .map((option) => ({ ...option, key: sortKey(option.label) }))
    .sort((a, b) => (a.key < b.key ? -1 : a.key > b.key ? 1 : 0))
    .map(({ code, label }) => ({ code, label }));

  return cachedOptions;
}
