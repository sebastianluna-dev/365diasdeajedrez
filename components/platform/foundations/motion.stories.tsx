import { useEffect, useLayoutEffect, useRef, useState, type RefObject } from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { POPUP_EXIT_MS } from "@/components/chess/game-viewer/use-lingering.hook";
import {
  PlatformPopup,
  type PlatformPopupHandle,
} from "@/components/platform/shared/platform-popup/platform-popup.comp";
import { PlatformSelect } from "@/components/platform/shared/platform-select/platform-select.comp";
import "./foundations.css";

/** A computed list (`opacity, transform`), split on the commas that are not inside a `cubic-bezier(…)`. */
function listOf(value: string): string[] {
  const parts: string[] = [];
  let depth = 0;
  let current = "";
  for (const character of value) {
    if (character === "(") depth += 1;
    if (character === ")") depth -= 1;
    if (character === "," && depth === 0) {
      parts.push(current.trim());
      current = "";
    } else {
      current += character;
    }
  }
  return [...parts, current.trim()];
}

/** "0.16s" → "160ms". */
function inMilliseconds(duration: string): string {
  return `${Math.round(parseFloat(duration) * (duration.endsWith("ms") ? 1 : 1000))}ms`;
}

/** The element's own transitions as the browser resolved them: "opacity 160ms ease-out · …", or "none". */
function transitionOf(element: Element): string {
  const style = getComputedStyle(element);
  const durations = listOf(style.transitionDuration);
  const timings = listOf(style.transitionTimingFunction);
  const behaviours = listOf(style.transitionBehavior ?? "");
  const parts = listOf(style.transitionProperty).flatMap((property, index) => {
    const duration = durations[index % durations.length] ?? "0s";
    if (parseFloat(duration) === 0) return [];
    const how = behaviours[index] === "allow-discrete" ? "allow-discrete" : timings[index % timings.length];
    return [`${property} ${inMilliseconds(duration)} ${how}`];
  });
  return parts.length > 0 ? parts.join(" · ") : "none";
}

/** The element's animation as the browser resolved it: "platform-page-in 220ms ease-out", or "none". */
function animationOf(element: Element): string {
  const style = getComputedStyle(element);
  if (style.animationName === "none") return "none";
  const durations = listOf(style.animationDuration);
  const timings = listOf(style.animationTimingFunction);
  return listOf(style.animationName)
    .map((name, index) => `${name} ${inMilliseconds(durations[index] ?? "0s")} ${timings[index] ?? ""}`.trim())
    .join(" · ");
}

/** What the browser reports for the element behind `ref`, read again whenever `key` changes. */
function useMotion(ref: RefObject<Element | null>, read: (element: Element) => string, key: unknown = null): string {
  const [spec, setSpec] = useState("…");
  useEffect(() => {
    if (ref.current) setSpec(read(ref.current));
  }, [ref, read, key]);
  return spec;
}

/**
 * The select's list as it opens and as it closes, read each time Radix flips
 * its `data-state`. Until the list is positioned Radix holds it with an inline
 * `animation: none`, so that reading waits for the style to be let go; and a
 * list that leaves with no animation (under reduced motion) is gone before it
 * can be read, which is itself the answer.
 */
function usePopupMotion(stage: RefObject<HTMLElement | null>): Record<string, string> {
  const [seen, setSeen] = useState<Record<string, string>>({});
  useEffect(() => {
    const root = stage.current;
    if (!root) return;
    let open = false;
    const record = (state: string, spec: string) =>
      setSeen((previous) => (previous[state] === spec ? previous : { ...previous, [state]: spec }));
    const observer = new MutationObserver(() => {
      const list = root.querySelector<HTMLElement>(".platform-select__content");
      const state = list?.getAttribute("data-state");
      if (!list || !state) {
        if (open) record("closed", "none, taken away at once");
        open = false;
        return;
      }
      open = state === "open";
      if (list.style.animationName === "none") return;
      record(state, animationOf(list));
    });
    observer.observe(root, {
      subtree: true,
      childList: true,
      attributes: true,
      attributeFilter: ["data-state", "style"],
    });
    return () => observer.disconnect();
  }, [stage]);
  return seen;
}

function Spec({ children }: { children: string }) {
  return <p className="foundations__spec">The browser says: {children}</p>;
}

function PageEntrance() {
  const [run, setRun] = useState(0);
  const page = useRef<HTMLDivElement>(null);
  const spec = useMotion(page, animationOf, run);
  return (
    <section className="foundations__motion" aria-labelledby="motion-page">
      <h2 id="motion-page" className="foundations__group-title">
        A page comes in
      </h2>
      <p className="foundations__lead">
        <code>.platform-page</code> fades in with a short rise when it mounts, so taking the place of a segment&apos;s
        loading fallback is not a cut. It plays again on every soft navigation.
      </p>
      <div className="foundations__stage">
        <div key={run} ref={page} className="platform-page">
          <div className="platform-card">
            <h3 className="platform-card__title">Mis cursos</h3>
          </div>
        </div>
      </div>
      <Spec>{spec}</Spec>
      <div className="foundations__actions">
        <button type="button" className="platform-button platform-button_size_compact" onClick={() => setRun(run + 1)}>
          Replay
        </button>
      </div>
    </section>
  );
}

