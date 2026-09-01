// Curso «Piense como un gran maestro»: el método de trabajo de Alexander Kotov
// llevado a la plataforma.
//
// SOBRE LAS FUENTES. El curso sigue el itinerario del libro homónimo de Kotov
// y usa las partidas magistrales que él eligió para ilustrarlo. Las jugadas de
// una partida son un hecho y se pueden citar libremente; el texto del libro no,
// así que TODOS los comentarios de estas lecciones están redactados para la
// academia y ninguno reproduce la prosa del original. Al añadir lecciones,
// mantener esa regla: partidas del libro, palabras nuestras.
//
// Fichero aparte de seed-data.ts porque es el curso más grande de la
// plataforma y allí no cabría sin sepultar el resto.

import { COURSE_STATUS, COURSE_TYPE, INITIAL_POSITION_TYPE, LEVEL, PRESENTATION_MODE } from "../../constants/platform/course-codes.const";
import { BOARD_ORIENTATION, OWNER_TYPE, TOPIC } from "../../constants/platform/shared-codes.const";
import { DATABASE_KIND, GAME_RESULT, GAME_SOURCE } from "../../constants/platform/study-codes.const";
import type { SeedCourse } from "../seed-data";

/** Ids fijos, en rangos propios para no chocar con los de seed-data.ts. */
export const GM_IDS = {
  course: "c0000000-0000-4000-8000-000000000003",

  chAnalysis: "c1000000-0000-4000-8000-000000000010",
  chJudgement: "c1000000-0000-4000-8000-000000000011",
  chPlanning: "c1000000-0000-4000-8000-000000000012",
  chEndgame: "c1000000-0000-4000-8000-000000000013",
  chPreparation: "c1000000-0000-4000-8000-000000000014",

  lsTree: "d0000000-0000-4000-8000-000000000010",
  lsBranchOnce: "d0000000-0000-4000-8000-000000000011",
  lsCandidates: "d0000000-0000-4000-8000-000000000012",
  lsGrove: "d0000000-0000-4000-8000-000000000013",
  lsQuietMoves: "d0000000-0000-4000-8000-000000000014",
  lsBlumenfeld: "d0000000-0000-4000-8000-000000000015",

  lsOpenFiles: "d0000000-0000-4000-8000-000000000020",
  lsSeventhRank: "d0000000-0000-4000-8000-000000000021",
  lsWeakSquares: "d0000000-0000-4000-8000-000000000022",
  lsColourComplex: "d0000000-0000-4000-8000-000000000023",
  lsBadKnight: "d0000000-0000-4000-8000-000000000024",
  lsPieceHarmony: "d0000000-0000-4000-8000-000000000025",

  lsSinglePlan: "d0000000-0000-4000-8000-000000000030",
  lsNoPlan: "d0000000-0000-4000-8000-000000000031",
  lsChangePlan: "d0000000-0000-4000-8000-000000000032",
  lsCentreTypes: "d0000000-0000-4000-8000-000000000033",

  lsKingToCentre: "d0000000-0000-4000-8000-000000000040",
  lsActiveRook: "d0000000-0000-4000-8000-000000000041",
  lsWhatToTrade: "d0000000-0000-4000-8000-000000000042",

  lsKeyPositions: "d0000000-0000-4000-8000-000000000050",
  lsTypicalMiddlegame: "d0000000-0000-4000-8000-000000000051",
  lsSelfReview: "d0000000-0000-4000-8000-000000000052",

} as const;

// ---------------------------------------------------------------------------
// Capítulo 1 — Análisis de variantes
// ---------------------------------------------------------------------------

/**
 * Boleslavsky–Flohr, 1950. El sacrificio en e6 y, sobre todo, el abanico de
 * respuestas a 18.Dh5+: la partida sirve para enseñar a ENUMERAR las jugadas
 * del rival antes de calcular ninguna.
 */
const BOLESLAVSKY_FLOHR = `1. e4 c6 2. Nf3 d5 3. Nc3 Bg4 4. h3 Bxf3 5. Qxf3 e6 6. d4 Nf6 7. Bd3 dxe4 8. Nxe4 Qxd4 {El negro toma un peón central y devuelve tiempo: a cambio, su rey se queda en el centro más de lo prudente. [%csl Re8]} 9. Be3 Qd8 10. O-O-O Nbd7 11. Bc4 Qa5 12. Bd2 Qb6 13. Rhe1 Nxe4 14. Rxe4 Nf6 15. Bxe6 fxe6 16. Rxe6+ {Aquí empieza el trabajo de verdad. Antes de calcular una sola variante, enumera las casillas a las que puede ir el rey negro: son cuatro, y ninguna se decide por intuición. [%cal Ge6e7,Ge6f7]} 16... Be7 ( 16... Kf7 17. Rxf6+ {La calidad no importa: lo que importa es que el rey se queda sin refugio.} 17... gxf6 18. Qh5+ {Y ahora las cuatro ramas del árbol. Recórrelas una a una, y cada una UNA sola vez.} 18... Ke7 ( 18... Ke6 19. Re1+ {Misma idea que en e7: la columna abierta llega antes que cualquier defensa.} ) ( 18... Kg7 19. Bh6+ $1 {La jugada intermedia que empuja al rey a la casilla peor. [%cal Gd2h6]} 19... Kg8 20. Qg4+ Kf7 21. Rd7+ Be7 22. Qg7+ ) ( 18... Kg8 19. Qg4+ Kf7 20. Qc4+ {Con el rey en f7 el jaque por la diagonal vuelve a abrir la posición.} ) 19. Re1+ Kd6 20. Bf4+ Kd7 21. Qf7+ {El rey ha cruzado el tablero y las piezas blancas llegan todas a la vez.} ) 17. Rxe7+ {En la partida el negro entregó el material de otra forma y perdió el final.} *`;

/**
 * Alekhine–Réti, Viena 1922. Cinco respuestas cortas a 12...c5: el ejemplo de
 * árbol ancho y poco profundo, donde lo difícil no es calcular hondo sino no
 * dejarse ninguna candidata fuera.
 */
