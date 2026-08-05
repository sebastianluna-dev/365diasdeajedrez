import Link from "next/link";
import "./reviews-and-faq.section.css";

const reviews = [
  {
    quote:
      "La claridad del método me cambió por completo la forma de estudiar. Ahora veo mejores ideas y tomo decisiones con mucha más confianza.",
    author: "Mónica G.",
  },
  {
    quote:
      "Las clases me ayudaron a entender por qué perdía tantas partidas en posiciones aparentemente tranquilas.",
    author: "Luis R.",
  },
  {
    quote:
      "Me encanta que no sólo se vea teoría, sino también cómo aplicarla en partidas reales y en mi propio juego.",
    author: "Nora T.",
  },
];

const faqs = [
  {
    question: "¿Necesito experiencia para comenzar?",
    answer:
      "No. El Método 365 está pensado para jugadores de todos los niveles y se adapta a tu punto de partida.",
  },
  {
    question: "¿Cómo son las clases?",
    answer:
      "Cada sesión combina teoría, ejercicios, análisis de partidas y seguimiento para que avances de forma constante.",
  },
  {
    question: "¿Qué temas aprenderé?",
    answer:
      "Trabajamos fundamentos, aperturas, medio juego, cálculo, finales y análisis de posiciones relevantes.",
  },
];

export function ReviewsAndFaqSection() {
  return (
    <>
      <section className="section section_theme_light reviews">
        <div className="section__inner">
          <div className="reviews__head">
            <h2 className="reviews__title">Lo que dicen los alumnos</h2>
            <div className="reviews__divider" />
          </div>

          <div className="reviews__grid">
            {reviews.map((review) => (
              <article key={review.author} className="review-card">
                <p className="review-card__quote">“{review.quote}”</p>
                <div className="review-card__author">
                  <div className="review-card__avatar">{review.author[0]}</div>
                  <strong>{review.author}</strong>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section section_theme_dark faq">
        <div className="section__inner">
          <div className="faq__grid">
            <div>
              <span className="section__eyebrow">Preguntas frecuentes</span>
              <h2 className="section__title">
                Todo lo que necesitas saber antes de empezar.
              </h2>
              <p className="section__text">
                Si te queda alguna duda, escríbenos y la resolvemos contigo.
              </p>
              <Link
                href="https://wa.me/520000000000"
                className="button button_variant_primary faq__cta"
              >
                Hablar con nosotros
              </Link>
            </div>
            <div className="faq__list">
              {faqs.map((faq) => (
                <article key={faq.question} className="faq-item">
                  <strong className="faq-item__question">{faq.question}</strong>
                  <p className="faq-item__answer">{faq.answer}</p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
