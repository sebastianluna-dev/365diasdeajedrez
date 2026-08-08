import { ChessBoard } from "@/components/sections/common/chess-board.comp";
import "./teacher-game.section.css";

const GAME_TITLE = "WIM Andrea Ortez — Sebastián Luna · Intercontinental Jorge Vega, 2026";
const GAME_TEXT =
  "Su mejor partida, con negras en una Caro-Kann, Ataque Panov. Neutraliza la presión central, transforma la posición en un final de torres y el rey negro cruza el tablero para decidir el encuentro.";
const FLIP_BOARD = true;
const GAME_MOVES =
  "e4 c6 d4 d5 exd5 cxd5 c4 Nf6 Nc3 Nc6 Bg5 e6 Nf3 Be7 c5 O-O a3 Ne4 Bf4 Nxc3 bxc3 b6 Bb5 Bd7 Qa4 Qc8 O-O bxc5 Qd1 Nxd4 Nxd4 cxd4 Bxd7 Qxd7 cxd4 Rfc8 Re1 Rc3 a4 a5 Rb1 Rc4 Rb5 Bb4 Re3 Rac8 Rb3 e5 Be3 exd4 Bf4 Qf5 g3 g5 Qh5 f6 Rb7 Qg6 Qf3 Qe4 Bb8 Rc3 Rxc3 Rxc3 Qxe4 dxe4 Rd7 Rc8 Ba7 d3 Be3 Ba3 Rd4 Bc1 Bxc1 Rxc1+ Kg2 Re1 g4 Kf7 h3 Ke6 f3 Ke5 Rd8 Kf4 fxe4 Ke3".split(
    " ",
  );

export function TeacherGameSection() {
  return (
    <section className="teacher-game">
      <div className="teacher-game__inner">
        <div className="teacher-game__intro">
          <h2 className="teacher-game__title">{GAME_TITLE}</h2>
          <p className="teacher-game__text">{GAME_TEXT}</p>
        </div>

        <ChessBoard moves={GAME_MOVES} flipBoard={FLIP_BOARD} />
      </div>
    </section>
  );
}