const ALEKHINE_RETI = `1. e4 e5 2. Nf3 Nc6 3. Bb5 a6 4. Ba4 Nf6 5. Nc3 b5 6. Bb3 Bc5 7. Nxe5 Nxe5 8. d4 Bd6 9. dxe5 Bxe5 10. f4 Bxc3+ 11. bxc3 O-O 12. e5 c5 {La jugada que obliga a las blancas a elegir. No es profunda: es ANCHA. Hay cinco continuaciones razonables y hay que mirarlas todas antes de decidir. [%csl Gc5]} 13. Ba3 ( 13. exf6 Re8+ 14. Kf1 c4 {El negro recupera la pieza con buena posición.} ) ( 13. c4 d5 14. exf6 Re8+ 15. Kf1 Qxf6 ) ( 13. Bd5 Nxd5 14. Qxd5 Qb6 15. Be3 Bb7 {Sin dificultades para el negro.} ) 13... Qa5 14. O-O Qxa3 15. exf6 c4 16. Qd5 Qa5 17. fxg7 Qb6+ 18. Kh1 Kxg7 19. Bxc4 {El alfil recupera la libertad: 19...bxc4 pierde por 20.Dxa8. [%cal Gd5a8]} *`;

/**
 * Rauzer–Riumin, Leningrado 1936. Plan largo de columna y diagonal: sirve para
 * la lección de jugadas candidatas y reaparece en el capítulo 2.
 */
const RAUZER_RIUMIN = `1. e4 e5 2. Nf3 Nc6 3. Bb5 a6 4. Ba4 Nf6 5. O-O Be7 6. Re1 d6 7. c3 b5 8. Bb3 Na5 9. Bc2 c5 10. d4 Qc7 11. Nbd2 Nc6 12. a4 {Primera decisión de plan: abrir la columna a antes de tocar el flanco de rey. [%cal Ga4b5]} 12... Rb8 13. axb5 axb5 14. dxc5 dxc5 15. Nf1 Be6 16. Ne3 O-O 17. Ng5 Rfd8 18. Qf3 Rd6 19. Nf5 Bxf5 20. exf5 h6 21. Ne4 Nxe4 22. Bxe4 Bf6 {Dama y alfil parten el tablero por la diagonal larga mientras la torre manda en la columna a. [%cal Ge4a8][%csl Ga8]} 23. Be3 Ne7 24. b4 c4 25. g3 Rd7 26. Ra7 Qd8 27. Rxd7 Qxd7 28. h4 Kh8 29. g4 Ng8 30. g5 Be7 31. Rd1 Qc7 32. f6 Bxf6 33. gxf6 Nxf6 34. Bc2 Rd8 35. Bxh6 Rxd1+ 36. Bxd1 e4 37. Bf4 Qd8 38. Qe2 {El negro abandonó: el ataque llega con pieza de más en el flanco. } *`;

// ---------------------------------------------------------------------------
// Capítulo 2 — Juicio posicional
// ---------------------------------------------------------------------------

/** Plater–Botvinnik, 1947. Una columna abierta basta para ganar. */
const PLATER_BOTVINNIK = `1. e4 c5 2. Ne2 Nf6 3. Nbc3 d5 4. exd5 Nxd5 5. Nxd5 Qxd5 6. Nc3 Qd8 7. Bc4 Nc6 8. d3 e6 9. O-O Be7 10. f4 O-O 11. Ne4 Na5 12. Bb3 Qd4+ 13. Kh1 c4 14. c3 Qxd3 15. Qxd3 cxd3 16. Nf2 Rd8 17. Rd1 Bc5 18. Rxd3 Bd7 19. Be3 Bxe3 20. Rxe3 Bb5 {La columna de dama es del negro y no hay forma de disputársela. Con eso solo, la partida está encaminada. [%csl Gd8][%cal Gd8d1]} 21. Ne4 h6 22. Rae1 Nxb3 23. axb3 a5 24. h3 Rac8 25. Kg1 Kf8 26. Kh2 Rc7 27. Kg3 b6 28. Kh2 Rcd7 29. Kg1 Rd1 {La torre entra en la última fila y parte en dos las fuerzas blancas.} 30. c4 Bc6 31. Nc3 Rxe1+ 32. Rxe1 Ke7 33. Re2 f6 34. Kf2 Rd3 35. h4 h5 36. Re3 Rd2+ 37. Re2 Rd3 38. Re3 Rd2+ 39. Re2 Rxe2+ 40. Nxe2 Kd6 {Empieza el final: el rey al centro antes que ninguna otra cosa. [%cal Gd6c5,Gc5b4]} 41. Nd4 g6 42. g3 e5 43. fxe5+ fxe5 44. Nc2 Be4 45. Ne1 Kc5 46. Ke3 Bf5 47. Nf3 Kb4 48. Nd2 Bc2 {El alfil supera al caballo y el rey ya está dentro. } *`;

/** Stahlberg–Taimanov, Zúrich 1953. La torre en la séptima que paraliza. */
const STAHLBERG_TAIMANOV = `1. d4 Nf6 2. c4 e6 3. Nf3 b6 4. g3 Ba6 {Presión inmediata sobre c4: el negro pelea la casilla antes de desarrollarse cómodo.} 5. Qa4 Be7 6. Bg2 O-O 7. Nc3 c6 8. Ne5 Qe8 9. O-O d5 10. Re1 b5 11. cxb5 cxb5 12. Qd1 b4 13. Nb1 Nc6 14. Nxc6 Qxc6 15. Nd2 Qb6 16. e3 Rac8 {Cinco jugadas seguidas con un solo objetivo: la única columna abierta del tablero. [%csl Gc8]} 17. Bf1 Rc6 18. Bxa6 Qxa6 19. Nf3 Rfc8 20. Qb3 Ne4 21. Nd2 Rc2 {La torre en la séptima no viene a comer: viene a paralizar. Mientras siga ahí, las blancas no pueden ordenar nada. [%csl Gc2]} 22. Nxe4 dxe4 23. a3 h5 24. d5 R8c4 25. Rd1 exd5 26. Bd2 Qf6 27. Rab1 h4 28. Qa4 Qf5 29. Qxa7 Bf8 {El negro prefirió el final; el ataque directo con 29...Ac5 era aún más fuerte.} *`;

/** Makagonov–Botvinnik, Sverdlovsk 1943. Casillas de un color, sin su alfil. */
const MAKAGONOV_BOTVINNIK = `1. d4 d5 2. c4 e6 3. Nc3 c6 4. e3 Nf6 5. Nf3 Nbd7 6. Ne5 Nxe5 7. dxe5 Nd7 8. f4 Bb4 9. cxd5 exd5 10. Bd3 Nc5 11. Bc2 Qh4+ 12. g3 Qh3 {La dama se instala en una casilla que las blancas ya no pueden disputarle sin debilitar más. [%csl Rh3,Rf3,Re4]} 13. Kf2 Bxc3 14. bxc3 Bf5 15. Bxf5 Qxf5 16. g4 {Buena defensa: para tapar el agujero, las blancas pagan con la seguridad de su rey, que se queda sin refugio para el resto de la partida.} 16... Qe6 17. Ba3 Ne4+ 18. Kf3 h5 19. h3 f6 {Las blancas no pueden capturar en f6 sin abrir su propio rey.} 20. c4 hxg4+ 21. hxg4 Rxh1 22. Qxh1 O-O-O 23. Rd1 fxe5 24. cxd5 cxd5 25. Rc1+ Kb8 {Ventaja posicional y material a la vez. } *`;

