import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./MainNavbar.css";

export default function MainNavbar() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const go = (to) => {
    setMenuOpen(false);
    navigate(to);
  };

  return (
    <nav className="nos-nav">
      <div className="nos-logo" onClick={() => go("/Home")}> 
        <img src="./Logo.png" alt="Logo Ingenia" />
      </div>

      <div className="nos-nav-logo">INGENIA PRINT</div>

      <div className="nav">
        <button className={`nav-btn ${pathname === "/Catalogo" ? "active" : ""}`} onClick={() => go("/Catalogo")}>Catalogo</button>
        <button className={`nav-btn ${pathname === "/Nosotros" ? "active" : ""}`} onClick={() => go("/Nosotros")}>Nosotros</button>
        <button className={`nav-btn ${pathname === "/Cursos" ? "active" : ""}`} onClick={() => go("/Cursos")}>Cursos</button>
        <button className={`nav-btn ${pathname === "/Software" ? "active" : ""}`} onClick={() => go("/Software")}>Software</button>
      </div>

      <button className="campus-btn" onClick={() => go('/login')}>CAMPUS</button>

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
          <button className={`nav-btn ${pathname === "/Cursos" ? "active" : ""}`} onClick={() => go("/Cursos")}>Cursos</button>
          <button className={`nav-btn ${pathname === "/Software" ? "active" : ""}`} onClick={() => go("/Software")}>Software</button>
          <button className="nav-btn campus-mobile" onClick={() => go('/login')}>CAMPUS</button>
        </div>
      </div>
    </nav>
  );
}
