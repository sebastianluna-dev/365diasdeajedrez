/** The sections of the home page, in the order of the owner's design; each one can be switched off. */
export interface HomeSectionsConfig {
  hero: boolean;
  figures: boolean;
  classes: boolean;
  team: boolean;
  courses: boolean;
  platform: boolean;
  adventure: boolean;
  information: boolean;
  testimonials: boolean;
  faq: boolean;
  closing: boolean;
}

export interface HomePageConfig {
  enabled: boolean;
  sections: HomeSectionsConfig;
}

/** A link of the site's header or footer: its words and where it goes. */
export interface SiteNavLink {
  label: string;
  href: string;
}

/**
 * An action that opens WhatsApp with a message already written: the button
 * says `label`, the chat opens with `message`. The number is the CMS's
 * (`site-settings`).
 */
export interface SiteWhatsappAction {
  label: string;
  message: string;
}

/** What every page of the site's new look shares: its header and its footer. */
export interface SiteShellConfig {
  /** The header's links, in order. */
  nav: SiteNavLink[];
  /** The header's main button, which opens WhatsApp. */
  headerCta: SiteWhatsappAction;
  /** The footer's columns of links, in order (the contact column is always added after them). */
  footerColumns: SiteFooterColumn[];
  /** The footer's band that sends someone to the other landing («¿Eres maestro?…»). */
  footerCrossLink: SiteFooterCrossLink;
  /** The academy's address, written in the footer. */
  contactEmail: string;
}

/** A column of the footer: its heading and its links. */
export interface SiteFooterColumn {
  title: string;
  links: SiteNavLink[];
}

/** The footer's band to the other landing: a question, the link and a line about where it leads. */
export interface SiteFooterCrossLink {
  question: string;
  label: string;
  href: string;
  note: string;
}

export interface SiteConfig {
  home: HomePageConfig;
  shell: SiteShellConfig;
}
