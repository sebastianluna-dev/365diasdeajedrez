import { PlatformNotice } from "@/components/platform/shared/platform-notice/platform-notice.comp";
import { PlatformSelect } from "@/components/platform/shared/platform-select/platform-select.comp";
import { SubmitButton } from "@/components/platform/shared/submit-button.comp";
import { studentErrorMessage } from "@/constants/platform/student-messages.const";
import { GOAL_OPTIONS } from "@/constants/platform/study-goal.const";
import { platformRoutes } from "@/lib/platform-routes";
import { setTheme } from "@/services/account/account.actions";
import { updateDailyGoal } from "@/services/study-goal/study-goal.actions";
import type { AccountSettings } from "@/services/account/account.types";
import "./account-settings.section.css";

/** The three answers to "which theme?", in the order they are offered. */
const THEME_CHOICES = [
  { value: "system", label: "El del sistema", note: "Sigue lo que tenga el aparato" },
  { value: "light", label: "Claro", note: "Siempre claro" },
  { value: "dark", label: "Oscuro", note: "Siempre oscuro" },
] as const;

interface AccountSettingsSectionProps {
  account: AccountSettings;
  /** What the person chose, if they chose; otherwise the machine decides. */
  theme?: "light" | "dark";
  /** What `updateDailyGoal` bounced back with, in `?error=`. */
  errorCode?: string;
}

/**
 * «Ajustes»: what is the person's own and what they can decide.
 *
 * Their details are shown and not edited — a name and an email are changed by
 * whoever runs the academy — and the one thing that is theirs to set is the
 * daily goal, the same one the dashboard offers beside the streak. It is the
 * same action either way, and each page says where to come back to.
 */
export function AccountSettingsSection({ account, theme, errorCode }: AccountSettingsSectionProps) {
  const chosen = theme ?? "system";
  const errorMessage = studentErrorMessage(errorCode);

  return (
    <div className="account-settings">
      {errorMessage && <PlatformNotice message={errorMessage} />}

      <section className="account-settings__card" aria-labelledby="account-settings-you">
        <h2 id="account-settings-you" className="account-settings__title">
          Tu cuenta
        </h2>

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

        <p className="account-settings__note">Para cambiar tu nombre o tu correo, escríbele a tu profesor.</p>
      </section>

      <section className="account-settings__card" aria-labelledby="account-settings-theme">
        <h2 id="account-settings-theme" className="account-settings__title">
          Apariencia
        </h2>

        <p className="account-settings__note">
          Cómo se ve la plataforma. «El del sistema» cambia contigo cuando tu aparato pasa a modo oscuro.
        </p>

        {/* One form per answer, with the answer bound into the action: no
            field travels that could be forged into something else, and the
            whole thing works without JavaScript. What is marked is what was
            CHOSEN — with «El del sistema» the theme on screen is the
            machine's, which the server cannot know. */}
        <div className="account-settings__themes" role="group" aria-label="Tema de la plataforma">
          {THEME_CHOICES.map((choice) => (
            <form key={choice.value} action={setTheme.bind(null, choice.value)}>
              <input type="hidden" name="returnTo" value={platformRoutes.settings} />
              <button type="submit" aria-pressed={chosen === choice.value} className="account-settings__theme">
                <span className="account-settings__theme-label">{choice.label}</span>
                <span className="account-settings__theme-note">{choice.note}</span>
              </button>
            </form>
          ))}
        </div>
      </section>

      <section className="account-settings__card" aria-labelledby="account-settings-goal">
        <h2 id="account-settings-goal" className="account-settings__title">
          Objetivo diario
        </h2>

        <p className="account-settings__note">
          Los minutos que quieres estudiar cada día. Es lo que mide la barra de tu racha.
        </p>

        <form action={updateDailyGoal} className="account-settings__form">
          {/* Where the action comes back to: this page, and not the dashboard
              it was written for. */}
          <input type="hidden" name="returnTo" value={platformRoutes.settings} />

          <label className="account-settings__field">
            <span className="account-settings__field-label">Minutos al día</span>
            <PlatformSelect
              name="goalMinutes"
              defaultValue={String(account.goalMinutes)}
              options={GOAL_OPTIONS.map((minutes) => ({ value: String(minutes), label: `${minutes} minutos` }))}
              size="compact"
            />
          </label>

          <SubmitButton>Guardar</SubmitButton>
        </form>
      </section>
    </div>
  );
}
