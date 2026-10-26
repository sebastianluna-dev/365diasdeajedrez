import { siteConfig } from "@/config/site.config";
import type { AcademyHomeCopy } from "@/types/academy-home.types";

// The copy of the academy's home page, section by section, in the order of
// the owner's assembled design (LandingAcademiaParte1 and 2, 2026-10-26).
// Where the design and the facts clashed, the facts won (the owner's
// decisions): today a class is joined with its link from the platform and the
// classroom inside it is «Próximamente»; the academy is a team; there are no
// public prices; nothing here invents a figure — a figure, a teacher or a
// testimonial the owner has not given stays out of the page.

export const academyHome: AcademyHomeCopy = {
  booking: {
    label: "Agenda tu clase de prueba",
    message: siteConfig.shell.headerCta.message,
  },

  hero: {
    eyebrow: "Academia de ajedrez en línea",
    heading: { text: "Aprende ajedrez con un maestro,", emphasis: "todos los días" },
    lead: "Clases en vivo, individuales o grupales, y entre una clase y otra, tu plataforma para estudiar: cursos, ejercicios y partidas de nuestros maestros.",
    chips: ["Clases que no caducan", "Individual o grupal", "Para niños y adultos"],
    secondary: { label: "Ve cómo funciona", href: "#como-funciona" },
    note: "Te abrimos WhatsApp para elegir día y hora.",
    board: {
      fen: "r1bqkbnr/pppp1ppp/2n5/1B2p3/4P3/5N2/PPPP1PPP/RNBQK2R",
      lastMove: { from: "f1", to: "b5" },
      label: "Tablero: las blancas acaban de jugar 3.Ab5, la Apertura Española",
    },
    caption: {
      move: "3.",
      title: "Ab5, la Apertura Española",
      text: "La vemos en clase y la repasas en tu plataforma",
    },
  },

  figures: {
    eyebrow: "La academia en cifras",
    heading: { text: "Lo que llevamos", emphasis: "jugado" },
    lead: "Cada clase la da un maestro del equipo, y cada alumno sigue estudiando en su plataforma entre una y otra.",
    link: { label: "Conoce al equipo", href: "#equipo" },
    // No invented stats: each value is null until the owner gives the real
    // one, and the section stays hidden until all four have one.
    items: [
      { value: null, label: "alumnos", note: "han tomado clase con el equipo", icon: "users", shape: "cookie" },
      {
        value: null,
        label: "clases dadas",
        note: "individuales y grupales, en vivo",
        icon: "calendar-clock",
        shape: "arch",
      },
      {
        value: null,
        label: "maestros con título",
        note: "FIDE, en el equipo de la academia",
        icon: "graduation-cap",
        shape: "clover",
      },
      { value: null, label: "años", note: "enseñando ajedrez", icon: "trophy", shape: "square" },
    ],
  },

  classes: {
    eyebrow: "Clases en vivo",
    heading: { text: "Tu clase,", emphasis: "desde tu plataforma" },
    lead: "Entras desde tu cuenta, con el enlace de tu clase. Pronto, el aula estará dentro de la plataforma: sin Zoom ni Meet, y con el tablero que comparte tu maestro como lo más grande de la pantalla.",
    formats: [
      { icon: "user", title: "Individual", text: "Tú y tu maestro, al ritmo que necesitas." },
      { icon: "users", title: "Grupal", text: "Con compañeros de tu nivel y el mismo maestro." },
    ],
    room: {
      label: "Así será el aula dentro de la plataforma, próximamente",
      title: "Finales de torre",
      meta: "Clase grupal · con tu maestro",
      soon: "Próximamente",
      turn: "Mueve Sofía, con negras",
      topic: "La defensa Philidor",
      moves: [
        ["1.", "Rf5", "Ta6"],
        ["2.", "Th7", "…"],
      ],
      current: "1,1",
      tools: ["Flechas", "Volver a la jugada", "Dar el tablero a…"],
      teacher: "Tu maestro",
      students: ["Sofía", "Emi", "Leo", "Tú"],
      captions: {
        who: "Subtítulos · tu maestro",
        text: "Fíjate: la torre negra se queda en la sexta fila y el rey blanco ya no puede avanzar.",
      },
      clock: "18:24 · 45 min",
      board: {
        fen: "4k3/7R/r7/4PK2/8/8/8/8",
        lastMove: { from: "h1", to: "h7" },
        label:
          "Tablero compartido: final de torre, defensa Philidor; las blancas acaban de jugar Th7 y la torre negra espera en la sexta fila",
      },
    },
    steps: [
      { title: "Agendas", text: "Nos escribes por WhatsApp y fijamos contigo el día y la hora." },
      { title: "Entras a tu clase", text: "Desde tu plataforma, con el enlace de tu clase." },
      { title: "Repasas", text: "El resumen, la grabación y los ejercicios quedan en la página de tu clase." },
    ],
    promises: [
      { title: "Tus clases no caducan", text: "Las clases pagadas no tienen fecha de vencimiento." },
      { title: "Si faltas, te damos otra fecha", text: "Tu clase pasa a otro día, sin pagarla dos veces." },
    ],
    note: "El aula integrada llega pronto; hoy entras a tu clase con su enlace, desde la misma página de tu plataforma.",
  },

  team: {
    eyebrow: "El equipo",
    heading: { text: "Un equipo de maestros,", emphasis: "no una sola cara" },
    lead: "Todos con título y con su manera de enseñar. Tú no eliges entre perfiles: te asignamos el maestro del equipo que va con tu nivel y tus horarios.",
    // The teachers' names, titles and photos are the owner's to give: until
    // then the section shows how a teacher is assigned and no one's face.
    members: [],
    assign: {
      title: "Te asignamos un maestro del equipo",
      steps: [
        { title: "Nos escribes", text: "Tu nivel, tus horarios y lo que quieres mejorar." },
        { title: "Te asignamos maestro", text: "El del equipo que va contigo, para tus clases." },
        { title: "Te prepara lo que sigue", text: "Ejercicios y repaso en tu plataforma." },
      ],
    },
  },

  courses: {
    eyebrow: "Cursos",
    heading: { text: "Cuatro cursos,", emphasis: "y así se ven por dentro" },
    lead: "Cursos de la academia con capítulos, lecciones y ejercicios en el tablero. Tu maestro te dice por cuál empezar.",
    ask: {
      label: "Pregunta por los cursos",
      message: "Hola, quiero información sobre los cursos de la academia.",
    },
    inside: {
      say: "Así lo ves dentro de tu plataforma",
      note: "El índice a la izquierda, los capítulos al centro y la lección que sigue, en el tablero.",
    },
    // The four courses of the platform (prisma/seed-data.ts and
    // prisma/seed-courses/), copied as static data: the site never reads the
    // platform's database.
    courses: [
      {
        cover: "siciliana",
        kicker: "Curso de apertura",
        coverTitle: "Defensa Siciliana",
        name: "Fundamentos de la Defensa Siciliana",
        topic: "Aperturas",
        levels: ["Principiante", "Intermedio"],
        chapters: [
          {
            name: "Ideas básicas",
            about: "Qué busca el negro con 1...c5 y cómo se forman las estructuras sicilianas.",
            lessons: 3,
          },
          {
            name: "La Variante Najdorf",
            about: "La línea favorita de Fischer y Kasparov: 5...a6 y sus planes.",
            lessons: 2,
          },
        ],
        next: {
          name: "El Peón Envenenado",
          about: "La variante 7...Db6: el negro toma b2 y sobrevive para contarlo.",
          board: {
            fen: "rnb1kb1r/1p3ppp/p2ppn2/6B1/3NPP2/2N5/PqPQ2PP/R3KB1R",
            lastMove: { from: "b6", to: "b2" },
            orientation: "black",
            label: "Tablero: las negras acaban de tomar el peón de b2 con la dama, el Peón Envenenado de la Najdorf",
          },
        },
      },
      {
        cover: "fischer",
        kicker: "Partidas comentadas",
        coverTitle: "Mis 60 partidas memorables",
        name: "Mis 60 memorables partidas",
        topic: "Partidas",
        levels: ["Intermedio", "Avanzado"],
        chapters: [
          {
            name: "Los años de aprendizaje (1957–1959)",
            about: "Las partidas 1 a 17 del libro, con Larsen, Petrosian, Keres, Smyslov y Tal entre los rivales.",
            lessons: 17,
          },
          {
            name: "La irrupción mundial (1960–1962)",
            about: "Las partidas 18 a 43, de Mar del Plata 1960 a la Olimpiada de Varna 1962.",
            lessons: 26,
          },
          {
            name: "Camino al título (1963–1967)",
            about: "Las partidas 44 a 58 y tres partidas de referencia que el estudio añade a sus notas.",
            lessons: 18,
          },
        ],
        next: {
          name: "Los años de aprendizaje",
          about: "Las partidas del libro de Fischer, una por lección, en el tablero.",
        },
      },
      {
        cover: "torre",
        kicker: "Curso de finales",
        coverTitle: "Finales de torre",
        name: "Finales de torre esenciales",
        topic: "Finales",
        levels: ["Intermedio"],
        chapters: [
          {
            name: "Posiciones fundamentales",
            about:
              "Lucena y Philidor: las dos posiciones del final de torre y peón que hay que dominar antes que cualquier otra.",
            lessons: 2,
          },
        ],
        next: {
          name: "La defensa Philidor",
          about: "La torre en la tercera fila: el método de tablas que hay que saber de memoria.",
          board: {
            fen: "4k3/7R/r7/4PK2/8/8/8/8",
            lastMove: { from: "h1", to: "h7" },
            label: "Tablero: final de torre y peón, la defensa Philidor con la torre negra en la sexta fila",
          },
        },
      },
      {
        cover: "kotov",
        kicker: "Estrategia",
        coverTitle: "Piense como un gran maestro",
        name: "Piense como un gran maestro",
        topic: "Estrategia",
        levels: ["Intermedio", "Avanzado"],
        chapters: [
          {
            name: "Análisis de variantes",
            about: "Cómo se calcula una variante, sin perderse en el árbol.",
            lessons: 67,
          },
          { name: "Juicio posicional", about: "Cómo se juzga una posición antes de elegir un plan.", lessons: 64 },
          { name: "Planeamiento", about: "Cómo se traza un plan y cuándo se cambia.", lessons: 18 },
          { name: "El final", about: "Qué cambia cuando quedan pocas piezas.", lessons: 7 },
          { name: "Un conocimiento del jugador", about: "El capítulo que cierra el libro.", lessons: 6 },
        ],
        next: {
          name: "Análisis de variantes",
          about: "El método de Kotov, capítulo a capítulo, con los 162 diagramas del libro, uno por lección.",
        },
      },
    ],
  },

  platform: {
    eyebrow: "Tu plataforma",
    heading: { text: "Lo que haces", emphasis: "entre clases" },
    lead: "Tu cuenta en la plataforma de la academia viene con todo esto.",
    features: [
      { icon: "list-ol", title: "Ejercicios de tu maestro", text: "Las series que te deja para después de clase." },
      { icon: "books", title: "Series de la academia", text: "Series armadas por el equipo, por tema y nivel." },
      { icon: "shuffle", title: "Práctica por tema y nivel", text: "Un ejercicio tras otro de la biblioteca." },
      { icon: "stopwatch", title: "Puzzle Rush", text: "Tres o cinco minutos, o hasta el tercer error." },
      { icon: "compass", title: "Estudios y explorador", text: "Tus partidas, y qué se juega en cada posición." },
      { icon: "fire", title: "Racha, meta y estadísticas", text: "Tus minutos de cada día y cómo vas por tema." },
    ],
    shown: 3,
    rush: {
      label: "Puzzle Rush de 3 minutos: quedan 2:41, 14 resueltos y 2 errores; juegan las blancas",
      modes: [
        { title: "3 min", text: "Contra el reloj" },
        { title: "5 min", text: "Contra el reloj" },
        { title: "Supervivencia", text: "Sin reloj, hasta el tercer error" },
      ],
      topics: ["Todos los temas", "Táctica", "Finales", "Aperturas"],
      mine: ["De tu profesor", "Series de la academia", "Historial"],
      left: "2:41",
      solved: "14",
      run: [true, true, true, true, true, true, true, true, true, false, true, true, true, true, true, false],
      current: "17",
      turn: "Juegan las blancas",
      note: "Cada ejercicio, un poco más difícil que el anterior.",
      board: {
        fen: "r1bqk2r/pppp1ppp/2n2n2/2b1p3/2B1P3/3P1N2/PPP2PPP/RNBQK2R",
        label: "Tablero de Puzzle Rush: juegan las blancas",
      },
    },
    streak: { days: "12 días", minutes: 14, goal: 20, text: "Meta diaria: 14 de 20 minutos hoy." },
  },

  adventure: {
    eyebrow: "Modo aventura",
    heading: { text: "Juega contra la computadora", emphasis: "dentro de una historia" },
    lead: "«El cuaderno del viajero» viene en tu plataforma: una ciudad, doce rivales con nombre, frase y apertura favorita, y un cuaderno de hace treinta años que llenas con tus partidas.",
    facts: [
      {
        icon: "trophy",
        title: "Para seguir, hay que ganar",
        text: "Cada lugar tiene dos rivales; la página siguiente se abre al ganarle al de ésta.",
      },
      {
        icon: "circle-check",
        title: "Estrellas y recuerdos",
        text: "Tres estrellas al primer intento, y de cada rival te queda algo suyo en el cuaderno.",
      },
    ],
    streak: {
      strong: "Jugar no cuenta para tu racha; estudiar, sí.",
      text: "La racha es de tus lecciones y ejercicios.",
    },
    ask: {
      label: "Pregunta por la plataforma",
      message: "Hola, quiero información sobre la plataforma de la academia.",
    },
    map: {
      label:
        "El mapa del cuaderno en el Club La Torre: ya le ganaste al Profe Leal con tres estrellas y te toca Toñito Garza",
      page: {
        kicker: "La Torre · Club local",
        title: "Una página arrancada",
        text: "El jueves me inscribí en el club. Aprendí que un caballo en el centro vale por dos…",
      },
      note: "¿quién la arrancó?",
      hint: "¡me toca!",
      keepsake: "La Torre",
      hud: { title: "El cuaderno del viajero", rivals: "3 de 12 rivales", stars: "8 estrellas" },
    },
    rivals: [
      {
        initials: "PL",
        name: "Profe Leal",
        role: "Entrenador del Club La Torre",
        quote: "Primero desarrolla tus piezas; luego presumes.",
        state: "won",
        tags: ["3 estrellas", "Recuerdo: tu credencial del club"],
      },
      {
        initials: "TG",
        name: "Toñito Garza",
        role: "El socio más joven del club",
        quote: "¡Jaque! ¿Eso fue jaque? Bueno, casi.",
        state: "next",
        tags: ["Te toca", "Fácil", "Ataque Fegatello"],
      },
    ],
  },

  information: {
    eyebrow: "Pide información",
    heading: { text: "Empieza con una", emphasis: "clase de prueba" },
    lead: "No publicamos paquetes: lo que pagas depende de si tomas clases individuales o grupales y de cuántas quieras. Pregúntanos y lo armamos contigo.",
    steps: [
      {
        title: "Escríbenos por WhatsApp",
        text: "Cuéntanos para quién son las clases, qué tanto juega y qué horarios le acomodan. Te contestamos con los precios y las modalidades.",
      },
      {
        title: "Toma tu clase de prueba",
        text: "Con un maestro del equipo, en línea. Ve en qué nivel estás y te recomienda cómo seguir.",
      },
      {
        title: "Elige individual o grupal",
        text: "Te asignamos un maestro del equipo, agendamos tus clases y te abrimos tu cuenta en la plataforma.",
      },
    ],
    card: {
      title: "Agenda tu clase de prueba",
      text: "Te abrimos WhatsApp con el mensaje ya escrito. Sólo lo mandas.",
      preview: "El mensaje que se abre",
      button: "Escríbenos por WhatsApp",
    },
    promises: [
      { strong: "Tus clases no caducan.", text: "Las tomas a tu ritmo." },
      { strong: "Si faltas, te damos otra fecha.", text: "Avísanos y la reprogramamos." },
      { strong: "Individual o grupal,", text: "en línea y con un maestro del equipo." },
    ],
  },

  testimonials: {
    eyebrow: "Testimonios",
    heading: { text: "Lo que cuentan", emphasis: "nuestros alumnos" },
    lead: "Alumnos de clases individuales y grupales, y mamás y papás de los más chicos, con sus palabras.",
  },

  faq: {
    eyebrow: "Preguntas frecuentes",
    heading: { text: "Lo que más", emphasis: "nos preguntan" },
    lead: "Edades, niveles, cómo son las clases y qué pasa si faltas. Si no está tu pregunta, escríbenos.",
    help: {
      title: "¿No está tu pregunta?",
      text: "Te contestamos por WhatsApp, también los precios.",
      button: "Escríbenos por WhatsApp",
    },
  },

  closing: {
    eyebrow: "Tu primera clase",
    heading: { text: "La siguiente jugada", emphasis: "es tuya" },
    text: "Agenda tu clase de prueba con un maestro del equipo. Te abrimos WhatsApp para elegir día y hora, y ahí mismo te damos los precios.",
    info: {
      label: "Pide información",
      message: "Hola, quiero información sobre las clases de ajedrez: precios y modalidades.",
    },
    chips: [
      { icon: "clock", text: "No caducan" },
      { icon: "calendar", text: "Si faltas, te damos otra fecha" },
      { icon: "users", text: "Individual o grupal" },
    ],
    board: {
      fen: "r1bqkbnr/pppp1ppp/2n5/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R",
      lastMove: { from: "f1", to: "c4" },
      label: "Tablero: Apertura Italiana; las blancas acaban de jugar 3.Ac4 y les toca a las negras",
      turn: "Juegan las negras",
      opening: "Apertura Italiana · 3.Ac4",
    },
  },
};
