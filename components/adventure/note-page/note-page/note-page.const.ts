/** The strip of washi tape that holds each zone's page, by the zone's slug: the colour of its place. */
export const PAGE_TAPES: Readonly<Record<string, string>> = {
  plaza: "rgb(143 125 195 / 0.7)",
  club: "rgb(201 128 90 / 0.72)",
  biblioteca: "rgb(150 168 130 / 0.75)",
  malecon: "rgb(111 159 172 / 0.72)",
  hotel: "rgb(169 143 154 / 0.75)",
  palacio: "rgb(212 164 64 / 0.72)",
};

/** The tape of a zone this list does not know. */
export const DEFAULT_PAGE_TAPE = "rgb(159 174 137 / 0.75)";
