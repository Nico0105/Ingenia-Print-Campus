import React, { useState, useEffect } from "react";
import "./Product.css";
import MainNavbar from "../Components/MainNavbar";
import { useParams, useNavigate } from "react-router-dom";
import { API_URL } from "../config";

export default function Product() {
  const { productId } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mainImage, setMainImage] = useState(0);

  useEffect(() => {
    fetch(`${API_URL}/api/products/${productId}`)
      .then((res) => res.json())
      .then((data) => {
        setProduct(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [productId]);

  if (loading) {
    return (
      <div className="product-page">
        <MainNavbar />
        <p style={{ padding: "2rem" }}>Cargando producto...</p>
      </div>
    );
  }

  if (!product || product.error) {
    return (
      <div className="product-error">
        <MainNavbar />
        <div className="error-container">
          <h2>Producto no encontrado</h2>
          <button onClick={() => navigate("/catalogo")}>
            Volver al Catálogo
          </button>
        </div>
      </div>
    );
  }

  const descripcionGeneral = product.contenido?.titulo || "";
  const especificaciones = product.contenido?.especificaciones || {};
  const materialesCompatibles = product.contenido?.materiales_compatibles || [];
  const idealPara = product.contenido?.ideal_para || [];

  const handleWhatsAppContact = () => {
    const message = encodeURIComponent(
      `Hola, me gustaría consultar disponibilidad y más información sobre: ${product.nombre}`
    );
    window.open(`https://wa.me/541134406167?text=${message}`, "_blank");
  };

  return (
    <div className="product-page">
      <header className="product-header">
        <MainNavbar />
      </header>

      <div className="breadcrumb">
        <span onClick={() => navigate("/")} className="breadcrumb-link">Home</span>
        <span>/</span>
        <span onClick={() => navigate("/catalogo")} className="breadcrumb-link">Catálogo</span>
        <span>/</span>
        <span className="breadcrumb-current">{product.nombre}</span>
      </div>

      <main className="product-main">
        {/* GALERÍA */}
        <section className="product-gallery">
          <div className="main-image">
            {product.imagenes && product.imagenes.length > 0 ? (
              <img 
                src={product.imagenes[mainImage]} 
                alt={product.nombre} 
                onError={(e) => {
                  e.target.src = "https://via.placeholder.com/600x400?text=No+Image";
                }}
              />
            ) : (
              <div className="no-image">Sin imagen</div>
            )}
          </div>
          <div className="thumbnail-gallery">
            {product.imagenes && product.imagenes.slice(0, 4).map((img, i) => (
              <div
                key={i}
                className={`thumbnail ${mainImage === i ? "active" : ""}`}
                onClick={() => setMainImage(i)}
              >
                <img 
                  src={img} 
                  alt={`Thumbnail ${i + 1}`} 
                  onError={(e) => {
                    e.target.src = "https://via.placeholder.com/150x100?text=No+Image";
                  }}
                />
              </div>
            ))}
          </div>
        </section>

        {/* DETALLES */}
        <section className="product-details">
          <div className="product-title-section">
            <span className="category-badge">
              {product.categoria?.toUpperCase() || 'SIN CATEGORÍA'}
            </span>
            <h1>{product.nombre}</h1>
          </div>

          {/* DESCRIPCIÓN GENERAL */}
          {descripcionGeneral && (
            <div className="description">
              <p>{descripcionGeneral}</p>
            </div>
          )}

          <div className="cta-section">
            <button className="btn-inquiry" onClick={handleWhatsAppContact}>
              💬 Consultar Disponibilidad
            </button>
          </div>

          <div className="info-boxes">
            <div className="info-box">
              <span className="icon">🚚</span>
              <p><strong>Envíos Gratis</strong> a partir de $1.000.000</p>
            </div>
            <div className="info-box">
              <span className="icon">🔒</span>
              <p><strong>Garantía Oficial</strong> de 1-2 años según modelo</p>
            </div>
            <div className="info-box">
              <span className="icon">💳</span>
              <p><strong>Financiación</strong> disponible en 3, 6 y 12 cuotas</p>
            </div>
          </div>
        </section>
      </main>

      {/* ESPECIFICACIONES TÉCNICAS */}
      {Object.keys(especificaciones).length > 0 && (
        <section className="specs-technical">
          <h2>Especificaciones Técnicas</h2>
          <div className="specs-table">
            {Object.entries(especificaciones).map(([key, value]) => (
              <div key={key} className="spec-row">
                <span className="spec-label">{key}</span>
                <span className="spec-value">{value}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* MATERIALES COMPATIBLES E IDEAL PARA */}
      {(materialesCompatibles.length > 0 || idealPara.length > 0) && (
        <section className="product-specs">
          <h2>Características y Especificaciones</h2>
          <div className="specs-sections-grid">
            {materialesCompatibles.length > 0 && (
              <div className="spec-section">
                <h3 className="spec-section-title">Materiales Compatibles</h3>
                <ul>
                  {materialesCompatibles.map((item, j) => (
                    <li key={j}>{item}</li>
                  ))}
                </ul>
              </div>
            )}
            {idealPara.length > 0 && (
              <div className="spec-section">
                <h3 className="spec-section-title">Ideal Para</h3>
                <ul>
                  {idealPara.map((item, j) => (
                    <li key={j}>{item}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </section>
      )}

      <RelatedProducts
        categoria={product.categoria}
        currentId={product.id}
        navigate={navigate}
      />

      <footer className="product-footer">
        <p>© 2024 INGENIA. Engineered for precision.</p>
      </footer>
    </div>
  );
}

function RelatedProducts({ categoria, currentId, navigate }) {
  const [related, setRelated] = useState([]);

  useEffect(() => {
    const controller = new AbortController();
    
    fetch(`${API_URL}/api/products`, { signal: controller.signal })
      .then((res) => res.json())
      .then((data) => {
        const filtered = data
          .filter((p) => p.categoria === categoria && p.id !== currentId)
          .slice(0, 4);
        setRelated(filtered);
      })
      .catch((err) => {
        if (err.name !== 'AbortError') {
          console.error('Error fetching related products:', err);
        }
      });
    
    return () => controller.abort();
  }, [categoria, currentId]);

  if (related.length === 0) return null;

  return (
    <section className="related-products">
      <h2>Productos Relacionados</h2>
      <div className="related-grid">
        {related.map((p) => (
          <div
            key={p.id}
            className="related-card"
            onClick={() => navigate(`/product/${p.id}`)}
          >
            {p.imagenes.length > 0 && (
              <img src={p.imagenes[0]} alt={p.nombre} />
            )}
            <h4>{p.nombre}</h4>
          </div>
        ))}
      </div>
    </section>
  );
}