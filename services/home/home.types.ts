export interface FaqQuestionContent {
  question: string;
  answer: string;
}

export interface FaqContent {
  eyebrow: string;
  sectionTitle: string;
  sectionDescription: string;
  ctaLabel: string;
  questions: FaqQuestionContent[];
}

export interface ReviewMessageContent {
  text: string;
  reacted: boolean;
}

export interface ReviewStatContent {
  label: string;
  value: string;
  text: string;
}

export type ReviewAvatarColor = "teal" | "orange" | "gold";

export interface ReviewContent {
  avatarInitial: string;
  avatarColor: ReviewAvatarColor;
  name: string;
  time: string;
  messages: ReviewMessageContent[];
  stat: ReviewStatContent;
}

export interface ReviewsContent {
  sectionTitle: string;
  reviews: ReviewContent[];
}
