import Link from "next/link";
import "./reading-list.comp.css";

const highlights = [
  "Cómo organizar tu entrenamiento de ajedrez",
  "Siete patrones que debes reconocer de inmediato",
  "Cómo estudiar una partida de gran maestro sin motor",
];

export function ReadingList() {
  return (
    <div className="reading-list">
      <h4 className="reading-list__title">Lo más leído</h4>
      {highlights.map((item, index) => (
        <Link key={item} href="#" className="reading-list__link">
          <span className="reading-list__index">{String(index + 1).padStart(2, "0")}</span>
          <span className="reading-list__label">{item}</span>
        </Link>
      ))}
    </div>
  );
}
