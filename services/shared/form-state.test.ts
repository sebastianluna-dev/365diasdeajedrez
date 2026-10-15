import { describe, expect, it } from "vitest";
import { POPUP_FORM_IDLE, popupFormDone, popupFormError, readFormValues } from "./form-state";

describe("readFormValues", () => {
  it("devuelve lo enviado por nombre, una cadena o la lista cuando el nombre se repite", () => {
    const form = new FormData();
    form.set("amount", "1400");
    form.append("studentIds", "a");
    form.append("studentIds", "b");
    form.set("password", "secreta");
    expect(readFormValues(form, ["amount", "studentIds", "missing"])).toEqual({
      amount: "1400",
      studentIds: ["a", "b"],
    });
  });

  it("nunca devuelve lo que no se le pide", () => {
    const form = new FormData();
    form.set("password", "secreta");
    expect(readFormValues(form, ["amount"])).toEqual({});
  });
});

describe("the states", () => {
  it("idle, error with what was sent, done with its notice", () => {
    expect(POPUP_FORM_IDLE).toEqual({ status: "idle" });
    expect(popupFormError({ amount: { code: "amount" } }, { amount: "" })).toEqual({
      status: "error",
      fieldErrors: { amount: { code: "amount" } },
      values: { amount: "" },
    });
    expect(popupFormError({}, undefined, { code: "throttled" })).toEqual({
      status: "error",
      fieldErrors: {},
      formError: { code: "throttled" },
    });
    expect(popupFormDone("paymentRegistered", [4, 3, 1])).toEqual({
      status: "done",
      notice: { code: "paymentRegistered", args: [4, 3, 1] },
    });
  });
});
