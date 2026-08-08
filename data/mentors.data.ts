import type { Mentor } from "@/interfaces/mentor.interface";

const LEGAL = "e4 e5 Nf3 Nc6 Bc4 d6 Nc3 Bg4 Nxe5 Bxd1 Bxf7+ Ke7 Nd5#".split(" ");
const RETI = "e4 c6 d4 d5 Nc3 dxe4 Nxe4 Nf6 Qd3 e5 dxe5 Qa5+ Bd2 Qxe5 O-O-O Nxe4 Qd8+ Kxd8 Bg5+ Ke8 Rd8#".split(" ");
const FISCHER =
  "e4 e5 Bc4 Nc6 Nf3 Bc5 b4 Bxb4 c3 Ba5 d4 exd4 O-O dxc3 Qb3 Qe7 Nxc3 Nf6 Nd5 Nxd5 exd5 Ne5 Nxe5 Qxe5 Bb2 Qg5 h4 Qxh4 Bxg7 Rg8 Rfe1+ Kd8 Qg3".split(
    " ",
  );
const LUNA =
  "e4 c6 d4 d5 exd5 cxd5 c4 Nf6 Nc3 Nc6 Bg5 e6 Nf3 Be7 c5 O-O a3 Ne4 Bf4 Nxc3 bxc3 b6 Bb5 Bd7 Qa4 Qc8 O-O bxc5 Qd1 Nxd4 Nxd4 cxd4 Bxd7 Qxd7 cxd4 Rfc8 Re1 Rc3 a4 a5 Rb1 Rc4 Rb5 Bb4 Re3 Rac8 Rb3 e5 Be3 exd4 Bf4 Qf5 g3 g5 Qh5 f6 Rb7 Qg6 Qf3 Qe4 Bb8 Rc3 Rxc3 Rxc3 Qxe4 dxe4 Rd7 Rc8 Ba7 d3 Be3 Ba3 Rd4 Bc1 Bxc1 Rxc1+ Kg2 Re1 g4 Kf7 h3 Ke6 f3 Ke5 Rd8 Kf4 fxe4 Ke3".split(
    " ",
  );