/** Kotov–Taimanov, Zúrich 1953. El caballo que se fue a la orilla. */
const KOTOV_TAIMANOV = `1. c4 Nf6 2. g3 e6 3. Bg2 d5 4. Nf3 d4 5. b4 c5 6. Bb2 Qb6 7. Qb3 Nc6 8. b5 Na5 {El caballo llega a la orilla y ahí se queda. No está perdido: está lejos, que en la práctica es peor. [%csl Ra5]} 9. Qc2 Bd6 10. e3 e5 11. exd4 exd4 12. O-O O-O 13. d3 Bd7 14. Nbd2 h6 15. Rae1 Rae8 16. Bc1 {Plan claro: si el caballo negro no defiende el flanco de rey, allí las blancas juegan con una pieza de más. Primero se vacía el flanco de dama. [%cal Gc1d2]} 16... Rxe1 17. Rxe1 Re8 18. Rxe8+ Bxe8 19. Nh4 a6 20. a4 Qa7 21. Nf5 Bf8 22. Ne4 Nxe4 23. Bxe4 b6 24. Qd1 axb5 25. axb5 Bd7 26. Qh5 Be6 27. Bf4 Nb3 {El caballo por fin entra... a comer casillas vacías, mientras el ataque blanco va contra el rey. [%csl Rb3,Gg7]} 28. Qd1 Qa2 29. h4 Na1 30. h5 Nc2 31. Be5 Qb2 32. Bc7 Na3 33. Qg4 Qc1+ 34. Kg2 Nb1 35. Bf4 Nd2 36. Qe2 {El negro abandonó. } *`;

/** Botvinnik–Alekhine, AVRO 1938. Una jugada de dama y el caballo no vuelve. */
const BOTVINNIK_ALEKHINE = `1. Nf3 d5 2. d4 Nf6 3. c4 e6 4. Nc3 c5 5. cxd5 Nxd5 6. e3 Nc6 7. Bc4 cxd4 8. exd4 Be7 9. O-O O-O 10. Re1 b6 11. Nxd5 exd5 12. Bb5 Bd7 13. Qa4 {Una sola jugada obliga al caballo a retirarse a la primera fila, y de ahí no volverá en toda la partida. [%cal Ga4c6][%csl Rc6]} 13... Nb8 14. Bf4 Bxb5 15. Qxb5 a6 16. Qa4 Bd6 17. Bxd6 Qxd6 18. Rac1 Ra7 19. Qc2 {Sencillo y demoledor: la columna c es de las blancas durante el resto de la partida. [%csl Gc1]} 19... Re7 20. Rxe7 Qxe7 21. Qc7 Qxc7 22. Rxc7 f6 23. Kf1 Rf7 24. Rc8+ Rf8 25. Rc3 {Zugzwang: ninguna pieza negra puede moverse sin dejar entrar otra vez la torre.} 25... g5 26. Ne1 h5 27. h4 Nd7 28. Rc7 Rf7 29. Nf3 g4 30. Ne1 f5 31. Nd3 f4 32. f3 gxf3 33. gxf3 a5 34. a4 Kf8 35. Rc6 Ke7 36. Kf2 Rf5 37. b3 Kd8 38. Ke2 Nb8 39. Rg6 Kc7 40. Ne5 Na6 41. Rg7+ Kc8 42. Nc6 Rf6 43. Ne7+ Kb8 44. Nxd5 Rd6 45. Rg5 {Y además cae el peón h. } *`;

/** Botvinnik–Yudovich, 1933. Cinco piezas atadas a una sola mal colocada. */
const BOTVINNIK_YUDOVICH = `1. c4 Nf6 2. d4 g6 3. Nc3 d5 4. Nf3 Bg7 5. Qb3 c6 6. cxd5 Nxd5 7. Bd2 O-O 8. e4 Nb6 {La retirada que lo estropea todo: el caballo queda fuera de juego y, peor aún, obliga a otras piezas a cuidarlo. [%csl Rb6]} 9. Rd1 N8d7 10. a4 a5 11. Be3 Qc7 12. Be2 Qd6 13. Na2 e6 14. O-O h6 15. Rc1 f5 16. Nc3 Kh7 17. Rfd1 fxe4 18. Nxe4 Qb4 19. Qc2 Qxa4 20. b3 Qa3 21. Nh4 Qe7 22. Nxg6 Kxg6 23. Bh5+ {Mate forzado. } *`;

// ---------------------------------------------------------------------------
// Capítulo 3 — Planeamiento
// ---------------------------------------------------------------------------

/**
 * Romanovsky–Vilner, 1927. Un objetivo elegido pronto (la casilla f5) y todas
 * las jugadas subordinadas a él. La línea principal se corta en la jugada 35,
 * donde el plan ya está consumado.
 */
const ROMANOVSKY_VILNER = `1. Nf3 d5 2. e3 Nf6 3. b3 Bg4 4. Bb2 Nbd7 5. Be2 Bxf3 6. Bxf3 e5 7. d3 c6 8. Nd2 Bd6 9. O-O Qe7 10. a4 {Antes de trazar un plan hay que saber dónde enrocará el rival: este avance descarta el flanco de dama. [%cal Ga4a5]} 10... O-O 11. g3 Rad8 12. Bg2 Rfe8 13. Qe2 Qe6 14. e4 Nf8 15. Rfd1 Ng6 16. Nf1 {Objetivo elegido: la casilla f5, y el camino más corto para el caballo: f1-e3-f5. Todo lo demás se subordina. [%csl Gf5][%cal Gf1e3,Ge3f5]} 16... Bc5 17. Ne3 Bxe3 18. Qxe3 d4 {El negro cambia el caballo antes de que llegue, pero al cerrar el centro se queda sin contrajuego y deja el otro flanco entero para las blancas.} 19. Qe2 Nd7 20. Rf1 Qd6 21. Ba3 c5 22. Rae1 Nb8 23. Bc1 Nc6 24. f4 f6 25. f5 {El plan se cumple: la casilla es de las blancas y el flanco de rey queda congelado. [%csl Gf5]} 25... Nf8 26. g4 Kf7 27. g5 Ke7 28. Rf3 Kd7 29. Rg3 Kc8 {El rey huye al otro lado, que es la defensa correcta ante un ataque de flanco.} 30. gxf6 gxf6 31. Bf3 Nd7 32. Qg2 a5 33. Bh5 Re7 34. Rg8 Nb6 35. Bh6 {Las piezas pesadas entran por donde el plan abrió la puerta. } *`;

