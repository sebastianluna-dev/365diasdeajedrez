import Link from "next/link";
import Image from "next/image";
import { CalendarCheck } from "lucide-react";
import { EloTable } from "@/components/common/elo-table.comp";
import { ChessBoard } from "@/components/common/chess-board.comp";
import { TeacherStat } from "./teacher-stat.comp";
import "./teacher.section.css";

export function TeacherSection() {
  return (
    <section id="maestro">
      <div className="teacher">
        <div className="teacher__media">
          <Image
            className="teacher__photo"
            src="/design-import/assets/profesores/diego.jpg"
            alt="Sebastián Luna"
            width={1536}
            height={2048}
          />
          <div className="teacher__photo-overlay" />

          <div className="teacher__stats">
            <TeacherStat value="10+" label="Años jugando" />
            <TeacherStat value="3+" label="Como entrenador" />
            <TeacherStat value="20+" label="Alumnos formados" />
            <TeacherStat value="365" label="Método propio" />
            <TeacherStat value="8+" label="Torneos nacionales" />
          </div>
        </div>

        <div className="teacher__content">
          <span className="teacher__eyebrow">Hola, soy</span>
          <h1 className="teacher__name">Sebastian Luna</h1>
          <span className="teacher__badge">Maestro de la academia</span>
          <p className="teacher__summary">
            Mi pasión por el juego me ha llevado a buscar una comprensión profunda del ajedrez y, como maestro, disfruto
            compartir ese conocimiento para ayudar a mis alumnos a mejorar, ganar confianza y desarrollar su propio
            criterio frente al tablero.
          </p>

          <div className="teacher__stats teacher__stats_variant_mobile">
            <TeacherStat value="10+" label="Años jugando" />
            <TeacherStat value="3+" label="Como entrenador" />
            <TeacherStat value="20+" label="Alumnos formados" />
            <TeacherStat value="365" label="Método propio" />
            <TeacherStat value="8+" label="Torneos nacionales" />
          </div>

          <p className="teacher__elo-label">Clasificación Elo actual por modalidad de juego:</p>
          <EloTable className="teacher__elo-table" columns={4}>
            <EloTable.EloItem label="Estándar" value={1834} />
            <EloTable.EloItem label="Rápidas" value={1804} />
            <EloTable.EloItem label="Blitz" value={1798} />
            <EloTable.EloItem label="Chess.com" value={2200} />
          </EloTable>

          <div className="teacher__actions">
            <Link href="/#planes" className="button button_variant_primary">
              <CalendarCheck size={16} />
              Agenda tu primera clase
            </Link>
          </div>
        </div>
      </div>

      <div className="teacher-game">
        <div className="teacher-game__inner">
          <div className="teacher-game__intro">
            <h2 className="teacher-game__title">Descubre cómo juega el Maestro Sebastián</h2>
            <p className="teacher-game__text">
              Después de dos derrotas ante jugadores titulados, la tercera ronda del Intercontinental Jorge Vega 2026 me
              enfrentó con negras a la Maestra Internacional Andrea Ortiz, de 2024 de Elo.
            </p>
            <p className="teacher-game__text">
              En un Ataque Panov contra la Caro-Kann, conseguí neutralizar la iniciativa de las blancas, ganar material
              y simplificar hasta alcanzar un final con dos peones de ventaja. Manteniendo la concentración y jugando
              una posición a la vez, logré llevar la partida hasta una posición ganadora.
            </p>
            <p className="teacher-game__text">Andrea abandonó antes de la coronación.</p>
            <p className="teacher-game__text">
              Fue mi primera victoria contra un jugador titulado y contra un rival de más de 2000 de Elo. Una partida
              que marcó un punto de inflexión en mi torneo.
            </p>
          </div>

          <ChessBoard
            flipBoard
            moves={"e4 c6 d4 d5 exd5 cxd5 c4 Nf6 Nc3 Nc6 Bg5 e6 Nf3 Be7 c5 O-O a3 Ne4 Bf4 Nxc3 bxc3 b6 Bb5 Bd7 Qa4 Qc8 O-O bxc5 Qd1 Nxd4 Nxd4 cxd4 Bxd7 Qxd7 cxd4 Rfc8 Re1 Rc3 a4 a5 Rb1 Rc4 Rb5 Bb4 Re3 Rac8 Rb3 e5 Be3 exd4 Bf4 Qf5 g3 g5 Qh5 f6 Rb7 Qg6 Qf3 Qe4 Bb8 Rc3 Rxc3 Rxc3 Qxe4 dxe4 Rd7 Rc8 Ba7 d3 Be3 Ba3 Rd4 Bc1 Bxc1 Rxc1+ Kg2 Re1 g4 Kf7 h3 Ke6 f3 Ke5 Rd8 Kf4 fxe4 Ke3".split(
              " ",
            )}
            annotations={{
              "8b": "book",
              "9b": "best",
              "10w": "inaccuracy",
              "10b": "best",
              "11b": "best",
              "13w": "mistake",
              "13b": "best",
              "14b": "best",
              "15b": "brilliant",
              "16w": "best",
              "16b": "best",
              "18b": "best",
              "22w": "mistake",
              "23b": "best",
              "24b": "great",
              "26b": "best",
              "27w": "best",
              "27b": "best",
              "28w": "best",
              "28b": "best",
              "29w": "best",
              "29b": "best",
              "31w": "mistake",
              "31b": "best",
              "36b": "best",
              "37b": "great",
            }}
          />
        </div>
      </div>
    </section>
  );
}
