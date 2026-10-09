import Link from "next/link";
import { EmptyState } from "@/components/platform/shared/empty-state/empty-state.comp";
import { PlatformForm, PlatformFormField } from "@/components/platform/shared/platform-form/platform-form.comp";
import { PlatformSelect } from "@/components/platform/shared/platform-select/platform-select.comp";
import { SubmitButton } from "@/components/platform/shared/submit-button/submit-button.comp";
import { PGN_MAX_LENGTH } from "@/constants/platform/content-limits.const";
import { platformRoutes } from "@/lib/platform-routes";
import { importPgnToStudy } from "@/services/studies/studies.actions";
import "./import-game.section.css";

interface ImportGameSectionProps {
  /** The person's own studies: where a game can go. */
  studies: { id: string; name: string }[];
}

/**
 * «Importar partida»: a pasted PGN — one game or several — straight into one
 * of the person's studies, the same import a study's own «Importar» runs,
 * ending on the first game that went in. Without a study of their own there
 * is nowhere to put it, and it says where to make one.
 */
export function ImportGameSection({ studies }: ImportGameSectionProps) {
  if (studies.length === 0) {
    return (
      <EmptyState
        title="Todavía no tienes estudios propios"
        description="Una partida importada entra en uno de tus estudios. Crea uno y vuelve aquí."
        actionLabel="Ir a Mis estudios"
        actionHref={platformRoutes.studies}
      />
    );
  }

  return (
    <PlatformForm action={importPgnToStudy} className="import-game">
      <PlatformFormField name="study" label="Estudio" messages={{ valueMissing: "Elige un estudio." }}>
        <PlatformSelect
          options={studies.map((study) => ({ value: study.id, label: study.name }))}
          defaultValue={studies[0]?.id}
          required
        />
      </PlatformFormField>
      <PlatformFormField
        name="pgn"
        label="PGN"
        hint="Una partida o varias, con sus variantes y comentarios."
        messages={{ valueMissing: "Pega el PGN de la partida." }}
      >
        <textarea rows={12} maxLength={PGN_MAX_LENGTH} required spellCheck={false} />
      </PlatformFormField>
      <footer className="import-game__foot">
        <Link href={platformRoutes.analysisBoard()} className="import-game__board">
          Sólo quiero analizarla
        </Link>
        <SubmitButton className="platform-button platform-button_variant_accent" pendingLabel="Importando…">
          Importar
        </SubmitButton>
      </footer>
    </PlatformForm>
  );
}
