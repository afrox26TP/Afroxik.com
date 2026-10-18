import { useEffect, useState } from "react";
import LetterSwap from "../ui/LetterSwap";
import MetalLayer from "../ui/MetalLayer";
import PerformanceToggle from "../ui/PerformanceToggle";
import { BrandMark, IconCat, IconClose, IconGlobe, IconMenu } from "../ui/icons";
import { CAT_POSTER_SRC } from "../../lib/cat";
import { useT } from "../../lib/i18n";

// Plovoucí „pill“ navigace se skleněným pozadím (inspirace Streamally + Komunita).
export default function SiteNav({
  name,
  sections,
  active,
  performanceMode,
  onPerformanceChange,
  catEnabled,
  onCatToggle,
  onLangToggle,
  onContact,
  lowMotion,
}) {
  const t = useT();
  const langSwitch = t.nav.langSwitch;
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
        <nav className="site-nav__inner" aria-label={t.nav.label}>
          <a href="#top" className="brand" onClick={closeMenu} aria-label={`${name} – ${t.backToTop}`}>
            {/* Domeček kočky: šedá silueta, dokud kočka lítá venku; schovaná sem přiletí a tancuje. */}
            <span className="brand__home" data-cat={catEnabled ? "out" : "home"}>
              <BrandMark className="brand__frame" letter={false} />
              <img className="brand__ghost" src={CAT_POSTER_SRC} alt="" width="360" height="400" data-cat-home="" />
            </span>
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
              aria-label={catEnabled ? t.nav.catHide : t.nav.catShow}
              title={catEnabled ? t.nav.catHide : t.nav.catShow}
              onClick={onCatToggle}
            >
              <IconCat />
            </button>
            <button
              type="button"
              className="lang-toggle"
              lang={langSwitch.lang}
              aria-label={langSwitch.label}
              title={langSwitch.label}
              onClick={onLangToggle}
            >
              {langSwitch.short}
            </button>
            <button type="button" className="nav-cta metal-btn" onClick={handleContact}>
              <MetalLayer still={lowMotion} />
              <span className="metal-btn__core">
                <LetterSwap text={t.contactMe} />
              </span>
            </button>
            <button
              type="button"
              className="nav-toggle"
              aria-expanded={menuOpen}
              aria-controls="mobile-menu"
              aria-label={menuOpen ? t.nav.menuClose : t.nav.menuOpen}
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
            <IconCat /> {catEnabled ? t.nav.catOut : t.nav.catHome}
          </button>
          <button
            type="button"
            className="lang-toggle lang-toggle--wide"
            lang={langSwitch.lang}
            aria-label={langSwitch.label}
            onClick={onLangToggle}
          >
            <IconGlobe /> {langSwitch.name}
          </button>
          <button type="button" className="nav-cta nav-cta--lg metal-btn" onClick={handleContact}>
            <MetalLayer still={lowMotion} />
            <span className="metal-btn__core">{t.contactMe}</span>
          </button>
        </div>
      )}
    </>
  );
}