function DialogMotion() {
  const popup = useRef<PlatformPopupHandle>(null);
  const section = useRef<HTMLElement>(null);
  // The piece owns its `<dialog>`: the element is looked up under the section
  // before the motion is read from it.
  const dialog = useRef<HTMLDialogElement>(null);
  useLayoutEffect(() => {
    dialog.current = section.current?.querySelector("dialog") ?? null;
  }, []);
  const spec = useMotion(dialog, transitionOf);
  return (
    <section ref={section} className="foundations__motion" aria-labelledby="motion-dialog">
      <h2 id="motion-dialog" className="foundations__group-title">
        A popup comes in and goes out
      </h2>
      <p className="foundations__lead">
        Every popup inherits its motion from <code>.platform-dialog</code>, the frame under <code>PlatformPopup</code>{" "}
        and <code>PlatformConfirmPopup</code>, in CSS alone: one transition, the same in both directions, of the opacity
        and of a short rise with a slight scale, and the backdrop fades with it. No popup animates on its own. The rule,
        as <code>AGENTS.md</code> writes it: the opacity in 160 ms, the rise in 200 ms, <code>display</code> and{" "}
        <code>overlay</code> held for those 200 ms.
      </p>
      <Spec>{spec}</Spec>
      <div className="foundations__actions">
        <button
          type="button"
          className="platform-button platform-button_size_compact"
          onClick={(event) => popup.current?.open(event)}
        >
          Open the popup
        </button>
      </div>
      <PlatformPopup ref={popup} title="Un popup de la plataforma" size="sm">
        <div className="foundations__dialog-body">
          <p className="foundations__note">Se cierra con la misma transición con la que entró.</p>
          <div className="foundations__actions">
            <button
              type="button"
              className="platform-button platform-button_variant_ink"
              onClick={() => popup.current?.close()}
            >
              Cerrar
            </button>
          </div>
        </div>
      </PlatformPopup>
    </section>
  );
}

function PopupMotion() {
  const stage = useRef<HTMLDivElement>(null);
  const seen = usePopupMotion(stage);
  return (
    <section className="foundations__motion" aria-labelledby="motion-popup">
      <h2 id="motion-popup" className="foundations__group-title">
        A menu, a list, a calendar or a tip
      </h2>
      <p className="foundations__lead">
        The rule, as <code>AGENTS.md</code> writes it: 160 ms to come in (<code>ease-out</code>) and 120 ms to go out (
        <code>ease-in</code>). A Radix popup animates on its <code>data-state</code>; a menu mounted conditionally stays
        mounted for its exit with <code>useLingering</code>, whose <code>POPUP_EXIT_MS</code> is {POPUP_EXIT_MS} ms.
        Open the list and close it.
      </p>
      <div ref={stage} className="foundations__stage">
        <PlatformSelect
          aria-label="Nivel"
          defaultValue="intermedio"
          options={[
            { value: "inicial", label: "Inicial" },
            { value: "intermedio", label: "Intermedio" },
            { value: "avanzado", label: "Avanzado" },
          ]}
        />
      </div>
      <Spec>{`coming in, ${seen.open ?? "— (open the list)"}; going out, ${seen.closed ?? "— (close it)"}`}</Spec>
    </section>
  );
}

function AccentPress() {
  const button = useRef<HTMLButtonElement>(null);
  const spec = useMotion(button, transitionOf);
  return (
    <section className="foundations__motion" aria-labelledby="motion-press">
      <h2 id="motion-press" className="foundations__group-title">
        The accent button sinks
      </h2>
      <p className="foundations__lead">
        The platform&apos;s one button that moves: raised on a hard edge, it sinks onto it while it is held down. Press
        it and hold.
      </p>
      <div className="foundations__stage">
        <button ref={button} type="button" className="platform-button platform-button_variant_accent">
          Aprender
        </button>
      </div>
      <Spec>{spec}</Spec>
    </section>
  );
}

function MotionPage() {
  const [reduced] = useState(() => window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  return (
    <div className="platform-page foundations">
      <header className="platform-page__head">
        <h1 className="platform-page__title">Motion</h1>
        <p className="platform-page__subtitle">Nothing that opens over the page appears or disappears in a cut.</p>
      </header>
      <p className="foundations__lead">
        Each sample is the platform&apos;s own class, and under it is what the browser reports for that element, so
        those figures are the stylesheets&apos; and not a copy of them. Where a motion has a rule of its own, the rule
        is written above it as <code>AGENTS.md</code> writes it: a stylesheet that drifts from its rule shows the
        difference here. Under <code>prefers-reduced-motion: reduce</code> every one of them is off
        {reduced ? " — and this machine asks for that, so the browser reports none" : ""}.
      </p>
      <PageEntrance />
      <DialogMotion />
      <PopupMotion />
      <AccentPress />
    </div>
  );
}

const meta = {
  title: "platform/foundations/Motion",
  parameters: {
    docs: {
      description: {
        component: `
The platform's motion, each kind played by the class that owns it: a page's
entrance (\`.platform-page\`), a dialog (\`.platform-dialog\`), a popup
(\`PlatformSelect\`, whose list animates on Radix's \`data-state\`) and the
accent button's press. The durations and curves printed under each are read
from the browser (\`getComputedStyle\`), so they are whatever the stylesheets
say today.

Reference: [Styling & design tokens › Popups come in and go out animated](/ui/styling#popups-come-in-and-go-out-animated) and [Conventions](/conventions) ("Whoever asks for less motion gets it everywhere") in the docs site.
`,
      },
    },
  },
  render: () => <MotionPage />,
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

/** The four motions of the platform, each with a way to play it again. */
export const Motion: Story = {};
