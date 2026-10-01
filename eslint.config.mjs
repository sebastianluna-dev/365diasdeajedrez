import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

// Accessibility of the markup. eslint-config-next registers eslint-plugin-jsx-a11y
// and switches on six of its rules as warnings; this is the plugin's own
// recommended set, by name and as errors, so CI holds it. The rules are listed
// instead of spreading the plugin's config because the plugin is already
// registered (spreading it redefines it and ESLint refuses) and is not a direct
// dependency of ours to import.
//
// `no-autofocus` is left out: every `autoFocus` here is the first field of a
// form the person has just asked for (a dialog that opens, the login page),
// which is where the focus belongs.
const accessibilityRules = {
  "jsx-a11y/alt-text": "error",
  "jsx-a11y/anchor-has-content": "error",
  "jsx-a11y/anchor-is-valid": "error",
  "jsx-a11y/aria-activedescendant-has-tabindex": "error",
  "jsx-a11y/aria-props": "error",
  "jsx-a11y/aria-proptypes": "error",
  "jsx-a11y/aria-role": "error",
  "jsx-a11y/aria-unsupported-elements": "error",
  "jsx-a11y/autocomplete-valid": "error",
  "jsx-a11y/click-events-have-key-events": "error",
  "jsx-a11y/heading-has-content": "error",
  "jsx-a11y/html-has-lang": "error",
  "jsx-a11y/iframe-has-title": "error",
  "jsx-a11y/img-redundant-alt": "error",
  "jsx-a11y/interactive-supports-focus": [
    "error",
    { tabbable: ["button", "checkbox", "link", "searchbox", "spinbutton", "switch", "textbox"] },
  ],
  // A <label> that wraps one of the platform's own controls labels it: the
  // rule only knows native ones unless it is told.
  "jsx-a11y/label-has-associated-control": [
    "error",
    { controlComponents: ["PlatformSelect", "PlatformDatePicker"], assert: "either", depth: 3 },
  ],
  "jsx-a11y/media-has-caption": "error",
  "jsx-a11y/mouse-events-have-key-events": "error",
  "jsx-a11y/no-access-key": "error",
  "jsx-a11y/no-distracting-elements": "error",
  "jsx-a11y/no-interactive-element-to-noninteractive-role": [
    "error",
    { tr: ["none", "presentation"], canvas: ["img"] },
  ],
  "jsx-a11y/no-noninteractive-element-interactions": [
    "error",
    {
      handlers: ["onClick", "onError", "onLoad", "onMouseDown", "onMouseUp", "onKeyPress", "onKeyDown", "onKeyUp"],
      alert: ["onKeyUp", "onKeyDown", "onKeyPress"],
      body: ["onError", "onLoad"],
      dialog: ["onKeyUp", "onKeyDown", "onKeyPress"],
      iframe: ["onError", "onLoad"],
      img: ["onError", "onLoad"],
    },
  ],
  "jsx-a11y/no-noninteractive-element-to-interactive-role": [
    "error",
    {
      ul: ["listbox", "menu", "menubar", "radiogroup", "tablist", "tree", "treegrid"],
      ol: ["listbox", "menu", "menubar", "radiogroup", "tablist", "tree", "treegrid"],
      li: ["menuitem", "menuitemradio", "menuitemcheckbox", "option", "row", "tab", "treeitem"],
      table: ["grid"],
      td: ["gridcell"],
      fieldset: ["radiogroup", "presentation"],
    },
  ],
  "jsx-a11y/no-noninteractive-tabindex": ["error", { tags: [], roles: ["tabpanel"], allowExpressionValues: true }],
  "jsx-a11y/no-redundant-roles": "error",
  "jsx-a11y/no-static-element-interactions": [
    "error",
    {
      allowExpressionValues: true,
      handlers: ["onClick", "onMouseDown", "onMouseUp", "onKeyPress", "onKeyDown", "onKeyUp"],
    },
  ],
  "jsx-a11y/role-has-required-aria-props": "error",
  "jsx-a11y/role-supports-aria-props": "error",
  "jsx-a11y/scope": "error",
  "jsx-a11y/tabindex-no-positive": "error",
};

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  { files: ["**/*.tsx"], rules: accessibilityRules },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Scripts imported from the design kit: they are not app code and use old
    // React APIs on purpose.
    "public/**",
    // Generated Prisma client.
    "lib/platform-db/generated/**",
    // Vitest coverage report (`npm run test:coverage`).
    "coverage/**",
    // Documentation site (Nextra): it is another app, with its own package.json.
    "docs/**",
    // Static Storybook build (`npm run storybook:build`).
    "storybook-static/**",
  ]),
]);

export default eslintConfig;
