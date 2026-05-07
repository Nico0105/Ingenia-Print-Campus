import React, { useState, useEffect } from "react";
import "./Product.css";
import MainNavbar from "../Components/MainNavbar";
import { useParams, useNavigate } from "react-router-dom";
import { API_URL } from "../config";

// Mapa de nombres de colores en español a valores CSS
const COLOR_MAP = {
  rojo: "#e53e3e", red: "#e53e3e",
  azul: "#3182ce", blue: "#3182ce",
  verde: "#38a169", green: "#38a169",
  amarillo: "#d69e2e", yellow: "#d69e2e",
  naranja: "#dd6b20", orange: "#dd6b20",
  violeta: "#805ad5", morado: "#805ad5", purple: "#805ad5",
  rosa: "#d53f8c", pink: "#d53f8c",
  negro: "#1a202c", black: "#1a202c",
  blanco: "#f7fafc", white: "#f7fafc",
  gris: "#718096", gray: "#718096", grey: "#718096",
  celeste: "#63b3ed", cyan: "#00bcd4",
  marron: "#8b4513", cafe: "#8b4513", brown: "#8b4513",
  beige: "#f5f0e8",
  dorado: "#d4af37", gold: "#d4af37",
  plateado: "#c0c0c0", silver: "#c0c0c0",
  transparente: "linear-gradient(135deg, #eee 25%, #fff 50%, #eee 75%)",
};

function getColorCSS(nombre) {
  if (!nombre) return "#ccc";
  const key = nombre.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  return COLOR_MAP[key] || "#ccc";
}

function getGarantia(categoria, nombre) {
  const cat = categoria?.toLowerCase() || "";
  const nom = nombre?.toLowerCase() || "";
  if (cat.includes("filament")) return null;
  if (nom.includes("bambu") || nom.includes("bambulab") || nom.includes("bambu lab")) {
    return { texto: "1 año", tipo: "bambu" };
  }
  return { texto: "6 meses", tipo: "default" };
}

