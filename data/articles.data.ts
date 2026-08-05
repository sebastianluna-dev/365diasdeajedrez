import type { Article } from "@/interfaces/article.interface";

export const articles: Article[] = [
  {
    slug: "metodo",
    category: "Método",
    title: "Cómo organizar tu entrenamiento de ajedrez",
    excerpt:
      "Primero conocimiento sólido, después cálculo y competencia. Una guía para entrenar con orden y ver resultados en tres meses.",
    href: "#",
  },
  {
    slug: "tactica",
    category: "Táctica",
    title: "Siete patrones que debes reconocer de inmediato",
    excerpt:
      "Clavadas, horquillas y ataques descubiertos: los motivos que deciden la mayoría de las partidas por debajo de 2000.",
    image: "/design-import/assets/thumb-tactica.png",
    meta: "8 de julio, 2026 · 7 min",
    href: "#",
  },
  {
    slug: "torre-c3",
    category: "Análisis de partidas",
    title: "La torre en c3: anatomía de una casilla que decide la partida",
    excerpt:
      "Sebastián Luna comenta su mejor partida jugada con negras en una Caro-Kann, Ataque Panov. Cómo neutralizar la presión central, por qué el cambio al final de torres era la decisión correcta y de qué manera la marcha del rey a e3 culmina el plan.",
    image: "/design-import/assets/thumb-metodo.png",
    readTime: "12 min de lectura",
    href: "#",
    author: {
      name: "Sebastián Luna",
      role: "Instructor · 3 de agosto, 2026",
      avatar: "/design-import/assets/profesores/diego.jpg",
    },
  },
  {
    slug: "aperturas",
    category: "Aperturas",
    title: "Deja de memorizar variantes y empieza a entender ideas",
    excerpt: "Estructuras de peones, planes típicos y los errores más frecuentes al construir un repertorio.",
    image: "/design-import/assets/thumb-aperturas.png",
    meta: "28 de julio, 2026 · 8 min",
    href: "/",
  },
  {
    slug: "finales",
    category: "Finales",
    title: "La posición de Lucena, paso a paso",
    excerpt: "El método de conversión más importante del ajedrez, explicado movimiento por movimiento.",
    image: "/design-import/assets/thumb-finales.png",
    meta: "21 de julio, 2026 · 10 min",
    href: "/",
  },
  {
    slug: "estrategia",
    category: "Estrategia",
    title: "Cómo aprovechar un puesto avanzado en el medio juego",
    excerpt: "Dónde colocar las piezas cuando la estructura te concede una casilla débil y qué hacer después.",
    image: "/design-import/assets/thumb-metodo.png",
    meta: "14 de julio, 2026 · 9 min",
    href: "/",
  },
];
