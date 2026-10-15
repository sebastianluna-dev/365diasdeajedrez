import { describe, expect, it } from "vitest";
import { CLASSES_NOW, cdmx } from "@/lib/testing/fixtures/classes";
import { readPaymentFields, readRegisterPaymentForm } from "./payment-form";

function form(entries: Record<string, string | string[]>): FormData {
  const data = new FormData();
  for (const [key, value] of Object.entries(entries)) {
    for (const item of Array.isArray(value) ? value : [value]) data.append(key, item);
  }
  return data;
}

const base = {
  studentId: "u-valentina",
  amount: "1400.00",
  currency: "MXN",
  paidOn: "2026-10-14",
  classCount: "4",
  reference: "Transferencia 9120",
  note: "",
  when: "now",
  meetingUrl: "",
};

describe("readRegisterPaymentForm", () => {
  it("lee el pago, las clases que cubre y sus filas, y cuenta las fechadas y las que quedan", () => {
    const read = readRegisterPaymentForm(
      form({
        ...base,
        cover: ["c-unpaid"],
        "slot.0.kind": "dated",
        "slot.0.teacherId": "t-1",
        "slot.0.date": "2026-10-21",
        "slot.0.time": "19:00",
        "slot.0.duration": "60",
        "slot.1.kind": "group",
        "slot.1.classId": "c-group",
        "slot.2.kind": "later",
      }),
      CLASSES_NOW,
    );
    expect(read.ok).toBe(true);
    if (!read.ok) return;
    expect(read.data).toMatchObject({
      studentId: "u-valentina",
      amount: "1400.00",
      currency: "MXN",
      paidOn: "2026-10-14",
      classCount: 4,
      reference: "Transferencia 9120",
      note: null,
      meetingUrl: null,
      cover: ["c-unpaid"],
      dated: 3,
      later: 1,
    });
    expect(read.data.slots[0]).toMatchObject({ kind: "dated", scheduledAt: cdmx("2026-10-21", "19:00") });
    expect(read.data.slots[1]).toEqual({ kind: "group", classId: "c-group" });
  });

  it("rechaza más clases con fecha y cubiertas que las que paga, con el total", () => {
    const read = readRegisterPaymentForm(
      form({
        ...base,
        classCount: "1",
        cover: ["a"],
        "slot.0.kind": "group",
        "slot.0.classId": "b",
      }),
      CLASSES_NOW,
    );
    expect(read).toEqual({ ok: false, fieldErrors: { classCount: { code: "tooManySeats", args: { total: 2 } } } });
  });

  it("«Dejarlas por programar» ignora las filas", () => {
    const read = readRegisterPaymentForm(form({ ...base, when: "later", "slot.0.kind": "dated" }), CLASSES_NOW);
    expect(read.ok && read.data).toMatchObject({ slots: [], dated: 0, later: 4 });
  });

  it("una fila incompleta es un error de esa fila", () => {
    const read = readRegisterPaymentForm(
      form({ ...base, "slot.0.kind": "dated", "slot.0.teacherId": "t-1", "slot.0.date": "2026-10-21" }),
      CLASSES_NOW,
    );
    expect(read).toEqual({ ok: false, fieldErrors: { "slot.0": { code: "invalid" } } });
  });
});

describe("readPaymentFields", () => {
  it("el importe es positivo con dos decimales, y la fecha nunca futura en la academia", () => {
    expect(readPaymentFields(form({ ...base, amount: "0" }), CLASSES_NOW)).toEqual({
      ok: false,
      fieldErrors: { amount: { code: "amount" } },
    });
    expect(readPaymentFields(form({ ...base, amount: "12.345" }), CLASSES_NOW)).toEqual({
      ok: false,
      fieldErrors: { amount: { code: "amount" } },
    });
    expect(readPaymentFields(form({ ...base, paidOn: "2026-10-15" }), CLASSES_NOW)).toEqual({
      ok: false,
      fieldErrors: { paidOn: { code: "paidOnFuture" } },
    });
    expect(readPaymentFields(form({ ...base, classCount: "51" }), CLASSES_NOW)).toEqual({
      ok: false,
      fieldErrors: { classCount: { code: "classCount" } },
    });
    expect(readPaymentFields(form(base), CLASSES_NOW)).toMatchObject({ ok: true, data: { classCount: 4 } });
  });
});