export default function Product() {
  const { productId } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mainImage, setMainImage] = useState(0);
  const [selectedColor, setSelectedColor] = useState(null);

  useEffect(() => {
    fetch(`${API_URL}/api/products/${productId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data && typeof data.imagenes === "string") {
          try { data.imagenes = JSON.parse(data.imagenes); }
          catch { data.imagenes = []; }
        }
        if (!Array.isArray(data?.imagenes)) data.imagenes = [];
        data.imagenes = data.imagenes.map((img) =>
          typeof img === "string" ? img : img.url
        );

        // Parsear colores si vienen como string
        if (data.contenido?.colores && typeof data.contenido.colores === "string") {
          try { data.contenido.colores = JSON.parse(data.contenido.colores); }
          catch { data.contenido.colores = []; }
        }

        setProduct(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [productId]);

  if (loading) return (
    <div className="product-page">
      <MainNavbar />
      <p style={{ padding: "2rem" }}>Cargando producto...</p>
    </div>
  );

  if (!product || product.error) return (
    <div className="product-error">
      <MainNavbar />
      <div className="error-container">
        <h2>Producto no encontrado</h2>
        <button onClick={() => navigate("/catalogo")}>Volver al Catálogo</button>
      </div>
    </div>
  );

  const descripcionGeneral = product.contenido?.titulo || "";
  const especificaciones = product.contenido?.especificaciones || {};
  const materialesCompatibles = product.contenido?.materiales_compatibles || [];
  const idealPara = product.contenido?.ideal_para || [];
  const colores = product.contenido?.colores || [];
  const isFilamento = product.categoria?.toLowerCase().includes("filament");
  const garantia = getGarantia(product.categoria, product.nombre);

  const imagenActual = selectedColor?.imagenUrl
    ? selectedColor.imagenUrl
    : product.imagenes[mainImage];

  const handleWhatsAppContact = () => {
    const colorInfo = selectedColor ? ` - Color: ${selectedColor.nombre}` : "";
    const message = encodeURIComponent(
      `Hola, me gustaría consultar disponibilidad y más información sobre: ${product.nombre}${colorInfo}`
    );
    window.open(`https://wa.me/541149455926?text=${message}`, "_blank");
  };

  return (
    <div className="product-page">
      <header className="product-header"><MainNavbar /></header>

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
            {imagenActual ? (
              <img
                src={imagenActual}
                alt={product.nombre}
                onError={(e) => {
                  e.target.src = "https://res.cloudinary.com/dvjmdhlac/image/upload/v1775435437/Logo_Principal_gq4gtt.png";
                }}
              />
            ) : (
              <div className="no-image">Sin imagen</div>
            )}
          </div>

          {/* THUMBNAILS normales (no filamentos) o SWATCHES (filamentos) */}
          {isFilamento && colores.length > 0 ? (
            <div className="color-swatches">
              <p className="swatches-label">Colores disponibles:</p>
              <div className="swatches-grid">
                {colores.map((color, i) => (
                  <button
                    key={i}
                    className={`swatch-btn ${selectedColor?.nombre === color.nombre ? "active" : ""}`}
                    onClick={() => setSelectedColor(
                      selectedColor?.nombre === color.nombre ? null : color
                    )}
                    title={color.nombre}
                  >
                    <span
                      className="swatch-circle"
                      style={{ background: getColorCSS(color.nombre) }}
                    />
                    <span className="swatch-name">{color.nombre}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="thumbnail-gallery">
              {product.imagenes.slice(0, 4).map((img, i) => (
                <div
                  key={i}
                  className={`thumbnail ${mainImage === i ? "active" : ""}`}
                  onClick={() => setMainImage(i)}
                >
                  <img
                    src={img}
                    alt={`Thumbnail ${i + 1}`}
                    onError={(e) => {
                      e.target.src = "https://res.cloudinary.com/dvjmdhlac/image/upload/v1775435437/Logo_Principal_gq4gtt.png";
                    }}
                  />
                </div>
              ))}
            </div>
          )}
        </section>

        {/* DETALLES */}
        <section className="product-details">
          <div className="product-title-section">
            <span className="category-badge">
              {product.categoria?.toUpperCase() || "SIN CATEGORÍA"}
            </span>
            <h1>{product.nombre?.toUpperCase() || "SIN NOMBRE"}</h1>
            {selectedColor && (
              <p className="selected-color-label">
                Color seleccionado: <strong>{selectedColor.nombre}</strong>
              </p>
            )}
          </div>

          {descripcionGeneral && (
            <div className="description"><p>{descripcionGeneral}</p></div>
          )}

          <div className="cta-section">
            <button className="btn-inquiry" onClick={handleWhatsAppContact}>
              💬 Consultar Disponibilidad
            </button>
          </div>

          <div className="info-boxes">
            <div className="info-box">
              <span className="icon">🚚</span>
              <p><strong>Envíos a todo el país</strong></p>
            </div>

            {garantia && (
              <div className="info-box">
                <span className="icon">🔒</span>
                <p>
                  <strong>Garantía Oficial</strong> de {garantia.texto}
                </p>
              </div>
            )}
          </div>
        </section>
      </main>

      {/* ESPECIFICACIONES TÉCNICAS */}
      {Object.keys(especificaciones).length > 0 && (
        <section className="specs-technical">
          <h2>ESPECIFICACIONES TECNICAS</h2>
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

      {(idealPara.length > 0 || materialesCompatibles.length > 0) && (
        <section className="product-specs-two-columns">
          <h2>CARACTERISTICAS ADICIONALES</h2>
          <div className="specs-columns-grid">
            {idealPara.length > 0 && (
              <div className="spec-column">
                <h3 className="spec-column-title">Ideal Para</h3>
                <div className="ideal-para-list">
                  {idealPara.map((item, j) => (
                    <p key={j} className="ideal-para-item">{item}</p>
                  ))}
                </div>
              </div>
            )}
            {materialesCompatibles.length > 0 && (
              <div className="spec-column">
                <h3 className="spec-column-title">Materiales Compatibles</h3>
                <ul className="materiales-list">
                  {materialesCompatibles.map((item, j) => (
                    <li key={j}>{item}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </section>
      )}

      <RelatedProductsCarousel
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

function RelatedProductsCarousel({ categoria, currentId, navigate }) {
  const [related, setRelated] = useState([]);

  useEffect(() => {
    fetch(`${API_URL}/api/products`)
      .then((res) => res.json())
      .then((data) => {
        const filtered = data
          .filter((p) => p && p.id && p.categoria === categoria && p.id !== currentId)
          .map((p) => ({
            ...p,
            imagenes: (() => {
              let imgs = typeof p.imagenes === "string"
                ? (() => { try { return JSON.parse(p.imagenes); } catch { return []; } })()
                : (Array.isArray(p.imagenes) ? p.imagenes : []);
              return imgs.map((img) => typeof img === "string" ? img : img.url);
            })()
          }))
          .slice(0, 8);
        setRelated(filtered);
      })
      .catch((err) => console.error("Error fetching related products:", err));
  }, [categoria, currentId]);

  if (related.length === 0) return null;

  return (
    <section className="related-carousel">
      <h2>PRODUCTOS RELACIONADOS</h2>
      <div className="carousel-container">
        <div className="carousel-track">
          {related.map((product) => (
            <div
              key={product.id}
              className="carousel-card"
              onClick={() => navigate(`/product/${product.id}`)}
            >
              {product.imagenes && product.imagenes.length > 0 ? (
                <img src={product.imagenes[0]} alt={product.nombre} />
              ) : (
                <div className="no-image">Sin imagen</div>
              )}
              <h4>{product.nombre}</h4>
              <span className="category-tag">{product.categoria}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}