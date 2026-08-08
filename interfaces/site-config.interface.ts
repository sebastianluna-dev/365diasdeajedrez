export interface HomeSectionsConfig {
  hero: boolean;
  program: boolean;
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

export interface SiteConfig {
  home: HomePageConfig;
}