/** Sokolsky–Botvinnik, 1938. Desarrollar no es un plan. */
const SOKOLSKY_BOTVINNIK = `1. c4 Nf6 2. Nc3 d5 3. d4 g6 4. Nf3 Bg7 5. e3 O-O 6. Be2 e6 7. O-O b6 8. cxd5 exd5 9. b3 Bb7 10. Bb2 Nbd7 11. Qc2 {Once jugadas correctas y ningún plan: las piezas están puestas, pero no hay ninguna idea que las mande a ningún sitio. [%csl Rc2]} 11... a6 12. Rac1 Rc8 13. Rfd1 Qe7 14. Qb1 Rfd8 15. Bf1 c5 16. dxc5 {Error posicional: las blancas sueltan su último punto fuerte del centro y abren la diagonal del alfil negro. [%cal Gb7g2]} 16... bxc5 17. Ne2 Bh6 {Ahora sí hay plan, y es del negro: ataque directo contra f2, cediendo la diagonal larga porque aquí no hace falta. [%csl Rf2]} 18. Ba3 Ng4 19. Qd3 Nde5 20. Nxe5 Qxe5 21. Ng3 Qf6 22. Nh1 {Obligado: f2 no se puede defender de otra forma.} 22... d4 23. Qe2 Ne5 24. exd4 cxd4 25. Rxc8 Bxc8 26. Re1 d3 27. Qd1 Bg4 28. Qa1 d2 29. Rxe5 d1=Q 30. Re8+ Rxe8 31. Qxf6 Be2 {Y las blancas abandonaron. } *`;

/** Petrosian–Euwe, Zúrich 1953. Jugadas sin objetivo común y su factura. */
const PETROSIAN_EUWE = `1. Nf3 Nf6 2. g3 d5 3. Bg2 Bf5 4. d3 e6 5. Nbd2 h6 6. O-O Bc5 7. Qe1 O-O 8. e4 dxe4 9. Nxe4 Nxe4 10. dxe4 Bh7 {Cinco jugadas del negro sin un objetivo común: cambia en el centro sin decidir qué quiere y su alfil queda encerrado detrás de sus propios peones. [%csl Rh7]} 11. b4 Be7 12. Bb2 Na6 13. a3 c6 14. Rd1 Qc8 15. c4 Nc7 16. Qc3 {Las blancas sí tienen un plan y es sencillo: espacio en el flanco de dama y después el centro.} 16... Bf6 17. Ne5 Rd8 18. Bf3 Ne8 19. Rxd8 Qxd8 20. Rd1 Qc7 21. c5 a5 22. Bg2 axb4 23. axb4 Rd8 24. Rxd8 Qxd8 25. Qc2 Nc7 26. Bf1 Nb5 27. f4 Kf8 28. Kf2 Bxe5 29. Bxe5 f6 30. Bb2 Ke7 31. Bc4 Bg6 32. Ke3 Bf7 33. g4 Qc7 34. e5 {Con el rey ya en el centro, las blancas abren la posición en el momento exacto. [%cal Ge4e5]} 34... Qd8 35. exf6+ gxf6 36. h4 Nc7 37. Qc3 Nd5+ {Las blancas ganaron con el peón de más y la mejor posición. } *`;

/**
 * Taimanov–Bronstein, Zúrich 1953. Peón sacrificado en la apertura por dos
 * columnas abiertas: el caso de manual del sacrificio posicional.
 */
const TAIMANOV_BRONSTEIN = `1. d4 Nf6 2. c4 c5 3. d5 g6 4. Nc3 d6 5. e4 b5 {El sacrificio: un peón por las columnas a y b, que son por donde el negro va a trabajar el resto de la partida. [%csl Ga8,Gb8]} 6. cxb5 Bg7 7. Nf3 O-O 8. Be2 a6 9. bxa6 Bxa6 10. O-O Qc7 11. Re1 Nbd7 12. Bxa6 Rxa6 13. Qe2 Rfa8 {Las dos torres ya están donde el sacrificio las quería. El peón de menos no se nota. [%cal Ga6a2,Ga8a2]} 14. h3 Nb6 15. Bg5 Ne8 16. Bd2 Na4 17. Nxa4 Rxa4 18. Bc3 Bxc3 19. bxc3 Qa5 20. Qd3 Qa6 21. Qd2 Rxa2 22. Rxa2 Qxa2 23. e5 Qxd2 24. Nxd2 dxe5 25. Rxe5 Kf8 {Empieza el final, y aquí la torre activa vale más que el peón. [%cal Ga1a2]} 26. Nb3 c4 27. Nc5 Ra1+ 28. Kh2 Nf6 29. Ne4 Nd7 30. Rg5 Ra2 31. Rg4 f5 32. Rf4 Nb6 33. Ng5 Nxd5 34. Rd4 Nb6 35. Rd8+ Kg7 36. f4 h6 37. Ne6+ Kf7 38. Nd4 Na4 39. Rc8 Nxc3 40. Rxc4 Nd5 41. Nf3 Rxg2+ 42. Kh1 Rf2 {Las blancas abandonaron. } *`;

// ---------------------------------------------------------------------------
// Capítulo 5 — Preparación: posiciones clave, no listas de variantes
// ---------------------------------------------------------------------------

/** Nimzoindia: la posición base sobre la que se explica todo el sistema. */
const NIMZO_KEY_POSITION = `1. d4 Nf6 2. c4 e6 3. Nc3 Bb4 4. e3 c5 5. Bd3 O-O 6. Nf3 d5 7. O-O Nc6 8. a3 Bxc3 9. bxc3 dxc4 10. Bxc4 Qc7 {La posición clave del sistema. Memorizar las diez jugadas no sirve de nada; entender esto sí: el blanco quiere avanzar e4 y después e5 para echar al defensor del rey, y el negro quiere frenar ese avance y presionar los peones doblados hasta ganarlos. [%csl Gc3,Gd4][%cal Ge3e4,Ge4e5]} *`;

/** India de Rey / Grünfeld: el centro cedido a cambio de contraataque. */
const KINGS_INDIAN_KEY_POSITION = `1. d4 Nf6 2. c4 g6 3. Nc3 d5 4. Nf3 Bg7 5. Qb3 dxc4 6. Qxc4 O-O 7. e4 Bg4 8. Be3 Nfd7 {Un siglo atrás esta posición se habría dado por perdida para el negro: el blanco tiene todo el centro. Hoy se juega a diario, porque el centro grande también es un centro que atacar. [%csl Rd4,Re4][%cal Gg7d4,Gd7c5]} *`;

