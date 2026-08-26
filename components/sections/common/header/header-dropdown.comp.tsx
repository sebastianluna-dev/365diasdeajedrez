import Link from "next/link";
import { ChevronDown } from "lucide-react";

interface HeaderDropdownProps {
  label: string;
  links: { label: string; href: string }[];
}

export function HeaderDropdown({ label, links }: HeaderDropdownProps) {
  return (
    <div className="site-header__dropdown">
      <button type="button" className="site-header__dropdown-trigger">
        {label}
        <ChevronDown size={14} />
      </button>
      <div className="site-header__dropdown-menu">
        {links.map((link, index) => (
          <Link key={`${link.href}-${index}`} href={link.href}>
            {link.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
