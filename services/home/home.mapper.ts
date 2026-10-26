import type { HomeFaq, HomeReviews } from "@/payload-types";
import type { FaqContent, ReviewsContent } from "./home.types";

export function mapFaq(faq: HomeFaq): FaqContent {
  return {
    eyebrow: faq.eyebrow,
    sectionTitle: faq.sectionTitle,
    sectionDescription: faq.sectionDescription,
    ctaLabel: faq.ctaLabel,
    questions: faq.questions.map((question) => ({ question: question.question, answer: question.answer })),
  };
}

export function mapReviews(homeReviews: HomeReviews): ReviewsContent {
  return {
    sectionTitle: homeReviews.sectionTitle,
    reviews: homeReviews.reviews.map((review) => ({
      avatarInitial: review.avatarInitial,
      avatarColor: review.avatarColor,
      name: review.name,
      time: review.time,
      messages: review.messages.map((message) => ({
        text: message.text,
        reacted: message.reacted ?? false,
      })),
      stat: {
        label: review.stat.label,
        value: review.stat.value,
        text: review.stat.text,
      },
    })),
  };
}
