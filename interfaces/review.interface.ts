export interface ReviewMessage {
  text: string;
  reacted?: boolean;
}

export interface ReviewStat {
  label: string;
  value: string;
  text: string;
}

export type ReviewAvatarColor = "teal" | "orange" | "gold";

export interface Review {
  slug: string;
  avatarInitial: string;
  avatarColor: ReviewAvatarColor;
  name: string;
  time: string;
  messages: ReviewMessage[];
  stat: ReviewStat;
}
