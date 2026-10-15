import { z } from "zod";
import { CLASS_DURATIONS } from "@/constants/platform/class-slots.const";
import { CURRENCY } from "@/constants/platform/currency-codes.const";
import { STUDY_DAY_TIMEZONE } from "@/constants/platform/timezones.const";
import { dayKeyIn } from "@/lib/timezone";
import { slotInstant } from "@/services/shared/class-schedule-rules";
import { formCode, formInt, formOptionalText, formOptionalUrl, formText } from "@/services/shared/form-schema";
import type { FieldError } from "@/services/shared/form-state";
import { planPaymentSeats } from "@/services/shared/payment-seats";

// Reading the «Registrar pago» and «Editar pago» forms: the payment's own
// fields, the classes it covers right away, and the rows of classes to date
// (`slot.<i>.*`). Pure: receives `now`, and gives field errors by name with
// the codes of CLASS_FIELD_ERRORS.

const CURRENCY_CODES = Object.values(CURRENCY) as [string, ...string[]];
const AMOUNT = /^\d{1,8}(?:\.\d{1,2})?$/;
const DATE = /^\d{4}-\d{2}-\d{2}$/;
const TIME = /^\d{2}:\d{2}$/;

const PAYMENT_SCHEMA = z.object({
  amount: z.string().trim().regex(AMOUNT),
  currency: formCode(CURRENCY_CODES),
  paidOn: z.string().trim().regex(DATE),
  classCount: formInt(1, 50),
  reference: formOptionalText(120),
  note: formOptionalText(500),
});

const REGISTER_SCHEMA = PAYMENT_SCHEMA.extend({
  studentId: formText(64),
  when: z.enum(["now", "later"]),
  meetingUrl: formOptionalUrl(2000),
});

export type PaymentSlot =
  | { kind: "dated"; teacherId: string; date: string; time: string; durationMin: number; scheduledAt: Date }
  | { kind: "group"; classId: string }
  | { kind: "later" };

export interface PaymentFields {
  amount: string;
  currency: string;
  paidOn: string;
  classCount: number;
  reference: string | null;
  note: string | null;
}

export interface RegisterPaymentForm extends PaymentFields {
  studentId: string;
  when: "now" | "later";
  meetingUrl: string | null;
  /** Ids of the «Sin pago» classes the payment covers. */
  cover: string[];
  slots: PaymentSlot[];
  /** How many classes have a date (covered, dated and group) and how many stay to schedule. */
  dated: number;
  later: number;
}

export type FormRead<T> = { ok: true; data: T } | { ok: false; fieldErrors: Record<string, FieldError> };

/** The errors of the payment's own fields, by the field the schema refused. */
function fieldErrorOf(field: string): FieldError {
  const codes: Record<string, string> = {
    amount: "amount",
    classCount: "classCount",
    paidOn: "invalid",
    currency: "invalid",
    studentId: "invalid",
    meetingUrl: "invalid",
  };
  return { code: codes[field] ?? "invalid" };
}

function readZod<S extends z.ZodObject>(schema: S, formData: FormData): FormRead<z.output<S>> {
  const raw: Record<string, unknown> = {};
  for (const key of Object.keys(schema.shape)) {
    const value = formData.get(key);
    raw[key] = typeof value === "string" ? value : undefined;
  }
  const parsed = schema.safeParse(raw);
  if (parsed.success) return { ok: true, data: parsed.data };
  const fieldErrors: Record<string, FieldError> = {};
  for (const issue of parsed.error.issues) {
    const field = String(issue.path[0] ?? "");
    if (field && !fieldErrors[field]) fieldErrors[field] = fieldErrorOf(field);
  }
  return { ok: false, fieldErrors };
}

/** The payment's own fields, as «Editar pago» sends them. */
export function readPaymentFields(formData: FormData, now: Date): FormRead<PaymentFields> {
  const read = readZod(PAYMENT_SCHEMA, formData);
  if (!read.ok) return read;
  if (Number(read.data.amount) <= 0) return { ok: false, fieldErrors: { amount: { code: "amount" } } };
  if (read.data.paidOn > dayKeyIn(now, STUDY_DAY_TIMEZONE)) {
    return { ok: false, fieldErrors: { paidOn: { code: "paidOnFuture" } } };
  }
  return { ok: true, data: read.data };
}

/** The rows `slot.<i>.kind` …, read until a missing index. */
function readSlots(formData: FormData): FormRead<PaymentSlot[]> {
  const slots: PaymentSlot[] = [];
  const fieldErrors: Record<string, FieldError> = {};
  for (let index = 0; index < 50; index += 1) {
    const kind = formData.get(`slot.${index}.kind`);
    if (typeof kind !== "string") break;
    const at = (name: string) => {
      const value = formData.get(`slot.${index}.${name}`);
      return typeof value === "string" ? value.trim() : "";
    };
    if (kind === "later") {
      slots.push({ kind: "later" });
    } else if (kind === "group") {
      const classId = at("classId");
      if (!classId) fieldErrors[`slot.${index}`] = { code: "invalid" };
      else slots.push({ kind: "group", classId });
    } else if (kind === "dated") {
      const teacherId = at("teacherId");
      const date = at("date");
      const time = at("time");
      const durationMin = Number(at("duration"));
      const scheduledAt = DATE.test(date) && TIME.test(time) ? slotInstant(date, time, STUDY_DAY_TIMEZONE) : null;
      if (!teacherId || !scheduledAt || !Number.isInteger(durationMin) || durationMin < 15 || durationMin > 480) {
        fieldErrors[`slot.${index}`] = { code: "invalid" };
      } else {
        slots.push({ kind: "dated", teacherId, date, time, durationMin, scheduledAt });
      }
    } else {
      fieldErrors[`slot.${index}`] = { code: "invalid" };
    }
  }
  if (Object.keys(fieldErrors).length > 0) return { ok: false, fieldErrors };
  return { ok: true, data: slots };
}

/** «Registrar pago», whole: the payment, what it covers now, and its classes. */
export function readRegisterPaymentForm(formData: FormData, now: Date): FormRead<RegisterPaymentForm> {
  const read = readZod(REGISTER_SCHEMA, formData);
  if (!read.ok) return read;
  const fields = readPaymentFields(formData, now);
  if (!fields.ok) return fields;

  const cover = [...new Set(formData.getAll("cover").filter((value): value is string => typeof value === "string"))];
  const slotsRead =
    read.data.when === "now" ? readSlots(formData) : ({ ok: true, data: [] } as FormRead<PaymentSlot[]>);
  if (!slotsRead.ok) return slotsRead;
  const slots = slotsRead.data;

  const dated = slots.filter((slot) => slot.kind === "dated").length;
  const group = slots.filter((slot) => slot.kind === "group").length;
  const plan = planPaymentSeats({ classCount: read.data.classCount, covered: cover.length, dated, group });
  if (!plan.ok) {
    return { ok: false, fieldErrors: { classCount: { code: "tooManySeats", args: { total: plan.total } } } };
  }

  return {
    ok: true,
    data: {
      ...fields.data,
      studentId: read.data.studentId,
      when: read.data.when,
      meetingUrl: read.data.meetingUrl,
      cover,
      slots,
      dated: cover.length + dated + group,
      later: plan.later,
    },
  };
}

export const PAYMENT_DURATIONS: readonly number[] = CLASS_DURATIONS;
