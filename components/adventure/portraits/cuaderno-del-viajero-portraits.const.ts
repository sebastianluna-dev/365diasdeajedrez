import type { ComponentType } from "react";
import { DonChemaPortrait } from "./don-chema-portrait.comp";
import { ChayoRiosPortrait } from "./chayo-rios-portrait.comp";
import { ProfeLealPortrait } from "./profe-leal-portrait.comp";
import { TonitoGarzaPortrait } from "./tonito-garza-portrait.comp";
import { AnselmoQuirogaPortrait } from "./anselmo-quiroga-portrait.comp";
import { InesCardenasPortrait } from "./ines-cardenas-portrait.comp";
import { DonaCucaPortrait } from "./dona-cuca-portrait.comp";
import { CapitanOlmoPortrait } from "./capitan-olmo-portrait.comp";
import { MaestroIbarraPortrait } from "./maestro-ibarra-portrait.comp";
import { LaCondesaPortrait } from "./la-condesa-portrait.comp";
import { ValeriaSotoPortrait } from "./valeria-soto-portrait.comp";
import { JulianEsparzaPortrait } from "./julian-esparza-portrait.comp";

// Original artwork drawn for this project (the version-2 mockup of proposal B, «El
// cuaderno del viajero»), exported by scripts/adventure-art.ts: edit the mockup
// and run `npm run adventure:art` again instead of editing this file by hand.

/** The portraits of «cuaderno-del-viajero»'s rivals by the rival's slug; each draws inside a 100 x 112 box. */
export const CUADERNO_DEL_VIAJERO_PORTRAITS: Readonly<Record<string, ComponentType>> = {
  "don-chema": DonChemaPortrait,
  "chayo-rios": ChayoRiosPortrait,
  "profe-leal": ProfeLealPortrait,
  "tonito-garza": TonitoGarzaPortrait,
  "anselmo-quiroga": AnselmoQuirogaPortrait,
  "ines-cardenas": InesCardenasPortrait,
  "dona-cuca": DonaCucaPortrait,
  "capitan-olmo": CapitanOlmoPortrait,
  "maestro-ibarra": MaestroIbarraPortrait,
  "la-condesa": LaCondesaPortrait,
  "valeria-soto": ValeriaSotoPortrait,
  "julian-esparza": JulianEsparzaPortrait,
};
