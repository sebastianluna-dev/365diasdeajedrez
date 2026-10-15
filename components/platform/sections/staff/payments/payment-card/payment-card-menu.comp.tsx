"use client";

import { useRef } from "react";
import { PlatformActionsMenu } from "@/components/platform/shared/platform-actions-menu/platform-actions-menu.comp";
import {
  PlatformConfirmPopup,
  type PlatformConfirmPopupHandle,
} from "@/components/platform/shared/platform-confirm-popup/platform-confirm-popup.comp";
import {
  RegisterPaymentPopup,
  type RegisterPaymentPopupHandle,
  type RegisterPaymentPopupProps,
} from "@/components/platform/shared/register-payment-popup/register-payment-popup.comp";
import type { StaffPaymentView } from "@/services/staff-payments/staff-payments.types";

interface PaymentCardMenuProps {
  payment: StaffPaymentView;
  studentName: string;
  /** The edit popup's inputs, the same the head's «Registrar pago» gets. */
  popup: Omit<RegisterPaymentPopupProps, "ref" | "payment" | "fixedStudent" | "students">;
  deletePayment: (formData: FormData) => Promise<void>;
}

/**
 * The «…» of a payment's card: «Editar pago», which opens the payment's own
 * fields in the register popup, and «Eliminar pago», which asks first and is
 * greyed with its reason once a class of the payment was given. Both popups
 * are siblings of the menu, never inside it.
 */
export function PaymentCardMenu({ payment, studentName, popup, deletePayment }: PaymentCardMenuProps) {
  const edit = useRef<RegisterPaymentPopupHandle>(null);
  const confirm = useRef<PlatformConfirmPopupHandle>(null);
  const unpaid = payment.seatsLeftUnpaid;

  return (
    <>
      <PlatformActionsMenu
        label={`Acciones del pago del ${payment.paidOnLabel}`}
        items={[
          { label: "Editar pago", onSelect: () => edit.current?.open() },
          {
            label: "Eliminar pago",
            tone: "danger",
            disabled: !payment.canDelete,
            reason: payment.deleteReason,
            onSelect: () => confirm.current?.open(),
          },
        ]}
      />
      <RegisterPaymentPopup ref={edit} payment={payment} {...popup} />
      <PlatformConfirmPopup
        ref={confirm}
        verb="Eliminar"
        subject={`pago del ${payment.paidOnLabel}`}
        title={`¿Eliminar el pago del ${payment.paidOnLabel}?`}
        description={`Se elimina el pago de ${payment.amountLabel} de ${studentName}.`}
        consequences={
          unpaid > 0
            ? [
                `${unpaid} clase${unpaid === 1 ? "" : "s"} con fecha se queda${unpaid === 1 ? "" : "n"} «Sin pago» hasta que registres otro.`,
              ]
            : ["Ninguna clase tenía fecha con este pago."]
        }
        action={deletePayment}
        confirmLabel="Eliminar pago"
      />
    </>
  );
}
