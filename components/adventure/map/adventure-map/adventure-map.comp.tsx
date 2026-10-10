"use client";

import { useEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";
import { MapHud } from "@/components/adventure/map/map-hud/map-hud.comp";
import { MapLayer, type MapLayerSize } from "@/components/adventure/map/map-layer/map-layer.comp";
import { RivalCard } from "@/components/adventure/rival-card/rival-card/rival-card.comp";
import {
  PlatformConfirmPopup,
  type PlatformConfirmPopupHandle,
} from "@/components/platform/shared/platform-confirm-popup/platform-confirm-popup.comp";
import {
  PlatformPopup,
  type PlatformPopupHandle,
} from "@/components/platform/shared/platform-popup/platform-popup.comp";
import type { AdventureArt, AdventureZoneSeed } from "@/lib/adventure/adventure.types";
import { zoneAt } from "@/lib/adventure/map-geometry";
import type { AdventureProgressView } from "@/services/adventure/adventure.types";
import "@/components/adventure/adventure.css";
import "./adventure-map.comp.css";

interface AdventureMapProps {
  progress: AdventureProgressView;
  /** The adventure's zones, in story order: the pages of the notebook and the HUD's name. */
  zones: readonly AdventureZoneSeed[];
  /** Where the live layer sits over each layout of the art. */
  art: AdventureArt;
  /** The person: their initials are the token's and their name goes on the membership card. */
  player: { initials: string; name: string };
  /** The encounter just beaten when the person comes back from its game, for the sequence that plays it. */
  victory: number | null;
  /** `startAdventureEncounter`, or a stub in Storybook: what «Empezar» and «Volver a retar» submit. */
  action: (formData: FormData) => void | Promise<void>;
  /** Scroll the stamp to play to the middle of the window on opening (the page does; a sheet that shows the map in a corner does not). */
  autoScroll?: boolean;
}

const LAYERS: readonly { size: MapLayerSize; key: "desktop" | "tablet" | "mobile" }[] = [
  { size: "desktop", key: "desktop" },
  { size: "tablet", key: "tablet" },
  { size: "mobile", key: "mobile" },
];

/**
 * The adventure's map: the three layouts of the world, one of them shown by the
 * width of the window, a row over it that says where one is, and the sheet of a
 * rival that opens when its stamp is pressed. It is the hand that holds the
 * state — which rival is open, which zone the window is over — and the two
 * things that need the browser: it scrolls the available stamp to the middle of
 * the window when it opens, and it measures the platform's bar so the row
 * sticks right under it.
 */
export function AdventureMap({ progress, zones, art, player, victory, action, autoScroll = true }: AdventureMapProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const popupRef = useRef<PlatformPopupHandle>(null);
  const confirmRef = useRef<PlatformConfirmPopupHandle>(null);
  /** What the person chose in the card, held while they confirm closing their open game. */
  const pendingStart = useRef<FormData | null>(null);
  /** Raised when the card closes, so it opens fresh (the colour chosen is not kept). */
  const [cardKey, setCardKey] = useState(0);
  const [selectedOrder, setSelectedOrder] = useState<number | null>(null);
  const [zoneSlug, setZoneSlug] = useState(progress.current?.zone ?? zones[zones.length - 1]?.slug);

  const selected = progress.encounters.find((encounter) => encounter.order === selectedOrder) ?? null;
  const zone = zones.find((candidate) => candidate.slug === zoneSlug) ?? zones[0]!;
  const previous = selected
    ? (progress.encounters.find((encounter) => encounter.order === selected.order - 1) ?? null)
    : null;
  const openGame = progress.openGame;

  // The row sticks under the platform's bar, whatever height the bar has (one row or two).
  useEffect(() => {
    const root = rootRef.current;
    const bar = document.querySelector<HTMLElement>(".platform-shell__bar");
    if (!root || !bar || typeof ResizeObserver === "undefined") return;
    const apply = () => root.style.setProperty("--map-bar", `${bar.offsetHeight}px`);
    apply();
    const observer = new ResizeObserver(apply);
    observer.observe(bar);
    return () => observer.disconnect();
  }, []);

  // On opening, the stamp to play (or the last one, when all are beaten) goes to the middle of the window.
  useEffect(() => {
    if (!autoScroll) return;
    const target = [...(rootRef.current?.querySelectorAll<HTMLElement>('[data-focus="true"]') ?? [])].find(
      (element) => element.offsetParent !== null,
    );
    if (!target) return;
    const rect = target.getBoundingClientRect();
    window.scrollTo({
      top: window.scrollY + rect.top + rect.height / 2 - window.innerHeight * 0.55,
      behavior: "instant",
    });
  }, [autoScroll]);

  // The zone the middle of the window is over, from the shown layer's own scale.
  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const layer = [...(rootRef.current?.querySelectorAll<HTMLElement>(".map-layer") ?? [])].find(
        (element) => element.offsetParent !== null,
      );
      const world = layer?.querySelector<HTMLElement>(".map-layer__world");
      const size = layer?.dataset.size as MapLayerSize | undefined;
      if (!world || !size) return;
      const layout = art[size];
      const scale = world.getBoundingClientRect().width / layout.width;
      const y = (window.innerHeight * 0.5 - world.getBoundingClientRect().top) / scale;
      setZoneSlug(zoneAt(layout, y).zone);
    };
    const schedule = () => {
      if (frame === 0) frame = requestAnimationFrame(update);
    };
    schedule();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      if (frame !== 0) cancelAnimationFrame(frame);
    };
  }, [art]);

  const openCard = (order: number, trigger: HTMLElement) => {
    // The card's content is in the page when the dialog opens, so the focus finds its first control.
    flushSync(() => setSelectedOrder(order));
    popupRef.current?.open({ currentTarget: trigger });
    // Opening focuses the first control, the colour, at the card's foot: the card is read from its top.
    document.activeElement?.closest("dialog")?.scrollTo({ top: 0 });
  };

  return (
    <div ref={rootRef} className="adventure adventure-map" data-victory={victory ?? undefined}>
      <MapHud
        zone={{ kind: zone.kind, name: zone.name }}
        beaten={progress.beaten}
        total={progress.total}
        stars={progress.stars}
      />
      {LAYERS.map(({ size, key }) => (
        <MapLayer
          key={size}
          size={size}
          layout={art[key]}
          zones={zones}
          progress={progress}
          player={player}
          onOpen={openCard}
        />
      ))}

      <PlatformPopup
        ref={popupRef}
        title={
          selected
            ? `Ficha de rival · N.º ${String(selected.order).padStart(2, "0")} de ${progress.total}`
            : "Ficha de rival"
        }
        size="md"
        phone="sheet"
        onClose={() => setCardKey((key) => key + 1)}
      >
        {selected && (
          <RivalCard
            key={`${selected.order}-${cardKey}`}
            adventure={progress.slug}
            encounter={selected}
            postmark={zones.find((candidate) => candidate.slug === selected.zone)?.postmark ?? ""}
            previousName={previous?.name ?? null}
            playerName={player.name}
            openGame={openGame}
            action={action}
            onReplace={(formData) => {
              pendingStart.current = formData;
              confirmRef.current?.open();
            }}
            onCancel={() => popupRef.current?.close()}
          />
        )}
      </PlatformPopup>

      {/* A sibling of the card's popup, opened over it: closing the open game is a question, not a body that changes. */}
      {openGame && (
        <PlatformConfirmPopup
          ref={confirmRef}
          verb="Quitar"
          subject={`partida contra ${openGame.rival.name}`}
          title={`¿Quitar tu partida en curso contra ${openGame.rival.name}?`}
          description="Empezar este encuentro cierra la partida que tienes abierta: si ya hiciste dos jugadas, la pierdes por abandono."
          confirmLabel="Quitar y empezar"
          pendingLabel="Preparando…"
          action={async () => {
            const formData = pendingStart.current;
            if (!formData) return;
            formData.set("replace", "1");
            await action(formData);
          }}
          onDone={() => popupRef.current?.close()}
        />
      )}
    </div>
  );
}
