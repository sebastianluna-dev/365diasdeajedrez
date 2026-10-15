import Link from "next/link";
import { LockIcon } from "@/components/icons/lock-icon.comp";
import { UserCheckIcon } from "@/components/icons/user-check-icon.comp";
import { UserXmarkIcon } from "@/components/icons/user-xmark-icon.comp";
import { PlayerAvatar } from "@/components/chess/player-avatar/player-avatar.comp";
import { PlatformChoiceCards } from "@/components/platform/shared/platform-choice-cards/platform-choice-cards.comp";
import { PlatformFormGroup } from "@/components/platform/shared/platform-form/platform-form.comp";
import { avatarToneOf, initialsOf } from "@/lib/avatar-tone";
import type { AttendanceMarkView, AttendanceStudent } from "./attendance-row.types";
import "./attendance-row.comp.css";

interface AttendanceRowProps {
  student: AttendanceStudent;
  /** Lines under the name: the email, how the seat is covered. */
  details?: string[];
  mark: AttendanceMarkView;
  /**
   * `edit`: «Asistió» and «Faltó» as cards, nothing chosen until the reader
   * marks (finalizing, changing one's own marks). `read`: the mark as it
   * stands, with who wrote it. A locked or moved seat reads even in `edit`.
   */
  mode: "read" | "edit";
  /** The field's name in `edit`; `attendance.<student id>` by default. */
  name?: string;
  defaultValue?: "yes" | "no";
  serverError?: string;
}

/**
 * One student of a class and their attendance: the initials, the name and
 * its details, and the mark — to write, as two cards in a line inside a
 * group that says whom it is about when nothing was chosen, or to read, as
 * a tag with the lines that say who marked and who changed. A Server
 * Component with no reads of its own, so it also sits inside the finalizing
 * popup.
 */
export function AttendanceRow({
  student,
  details = [],
  mark,
  mode,
  name,
  defaultValue,
  serverError,
}: AttendanceRowProps) {
  const editing = mode === "edit" && !mark.locked && !mark.moved;
  const avatar = {
    initials: initialsOf(student.displayName),
    tone: avatarToneOf(student.id),
    ring: "NONE" as const,
    country: null,
  };

  return (
    <div className={`attendance-row${editing ? " attendance-row_mode_edit" : ""}`}>
      <PlayerAvatar {...avatar} size="sm" />
      {editing ? (
        <PlatformFormGroup
          label={student.displayName}
          hint={details.length > 0 ? details.join(" · ") : undefined}
          serverError={serverError}
          valueMissing={`Marca si ${student.displayName} asistió o faltó.`}
        >
          <PlatformChoiceCards
            name={name ?? `attendance.${student.id}`}
            layout="line"
            required
            defaultValue={defaultValue}
            options={[
              { value: "yes", label: "Asistió" },
              { value: "no", label: "Faltó" },
            ]}
          />
        </PlatformFormGroup>
      ) : (
        <>
          <div className="attendance-row__who">
            <span className="attendance-row__name">{student.displayName}</span>
            {details.map((line) => (
              <span key={line} className="attendance-row__detail">
                {line}
              </span>
            ))}
            {mark.replacesLabel && <span className="attendance-row__detail">{mark.replacesLabel}</span>}
          </div>
          <div className="attendance-row__mark">
            {mark.moved ? (
              mark.moved.href ? (
                <Link href={mark.moved.href} className="platform-tag attendance-row__moved">
                  {mark.moved.label}
                </Link>
              ) : (
                <span className="platform-tag">{mark.moved.label}</span>
              )
            ) : mark.attended === null ? (
              <span className="platform-tag">Sin pasar lista</span>
            ) : mark.attended ? (
              <span className="platform-tag platform-tag_variant_success">
                <UserCheckIcon variant="classic-solid" className="platform-tag__icon" />
                Asistió
              </span>
            ) : (
              <span className="platform-tag">
                <UserXmarkIcon variant="classic-solid" className="platform-tag__icon" />
                Faltó
              </span>
            )}
            {mark.markedLine && <span className="attendance-row__line">{mark.markedLine}</span>}
            {mark.changedLine && (
              <span className="attendance-row__line attendance-row__line_kind_changed">
                {mark.locked && <LockIcon variant="classic-solid" className="attendance-row__lock" />}
                {mark.changedLine}
              </span>
            )}
          </div>
        </>
      )}
    </div>
  );
}
