import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { LOGIN_PATH } from "@/constants/platform/auth.const";
import { Logo } from "@/components/common/logo.comp";
import { getHeaderData } from "@/services/home/home.service";
import { HeaderDropdown } from "./header-dropdown.comp";
import { HeaderMobileMenu } from "./header-mobile-menu.comp";
import "./header.section.css";

interface HeaderProps {
  theme?: "dark" | "light";
}

// El botón principal del header es la entrada a la plataforma, y por eso su
// texto y su destino van fijos en el código en lugar de salir del CMS: un
// rótulo editable podría acabar prometiendo algo distinto de lo que hace el
// enlace. El campo `ctaLabel` del global `home-header` sigue existiendo (y lo
// sigue mapeando services/home), pero ya no lo lee nadie.
const LOGIN_CTA_LABEL = "Iniciar sesión";

export async function Header({ theme = "dark" }: HeaderProps) {
  const content = await getHeaderData();

  return (
    <div className={`site-header-nav site-header-nav_theme_${theme}`}>
      <div className="site-header-nav__inner">
        <div className="site-header-bar">
          <nav className="site-header">
            {theme === "light" ? (
              <Logo theme="light" accent="red" />
            ) : (
              <Logo theme="dark" accent="orange" />
            )}

            <div className="site-header__links">
              {content.navItems.map((item, index) =>
                item.type === "link" ? (
                  <Link key={`${item.href}-${index}`} href={item.href}>
                    {item.label}
                  </Link>
                ) : (
                  <HeaderDropdown key={`${item.label}-${index}`} label={item.label} links={item.links} />
                ),
              )}
            </div>
          </nav>
          <Link href={LOGIN_PATH} className="site-header__button">
            {LOGIN_CTA_LABEL}
            <ChevronRight size={16} />
          </Link>

          <HeaderMobileMenu navItems={content.navItems} ctaLabel={LOGIN_CTA_LABEL} ctaHref={LOGIN_PATH} />
        </div>

        <div className="site-header-nav__spacer" />
      </div>
    </div>
  );
}
