export interface HomeSectionsConfig {
  hero: boolean;
  program: boolean;
  teacher: boolean;
  mentors: boolean;
  plans: boolean;
  resources: boolean;
  reviews: boolean;
  faq: boolean;
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

/**
 * The shell of the teachers' landing (`/para-profesores`): the same header and
 * footer, with links to its own sections and its own main button.
 */
export interface TeachersShellConfig {
  nav: SiteNavLink[];
  headerCta: SiteWhatsappAction;
  footerNav: SiteNavLink[];
}

export interface SiteConfig {
  home: HomePageConfig;
  shell: SiteShellConfig;
  teachersShell: TeachersShellConfig;
}
