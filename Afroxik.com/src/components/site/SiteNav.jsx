import { useEffect, useState } from "react";
import LetterSwap from "../ui/LetterSwap";
import PerformanceToggle from "../ui/PerformanceToggle";
import { BrandMark, IconCat, IconClose, IconMenu } from "../ui/icons";

// Plovoucí „pill“ navigace se skleněným pozadím (inspirace Streamally + Komunita).
export default function SiteNav({
  name,
  sections,
  active,
  performanceMode,
  onPerformanceChange,
  catEnabled,
  onCatToggle,
  onContact,
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(() => typeof window !== "undefined" && window.scrollY > 24);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!menuOpen) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKeyDown = (event) => {
      if (event.key === "Escape") setMenuOpen(false);
    };
    const desktop = window.matchMedia("(min-width: 901px)");
    const onBreakpoint = (event) => {
      if (event.matches) setMenuOpen(false);
    };

    document.addEventListener("keydown", onKeyDown);
    desktop.addEventListener("change", onBreakpoint);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
      desktop.removeEventListener("change", onBreakpoint);
    };
  }, [menuOpen]);

  const closeMenu = () => setMenuOpen(false);
  const handleContact = () => {
    setMenuOpen(false);
    onContact();
  };

  return (
    <>
      <header className={`site-nav${scrolled ? " is-scrolled" : ""}${menuOpen ? " is-menu-open" : ""}`}>
        <nav className="site-nav__inner" aria-label="Hlavní navigace">
          <a href="#top" className="brand" onClick={closeMenu} aria-label={`${name} – zpět nahoru`}>
            <BrandMark className="brand__mark" />
            <span className="brand__name" aria-hidden="true">
              {name}
            </span>
          </a>

          <ul className="site-nav__links">
            {sections.map((section) => (
              <li key={section.id}>
                <a
                  href={`#${section.id}`}
                  className={`nav-link${active === section.id ? " is-active" : ""}`}
                  aria-current={active === section.id ? "location" : undefined}
                >
                  <LetterSwap text={section.label} />
                </a>
              </li>
            ))}
          </ul>

          <div className="site-nav__actions">
            <PerformanceToggle className="site-nav__perf" value={performanceMode} onChange={onPerformanceChange} />
            <button
              type="button"
              className="cat-toggle"
              aria-pressed={catEnabled}
              aria-label={catEnabled ? "Schovat kočku" : "Ukázat kočku"}
              title={catEnabled ? "Schovat kočku" : "Ukázat kočku"}
              onClick={onCatToggle}
            >
              <IconCat />
            </button>
            <button type="button" className="nav-cta" onClick={handleContact}>
              <LetterSwap text="Napiš mi" />
            </button>
            <button
              type="button"
              className="nav-toggle"
              aria-expanded={menuOpen}
              aria-controls="mobile-menu"
              aria-label={menuOpen ? "Zavřít menu" : "Otevřít menu"}
              onClick={() => setMenuOpen((open) => !open)}
            >
              {menuOpen ? <IconClose /> : <IconMenu />}
            </button>
          </div>
        </nav>
      </header>

      {menuOpen && (
        <div id="mobile-menu" className="mobile-menu">
          <ul className="mobile-menu__links">
            {sections.map((section, index) => (
              <li key={section.id} style={{ "--i": index }}>
                <a
                  href={`#${section.id}`}
                  className={`mobile-menu__link${active === section.id ? " is-active" : ""}`}
                  onClick={closeMenu}
                >
                  {section.label}
                </a>
              </li>
            ))}
          </ul>
          <PerformanceToggle value={performanceMode} onChange={onPerformanceChange} />
          <button type="button" className="cat-toggle cat-toggle--wide" aria-pressed={catEnabled} onClick={onCatToggle}>
            <IconCat /> {catEnabled ? "Kočka: zapnutá" : "Kočka: vypnutá"}
          </button>
          <button type="button" className="nav-cta nav-cta--lg" onClick={handleContact}>
            Napiš mi
          </button>
        </div>
      )}
    </>
  );
}
