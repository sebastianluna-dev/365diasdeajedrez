import { PlatformSparkline } from "@/components/platform/shared/platform-sparkline/platform-sparkline.comp";
import "./platform-big-number.comp.css";

interface PlatformBigNumberProps {
  /** What the figure is: «Racha de estudio», «Nivel contra bots». */
  label: string;
  /** The figure; null when there is none yet, drawn as a dash (the note says why). */
  value: number | null;
  /** Decimals to show: the integer part is large, the decimals go small and grey with the unit. */
  fractionDigits?: number;
  /** Before the figure, small and grey: «≈». */
  prefix?: string;
  /** After it, small and grey: «días», «%», «min». */
  unit?: string;
  /** A line under it: where it comes from, or what it is against. */
  note?: string;
  /** `lg` the figure of a sheet (44px), `md` one inside a block (32px). */
  size?: "md" | "lg";
  /** A mini line at its right, of the figure's own series. */
  trend?: { values: readonly number[]; label: string };
}

/**
 * A big thin figure (2026-10-25, the owner's «Gráficas del perfil», chart 6):
 * the label over it, the integer large in tabular figures, the decimals and
 * the unit small and grey, a note under it, and optionally its own series as
 * a sparkline at the right. A number in Spanish as Mexico writes it, with a
 * point for the decimals.
 */
export function PlatformBigNumber({
  label,
  value,
  fractionDigits = 0,
  prefix,
  unit,
  note,
  size = "lg",
  trend,
}: PlatformBigNumberProps) {
  const [whole, decimals] = value === null ? ["—", undefined] : value.toFixed(fractionDigits).split(".");
  const tail = [decimals !== undefined ? `.${decimals}` : "", unit ? ` ${unit}` : ""].join("");

  return (
    <div className={`platform-big-number platform-big-number_size_${size}`}>
      <p className="platform-big-number__label">{label}</p>
      <div className="platform-big-number__row">
        <p className="platform-big-number__figure">
          {prefix && <span className="platform-big-number__prefix">{prefix}</span>}
          {whole}
          {value !== null && tail && <span className="platform-big-number__tail">{tail}</span>}
        </p>
        {trend && <PlatformSparkline values={trend.values} label={trend.label} />}
      </div>
      {note && <p className="platform-big-number__note">{note}</p>}
    </div>
  );
}
