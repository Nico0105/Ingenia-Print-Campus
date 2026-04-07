import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./MainNavbar.css";

export default function MainNavbar() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const lower = pathname.toLowerCase();
  const [menuOpen, setMenuOpen] = useState(false);
  const [hidden, setHidden] = useState(false);
  const lastScrollY = useRef(0);

  const go = (to) => {
    setMenuOpen(false);
    navigate(to);
  };

  useEffect(() => {
    const handleScroll = () => {
      const onGarantia = lower.includes('garantia');
      const onNosotros = lower.includes('nosotros');
      const shouldAutohide = onGarantia || onNosotros;
      const currentY = window.scrollY || window.pageYOffset;

      // Only apply autohide on selected pages (Garantia or Nosotros)
      if (!shouldAutohide) {
        if (hidden) setHidden(false);
        lastScrollY.current = currentY;
        return;
      }

      if (currentY > lastScrollY.current && currentY > 80) {
        setHidden(true);
      } else {
        setHidden(false);
      }

      lastScrollY.current = currentY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [pathname, hidden]);

  return (
    <nav className={`nos-nav ${hidden ? 'hidden' : ''}`}>
      <div className="nos-logo" onClick={() => go("/Home")}> 
        <img src="https://res.cloudinary.com/dvjmdhlac/image/upload/v1775435437/Logo_Principal_gq4gtt.png" alt="Logo Ingenia" />
      </div>

      <div className="nos-nav-logo" onClick={() => go("/Home")}>INGENIA PRINT</div>

      <div className="nav">
        <button className={`nav-btn ${pathname === "/Catalogo" ? "active" : ""}`} onClick={() => go("/Catalogo")}>Catalogo</button>
        <button className={`nav-btn ${pathname === "/Nosotros" ? "active" : ""}`} onClick={() => go("/Nosotros")}>Nosotros</button>
        <button className={`nav-btn ${pathname === "/Curso" ? "active" : ""}`} onClick={() => go("/Curso")}>Campus</button>
        <button className={`nav-btn ${pathname === "/Garantia" ? "active" : ""}`} onClick={() => go("/Garantia")}>Garantía</button>
      </div>

      {/* Hamburger (visible on tablet/mobile) */}
      <button
        className={`hamburger ${menuOpen ? 'open' : ''}`}
        aria-label="Toggle menu"
        onClick={() => setMenuOpen((s) => !s)}
      >
        <span />
        <span />
        <span />
      </button>

      {/* Mobile / Tablet dropdown menu */}
      <div className={`mobile-menu ${menuOpen ? 'open' : ''}`}>
        <div className="mobile-nav">
          <button className={`nav-btn ${pathname === "/Catalogo" ? "active" : ""}`} onClick={() => go("/Catalogo")}>Catalogo</button>
          <button className={`nav-btn ${pathname === "/Nosotros" ? "active" : ""}`} onClick={() => go("/Nosotros")}>Nosotros</button>
          <button className={`nav-btn ${pathname === "/Curso" ? "active" : ""}`} onClick={() => go("/Curso")}>Campus</button>
          <button className={`nav-btn ${pathname === "/Garantia" ? "active" : ""}`} onClick={() => go("/Garantia")}>Garantía</button>
        </div>
      </div>
    </nav>
  );
}
