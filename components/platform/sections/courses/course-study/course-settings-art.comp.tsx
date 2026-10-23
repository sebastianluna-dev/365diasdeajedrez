import "./course-settings-art.comp.css";

/** What a drawing shows: one per option of the course's settings. */
export type CourseSettingsArtKind =
  "all-lessons" | "priority-lessons" | "course-info" | "reset-course" | "reset-chapter" | "remove-course";

interface CourseSettingsArtProps {
  kind: CourseSettingsArtKind;
}

/** A star, on its own row of the list. */
const star = (y: number) => `M14 ${y}l1.2 2.4 2.6.4-1.9 1.8.5 2.6-2.4-1.3-2.4 1.3.5-2.6-1.9-1.8 2.6-.4z`;

/**
 * The drawing at the right of each option of the course's settings
 * (2026-10-23, after Gmail's thumbnails): a small loop that shows what the
 * option does before it is chosen — every lesson walked, the others fading
 * so only the starred stay, the course's page writing itself, the bars
 * emptying, a course leaving the shelf. An illustration, not an icon: drawn
 * here by hand, in the platform's Material roles, and hidden from screen
 * readers, since the option's words say the same. Still under
 * `prefers-reduced-motion`.
 */
export function CourseSettingsArt({ kind }: CourseSettingsArtProps) {
  return (
    <svg className="course-settings-art" width="96" height="60" viewBox="0 0 96 60" aria-hidden="true">
      {kind === "all-lessons" && (
        <>
          <rect
            className="course-settings-art__mark course-settings-art__walk"
            x="4"
            y="6"
            width="88"
            height="12"
            rx="6"
          />
          {[12, 24, 36, 48].map((y, index) => (
            <g key={y}>
              <circle className="course-settings-art__dot" cx="14" cy={y} r="3" />
              <rect
                className="course-settings-art__line"
                x="22"
                y={y - 2}
                width={[54, 44, 58, 40][index]}
                height="4"
                rx="2"
              />
            </g>
          ))}
        </>
      )}

      {kind === "priority-lessons" && (
        <>
          <rect
            className="course-settings-art__mark course-settings-art__mark_tone_star course-settings-art__hop"
            x="4"
            y="18"
            width="88"
            height="12"
            rx="6"
          />
          <g className="course-settings-art__fade">
            <circle className="course-settings-art__dot course-settings-art__dot_tone_muted" cx="14" cy="12" r="3" />
            <rect className="course-settings-art__line" x="22" y="10" width="54" height="4" rx="2" />
          </g>
          <path className="course-settings-art__star" d={star(20.5)} />
          <rect
            className="course-settings-art__line course-settings-art__line_tone_ink"
            x="22"
            y="22"
            width="44"
            height="4"
            rx="2"
          />
          <g className="course-settings-art__fade">
            <circle className="course-settings-art__dot course-settings-art__dot_tone_muted" cx="14" cy="36" r="3" />
            <rect className="course-settings-art__line" x="22" y="34" width="58" height="4" rx="2" />
          </g>
          <path className="course-settings-art__star" d={star(44.5)} />
          <rect
            className="course-settings-art__line course-settings-art__line_tone_ink"
            x="22"
            y="46"
            width="40"
            height="4"
            rx="2"
          />
        </>
      )}

      {kind === "course-info" && (
        <>
          <rect className="course-settings-art__cover" x="8" y="8" width="28" height="44" rx="4" />
          <rect
            className="course-settings-art__line course-settings-art__line_tone_ink course-settings-art__write"
            x="44"
            y="12"
            width="40"
            height="5"
            rx="2.5"
          />
          <rect
            className="course-settings-art__line course-settings-art__write course-settings-art__write_step_2"
            x="44"
            y="24"
            width="32"
            height="4"
            rx="2"
          />
          <rect
            className="course-settings-art__line course-settings-art__write course-settings-art__write_step_3"
            x="44"
            y="34"
            width="36"
            height="4"
            rx="2"
          />
          <rect
            className="course-settings-art__line course-settings-art__line_tone_faint course-settings-art__write course-settings-art__write_step_3"
            x="44"
            y="44"
            width="22"
            height="4"
            rx="2"
          />
        </>
      )}

      {kind === "reset-course" && (
        <>
          {[12, 27, 42].map((y) => (
            <rect key={y} className="course-settings-art__track" x="8" y={y} width="80" height="6" rx="3" />
          ))}
          <rect
            className="course-settings-art__bar course-settings-art__bar_tone_done course-settings-art__empty"
            x="8"
            y="12"
            width="80"
            height="6"
            rx="3"
          />
          <rect
            className="course-settings-art__bar course-settings-art__empty"
            x="8"
            y="27"
            width="30"
            height="6"
            rx="3"
          />
        </>
      )}

      {kind === "reset-chapter" && (
        <>
          <rect className="course-settings-art__track" x="8" y="12" width="80" height="6" rx="3" />
          <rect
            className="course-settings-art__bar course-settings-art__bar_tone_done"
            x="8"
            y="12"
            width="80"
            height="6"
            rx="3"
          />
          <rect className="course-settings-art__track" x="8" y="27" width="80" height="6" rx="3" />
          <rect
            className="course-settings-art__bar course-settings-art__empty"
            x="8"
            y="27"
            width="46"
            height="6"
            rx="3"
          />
          <rect className="course-settings-art__track" x="8" y="42" width="80" height="6" rx="3" />
        </>
      )}

      {kind === "remove-course" && (
        <>
          <rect className="course-settings-art__card" x="8" y="16" width="22" height="28" rx="4" />
          <rect
            className="course-settings-art__card course-settings-art__card_tone_leaving course-settings-art__leave"
            x="37"
            y="16"
            width="22"
            height="28"
            rx="4"
          />
          <rect
            className="course-settings-art__card course-settings-art__card_tone_plain course-settings-art__close"
            x="66"
            y="16"
            width="22"
            height="28"
            rx="4"
          />
        </>
      )}
    </svg>
  );
}
