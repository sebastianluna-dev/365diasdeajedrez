import Link from "next/link";
import "./reviews.css";

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
      <section className="sectionBlock reviewSection">
        <div className="sectionInner">
          <div className="reviewHead">
            <h2>Lo que dicen los alumnos</h2>
            <div className="reviewDivider" />
          </div>

          <div className="reviewGrid">
            {reviews.map((review) => (
              <article key={review.author} className="reviewCard">
                <p>“{review.quote}”</p>
                <div className="reviewAuthor">
                  <div className="reviewAvatar">{review.author[0]}</div>
                  <strong>{review.author}</strong>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="sectionBlock faqSection">
        <div className="sectionInner">
          <div className="faqGrid">
            <div>
              <span className="sectionEyebrow">Preguntas frecuentes</span>
              <h2 className="sectionTitle">
                Todo lo que necesitas saber antes de empezar.
              </h2>
              <p className="sectionText">
                Si te queda alguna duda, escríbenos y la resolvemos contigo.
              </p>
              <Link
                href="https://wa.me/520000000000"
                className="primaryBtn"
                style={{ marginTop: 24 }}
              >
                Hablar con nosotros
              </Link>
            </div>
            <div className="faqList">
              {faqs.map((faq) => (
                <article key={faq.question} className="faqItem">
                  <strong>{faq.question}</strong>
                  <p>{faq.answer}</p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
