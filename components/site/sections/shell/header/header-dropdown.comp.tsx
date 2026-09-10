"use client";

import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { useId, useState } from "react";

interface HeaderDropdownProps {
  label: string;
  links: { label: string; href: string }[];
}

// With the mouse it still opens through CSS (`:hover`); the state here is for
// the keyboard and screen readers: `aria-expanded` says whether it is open,
// click toggles it, Escape closes it and returns focus to the trigger, and
// tabbing out of the block closes it.
export function HeaderDropdown({ label, links }: HeaderDropdownProps) {
  const [open, setOpen] = useState(false);
  const menuId = useId();

  return (
    <div
      className={`site-header__dropdown${open ? " site-header__dropdown_open" : ""}`}
      onFocusCapture={() => setOpen(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setOpen(false);
      }}
      onKeyDown={(event) => {
        if (event.key !== "Escape" || !open) return;
        setOpen(false);
        event.currentTarget.querySelector("button")?.focus();
      }}
    >
      <button
        type="button"
        className="site-header__dropdown-trigger"
        aria-haspopup="true"
        aria-expanded={open}
        aria-controls={menuId}
        onClick={() => setOpen((current) => !current)}
      >
        {label}
        <ChevronDown size={14} />
      </button>
      <div id={menuId} className="site-header__dropdown-menu">
        {links.map((link, index) => (
          <Link key={`${link.href}-${index}`} href={link.href}>
            {link.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
