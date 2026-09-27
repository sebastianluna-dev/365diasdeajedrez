import { describe, expect, it } from "vitest";
import { entityFieldLabel } from "./source-rules";

describe("entityFieldLabel", () => {
  it("un libro tiene editorial, un curso digital plataforma, lo demás entidad de origen", () => {
    expect(entityFieldLabel("BOOK")).toBe("Editorial");
    expect(entityFieldLabel("DIGITAL_COURSE")).toBe("Plataforma o proveedor");
    expect(entityFieldLabel("VIDEO")).toBe("Entidad de origen");
    expect(entityFieldLabel("OWN_MATERIAL")).toBe("Entidad de origen");
    expect(entityFieldLabel("")).toBe("Entidad de origen");
  });
});
