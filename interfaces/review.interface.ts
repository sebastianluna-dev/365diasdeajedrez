export interface ReviewStat {
  label: string;
  value: string;
  text: string;
}

export interface Review {
  slug: string;
  avatarInitial: string;
  name: string;
  time: string;
  messagesBeforeReaction: string[];
  reactionCount: number;
  messagesAfterReaction: string[];
  stat: ReviewStat;
}
