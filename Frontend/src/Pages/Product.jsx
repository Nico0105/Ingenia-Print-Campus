import React, { useState, useEffect } from "react";
import "./Product.css";
import MainNavbar from "../Components/MainNavbar";
import { useParams, useNavigate } from "react-router-dom";

// Extrae la descripción general (primeras líneas del contenido)
function getDescripcionGeneral(contenido) {
  if (!contenido || !contenido.descripcion_general) return [];
  const dg = contenido.descripcion_general;
  return Array.isArray(dg) ? dg.filter((line) => line && String(line).trim()) : [];
}

// Nombres amigables para las claves de caracteristicas
const TITULOS_CARACTERISTICAS = {
  ventajas_claves: "Ventajas clave",
  especificaciones_generales: "Especificaciones generales",
  caracteristicas_principales: "Características principales",
  materiales_compatibles: "Materiales compatibles",
  que_incluye: "Qué incluye",
  para_quien_es_ideal: "Para quién es ideal",
};

// Extrae secciones: soporta estructura nueva (caracteristicas) y antigua (claves planas)
function getSecciones(contenido) {
  if (!contenido) return [];

  // Estructura nueva: contenido.caracteristicas con ventajas_claves, especificaciones_generales, etc.
  if (contenido.caracteristicas && typeof contenido.caracteristicas === "object") {
    const secciones = [];
    const car = contenido.caracteristicas;

    for (const [key, value] of Object.entries(car)) {
      if (key === "otras_secciones" && Array.isArray(value)) {
        value.forEach((s) => {
          if (s && s.items && s.items.length > 0) {
            secciones.push({
              titulo: s.titulo || key,
              items: s.items.filter((item) => typeof item === "string" && item.trim()),
            });
          }
        });
        continue;
      }
      if (!value || typeof value !== "object") continue;
      const items = Array.isArray(value.items) ? value.items.filter((item) => typeof item === "string" && item.trim()) : [];
      if (items.length === 0) continue;
      secciones.push({
        titulo: TITULOS_CARACTERISTICAS[key] || value.titulo || key.replace(/_/g, " "),
        items,
      });
    }
    return secciones;
  }

  // Estructura antigua: claves planas con arrays
  return Object.entries(contenido)
    .filter(([key]) => key !== "descripcion_general")
    .map(([key, value]) => ({
      titulo: key.replace(/_/g, " "),
      items: Array.isArray(value)
        ? value.filter((item) => typeof item === "string" && item.trim())
        : [],
    }))
    .filter((s) => s.items.length > 0);
}

export default function Product() {
  const { productId } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mainImage, setMainImage] = useState(0);
  const [showFullDesc, setShowFullDesc] = useState(false);

  useEffect(() => {
    fetch(`http://localhost:5000/api/products/${productId}`)
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

  const descripcionGeneral = getDescripcionGeneral(product.contenido);
  const secciones = getSecciones(product.contenido);

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
            {product.imagenes.length > 0 ? (
              <img src={product.imagenes[mainImage]} alt={product.nombre} />
            ) : (
              <div className="no-image">Sin imagen</div>
            )}
          </div>
          <div className="thumbnail-gallery">
            {product.imagenes.slice(0, 4).map((img, i) => (
              <div
                key={i}
                className={`thumbnail ${mainImage === i ? "active" : ""}`}
                onClick={() => setMainImage(i)}
              >
                <img src={img} alt={`Thumbnail ${i + 1}`} />
              </div>
            ))}
          </div>
        </section>

        {/* DETALLES */}
        <section className="product-details">
          <div className="product-title-section">
            <span className="category-badge">
              {product.categoria.toUpperCase()}
            </span>
            <h1>{product.nombre}</h1>
          </div>

          {/* DESCRIPCIÓN GENERAL */}
          {descripcionGeneral.length > 0 && (
            <div className="description">
              {(showFullDesc ? descripcionGeneral : descripcionGeneral.slice(0, 3)).map(
                (line, i) => (
                  <p key={i}>{line}</p>
                )
              )}
              {descripcionGeneral.length > 3 && (
                <button
                  className="btn-toggle-desc"
                  onClick={() => setShowFullDesc(!showFullDesc)}
                >
                  {showFullDesc ? "Ver menos ▲" : "Ver más ▼"}
                </button>
              )}
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

      {/* SECCIONES DE CARACTERÍSTICAS - debajo del main */}
      {secciones.length > 0 && (
        <section className="product-specs">
          <h2>Características y Especificaciones</h2>
          <div className="specs-grid">
            {secciones.map((seccion, i) => (
              <div className="spec-section" key={i}>
                {seccion.titulo && <h3 className="spec-section-title">{seccion.titulo}</h3>}
                <ul>
                  {seccion.items.map((item, j) => (
                    <li key={j}>{item}</li>
                  ))}
                </ul>
              </div>
            ))}
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
    fetch("http://localhost:5000/api/products")
      .then((res) => res.json())
      .then((data) => {
        const filtered = data
          .filter((p) => p.categoria === categoria && p.id !== currentId)
          .slice(0, 4);
        setRelated(filtered);
      });
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