// ---------------------------------------------------------------------------
// Curso
// ---------------------------------------------------------------------------

export const THINK_LIKE_A_GRANDMASTER: SeedCourse = {
  id: GM_IDS.course,
  name: "Piense como un gran maestro",
  slug: "piense-como-un-gran-maestro",
  description:
    "El método de trabajo de Alexander Kotov, capítulo a capítulo: cómo se calcula una variante, cómo se juzga una posición, cómo se traza un plan y qué cambia en el final. Con las partidas magistrales que él eligió para explicarlo.",
  type: COURSE_TYPE.STRATEGY,
  status: COURSE_STATUS.PUBLISHED,
  levels: [LEVEL.INTERMEDIATE, LEVEL.ADVANCED],
  chapters: [
    {
      id: GM_IDS.chAnalysis,
      order: 1,
      name: "Análisis de variantes",
      description:
        "Enumerar las jugadas candidatas, recorrer el árbol sin volver dos veces por la misma rama y comprobar lo evidente antes de mover.",
      estimatedDuration: 110,
      lessons: [
        {
          id: GM_IDS.lsTree,
          order: 1,
          name: "El árbol de análisis",
          description: "Antes de calcular, enumerar. Las cuatro respuestas del rival y sus cuatro ramas.",
          isPriority: true,
          estimatedDuration: 20,
          presentationMode: PRESENTATION_MODE.GAME_ANALYSIS,
          initialPositionType: INITIAL_POSITION_TYPE.STARTING_POSITION,
          initialFen: null,
          orientation: BOARD_ORIENTATION.WHITE,
          topics: [TOPIC.TACTICS, TOPIC.STRATEGY],
          exercises: [],
          pgn: BOLESLAVSKY_FLOHR,
        },
        {
          id: GM_IDS.lsBranchOnce,
          order: 2,
          name: "Cada rama, una sola vez",
          description:
            "El error que más reloj cuesta: ir y volver entre dos variantes sin terminar ninguna. Disciplina de recorrido.",
          isPriority: true,
          estimatedDuration: 15,
          presentationMode: PRESENTATION_MODE.GAME_ANALYSIS,
          initialPositionType: INITIAL_POSITION_TYPE.STARTING_POSITION,
          initialFen: null,
          orientation: BOARD_ORIENTATION.WHITE,
          topics: [TOPIC.TACTICS],
          exercises: [],
          pgn: BOLESLAVSKY_FLOHR,
        },
        {
          id: GM_IDS.lsCandidates,
          order: 3,
          name: "Jugadas candidatas",
          description:
            "Cuántas jugadas mirar: ni tres de más ni una de menos. La que no se enumera es la que gana la partida.",
          isPriority: true,
          estimatedDuration: 20,
          presentationMode: PRESENTATION_MODE.GAME_ANALYSIS,
          initialPositionType: INITIAL_POSITION_TYPE.STARTING_POSITION,
          initialFen: null,
          orientation: BOARD_ORIENTATION.WHITE,
          topics: [TOPIC.TACTICS, TOPIC.STRATEGY],
          exercises: [],
          pgn: RAUZER_RIUMIN,
        },
        {
          id: GM_IDS.lsGrove,
          order: 4,
          name: "Árboles anchos y árboles profundos",
          description:
            "Hay posiciones que piden una variante larga y otras que piden cinco cortas. Reconocer cuál tienes delante.",
          isPriority: false,
          estimatedDuration: 20,
          presentationMode: PRESENTATION_MODE.GAME_ANALYSIS,
          initialPositionType: INITIAL_POSITION_TYPE.STARTING_POSITION,
          initialFen: null,
          orientation: BOARD_ORIENTATION.BLACK,
          topics: [TOPIC.TACTICS],
          exercises: [],
          pgn: ALEKHINE_RETI,
        },
        {
          id: GM_IDS.lsQuietMoves,
          order: 5,
          name: "Jugadas tranquilas",
          description:
            "La jugada que no da jaque ni come nada y decide la partida. Por qué cuesta tanto encontrarlas.",
          isPriority: false,
          estimatedDuration: 15,
          presentationMode: PRESENTATION_MODE.GAME_ANALYSIS,
          initialPositionType: INITIAL_POSITION_TYPE.STARTING_POSITION,
          initialFen: null,
          orientation: BOARD_ORIENTATION.WHITE,
          topics: [TOPIC.TACTICS, TOPIC.STRATEGY],
          exercises: [],
          pgn: RAUZER_RIUMIN,
        },
        {
          id: GM_IDS.lsBlumenfeld,
          order: 6,
          name: "Comprobar lo evidente antes de mover",
          description:
            "Terminado el cálculo, mirar la posición con ojos de principiante: ¿hay mate en una?, ¿está algo en el aire?",
          isPriority: true,
          estimatedDuration: 15,
          presentationMode: PRESENTATION_MODE.GAME_ANALYSIS,
          initialPositionType: INITIAL_POSITION_TYPE.STARTING_POSITION,
          initialFen: null,
          orientation: BOARD_ORIENTATION.WHITE,
          topics: [TOPIC.TACTICS],
          exercises: [],
          pgn: BOTVINNIK_YUDOVICH,
        },
      ],
    },
    {
      id: GM_IDS.chJudgement,
      order: 2,
      name: "Juicio posicional",
      description:
        "Descomponer la posición en sus elementos —líneas abiertas, peones, casillas débiles, colocación de las piezas— y volver a juntarlos en un veredicto.",
      estimatedDuration: 120,
      lessons: [
        {
          id: GM_IDS.lsOpenFiles,
          order: 1,
          name: "Una columna abierta puede bastar",
          description: "Ocuparla, penetrar y partir en dos las fuerzas del rival.",
          isPriority: true,
          estimatedDuration: 20,
          presentationMode: PRESENTATION_MODE.GAME_ANALYSIS,
          initialPositionType: INITIAL_POSITION_TYPE.STARTING_POSITION,
          initialFen: null,
          orientation: BOARD_ORIENTATION.BLACK,
          topics: [TOPIC.STRATEGY],
          exercises: [],
          pgn: PLATER_BOTVINNIK,
        },
        {
          id: GM_IDS.lsSeventhRank,
          order: 2,
          name: "La torre que paraliza",
          description:
            "No toda torre en la séptima viene a comer: a veces su sola presencia deja al rival sin jugadas útiles.",
          isPriority: true,
          estimatedDuration: 20,
          presentationMode: PRESENTATION_MODE.GAME_ANALYSIS,
          initialPositionType: INITIAL_POSITION_TYPE.STARTING_POSITION,
          initialFen: null,
          orientation: BOARD_ORIENTATION.BLACK,
          topics: [TOPIC.STRATEGY],
          exercises: [],
          pgn: STAHLBERG_TAIMANOV,
        },
        {
          id: GM_IDS.lsWeakSquares,
          order: 3,
          name: "Columnas, diagonales y el plan que las une",
          description:
            "Las líneas abiertas no valen por sí solas: valen cuando llevan a algo. Un plan de apertura construido sobre ellas.",
          isPriority: false,
          estimatedDuration: 20,
          presentationMode: PRESENTATION_MODE.GAME_ANALYSIS,
          initialPositionType: INITIAL_POSITION_TYPE.STARTING_POSITION,
          initialFen: null,
          orientation: BOARD_ORIENTATION.WHITE,
          topics: [TOPIC.STRATEGY, TOPIC.OPENING_LINE],
          exercises: [],
          pgn: RAUZER_RIUMIN,
        },
        {
          id: GM_IDS.lsColourComplex,
          order: 4,
          name: "Las casillas de un color",
          description:
            "Cuando desaparece el alfil que las cuidaba, todas las casillas de ese color quedan huérfanas a la vez.",
          isPriority: true,
          estimatedDuration: 20,
          presentationMode: PRESENTATION_MODE.GAME_ANALYSIS,
          initialPositionType: INITIAL_POSITION_TYPE.STARTING_POSITION,
          initialFen: null,
          orientation: BOARD_ORIENTATION.BLACK,
          topics: [TOPIC.STRATEGY, TOPIC.PAWN_STRUCTURE],
          exercises: [],
          pgn: MAKAGONOV_BOTVINNIK,
        },
        {
          id: GM_IDS.lsBadKnight,
          order: 5,
          name: "La pieza que está lejos",
          description:
            "Un caballo en la orilla no está perdido: está a tres jugadas de donde se decide la partida, que es peor.",
          isPriority: true,
          estimatedDuration: 20,
          presentationMode: PRESENTATION_MODE.GAME_ANALYSIS,
          initialPositionType: INITIAL_POSITION_TYPE.STARTING_POSITION,
          initialFen: null,
          orientation: BOARD_ORIENTATION.WHITE,
          topics: [TOPIC.STRATEGY],
          exercises: [],
          pgn: KOTOV_TAIMANOV,
        },
        {
          id: GM_IDS.lsPieceHarmony,
          order: 6,
          name: "Una jugada y la pieza no vuelve",
          description:
            "Cómo se provoca que una pieza rival quede fuera de la partida, y cómo se explota mientras dura.",
          isPriority: false,
          estimatedDuration: 20,
          presentationMode: PRESENTATION_MODE.GAME_ANALYSIS,
          initialPositionType: INITIAL_POSITION_TYPE.STARTING_POSITION,
          initialFen: null,
          orientation: BOARD_ORIENTATION.WHITE,
          topics: [TOPIC.STRATEGY],
          exercises: [],
          pgn: BOTVINNIK_ALEKHINE,
        },
      ],
    },
    {
      id: GM_IDS.chPlanning,
      order: 3,
      name: "Planeamiento",
      description:
        "Qué es de verdad un plan, cuándo se cambia y cómo el tipo de centro decide en qué parte del tablero se juega.",
      estimatedDuration: 80,
      lessons: [
        {
          id: GM_IDS.lsSinglePlan,
          order: 1,
          name: "Un objetivo y todo lo demás detrás",
          description:
            "Elegir una casilla, calcular el camino más corto para llegar a ella y subordinar cada jugada a eso.",
          isPriority: true,
          estimatedDuration: 20,
          presentationMode: PRESENTATION_MODE.GAME_ANALYSIS,
          initialPositionType: INITIAL_POSITION_TYPE.STARTING_POSITION,
          initialFen: null,
          orientation: BOARD_ORIENTATION.WHITE,
          topics: [TOPIC.STRATEGY],
          exercises: [],
          pgn: ROMANOVSKY_VILNER,
        },
        {
          id: GM_IDS.lsNoPlan,
          order: 2,
          name: "Desarrollar no es un plan",
          description:
            "Once jugadas correctas seguidas pueden dejarte en una posición pasiva si ninguna responde a una idea.",
          isPriority: true,
          estimatedDuration: 20,
          presentationMode: PRESENTATION_MODE.GAME_ANALYSIS,
          initialPositionType: INITIAL_POSITION_TYPE.STARTING_POSITION,
          initialFen: null,
          orientation: BOARD_ORIENTATION.BLACK,
          topics: [TOPIC.STRATEGY],
          exercises: [],
          pgn: SOKOLSKY_BOTVINNIK,
        },
        {
          id: GM_IDS.lsChangePlan,
          order: 3,
          name: "Cambiar de plan a tiempo",
          description:
            "Mejor un plan mediocre que ninguno; pero peor que ninguno es aferrarse al que la posición ya ha desmentido.",
          isPriority: false,
          estimatedDuration: 20,
          presentationMode: PRESENTATION_MODE.GAME_ANALYSIS,
          initialPositionType: INITIAL_POSITION_TYPE.STARTING_POSITION,
          initialFen: null,
          orientation: BOARD_ORIENTATION.WHITE,
          topics: [TOPIC.STRATEGY],
          exercises: [],
          pgn: PETROSIAN_EUWE,
        },
        {
          id: GM_IDS.lsCentreTypes,
          order: 4,
          name: "El centro manda dónde se juega",
          description:
            "Centro cerrado, abierto, móvil, fijo o en tensión: cada uno pide un tipo de plan distinto.",
          isPriority: true,
          estimatedDuration: 20,
          presentationMode: PRESENTATION_MODE.GAME_ANALYSIS,
          initialPositionType: INITIAL_POSITION_TYPE.STARTING_POSITION,
          initialFen: null,
          orientation: BOARD_ORIENTATION.BLACK,
          topics: [TOPIC.STRATEGY, TOPIC.PAWN_STRUCTURE],
          exercises: [],
          pgn: TAIMANOV_BRONSTEIN,
        },
      ],
    },
    {
      id: GM_IDS.chEndgame,
      order: 4,
      name: "El final",
      description:
        "Lo que cambia cuando quedan pocas piezas: pensar por esquemas, no tener prisa y llevar el rey al centro.",
      estimatedDuration: 60,
      lessons: [
        {
          id: GM_IDS.lsKingToCentre,
          order: 1,
          name: "El rey al centro",
          description:
            "La pieza que en el medio juego se esconde es la que decide el final. Llevarla pronto, aunque no urja.",
          isPriority: true,
          estimatedDuration: 20,
          presentationMode: PRESENTATION_MODE.GAME_ANALYSIS,
          initialPositionType: INITIAL_POSITION_TYPE.STARTING_POSITION,
          initialFen: null,
          orientation: BOARD_ORIENTATION.BLACK,
          topics: [TOPIC.ENDGAME],
          exercises: [],
          pgn: PLATER_BOTVINNIK,
        },
        {
          id: GM_IDS.lsActiveRook,
          order: 2,
          name: "Una torre activa vale más que un peón",
          description:
            "En los finales de torre la actividad pesa más que el material. Cómo se cambia lo uno por lo otro.",
          isPriority: true,
          estimatedDuration: 20,
          presentationMode: PRESENTATION_MODE.GAME_ANALYSIS,
          initialPositionType: INITIAL_POSITION_TYPE.STARTING_POSITION,
          initialFen: null,
          orientation: BOARD_ORIENTATION.BLACK,
          topics: [TOPIC.ENDGAME],
          exercises: [],
          pgn: TAIMANOV_BRONSTEIN,
        },
        {
          id: GM_IDS.lsWhatToTrade,
          order: 3,
          name: "Qué cambiar y qué dejar",
          description:
            "La decisión más frecuente al entrar en el final, y la que más partidas decide antes de que se note.",
          isPriority: false,
          estimatedDuration: 20,
          presentationMode: PRESENTATION_MODE.GAME_ANALYSIS,
          initialPositionType: INITIAL_POSITION_TYPE.STARTING_POSITION,
          initialFen: null,
          orientation: BOARD_ORIENTATION.WHITE,
          topics: [TOPIC.ENDGAME],
          exercises: [],
          pgn: PETROSIAN_EUWE,
        },
      ],
    },
    {
      id: GM_IDS.chPreparation,
      order: 5,
      name: "Preparación del jugador",
      description:
        "Cómo estudiar una apertura, cómo estudiar el medio juego y cómo hacerse una revisión honesta cada cierto tiempo.",
      estimatedDuration: 55,
      lessons: [
        {
          id: GM_IDS.lsKeyPositions,
          order: 1,
          name: "Estudiar posiciones clave, no listas de variantes",
          description:
            "Dos o tres aperturas a fondo y del resto lo básico. Y de cada una, la posición base y sus dos planes.",
          isPriority: true,
          estimatedDuration: 20,
          presentationMode: PRESENTATION_MODE.MOVE_SEQUENCE,
          initialPositionType: INITIAL_POSITION_TYPE.STARTING_POSITION,
          initialFen: null,
          orientation: BOARD_ORIENTATION.WHITE,
          topics: [TOPIC.OPENING_LINE, TOPIC.STRATEGY],
          exercises: [],
          pgn: NIMZO_KEY_POSITION,
        },
        {
          id: GM_IDS.lsTypicalMiddlegame,
          order: 2,
          name: "Las posiciones típicas del medio juego",
          description:
            "El medio juego también se estudia: reconocer la estructura y saber de antemano qué se hace con ella.",
          isPriority: true,
          estimatedDuration: 20,
          presentationMode: PRESENTATION_MODE.MOVE_SEQUENCE,
          initialPositionType: INITIAL_POSITION_TYPE.STARTING_POSITION,
          initialFen: null,
          orientation: BOARD_ORIENTATION.BLACK,
          topics: [TOPIC.OPENING_LINE, TOPIC.PAWN_STRUCTURE],
          exercises: [],
          pgn: KINGS_INDIAN_KEY_POSITION,
        },
        {
          id: GM_IDS.lsSelfReview,
          order: 3,
          name: "La revisión periódica",
          description:
            "Cada dos o tres meses, repasar las derrotas propias y escribir qué falló. Es lo que más rating da.",
          isPriority: false,
          estimatedDuration: 15,
          presentationMode: PRESENTATION_MODE.GAME_ANALYSIS,
          initialPositionType: INITIAL_POSITION_TYPE.STARTING_POSITION,
          initialFen: null,
          orientation: BOARD_ORIENTATION.WHITE,
          topics: [TOPIC.STRATEGY],
          exercises: [],
          pgn: KOTOV_TAIMANOV,
        },
      ],
    },
  ],
};

