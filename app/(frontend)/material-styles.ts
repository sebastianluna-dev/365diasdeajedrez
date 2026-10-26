// Material 3 Expressive (`@material/web`'s `labs/gb`, the nightly pinned in
// package.json) for the public site's new look (2026-10-26): the system
// tokens and the stylesheets of the components the site draws, all in cascade
// layers, so `site-m4.css` and every section's stylesheet win where they meet.
// Only the CSS, as on the platform (app/(platform)/material-styles.ts): none
// of its web components, Lit or JavaScript, so the site stays static.
//
// Only the site's root layout imports this: `/admin` and the platform have
// their own root layouts and never load it from here.
import "@material/web/labs/gb/styles/m3.css";
import "@material/web/labs/gb/components/focus/focus-ring.css";
import "@material/web/labs/gb/components/ripple/ripple.css";
import "@material/web/labs/gb/components/button/button.css";
import "@material/web/labs/gb/components/chip/chip.css";
import "@material/web/labs/gb/components/iconbutton/icon-button.css";