export const mentors: Mentor[] = [
  {
    slug: "sebastian",
    name: "Sebastián Luna",
    fullName: "Sebastian Luna",
    firstName: "Sebastián",
    city: "Ciudad de México",
    photo: "/design-import/assets/profesores/diego.jpg",
    photoFocus: "80% 20%",
    birthYear: 2002,
    gender: "male",
    summary:
      "Mi pasión por el juego me ha llevado a buscar una comprensión profunda del ajedrez y, como maestro, disfruto compartir ese conocimiento para ayudar a mis alumnos a mejorar, ganar confianza y desarrollar su propio criterio frente al tablero.",
    shortDescription: "Enseña a pensar y decidir mejor sobre el tablero.",
    fideInfo: {
      fideId: "5154782",
      standardElo: 1834,
      rapidElo: 1804,
      blitzElo: 1798,
      chessComElo: 2200,
      federation: "México",
      longFideTitle: "Instructor · Jugador federado FIDE",
    },
    achievements: [
      {
        year: "2024",
        title: "2º lugar · Copa Ciudad de México",
        text: "Cierra el open con 7 de 9 puntos y firma su mejor desempeño en un torneo estándar.",
      },
      {
        year: "2023",
        title: "Campeón · Circuito Metropolitano sub-23",
        text: "Gana el circuito de forma invicta, con seis victorias y tres tablas.",
      },
      {
        year: "2022",
        title: "3º lugar · Abierto Intercontinental Jorge Vega",
        text: "Podio en su primera participación internacional, con victoria ante una jugadora titulada.",
      },
    ],
    testimonials: [
      {
        name: "Mariana G.",
        detail: "De 1250 a 1610 en 8 meses",
        text: "Dejé de jugar por intuición. Ahora tengo un método para elegir plan y mis partidas largas cambiaron por completo.",
      },
      {
        name: "Ricardo T.",
        detail: "Alumno desde 2022",
        text: 'Explica el porqué de cada jugada. Nunca es "esto se juega así", siempre hay una idea detrás que puedo reutilizar.',
      },
      {
        name: "Ana P.",
        detail: "Madre de alumno de 11 años",
        text: "Mi hijo llega a la clase con ganas y sale queriendo analizar. Se nota la paciencia y el orden en cada sesión.",
      },
    ],
    featuredGame: {
      gameTitle: "WIM Andrea Ortez — Sebastián Luna · Intercontinental Jorge Vega, 2026",
      gameText:
        "Su mejor partida, con negras en una Caro-Kann, Ataque Panov. Neutraliza la presión central, transforma la posición en un final de torres y el rey negro cruza el tablero para decidir el encuentro.",
      gameNote:
        "La clave está en la torre de c3: desde esa casilla presiona a3, c4 y d4 de forma simultánea. En el final, la marcha del rey hasta e3 culmina el plan. El tablero se presenta desde el lado de las negras.",
      flipBoard: true,
      moves: LUNA,
    },
  },
  {
    slug: "emiliano",
    name: "Emiliano Vargas",
    fullName: "Emiliano Vargas Ortiz",
    firstName: "Emiliano",
    city: "Guadalajara",
    photo: "/design-import/assets/profesores/emiliano.jpg",
    photoFocus: "76% 18%",
    birthYear: 1988,
    gender: "male",
    summary:
      "Más de dos décadas de competencia le enseñaron que los resultados los sostiene la preparación, no el talento. Trabaja planes largos, finales prácticos y rutinas de torneo para que el alumno llegue a la partida sabiendo exactamente qué va a jugar.",
    shortDescription: "Preparación de torneo, finales prácticos y planes largos.",
    fideInfo: {
      fideId: "5108934",
      standardElo: 2531,
      rapidElo: 2548,
      blitzElo: 2564,
      federation: "México",
      shortFideTitle: "GM",
      longFideTitle: "Grandmaster",
    },
    achievements: [
      {
        year: "2019",
        title: "Campeón · Open Internacional de Guadalajara",
        text: "Primer lugar con 8 de 9 puntos y actuación de 2680 de performance.",
      },
      {
        year: "2016",
        title: "2º lugar · Campeonato Nacional Absoluto",
        text: "Subcampeón tras desempate y plaza en el equipo olímpico mexicano.",
      },
      {
        year: "2013",
        title: "Campeón · Round Robin GM de Barcelona",
        text: "Gana el torneo cerrado donde completa su título de Gran Maestro.",
      },
    ],
    testimonials: [
      {
        name: "Diego L.",
        detail: "1980 → 2140 Elo",
        text: "Su preparación para torneo es de otro nivel. Llego a las partidas sabiendo qué esperar y con energía para la fase decisiva.",
      },
      {
        name: "Sofía R.",
        detail: "Alumna de finales",
        text: "Los finales dejaron de darme miedo. Ahora hasta busco cambiar damas cuando tengo la estructura mejor.",
      },
      {
        name: "Julián M.",
        detail: "Jugador de club",
        text: "Es exigente, pero siempre explica el criterio. Nunca sales de la clase con una duda a medias.",
      },
    ],
    featuredGame: {
      gameTitle: "Vargas — Open Internacional de Guadalajara, 2019",
      gameText:
        "Su partida más limpia: cada jugada gana un tiempo y la posición negra se derrumba con el rey aún en el centro.",
      gameNote:
        "En ningún momento recupera material por avaricia: cada captura responde al ataque sobre el rey. Esa disciplina es la que trabaja con sus alumnos.",
      flipBoard: false,
      moves: FISCHER,
    },
  },
  {
    slug: "diego",
    name: "Diego Márquez",
    fullName: "Diego Márquez Fuentes",
    firstName: "Diego",
    city: "Puebla",
    photo: "/design-import/assets/profesores/andres.jpg",
    photoFocus: "82% 20%",
    birthYear: 1992,
    gender: "male",
    summary:
      "Sostiene que una apertura solo funciona si al jugador le gustan las posiciones que produce. Construye el repertorio a partir del estilo de cada alumno y del criterio necesario para decidir cuando la teoría se agota.",
    shortDescription: "Repertorios de apertura a la medida de cada alumno.",
    fideInfo: {
      fideId: "5127461",
      standardElo: 2418,
      rapidElo: 2455,
      blitzElo: 2487,
      federation: "México",
      shortFideTitle: "IM",
      longFideTitle: "International Master",
    },
    achievements: [
      {
        year: "2018",
        title: "Campeón por equipos · Nacional de Puebla",
        text: "Primer tablero del equipo campeón, con 6 de 7 puntos individuales.",
      },
      {
        year: "2016",
        title: "2º lugar · Open de Ciudad Universitaria",
        text: "Subcampeón invicto y última norma de Maestro Internacional.",
      },
      {
        year: "2014",
        title: "3º lugar · Campeonato Nacional Absoluto",
        text: "Podio nacional tras vencer a dos jugadores titulados en la fase final.",
      },
    ],
    testimonials: [
      {
        name: "Carlos V.",
        detail: "Alumno de repertorio",
        text: "Cambiamos mi apertura por una que encaja con cómo juego y de golpe empecé a entender mis propias partidas.",
      },
      {
        name: "Renata S.",
        detail: "1450 → 1720 Elo",
        text: "Antes salía de la apertura sin plan. Ahora sé qué estructura busco y qué piezas quiero cambiar.",
      },
      {
        name: "Iván H.",
        detail: "Jugador de torneo amateur",
        text: "Las clases son muy concretas: posición, plan, ejercicio. Nada de teoría suelta que se olvida a la semana.",
      },
    ],
    featuredGame: {
      gameTitle: "Márquez — Nacional por Equipos, Puebla 2018",
      gameText:
        "La partida que mejor resume su juego: una apertura tranquila que se convierte en ataque directo gracias a la ventaja de desarrollo.",
      gameNote:
        "La clave está en el enroque largo: mientras su rival recupera material, todas sus piezas ya apuntan a la columna d.",
      flipBoard: false,
      moves: RETI,
    },
  },
  {
    slug: "andres",
    name: "Andrés Rivas",
    fullName: "Andrés Rivas Solano",
    firstName: "Andrés",
    city: "Querétaro",
    photo: "/design-import/assets/profesores/andres.jpg",
    photoFocus: "82% 20%",
    birthYear: 1995,
    gender: "male",
    summary:
      "Se dedica a la etapa inicial, donde un buen hábito vale cien lecciones. Ordena lo básico —piezas activas, seguridad del rey, cálculo simple— y construye desde ahí la confianza necesaria para competir.",
    shortDescription: "Fundamentos sólidos para empezar a competir.",
    fideInfo: {
      fideId: "5143820",
      standardElo: 2168,
      rapidElo: 2205,
      blitzElo: 2231,
      federation: "México",
      shortFideTitle: "CM",
      longFideTitle: "Candidate Master",
    },
    achievements: [
      {
        year: "2022",
        title: "Campeón · Abierto Estatal de Querétaro",
        text: "Primer lugar con 7 de 8 puntos en el torneo más concurrido del estado.",
      },
      {
        year: "2019",
        title: "2º lugar · Copa Bajío",
        text: "Subcampeón regional y mejor desempeño de su carrera en ritmo estándar.",
      },
      {
        year: "2017",
        title: "3º lugar · Nacional de Ajedrez Rápido",
        text: "Podio nacional en rápidas, donde obtiene el título de Maestro Candidato.",
      },
    ],
    testimonials: [
      {
        name: "Paula N.",
        detail: "Primer torneo oficial",
        text: "Llegué sin saber anotar una partida y seis meses después jugué mi primer torneo sin nervios.",
      },
      {
        name: "Tomás F.",
        detail: "Alumno de 10 años",
        text: "Las clases son divertidas y siempre hay ejercicios. Ya le gané a mi papá tres veces seguidas.",
      },
      {
        name: "Lucía B.",
        detail: "Adulta principiante",
        text: "Pensé que era tarde para aprender. Andrés arma todo por pasos y nunca te hace sentir perdida.",
      },
    ],
    featuredGame: {
      gameTitle: "Rivas — Torneo Estatal de Querétaro, 2017",
      gameText:
        "Su miniatura favorita y la que mejor ilustra un principio esencial: no toda pieza clavada está realmente clavada.",
      gameNote:
        "Seis jugadas de desarrollo natural y un motivo táctico que aparece constantemente en partidas de club. Con ella abre el módulo de fundamentos.",
      flipBoard: false,
      moves: LEGAL,
    },
  },
];
