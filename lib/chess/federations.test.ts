import { describe, expect, it } from "vitest";
import { federationFlag, federationName, federationOptions } from "./federations";

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

describe("federationName", () => {
  it("da el nombre del país en castellano", () => {
    expect(federationName("MEX")).toBe("México");
    expect(federationName("GER")).toBe("Alemania");
    // El que se traduciría mal copiando las tres letras a ciegas.
    expect(federationName("CHI")).toBe("Chile");
  });

  it("no se inventa nada con un código que no conoce", () => {
    expect(federationName("XYZ")).toBeNull();
    expect(federationName(null)).toBeNull();
  });
});

describe("federationOptions", () => {
  const options = federationOptions();

  it("lleva el país y su código, ordenados por nombre", () => {
    expect(options.find((option) => option.code === "MEX")?.label).toBe("México (MEX)");

    // El orden NO depende de los datos de idioma del entorno: se compara sin
    // acentos, para que el servidor y el navegador pinten la misma lista.
    const keys = options.map((option) =>
      option.label
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toUpperCase(),
    );
    expect(keys).toEqual([...keys].sort());
  });

  it("ofrece todas las federaciones de la tabla, sin repetir", () => {
    expect(options.length).toBeGreaterThan(80);
    expect(new Set(options.map((option) => option.code)).size).toBe(options.length);
  });
});
