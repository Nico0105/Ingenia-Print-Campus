import React, { useEffect, useState } from "react";
import "./Home.css";
import MainNavbar from "../Components/MainNavbar";
import Footer from "../Components/Footer";
import { useNavigate } from "react-router-dom";
import { WhatsAppFloat } from "../Components/WhatsAppFloat";
import { API_URL } from "../config";

const BANNER_IMAGES = [
  "https://res.cloudinary.com/dvjmdhlac/image/upload/v1776731540/BANNER_MAIN_lfdxd3.jpg",
  "https://res.cloudinary.com/dvjmdhlac/image/upload/v1777337750/Banner_vnr5p1.png",
];

function HeroCarousel() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent(prev => (prev + 1) % BANNER_IMAGES.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const prev = () => setCurrent(c => (c - 1 + BANNER_IMAGES.length) % BANNER_IMAGES.length);
  const next = () => setCurrent(c => (c + 1) % BANNER_IMAGES.length);

  return (
    <div className="carousel">
      {BANNER_IMAGES.map((src, i) => (
        <img
          key={i}
          src={src}
          alt={`Banner ${i + 1}`}
          className={`hero-banner ${i === current ? 'active' : ''}`}
        />
      ))}

      <button className="carousel-btn carousel-btn--prev" onClick={prev}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="15 18 9 12 15 6" />
        </svg>
      </button>
      <button className="carousel-btn carousel-btn--next" onClick={next}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="9 18 15 12 9 6" />
        </svg>
      </button>

      <div className="carousel-dots">
        {BANNER_IMAGES.map((_, i) => (
          <button
            key={i}
            className={`carousel-dot${i === current ? ' active' : ''}`}
            onClick={() => setCurrent(i)}
          />
        ))}
      </div>
    </div>
  );
}

export default function Home() {
  const [products, setProducts] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetch(`${API_URL}/api/products/destacados`)
      .then(res => res.json())
      .then(data => {
        const parsed = (Array.isArray(data) ? data : []).map(p => ({
          ...p,
          imagenes: Array.isArray(p.imagenes)
            ? p.imagenes.map(img => typeof img === 'string' ? img : img.url).filter(Boolean)
            : []
        }));
        setProducts(parsed);
      })
      .catch(err => console.error('Error fetching destacados:', err));
  }, []);

  return (
    <div className="home">
      <header className="header">
        <div className="header-left">
          <MainNavbar />
        </div>
        <div className="header-right">
          <div className="search-box">
            <input type="text" placeholder="Buscar modelos o partes..." />
          </div>
        </div>
      </header>

      <main>
        <section className="hero">
          <HeroCarousel />
        </section>

        <section className="products">
          <div className="section-header">
            <div>
              <h3>Nuestros Modelos</h3>
              <p>Rendimiento, precisión y durabilidad</p>
            </div>
          </div>

          <div className="product-grid">
            {products.length === 0 ? (
              <p className="no-destacados">No hay productos destacados por el momento.</p>
            ) : (
              products.map((product) => (
                <div className="card" key={product.id} onClick={() => navigate(`/product/${product.id}`)}>
                  <div className="card-image">
                    <img
                      src={product.imagenes?.[0] || 'https://res.cloudinary.com/dvjmdhlac/image/upload/v1775435437/Logo_Principal_gq4gtt.png'}
                      alt={product.nombre}
                      onError={(e) => {
                        e.target.src = 'https://res.cloudinary.com/dvjmdhlac/image/upload/v1775435437/Logo_Principal_gq4gtt.png';
                      }}
                    />
                  </div>
                  <div className="card-body">
                    <h4>{product.nombre}</h4>
                    <ul>
                      {Object.entries(product.contenido?.especificaciones || {}).slice(0, 3).map(([key, value], index) => (
                        <li key={index}>{key}: {value}</li>
                      ))}
                    </ul>
                    <div className="card-actions">
                      <button className="btn-primary small" onClick={(e) => { e.stopPropagation(); navigate(`/product/${product.id}`); }}>
                        Ver Producto
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        <WhatsAppFloat />
        <Footer />
      </main>
    </div>
  );
}