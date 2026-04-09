import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { API_URL } from "../config";
import "./MainNavbar.css";

export default function MainNavbar() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const lower = pathname.toLowerCase();
  const [menuOpen, setMenuOpen] = useState(false);
  const [hidden, setHidden] = useState(false);
  const lastScrollY = useRef(0);

  // 🔍 Search
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const searchRef = useRef(null);
  const inputRef = useRef(null);

  const go = (to) => {
    setMenuOpen(false);
    navigate(to);
  };

  // Cargar productos una vez
  useEffect(() => {
    fetch(`${API_URL}/api/products`)
      .then((res) => res.json())
      .then((data) => {
        const parsed = Array.isArray(data)
          ? data.filter(Boolean).map((p) => ({
              ...p,
              imagenes: (() => {
                let arr = Array.isArray(p.imagenes)
                  ? p.imagenes
                  : (() => { try { return JSON.parse(p.imagenes); } catch { return []; } })();
                return arr.map((img) => (typeof img === "string" ? img : img.url)).filter(Boolean);
              })(),
            }))
          : [];
        setAllProducts(parsed);
      })
      .catch(console.error);
  }, []);

  // Filtrar al escribir
  useEffect(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) {
      setSearchResults([]);
      setShowDropdown(false);
      return;
    }
    const results = allProducts
      .filter(
        (p) =>
          p.nombre?.toLowerCase().includes(q) ||
          p.categoria?.toLowerCase().includes(q)
      )
      .slice(0, 6);
    setSearchResults(results);
    setShowDropdown(true);
  }, [searchQuery, allProducts]);

  // Cerrar dropdown al clickear afuera
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowDropdown(false);
        setSearchQuery("");
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelectProduct = (product) => {
    setShowDropdown(false);
    setSearchQuery("");
    navigate(`/product/${product.id}`);
  };

  // Autohide scroll
  useEffect(() => {
    const handleScroll = () => {
      const shouldAutohide = lower.includes("garantia") || lower.includes("nosotros");
      const currentY = window.scrollY || window.pageYOffset;
      if (!shouldAutohide) {
        if (hidden) setHidden(false);
        lastScrollY.current = currentY;
        return;
      }
      setHidden(currentY > lastScrollY.current && currentY > 80);
      lastScrollY.current = currentY;
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [pathname, hidden]);

  return (
    <nav className={`nos-nav ${hidden ? "hidden" : ""}`}>
      <div className="nos-logo" onClick={() => go("/Home")}>
        <img
          src="https://res.cloudinary.com/dvjmdhlac/image/upload/v1775435437/Logo_Principal_gq4gtt.png"
          alt="Logo Ingenia"
        />
      </div>

      <div className="nos-nav-logo" onClick={() => go("/Home")}>INGENIA PRINT</div>

      <div className="nav">
          <button className={`nav-btn ${pathname === "/Catalogo" ? "active" : ""}`} onClick={() => go("/Catalogo")}>Catalogo</button>
          <button className={`nav-btn ${pathname === "/Curso" ? "active" : ""}`} onClick={() => go("/Curso")}>Campus</button>
          <button className={`nav-btn ${pathname === "/Garantia" ? "active" : ""}`} onClick={() => go("/Garantia")}>Garantía</button>
          <button className={`nav-btn ${pathname === "/Nosotros" ? "active" : ""}`} onClick={() => go("/Nosotros")}>Nosotros</button>
      </div>

      {/* 🔍 Barra de búsqueda */}
      <div className="navbar-search" ref={searchRef}>
        <div className="search-box">
          <svg className="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            ref={inputRef}
            className="search-input"
            type="text"
            placeholder="Buscar productos..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => searchQuery && setShowDropdown(true)}
          />
          {searchQuery && (
            <button
              className="search-clear"
              onClick={() => { setSearchQuery(""); setSearchResults([]); setShowDropdown(false); inputRef.current?.focus(); }}
            >✕</button>
          )}
        </div>

        {/* Dropdown */}
        {showDropdown && (
          <div className="search-dropdown">
            {searchResults.length > 0 ? (
              <>
                {searchResults.map((product) => (
                  <div
                    key={product.id}
                    className="search-result-item"
                      onMouseDown={(e) => { e.preventDefault(); handleSelectProduct(product); }}                  >
                    <img
                      src={product.imagenes[0] || "https://res.cloudinary.com/dvjmdhlac/image/upload/v1775435437/Logo_Principal_gq4gtt.png"}
                      alt={product.nombre}
                      className="search-result-img"
                      onError={(e) => { e.target.src = "https://res.cloudinary.com/dvjmdhlac/image/upload/v1775435437/Logo_Principal_gq4gtt.png"; }}
                    />
                    <div className="search-result-info">
                      <span className="search-result-name">{product.nombre}</span>
                      <span className="search-result-cat">{product.categoria}</span>
                    </div>
                    <svg className="search-result-arrow" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
                    </svg>
                  </div>
                ))}
              </>
            ) : (
              <div className="search-no-results">
                Sin resultados para "<strong>{searchQuery}</strong>"
              </div>
            )}
          </div>
        )}
      </div>

      {/* Hamburger */}
      <button
        className={`hamburger ${menuOpen ? "open" : ""}`}
        aria-label="Toggle menu"
        onClick={() => setMenuOpen((s) => !s)}
      >
        <span /><span /><span />
      </button>

      {/* Mobile dropdown */}
      <div className={`mobile-menu ${menuOpen ? "open" : ""}`}>
        <div className="mobile-nav">
          <button className={`nav-btn ${pathname === "/Catalogo" ? "active" : ""}`} onClick={() => go("/Catalogo")}>Catalogo</button>
          <button className={`nav-btn ${pathname === "/Curso" ? "active" : ""}`} onClick={() => go("/Curso")}>Campus</button>
          <button className={`nav-btn ${pathname === "/Garantia" ? "active" : ""}`} onClick={() => go("/Garantia")}>Garantía</button>
          <button className={`nav-btn ${pathname === "/Nosotros" ? "active" : ""}`} onClick={() => go("/Nosotros")}>Nosotros</button>

          {/* Search mobile */}
          <div className="mobile-search-box">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input
              type="text"
              placeholder="Buscar productos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="mobile-search-input"
            />
          </div>

          {/* Resultados mobile */}
          {showDropdown && searchResults.length > 0 && (
            <div className="mobile-search-results">
              {searchResults.map((product) => (
                <div
                  key={product.id}
                  className="search-result-item"
                  onMouseDown={(e) => { e.preventDefault(); setMenuOpen(false); handleSelectProduct(product); }}
                >
                  <img
                    src={product.imagenes[0] || "https://res.cloudinary.com/dvjmdhlac/image/upload/v1775435437/Logo_Principal_gq4gtt.png"}
                    alt={product.nombre}
                    className="search-result-img"
                    onError={(e) => { e.target.src = "https://res.cloudinary.com/dvjmdhlac/image/upload/v1775435437/Logo_Principal_gq4gtt.png"; }}
                  />
                  <div className="search-result-info">
                    <span className="search-result-name">{product.nombre}</span>
                    <span className="search-result-cat">{product.categoria}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}