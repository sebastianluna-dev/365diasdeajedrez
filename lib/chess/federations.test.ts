import { describe, expect, it } from "vitest";
import { federationFlag } from "./federations";

describe("federationFlag", () => {
  it("compone la bandera desde el código de la federación", () => {
    expect(federationFlag("MEX")).toBe("🇲🇽");
    expect(federationFlag("USA")).toBe("🇺🇸");
    expect(federationFlag("ARG")).toBe("🇦🇷");
  });

  it("acierta donde el código FIDE NO es el ISO alfa-3", () => {
    // Los que se traducirían mal copiando las tres letras a ciegas.
    expect(federationFlag("CHI")).toBe("🇨🇱"); // Chile, no China
    expect(federationFlag("CHN")).toBe("🇨🇳");
    expect(federationFlag("SUI")).toBe("🇨🇭"); // Suiza
    expect(federationFlag("GER")).toBe("🇩🇪");
    expect(federationFlag("NED")).toBe("🇳🇱");
    expect(federationFlag("LAT")).toBe("🇱🇻"); // Letonia
    expect(federationFlag("IRI")).toBe("🇮🇷"); // Irán
  });

  it("no se inventa una bandera cuando no conoce el código", () => {
    expect(federationFlag("XYZ")).toBeNull();
    expect(federationFlag("")).toBeNull();
    expect(federationFlag(null)).toBeNull();
    expect(federationFlag(undefined)).toBeNull();
  });

  it("tolera espacios y minúsculas", () => {
    expect(federationFlag(" mex ")).toBe("🇲🇽");
  });
});
