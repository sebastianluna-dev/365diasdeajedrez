import { describe, expect, it } from "vitest";
import { EXERCISE_KIND } from "@/constants/platform/exercise-codes.const";
import { solutionPgnFromLine } from "@/lib/chess/exercise-format";
import { outcomeOf, playMove, readSolution, showSolution, startSolving } from "@/lib/chess/exercise-solver";
import { MATE_IN_ONE } from "./hero/mate-in-one.const";
import { demoRequestMessage, seatPriceMessage } from "./teachers-messages";

describe("the teachers' landing WhatsApp messages", () => {
  it("writes the demo request with the fields of the form", () => {
    expect(demoRequestMessage({ intent: "demo", name: "  Laura Méndez ", role: "club", students: "11 a 30" })).toBe(
      [
        "Hola, soy Laura Méndez, de un club de ajedrez.",
        "Quiero agendar una demo de Plataforma Ajedrez 365.",
        "Alumnos: 11 a 30.",
      ].join("\n"),
    );
  });

  it("says when it is the waiting list and not a demo", () => {
    expect(demoRequestMessage({ intent: "lista", name: "Diego", role: "profesor", students: "Más de 100" })).toContain(
      "Quiero unirme a la lista de espera de Plataforma Ajedrez 365.",
    );
  });

  it("asks for the price of the seats the calculator counted", () => {
    const message = seatPriceMessage(8, 10);
    expect(message).toContain("Tengo 18 alumnos activos: 8 en clases individuales y 10 en grupales.");
    expect(message).toContain("¿Cuánto costarían 18 asientos?");
    expect(seatPriceMessage(1, 0)).toContain("¿Cuánto costarían 1 asiento?");
  });
});

describe("the hero's mate in 1", () => {
  const solution = readSolution({
    solutionPgn: solutionPgnFromLine(MATE_IN_ONE.fen, [MATE_IN_ONE.solution]),
    kind: EXERCISE_KIND.MATE_IN,
    mateIn: 1,
    hints: [],
  });

  it("reads as an exercise and passes with the mate", () => {
    if (!solution) throw new Error("the sample does not read");
    const result = playMove(solution, startSolving(solution), "Rd8#");
    expect(result.kind).toBe("correct");
    if (result.kind === "correct") expect(outcomeOf(result.state).result).toBe("PASSED");
  });

  it("is decided as failed by the first wrong move, even if the mate follows", () => {
    if (!solution) throw new Error("the sample does not read");
    const wrong = playMove(solution, startSolving(solution), "Rd7");
    expect(wrong.kind).toBe("wrong");
    if (wrong.kind !== "wrong") return;
    const mate = playMove(solution, wrong.state, "Rd8#");
    expect(mate.kind).toBe("correct");
    if (mate.kind === "correct") expect(outcomeOf(mate.state).result).toBe("FAILED");
  });

  it("counts «Ver la solución» as failed", () => {
    if (!solution) throw new Error("the sample does not read");
    expect(outcomeOf(showSolution(solution, startSolving(solution)).state).result).toBe("FAILED");
  });
});
