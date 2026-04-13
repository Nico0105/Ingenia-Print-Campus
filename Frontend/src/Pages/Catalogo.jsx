import React, { useState, useEffect } from "react";
import "./Catalogo.css";
import MainNavbar from "../Components/MainNavbar";
import Footer from "../Components/Footer";
import { useNavigate } from "react-router-dom";
import { WhatsAppFloat } from "../Components/WhatsAppFloat";
import { API_URL } from "../config";

function parseImagenes(imagenes) {
  let arr;
  if (Array.isArray(imagenes)) arr = imagenes;
  else if (typeof imagenes === 'string') {
    try { arr = JSON.parse(imagenes); } catch { return []; }
  } else return [];
  return arr.map(img => typeof img === 'string' ? img : img.url).filter(Boolean);
}

const SUBCATEGORIES = {
  "Impresoras FDM": ["Bambu Lab", "Creality"],
  "Accesorios": ["Bambu Lab", "Creality"],
};

export default function Catalogo() {
  const navigate = useNavigate();
  const [allProducts, setAllProducts] = useState([]);
  const [activeCategory, setActiveCategory] = useState("all");
  const [activeSub, setActiveSub] = useState(null);
  const [openDropdown, setOpenDropdown] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_URL}/api/products`)
      .then((res) => res.json())
      .then((data) => {
        const parsed = Array.isArray(data)
          ? data
              .filter(p => p != null)
              .map((p) => ({ ...p, imagenes: parseImagenes(p.imagenes) }))
          : [];
        setAllProducts(parsed);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error cargando productos:", err);
        setLoading(false);
      });
  }, []);

  const validProducts = (allProducts || []).filter(p => p && p.categoria);

  const categorias = Array.from(new Set(validProducts.map((p) => p.categoria)));

  const filteredProducts = validProducts.filter((product) => {
    if (activeCategory === "all") return true;
    if (product.categoria !== activeCategory) return false;
    if (activeSub && !product.nombre?.toLowerCase().includes(activeSub.toLowerCase())) return false;
    return true;
  });

  if (loading) {
    return (
      <div className="catalogo">
        <MainNavbar />
        <p style={{ padding: "2rem" }}>Cargando productos...</p>
      </div>
    );
  }

  return (
    <div className="catalogo">
      <header className="catalogo-header">
        <MainNavbar />
      </header>

      <main className="catalogo-main">
        {/* SIDEBAR FILTERS */}
        <aside className="catalogo-sidebar">
          <div className="filters-section">
            <h3 className="filters-title">Categorías</h3>
            <div className="filter-list">

              <button
                className={`filter-btn ${activeCategory === "all" && !activeSub ? "active" : ""}`}
                onClick={() => {
                  setActiveCategory("all");
                  setActiveSub(null);
                  setOpenDropdown(null);
                }}
              >
                Todos los Productos
              </button>

              {categorias.map((cat) => {
                const hasSubs = !!SUBCATEGORIES[cat];
                const isOpen = openDropdown === cat;
                const isActive = activeCategory === cat && !activeSub;

                return (
                  <div key={cat} className="filter-group">
                    <button
                      className={`filter-btn ${isActive ? "active" : ""}`}
                      onClick={() => {
                        if (hasSubs) {
                          setOpenDropdown(isOpen ? null : cat);
                          if (!isOpen) {
                            setActiveCategory(cat);
                            setActiveSub(null);
                          }
                        } else {
                          setActiveCategory(cat);
                          setActiveSub(null);
                          setOpenDropdown(null);
                        }
                      }}
                    >
                      <span>{cat}</span>
                      {hasSubs && (
                        <span className={`filter-chevron ${isOpen ? "open" : ""}`}>&#9658;</span>
                      )}
                    </button>

                    {hasSubs && (
                      <div className={`subcategory-group ${isOpen ? "open" : ""}`}>
                        {SUBCATEGORIES[cat].map((sub) => (
                          <button
                            key={sub}
                            className={`sub-filter-btn ${activeSub === sub && activeCategory === cat ? "active" : ""}`}
                            onClick={() => {
                              setActiveCategory(cat);
                              setActiveSub(sub);
                            }}
                          >
                            <span className="sub-dot" />
                            {sub}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}

            </div>
          </div>

          <button
            className="reset-filters"
            onClick={() => {
              setActiveCategory("all");
              setActiveSub(null);
              setOpenDropdown(null);
            }}
          >
            Limpiar Filtros
          </button>
        </aside>

        {/* PRODUCTS GRID */}
        <section className="catalogo-products">
          <div className="products-header">
            <h2>Catálogo de Productos</h2>
            <p>{filteredProducts.length} resultados</p>
          </div>

          <div className="products-grid">
            {filteredProducts.map((product) => (
              <div
                className="product-card"
                key={product.id}
                onClick={() => navigate(`/product/${product.id}`)}
              >
                <div className="product-image">
                  <img
                    src={product.imagenes[0] || "https://res.cloudinary.com/dvjmdhlac/image/upload/v1775435437/Logo_Principal_gq4gtt.png"}
                    alt={product.nombre}
                    onError={(e) => {
                      e.target.src = "https://res.cloudinary.com/dvjmdhlac/image/upload/v1775435437/Logo_Principal_gq4gtt.png";
                    }}
                  />
                </div>

                <div className="product-info">
                  <h4 className="product-name">{product.nombre}</h4>
                  <p className="product-category">{product.categoria}</p>
                  <p className="product-description">
                    {product.contenido?.titulo || "Consulte por este producto"}
                  </p>
                  <div className="product-footer">
                    <button
                      className="btn-add-cart"
                      onClick={() => navigate(`/product/${product.id}`)}
                    >
                      Ver Producto
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      <WhatsAppFloat />
      <Footer />
    </div>
  );
}