// ---------------------------------------------------------------------------
// Base de partidas del curso
// ---------------------------------------------------------------------------

/**
 * Las partidas magistrales del curso, como base propia. Además de poder
 * consultarse desde «Mis estudios», es el corpus que alimenta el buscador por
 * posición: sin partidas de verdad, el explorador no tiene nada que encontrar.
 */
export const THINK_LIKE_A_GRANDMASTER_DATABASE = {
  id: "f0000000-0000-4000-8000-000000000010",
  ownerType: OWNER_TYPE.COURSE,
  userId: null as string | null,
  courseId: GM_IDS.course as string | null,
  name: "Partidas del curso",
  description: "Las partidas magistrales que ilustran cada capítulo del método.",
  kind: DATABASE_KIND.COLLECTION,
  isDefault: false,
  order: 0,
};

export const THINK_LIKE_A_GRANDMASTER_GAMES = [
  {
    id: "f1000000-0000-4000-8000-000000000010",
    databaseId: THINK_LIKE_A_GRANDMASTER_DATABASE.id,
    white: "Isaac Boleslavsky",
    black: "Salo Flohr",
    whiteElo: null as number | null,
    blackElo: null as number | null,
    result: GAME_RESULT.WHITE_WINS,
    playedAt: new Date(Date.UTC(1950, 0, 1)),
    event: "Budapest",
    site: null as string | null,
    eco: "B10",
    source: GAME_SOURCE.MANUAL,
    pgn: BOLESLAVSKY_FLOHR,
  },
  {
    id: "f1000000-0000-4000-8000-000000000011",
    databaseId: THINK_LIKE_A_GRANDMASTER_DATABASE.id,
    white: "Alexander Alekhine",
    black: "Richard Réti",
    whiteElo: null as number | null,
    blackElo: null as number | null,
    result: GAME_RESULT.WHITE_WINS,
    playedAt: new Date(Date.UTC(1922, 0, 1)),
    event: "Viena",
    site: null as string | null,
    eco: "C77",
    source: GAME_SOURCE.MANUAL,
    pgn: ALEKHINE_RETI,
  },
  {
    id: "f1000000-0000-4000-8000-000000000012",
    databaseId: THINK_LIKE_A_GRANDMASTER_DATABASE.id,
    white: "Vsevolod Rauzer",
    black: "Nikolai Riumin",
    whiteElo: null as number | null,
    blackElo: null as number | null,
    result: GAME_RESULT.WHITE_WINS,
    playedAt: new Date(Date.UTC(1936, 0, 1)),
    event: "Leningrado",
    site: null as string | null,
    eco: "C86",
    source: GAME_SOURCE.MANUAL,
    pgn: RAUZER_RIUMIN,
  },
  {
    id: "f1000000-0000-4000-8000-000000000013",
    databaseId: THINK_LIKE_A_GRANDMASTER_DATABASE.id,
    white: "Wlodzimierz Plater",
    black: "Mijaíl Botvinnik",
    whiteElo: null as number | null,
    blackElo: null as number | null,
    result: GAME_RESULT.BLACK_WINS,
    playedAt: new Date(Date.UTC(1947, 0, 1)),
    event: "Torneo Paneslavo",
    site: null as string | null,
    eco: "B29",
    source: GAME_SOURCE.MANUAL,
    pgn: PLATER_BOTVINNIK,
  },
  {
    id: "f1000000-0000-4000-8000-000000000014",
    databaseId: THINK_LIKE_A_GRANDMASTER_DATABASE.id,
    white: "Gideon Stahlberg",
    black: "Mark Taimanov",
    whiteElo: null as number | null,
    blackElo: null as number | null,
    result: GAME_RESULT.BLACK_WINS,
    playedAt: new Date(Date.UTC(1953, 0, 1)),
    event: "Torneo de Candidatos, Zúrich",
    site: null as string | null,
    eco: "E15",
    source: GAME_SOURCE.MANUAL,
    pgn: STAHLBERG_TAIMANOV,
  },
  {
    id: "f1000000-0000-4000-8000-000000000015",
    databaseId: THINK_LIKE_A_GRANDMASTER_DATABASE.id,
    white: "Vladimir Makagonov",
    black: "Mijaíl Botvinnik",
    whiteElo: null as number | null,
    blackElo: null as number | null,
    result: GAME_RESULT.BLACK_WINS,
    playedAt: new Date(Date.UTC(1943, 0, 1)),
    event: "Sverdlovsk",
    site: null as string | null,
    eco: "D46",
    source: GAME_SOURCE.MANUAL,
    pgn: MAKAGONOV_BOTVINNIK,
  },
  {
    id: "f1000000-0000-4000-8000-000000000016",
    databaseId: THINK_LIKE_A_GRANDMASTER_DATABASE.id,
    white: "Alexander Kotov",
    black: "Mark Taimanov",
    whiteElo: null as number | null,
    blackElo: null as number | null,
    result: GAME_RESULT.WHITE_WINS,
    playedAt: new Date(Date.UTC(1953, 0, 1)),
    event: "Torneo de Candidatos, Zúrich",
    site: null as string | null,
    eco: "A30",
    source: GAME_SOURCE.MANUAL,
    pgn: KOTOV_TAIMANOV,
  },
  {
    id: "f1000000-0000-4000-8000-000000000017",
    databaseId: THINK_LIKE_A_GRANDMASTER_DATABASE.id,
    white: "Mijaíl Botvinnik",
    black: "Alexander Alekhine",
    whiteElo: null as number | null,
    blackElo: null as number | null,
    result: GAME_RESULT.WHITE_WINS,
    playedAt: new Date(Date.UTC(1938, 10, 1)),
    event: "Torneo AVRO",
    site: null as string | null,
    eco: "D41",
    source: GAME_SOURCE.MANUAL,
    pgn: BOTVINNIK_ALEKHINE,
  },
  {
    id: "f1000000-0000-4000-8000-000000000018",
    databaseId: THINK_LIKE_A_GRANDMASTER_DATABASE.id,
    white: "Mijaíl Botvinnik",
    black: "Mijaíl Yudovich",
    whiteElo: null as number | null,
    blackElo: null as number | null,
    result: GAME_RESULT.WHITE_WINS,
    playedAt: new Date(Date.UTC(1933, 0, 1)),
    event: "Campeonato de la URSS",
    site: null as string | null,
    eco: "D90",
    source: GAME_SOURCE.MANUAL,
    pgn: BOTVINNIK_YUDOVICH,
  },
  {
    id: "f1000000-0000-4000-8000-000000000019",
    databaseId: THINK_LIKE_A_GRANDMASTER_DATABASE.id,
    white: "Piotr Romanovsky",
    black: "Yakov Vilner",
    whiteElo: null as number | null,
    blackElo: null as number | null,
    result: GAME_RESULT.WHITE_WINS,
    playedAt: new Date(Date.UTC(1927, 0, 1)),
    event: "Campeonato de la URSS",
    site: null as string | null,
    eco: "A06",
    source: GAME_SOURCE.MANUAL,
    pgn: ROMANOVSKY_VILNER,
  },
  {
    id: "f1000000-0000-4000-8000-000000000020",
    databaseId: THINK_LIKE_A_GRANDMASTER_DATABASE.id,
    white: "Alexey Sokolsky",
    black: "Mijaíl Botvinnik",
    whiteElo: null as number | null,
    blackElo: null as number | null,
    result: GAME_RESULT.BLACK_WINS,
    playedAt: new Date(Date.UTC(1938, 0, 1)),
    event: "Campeonato de la URSS (semifinal)",
    site: null as string | null,
    eco: "D94",
    source: GAME_SOURCE.MANUAL,
    pgn: SOKOLSKY_BOTVINNIK,
  },
  {
    id: "f1000000-0000-4000-8000-000000000021",
    databaseId: THINK_LIKE_A_GRANDMASTER_DATABASE.id,
    white: "Tigran Petrosian",
    black: "Max Euwe",
    whiteElo: null as number | null,
    blackElo: null as number | null,
    result: GAME_RESULT.WHITE_WINS,
    playedAt: new Date(Date.UTC(1953, 0, 1)),
    event: "Torneo de Candidatos, Zúrich",
    site: null as string | null,
    eco: "A07",
    source: GAME_SOURCE.MANUAL,
    pgn: PETROSIAN_EUWE,
  },
  {
    id: "f1000000-0000-4000-8000-000000000022",
    databaseId: THINK_LIKE_A_GRANDMASTER_DATABASE.id,
    white: "Mark Taimanov",
    black: "David Bronstein",
    whiteElo: null as number | null,
    blackElo: null as number | null,
    result: GAME_RESULT.BLACK_WINS,
    playedAt: new Date(Date.UTC(1953, 0, 1)),
    event: "Torneo de Candidatos, Zúrich",
    site: null as string | null,
    eco: "A56",
    source: GAME_SOURCE.MANUAL,
    pgn: TAIMANOV_BRONSTEIN,
  },
];
