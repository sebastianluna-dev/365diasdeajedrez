import Link from "next/link";
import "./clock-header.comp.css";

export function ClockHeader() {
  return (
    <div className="clock-header">
      <div className="clock-header__pill">
        <Link href="/" className="brand">
          <span className="brand__accent">365</span>
          <span>DiasDeAjedrez</span>
        </Link>

        <nav className="clock-header__nav">
          <Link href="/" className="clock-header__nav-link">
            Inicio
          </Link>
          <Link href="/blog" className="clock-header__nav-link">
            Blog
          </Link>
          <span className="clock-header__dropdown">
            <span className="clock-header__dropdown-label">Herramientas</span>
            <span className="clock-header__dropdown-menu">
              <span className="clock-header__dropdown-panel">
                <Link href="/reloj-de-ajedrez" className="clock-header__dropdown-item">
                  Reloj
                </Link>
              </span>
            </span>
          </span>
          <Link href="/" className="clock-header__nav-link">
            Nosotros
          </Link>
        </nav>
      </div>
      <Link href="/#planes" className="clock-header__button">
        Agenda una llamada
      </Link>
    </div>
  );
}
