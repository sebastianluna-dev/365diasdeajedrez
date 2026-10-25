import { CircleHalfStrokeIcon } from "@/components/icons/circle-half-stroke-icon.comp";
import { CircleInfoIcon } from "@/components/icons/circle-info-icon.comp";
import { ClockIcon } from "@/components/icons/clock-icon.comp";
import { FireIcon } from "@/components/icons/fire-icon.comp";
import { PenIcon } from "@/components/icons/pen-icon.comp";
import { UserIcon } from "@/components/icons/user-icon.comp";
import { PlatformForm, PlatformFormField } from "@/components/platform/shared/platform-form/platform-form.comp";
import { PlatformNotice } from "@/components/platform/shared/platform-notice/platform-notice.comp";
import { PlatformSelect } from "@/components/platform/shared/platform-select/platform-select.comp";
import {
  PlatformSideNav,
  type PlatformSideNavLink,
} from "@/components/platform/shared/platform-side-nav/platform-side-nav.comp";
import { SubmitButton } from "@/components/platform/shared/submit-button/submit-button.comp";
import { PLAY_ENABLED } from "@/constants/platform/features.const";
import { studentErrorMessage } from "@/constants/platform/student-messages.const";
import { USER_SLUG_MAX, USER_SLUG_MIN } from "@/constants/platform/user-slug.const";
import { federationOptions } from "@/lib/chess/federations";
import { GOAL_OPTIONS } from "@/constants/platform/study-goal.const";
import { mdButton, mdCard } from "@/lib/material/material-classes";
import { platformRoutes } from "@/lib/platform-routes";
import { setProfileDetails, setTheme, setUserSlug } from "@/services/account/account.actions";
import { updateDailyGoal } from "@/services/study-goal/study-goal.actions";
import type { AccountSettings } from "@/services/account/account.types";
import type { StudyGoal } from "@/services/study-goal/study-goal.types";
import { MaterialFields } from "./material-fields.comp";
import { ThemeArt } from "./theme-art.comp";
import "./account-settings.section.css";

/** The three answers to "which theme?", in the order they are offered. */
const THEME_CHOICES = [
  { value: "system", label: "El del sistema", note: "Sigue lo que tenga el aparato" },
  { value: "light", label: "Claro", note: "Siempre claro" },
  { value: "dark", label: "Oscuro", note: "Siempre oscuro" },
] as const;

/** The page's four cards, by the anchor each is at. */
const ANCHORS = { account: "cuenta", profile: "perfil", theme: "apariencia", goal: "objetivo" } as const;

interface AccountSettingsSectionProps {
  account: AccountSettings;
  /** Today's minutes against the goal: the same figures the home page shows (`getStudyGoal`). */
  goal: StudyGoal;
  /** What the person chose, if they chose; otherwise the machine decides. */
  theme?: "light" | "dark";
  /** What an action bounced back with, in `?error=`. */
  errorCode?: string;
}

/**
 * «Ajustes» in the new design system (2026-10-25, the owner's «Ajustes A ·
 * Todo a la vista»): every section open at once, four outlined cards in two
 * columns on the panel, and in the side column «Ver mi perfil» as the FAB
 * and the four cards as the anchors of «En esta página».
 *
 * Their details are shown and not edited — a name and an email are changed
 * by whoever runs the academy. What is theirs to set: the profile — the user
 * name that is its address, a status line and a flag (while «Jugar» is on)
 * —, the theme, and the daily goal, with today's minutes against it under
 * the select. The fields are Material's outlined ones (`MaterialFields`).
 */
