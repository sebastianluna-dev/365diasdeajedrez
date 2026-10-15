import { describe, expect, it } from "vitest";
import { CLASSES_NOW, CLASSES_TIME_ZONE, cdmx } from "@/lib/testing/fixtures/classes";
import { buildClassHistory, type ClassHistoryInput } from "./class-history";

const zone = CLASSES_TIME_ZONE;

const EMPTY: ClassHistoryInput = {
  createdAt: cdmx("2026-10-12", "18:05"),
  createdByName: "Staff Demo",
  seats: [],
  reschedule: null,
  cancel: null,
  close: null,
  changes: [],
  moves: [],
};

describe("buildClassHistory", () => {
  it("dice quién creó la clase y a quién agregó, en una línea por tanda", () => {
    const added = cdmx("2026-10-12", "18:05");
    const history = buildClassHistory(
      {
        ...EMPTY,
        seats: [
          {
            studentName: "Alumno Demo",
            addedAt: added,
            addedByName: "Staff Demo",
            paymentLabel: "pago del jue 1 oct",
            isFree: false,
          },
          {
            studentName: "Mateo Ríos",
            addedAt: added,
            addedByName: "Staff Demo",
            paymentLabel: "pago del lun 12 oct",
            isFree: false,
          },
          { studentName: "Diego Salas", addedAt: added, addedByName: "Staff Demo", paymentLabel: null, isFree: false },
          {
            studentName: "Lucía Herrera",
            addedAt: cdmx("2026-10-13", "09:00"),
            addedByName: "Staff Demo",
            paymentLabel: null,
            isFree: false,
          },
        ],
      },
      zone,
      CLASSES_NOW,
    );
    expect(history.map((entry) => `${entry.stamp} · ${entry.text}`)).toEqual([
      "lun 12 oct, 18:05 · Staff Demo creó la clase",
      "lun 12 oct, 18:05 · Staff Demo agregó a Alumno Demo, Mateo Ríos y Diego Salas",
      "mar 13 oct, 09:00 · Staff Demo agregó a Lucía Herrera",
    ]);
  });

  it("una sola plaza al crear se dice con la creación, según su cobertura", () => {
    const seat = (paymentLabel: string | null, isFree: boolean) =>
      buildClassHistory(
        {
          ...EMPTY,
          createdAt: cdmx("2026-09-15", "10:20"),
          seats: [
            {
              studentName: "Valentina Cruz",
              addedAt: cdmx("2026-09-15", "10:20"),
              addedByName: "Staff Demo",
              paymentLabel,
              isFree,
            },
          ],
        },
        zone,
        CLASSES_NOW,
      )[0]?.text;
    expect(seat("pago del mar 15 sep", false)).toBe(
      "Staff Demo creó la clase con el pago del mar 15 sep de Valentina Cruz",
    );
    expect(seat(null, true)).toBe("Staff Demo creó la clase gratis para Valentina Cruz");
    expect(seat(null, false)).toBe("Staff Demo creó la clase para Valentina Cruz, sin pago");
  });

  it("ordena el cierre, los cambios, las reprogramaciones y la cancelación por su momento", () => {
    const history = buildClassHistory(
      {
        ...EMPTY,
        createdAt: cdmx("2026-09-15", "10:20"),
        createdByName: null,
        close: {
          at: cdmx("2026-10-14", "20:12"),
          byName: "GM Profesor Demo",
          marks: [{ studentName: "Valentina Cruz", attended: false }],
        },
        changes: [
          {
            at: cdmx("2026-10-15", "10:05"),
            byName: "Staff Demo",
            studentName: "Valentina Cruz",
            from: false,
            to: true,
            reason: "Estuvo conectada; se le cayó el audio.",
            isOverride: true,
          },
        ],
        reschedule: {
          at: cdmx("2026-10-01", "09:00"),
          byName: "Staff Demo",
          previous: cdmx("2026-10-13", "19:00"),
          current: cdmx("2026-10-14", "19:00"),
          note: "Pidió moverla",
        },
        moves: [
          {
            at: cdmx("2026-10-16", "08:00"),
            byName: "Staff Demo",
            studentName: "Valentina Cruz",
            toStart: cdmx("2026-10-16", "19:00"),
          },
          { at: cdmx("2026-10-17", "08:00"), byName: null, studentName: "Diego Salas", toStart: null },
        ],
        cancel: { at: cdmx("2026-10-18", "08:00"), byName: "Staff Demo", reason: "Enfermedad" },
      },
      zone,
      CLASSES_NOW,
    );
    expect(history.map((entry) => entry.text)).toEqual([
      "Administración creó la clase",
      "Staff Demo reprogramó la clase del mar 13 oct al mié 14 oct · «Pidió moverla»",
      "GM Profesor Demo finalizó la clase · Valentina Cruz: faltó",
      "Staff Demo cambió la asistencia de Valentina Cruz: «Faltó» → «Asistió» · «Estuvo conectada; se le cayó el audio.»",
      "Staff Demo reprogramó la clase de Valentina Cruz al vie 16 oct",
      "Administración devolvió la clase de Diego Salas a su pago",
      "Staff Demo canceló la clase · «Enfermedad»",
    ]);
    expect(history[2]?.stamp).toBe("mié 14 oct, 20:12");
    expect(history[0]?.atIso).toBe(cdmx("2026-09-15", "10:20").toISOString());
  });
});
