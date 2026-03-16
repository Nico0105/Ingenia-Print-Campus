import React, { useState, useEffect } from "react";
import "./Catalogo.css";
import MainNavbar from "../Components/MainNavbar";
import Footer from "../Components/Footer";
import { useNavigate } from "react-router-dom";
import { API_URL } from "../config";

export default function Catalogo() {
  const navigate = useNavigate();
  const [allProducts, setAllProducts] = useState([]);
  const [activeCategory, setActiveCategory] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_URL}/api/products`)
      .then((res) => res.json())
      .then((data) => { 
      console.log("DATA:", data, Array.isArray(data));
      setAllProducts(Array.isArray(data) ? data : []);
      setLoading(false);
    })
      .catch((err) => {
        console.error("Error cargando productos:", err);
        setLoading(false);
      });
  }, []);

  // Categorías dinámicas desde los datos
  const validProducts = (allProducts || []).filter(p => p && p.categoria);
  const categorias = [
    { id: "all", name: "Todos los Productos" },
    ...Array.from(new Set(validProducts.map((p) => p.categoria))).map((cat) => ({
      id: cat,
      name: cat,
    })),
  ];

  const filteredProducts = validProducts.filter((product) => {
    const categoryMatch = activeCategory === "all" || product.categoria === activeCategory;
    return categoryMatch;
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
      {/* NAVBAR */}
      <header className="catalogo-header">
        <MainNavbar />
      </header>

      {/* MAIN CONTENT */}
      <main className="catalogo-main">
        {/* SIDEBAR FILTERS */}
        <aside className="catalogo-sidebar">
          <div className="filters-section">
            <h3 className="filters-title">Categorías</h3>
            <div className="filter-list">
              {categorias.map((cat) => (
                <button
                  key={cat.id}
                  className={`filter-btn ${activeCategory === cat.id ? "active" : ""}`}
                  onClick={() => setActiveCategory(cat.id)}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          <button className="reset-filters" onClick={() => { setActiveCategory("all"); }}>
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
              <div className="product-card" key={product.id}>
                <div className="product-image">
                  <img 
                    src={product.imagenes && product.imagenes[0] ? product.imagenes[0] : "/images/Logo.png"} 
                    alt={product.nombre} 
                    onError={(e) => {
                      e.target.src = "/images/Logo.png";
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
                    <button className="btn-add-cart" onClick={() => navigate(`/product/${product.id}`)}>Consultar</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