export function AccountSettingsSection({ account, goal, theme, errorCode }: AccountSettingsSectionProps) {
  const chosen = theme ?? "system";
  const errorMessage = studentErrorMessage(errorCode);

  const anchors: PlatformSideNavLink[] = [
    { label: "Tu cuenta", href: `#${ANCHORS.account}`, icon: "user" },
    ...(PLAY_ENABLED ? [{ label: "Tu perfil", href: `#${ANCHORS.profile}`, icon: "pen" } as const] : []),
    { label: "Apariencia", href: `#${ANCHORS.theme}`, icon: "eye" },
    { label: "Objetivo diario", href: `#${ANCHORS.goal}`, icon: "clock" },
  ];

  return (
    <div className="platform-workspace account-settings">
      <div className="platform-workspace__side">
        <PlatformSideNav
          label="Secciones de ajustes"
          action={
            PLAY_ENABLED
              ? { label: "Ver mi perfil", href: platformRoutes.userProfile(account.slug), icon: "user" }
              : undefined
          }
          groups={[{ title: "En esta página", links: anchors }]}
        />
      </div>

      <div className="platform-workspace__panel account-settings__panel">
        <header className="account-settings__head">
          <h1 className="account-settings__heading">Ajustes</h1>
          <p className="account-settings__lead">Tu cuenta y cómo quieres estudiar.</p>
        </header>

        {errorMessage && <PlatformNotice message={errorMessage} />}

        <MaterialFields>
          <div className="account-settings__grid">
            <div className="account-settings__column">
              <section
                id={ANCHORS.account}
                className={`${mdCard("outlined")} account-settings__card`}
                aria-labelledby="account-settings-you"
              >
                <div className="account-settings__card-head">
                  <span className="account-settings__disc" aria-hidden="true">
                    <UserIcon variant="classic-solid" className="account-settings__disc-icon" />
                  </span>
                  <h2 id="account-settings-you" className="account-settings__title">
                    Tu cuenta
                  </h2>
                </div>

                <dl className="account-settings__facts">
                  <div className="account-settings__fact">
                    <dt className="account-settings__term">Nombre</dt>
                    <dd className="account-settings__value">{account.displayName}</dd>
                  </div>

                  <div className="account-settings__fact">
                    <dt className="account-settings__term">Correo</dt>
                    <dd className="account-settings__value">{account.email}</dd>
                  </div>

                  <div className="account-settings__fact">
                    <dt className="account-settings__term">En la academia desde</dt>
                    <dd className="account-settings__value">{account.memberSinceLabel}</dd>
                  </div>
                </dl>

                <p className="account-settings__note">
                  <CircleInfoIcon variant="classic-light" className="account-settings__note-icon" />
                  Para cambiar tu nombre o tu correo, escríbele a tu profesor.
                </p>
              </section>

              {PLAY_ENABLED && (
                <section
                  id={ANCHORS.profile}
                  className={`${mdCard("outlined")} account-settings__card`}
                  aria-labelledby="account-settings-profile"
                >
                  <div className="account-settings__card-head">
                    <span className="account-settings__disc" aria-hidden="true">
                      <PenIcon variant="classic-solid" className="account-settings__disc-icon" />
                    </span>
                    <h2 id="account-settings-profile" className="account-settings__title">
                      Tu perfil
                    </h2>
                  </div>

                  <PlatformForm
                    action={setUserSlug}
                    className="account-settings__form account-settings__form_layout_row"
                  >
                    <PlatformFormField
                      name="slug"
                      label="Nombre de usuario"
                      hint={`Tu perfil está en ${platformRoutes.userProfile(account.slug)}. Si lo cambias, la dirección anterior deja de funcionar.`}
                      messages={{
                        valueMissing: "Escribe un nombre de usuario.",
                        patternMismatch: "Sólo minúsculas, números y guiones, sin espacios ni acentos.",
                        tooShort: `Al menos ${USER_SLUG_MIN} caracteres.`,
                      }}
                    >
                      <input
                        type="text"
                        defaultValue={account.slug}
                        required
                        minLength={USER_SLUG_MIN}
                        maxLength={USER_SLUG_MAX}
                        pattern="[a-z0-9]+(-[a-z0-9]+)*"
                        autoComplete="username"
                        spellCheck={false}
                      />
                    </PlatformFormField>
                    <SubmitButton pendingLabel="Guardando…" className={mdButton("filled")}>
                      Guardar
                    </SubmitButton>
                  </PlatformForm>

                  <hr className="account-settings__split" />

                  <PlatformForm action={setProfileDetails} className="account-settings__form">
                    <PlatformFormField
                      name="statusLine"
                      label="Línea de estado"
                      hint="Lo que se lee bajo tu nombre en tu perfil."
                    >
                      <input type="text" defaultValue={account.statusLine ?? ""} maxLength={120} />
                    </PlatformFormField>
                    <div className="account-settings__row">
                      <PlatformFormField name="country" label="País">
                        <PlatformSelect
                          emptyOption="Sin bandera"
                          defaultValue={account.country ?? ""}
                          options={federationOptions().map((option) => ({ value: option.code, label: option.label }))}
                        />
                      </PlatformFormField>
                      <SubmitButton pendingLabel="Guardando…" className={mdButton("tonal")}>
                        Guardar
                      </SubmitButton>
                    </div>
                  </PlatformForm>
                </section>
              )}
            </div>

            <div className="account-settings__column">
              <section
                id={ANCHORS.theme}
                className={`${mdCard("outlined")} account-settings__card`}
                aria-labelledby="account-settings-theme"
              >
                <div className="account-settings__card-head">
                  <span className="account-settings__disc" aria-hidden="true">
                    <CircleHalfStrokeIcon variant="classic-solid" className="account-settings__disc-icon" />
                  </span>
                  <h2 id="account-settings-theme" className="account-settings__title">
                    Apariencia
                  </h2>
                </div>

                <p className="account-settings__note">
                  Cómo se ve la plataforma en este navegador. Cambia al instante.
                </p>

                {/* One form per answer, with the answer bound into the action:
                    no field travels that could be forged into something else,
                    and the whole thing works without JavaScript. What is
                    marked is what was CHOSEN — with «El del sistema» the theme
                    on screen is the machine's, which the server cannot know. */}
                <div className="account-settings__themes" role="group" aria-label="Tema de la plataforma">
                  {THEME_CHOICES.map((choice) => (
                    <form key={choice.value} action={setTheme.bind(null, choice.value)}>
                      <input type="hidden" name="returnTo" value={platformRoutes.settings} />
                      <button type="submit" aria-pressed={chosen === choice.value} className="account-settings__theme">
                        <ThemeArt scheme={choice.value} />
                        <span className="account-settings__theme-label">
                          <span className="account-settings__theme-mark" aria-hidden="true" />
                          {choice.label}
                        </span>
                        <span className="account-settings__theme-note">{choice.note}</span>
                      </button>
                    </form>
                  ))}
                </div>
              </section>

              <section
                id={ANCHORS.goal}
                className={`${mdCard("outlined")} account-settings__card`}
                aria-labelledby="account-settings-goal"
              >
                <div className="account-settings__card-head">
                  <span className="account-settings__disc account-settings__disc_tone_warning" aria-hidden="true">
                    <ClockIcon variant="classic-solid" className="account-settings__disc-icon" />
                  </span>
                  <h2 id="account-settings-goal" className="account-settings__title">
                    Objetivo diario
                  </h2>
                </div>

                <p className="account-settings__note">
                  Los minutos que quieres estudiar cada día. Es lo que mide la barra de tu racha.
                </p>

                <PlatformForm
                  action={updateDailyGoal}
                  className="account-settings__form account-settings__form_layout_row"
                >
                  {/* Where the action comes back to: this page, and not the
                      dashboard it was written for. */}
                  <input type="hidden" name="returnTo" value={platformRoutes.settings} />

                  <PlatformFormField name="goalMinutes" label="Minutos al día">
                    <PlatformSelect
                      defaultValue={String(account.goalMinutes)}
                      options={GOAL_OPTIONS.map((minutes) => ({ value: String(minutes), label: `${minutes} minutos` }))}
                    />
                  </PlatformFormField>

                  <SubmitButton className={mdButton("tonal")}>Guardar</SubmitButton>
                </PlatformForm>

                {/* Today against the goal, read as the home page reads it:
                    the lessons finished today, nothing stored. */}
                <div className="account-settings__today">
                  <FireIcon
                    variant="duotone-solid"
                    className="account-settings__flame"
                    coreClassName="account-settings__flame-core"
                  />
                  <span className="account-settings__today-text">
                    Hoy llevas{" "}
                    <strong>
                      {goal.minutesToday} de {goal.goalMinutes} min
                    </strong>
                  </span>
                  <span className="account-settings__meter" aria-hidden="true">
                    <span className="account-settings__meter-fill" style={{ width: `${goal.percent}%` }} />
                  </span>
                </div>
              </section>
            </div>
          </div>
        </MaterialFields>
      </div>
    </div>
  );
}
