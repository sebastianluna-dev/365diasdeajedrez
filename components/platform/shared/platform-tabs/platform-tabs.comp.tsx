"use client";

import type { ReactNode } from "react";
import { Tabs } from "radix-ui";
import { CircleExclamationIcon } from "@/components/icons/circle-exclamation-icon.comp";
import "./platform-tabs.comp.css";

export interface PlatformTab {
  value: string;
  label: string;
  /**
   * Something on this tab stops what the screen is for (a save): the tab
   * carries the danger's mark and «con errores» in its name until it is
   * fixed, so an error on a tab nobody is looking at is still seen.
   */
  invalid?: boolean;
}

interface PlatformTabsProps {
  /** What the tabs divide, as the list's accessible name: «Pasos del ejercicio». */
  label: string;
  tabs: PlatformTab[];
  /** Controlled: the host owns which tab is open, so it can move to the one with an error. */
  value: string;
  onValueChange: (value: string) => void;
  /** The panels, one `PlatformTabPanel` per tab. */
  children: ReactNode;
}

/**
 * Steps of one screen as tabs, on Radix's `Tabs`: the arrows move between
 * them, Home and End go to the ends, and only the open tab's panel is
 * mounted. Unlike `StaffTabs`, which are pages, these are state: whoever
 * mounts them keeps every value outside the panels (a panel that closes
 * unmounts), and decides which one is open.
 */
export function PlatformTabs({ label, tabs, value, onValueChange, children }: PlatformTabsProps) {
  return (
    <Tabs.Root className="platform-tabs" value={value} onValueChange={onValueChange}>
      <Tabs.List className="platform-tabs__list" aria-label={label}>
        {tabs.map((tab) => (
          <Tabs.Trigger
            key={tab.value}
            value={tab.value}
            className={`platform-tabs__tab${tab.invalid ? " platform-tabs__tab_state_invalid" : ""}`}
            // The mark is a picture: the name says it in words, «Datos, con errores».
            aria-label={tab.invalid ? `${tab.label}, con errores` : undefined}
          >
            {tab.label}
            {tab.invalid && <CircleExclamationIcon variant="classic-solid" className="platform-tabs__mark" />}
          </Tabs.Trigger>
        ))}
      </Tabs.List>
      {children}
    </Tabs.Root>
  );
}

interface PlatformTabPanelProps {
  /** The tab it belongs to. */
  value: string;
  children: ReactNode;
}

/** One tab's content: a container that places what it is given, mounted while its tab is open. */
export function PlatformTabPanel({ value, children }: PlatformTabPanelProps) {
  return (
    <Tabs.Content value={value} className="platform-tabs__panel">
      {children}
    </Tabs.Content>
  );
}
