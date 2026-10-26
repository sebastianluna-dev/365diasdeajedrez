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
  /** The footer's links, in order. */
  footerNav: SiteNavLink[];
  /** The academy's address, written in the footer. */
  contactEmail: string;
}

export interface SiteConfig {
  home: HomePageConfig;
  shell: SiteShellConfig;
}
