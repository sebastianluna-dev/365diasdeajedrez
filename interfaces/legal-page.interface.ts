export interface LegalCardAction {
  label: string;
  href: string;
}

export interface LegalCard {
  id?: string;
  title: string;
  paragraphs?: string[];
  items?: string[];
  highlighted?: boolean;
  action?: LegalCardAction;
}

export interface LegalClosing {
  title: string;
  paragraphs: string[];
}

export interface LegalPageContent {
  title: string;
  intro: string;
  updatedLabel: string;
  cards: LegalCard[];
  closing: LegalClosing;
}
