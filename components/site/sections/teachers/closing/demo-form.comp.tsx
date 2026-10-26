"use client";

import { useId, useState, type FormEvent } from "react";
import { ArrowRotateLeftIcon } from "@/components/icons/arrow-rotate-left-icon.comp";
import { CalendarIcon } from "@/components/icons/calendar-icon.comp";
import { ChalkboardUserIcon } from "@/components/icons/chalkboard-user-icon.comp";
import { CheckIcon } from "@/components/icons/check-icon.comp";
import { GraduationCapIcon } from "@/components/icons/graduation-cap-icon.comp";
import { UsersIcon } from "@/components/icons/users-icon.comp";
import { WhatsappIcon } from "@/components/icons/whatsapp-icon.comp";
import { buildWhatsappUrl } from "@/lib/build-whatsapp-url";
import {
  DEMO_ROLES,
  DEMO_STUDENT_RANGES,
  demoRequestMessage,
  type DemoIntent,
  type DemoRole,
  type DemoStudentRange,
} from "../teachers-messages";
import { mdButton } from "@/lib/material/material-classes";
import "./demo-form.comp.css";

const ROLE_ICONS = { profesor: ChalkboardUserIcon, club: UsersIcon, escuela: GraduationCapIcon } as const;

interface DemoFormProps {
  /** The academy's WhatsApp, country code first (`site-settings`). */
  whatsappNumber: string;
}

interface Sent {
  intent: DemoIntent;
  firstName: string;
  url: string;
}

/**
 * «Agenda una demo» and «Únete a la lista de espera» (the owner's «Cierre A»).
 * There is no lead backend: the form writes its fields into a WhatsApp
 * message and opens WhatsApp with it, and it says so before and after. The
 * two submit buttons say which of the two the message asks for.
 */
export function DemoForm({ whatsappNumber }: DemoFormProps) {
  const id = useId();
  const [sent, setSent] = useState<Sent | null>(null);
  const [name, setName] = useState("");
  const [role, setRole] = useState<DemoRole>("profesor");
  const [students, setStudents] = useState<DemoStudentRange>("1 a 10");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const submitter = (event.nativeEvent as SubmitEvent).submitter;
    const intent: DemoIntent = submitter?.getAttribute("value") === "lista" ? "lista" : "demo";
    const url = buildWhatsappUrl(whatsappNumber, demoRequestMessage({ intent, name, role, students }));
    window.open(url, "_blank", "noopener");
    setSent({ intent, firstName: name.trim().split(/\s+/)[0] ?? "", url });
  }

  if (sent) {
    return (
      <div className="demo-form demo-form_state_sent" role="status">
        <span className="demo-form__done-icon-wrap">
          <CheckIcon className="demo-form__done-icon" variant="classic-solid" />
        </span>
        <strong className="demo-form__done-title">¡Listo{sent.firstName ? `, ${sent.firstName}` : ""}!</strong>
        <p className="demo-form__done-text">
          {sent.intent === "lista"
            ? "Abrimos WhatsApp con tu mensaje para la lista de espera. Envíalo y te escribimos cuando abramos para ti."
            : "Abrimos WhatsApp con tu mensaje. Envíalo y te escribimos para elegir el día de tu demo."}
        </p>
        <div className="demo-form__done-actions">
          <a className={mdButton("filled", "sm")} href={sent.url} target="_blank" rel="noopener noreferrer">
            <WhatsappIcon className="site-md-icon" />
            Abrir WhatsApp otra vez
          </a>
          <button type="button" className={mdButton("text", "sm")} onClick={() => setSent(null)}>
            <ArrowRotateLeftIcon className="site-md-icon" variant="classic-solid" />
            Cambiar mis datos
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="demo-form">
      <h3 className="demo-form__title">Tus datos</h3>
      <form className="demo-form__form" onSubmit={handleSubmit}>
        <div className="demo-form__field">
          <label className="demo-form__label" htmlFor={`${id}-name`}>
            Nombre
          </label>
          <input
            className="demo-form__input"
            id={`${id}-name`}
            name="nombre"
            type="text"
            required
            autoComplete="name"
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
        </div>
        <fieldset className="demo-form__group">
          <legend className="demo-form__label">Eres</legend>
          <div className="demo-form__cards">
            {DEMO_ROLES.map((entry) => {
              const Icon = ROLE_ICONS[entry.value];
              return (
                <label key={entry.value} className="demo-form__card">
                  <input
                    className="demo-form__radio"
                    type="radio"
                    name="tipo"
                    value={entry.value}
                    checked={role === entry.value}
                    onChange={() => setRole(entry.value)}
                  />
                  <Icon className="demo-form__card-icon" />
                  {entry.label}
                </label>
              );
            })}
          </div>
        </fieldset>
        <fieldset className="demo-form__group">
          <legend className="demo-form__label">¿Cuántos alumnos tienes?</legend>
          <div className="demo-form__pills">
            {DEMO_STUDENT_RANGES.map((range) => (
              <label key={range} className="demo-form__pill">
                <input
                  className="demo-form__radio"
                  type="radio"
                  name="alumnos"
                  value={range}
                  checked={students === range}
                  onChange={() => setStudents(range)}
                />
                {range}
              </label>
            ))}
          </div>
        </fieldset>
        <p className="demo-form__note">
          <WhatsappIcon className="demo-form__note-icon" />
          Se abre WhatsApp con tu mensaje, listo para enviar: así te contestamos.
        </p>
        <div className="demo-form__actions">
          <button type="submit" className={mdButton("filled", "md")} name="intencion" value="demo">
            <CalendarIcon className="site-md-icon" variant="classic-solid" />
            Agenda una demo
          </button>
          <button type="submit" className={mdButton("text", "md")} name="intencion" value="lista">
            o únete a la lista de espera
          </button>
        </div>
      </form>
    </div>
  );
}
