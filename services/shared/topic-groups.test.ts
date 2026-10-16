import { describe, expect, it } from "vitest";
import { topicCardGroups } from "./topic-groups";

describe("topicCardGroups", () => {
  it("pone primero los temas sin padre y después cada padre con sus hijos bajo su nombre", () => {
    const result = topicCardGroups([
      { code: "TACTICS", label: "Táctica", parentCode: null },
      { code: "ENDGAME", label: "Finales", parentCode: null },
      { code: "FORK", label: "Ataque doble", parentCode: "TACTICS" },
      { code: "PIN", label: "Clavada", parentCode: "TACTICS" },
    ]);
    expect(result.options).toEqual([
      { value: "TACTICS", label: "Táctica" },
      { value: "ENDGAME", label: "Finales" },
    ]);
    expect(result.groups).toEqual([
      {
        label: "Táctica",
        options: [
          { value: "FORK", label: "Ataque doble" },
          { value: "PIN", label: "Clavada" },
        ],
      },
    ]);
  });

  it("no pierde un hijo cuyo padre no está en la lista: va con los de primer nivel", () => {
    const result = topicCardGroups([{ code: "FORK", label: "Ataque doble", parentCode: "TACTICS" }]);
    expect(result.options).toEqual([{ value: "FORK", label: "Ataque doble" }]);
    expect(result.groups).toEqual([]);
  });
});
