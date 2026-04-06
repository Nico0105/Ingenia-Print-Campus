import React, { useEffect, useState } from "react";
import "./Home.css";
import HeroPrinter from "../Components/HeroPrinter";
import MainNavbar from "../Components/MainNavbar";
import Footer from "../Components/Footer";
import { animate } from "animejs";
import { useNavigate, Link } from "react-router-dom";
import { API_URL } from "../config";


export default function Home() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [scrollY, setScrollY] = useState(0);
  const [products, setProducts] = useState([]);

  const navigate = useNavigate();

  const HandleLogin = () => {
    navigate('/login');
  }

  useEffect(() => {
    fetch(`${API_URL}/api/products`)
    .then(res => res.json())
    .then(data => {
      const parsed = data.slice(0, 4).map(p => ({
        ...p,
        imagenes: Array.isArray(p.imagenes)
          ? p.imagenes.map(img => typeof img === 'string' ? img : img.url).filter(Boolean)
          : []
      }));
      setProducts(parsed);
    })
    .catch(err => console.error('Error fetching products:', err));
  }, []);

  return (
    <div className="home">

      {/* HEADER */}
      <header className="header">
        <div className="header-left">
          <MainNavbar />
        </div>

        <div className="header-right">
          <div className="search-box">
            <input type="text" placeholder="Buscar modelos o partes..." />
          </div>

          <button className="btn-primary" onClick={HandleLogin}>
            <span className="material-symbols-outlined">CAMPUS</span>
          </button>
        </div>
      </header>

      {/* HERO */}
      <main>
       <section className="hero">

        <div className="hero-content">
          <span className="badge">IMPRESORAS 3D</span>
          <h2 className="hero-title">
            INGENIA PRINT <br />
            <span>Ideas que toman forma</span>
          </h2>
        </div>
        {/* Animacion */}
        <div className="hero-animation">
          <HeroPrinter />
        </div>
      </section>

        {/* PRODUCTS */}
       <section className="products">
          <div className="section-header">
            <div>
              <h3>Nuestros Modelos</h3>
              <p>Rendimiento, precisión y durabilidad</p>
            </div>
          </div>

          <div className="product-grid">
            {products.map((product) => (
              <div className="card" key={product.id}>
                <div className="card-image">
                  <img 
                    src={product.imagenes && product.imagenes[0] ? product.imagenes[0] : 'https://res.cloudinary.com/dvjmdhlac/image/upload/v1775435437/Logo_Principal_gq4gtt.png'} 
                    alt={product.nombre} 
                    onError={(e) => {
                      e.target.src = 'https://res.cloudinary.com/dvjmdhlac/image/upload/v1775435437/Logo_Principal_gq4gtt.png';
                    }}
                  />
                </div>

                <div className="card-body">
                  <h4>{product.nombre}</h4>

                  <p className="description">{product.contenido?.titulo || 'Descripción no disponible'}</p>

                  <ul>
                    {Object.entries(product.contenido?.especificaciones || {}).slice(0, 3).map(([key, value], index) => (
                      <li key={index}>{key}: {value}</li>
                    ))}
                  </ul>

                  <div className="card-actions">
                    <button className="btn-primary small" onClick={() => navigate(`/product/${product.id}`)}>
                      Consulta Aquí
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* FOOTER */}
        <Footer />
      </main>
    </div>
  );
}