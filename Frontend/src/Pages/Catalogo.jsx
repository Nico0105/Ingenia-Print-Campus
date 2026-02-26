import React, { useState, useEffect } from "react";
import "./Catalogo.css";
import MainNavbar from "../Components/MainNavbar";
import { useNavigate } from "react-router-dom";

export default function Catalogo() {
  const navigate = useNavigate();
  const [allProducts, setAllProducts] = useState([]);
  const [activeCategory, setActiveCategory] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("http://localhost:5000/api/products")
      .then((res) => res.json())
      .then((data) => {
        setAllProducts(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error cargando productos:", err);
        setLoading(false);
      });
  }, []);

  // Categorías dinámicas desde los datos
  const categorias = [
    { id: "all", name: "Todos los Productos" },
    ...Array.from(new Set(allProducts.map((p) => p.categoria))).map((cat) => ({
      id: cat,
      name: cat,
    })),
  ];

  const filteredProducts =
    activeCategory === "all"
      ? allProducts
      : allProducts.filter((p) => p.categoria === activeCategory);

  return (
    <div className="catalogo">
      <header className="catalogo-header">
        <MainNavbar />
      </header>

      <main className="catalogo-main">
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
          <button
            className="reset-filters"
            onClick={() => setActiveCategory("all")}
          >
            Limpiar Filtros
          </button>
        </aside>

        <section className="catalogo-products">
          <div className="products-header">
            <h2>Catálogo de Productos</h2>
            <p>{filteredProducts.length} resultados</p>
          </div>

          {loading ? (
            <p style={{ padding: "2rem" }}>Cargando productos...</p>
          ) : (
            <div className="products-grid">
              {filteredProducts.map((product) => (
                <div className="product-card" key={product.id}>
                  <div className="product-image">
                    {product.imagenes.length > 0 ? (
                      <img
                        src={product.imagenes[0]}
                        alt={product.nombre}
                        onError={(e) => (e.target.style.display = "none")}
                      />
                    ) : (
                      <div className="no-image">Sin imagen</div>
                    )}
                  </div>
                  <div className="product-info">
                    <h4 className="product-name">{product.nombre}</h4>
                    <p className="product-category">{product.categoria}</p>
                    <div className="product-footer">
                      <button
                        className="btn-add-cart"
                        onClick={() => navigate(`/product/${product.id}`)}
                      >
                        Consultar
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}