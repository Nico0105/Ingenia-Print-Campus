import React, { useEffect, useState } from "react";
import "./Home.css";
import { useNavigate } from "react-router-dom";
import Globe from '../Components/Globe';

export default function Home() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [scrollY, setScrollY] = useState(0);

  const navigate = useNavigate();

  const HandleLogin = () => {
    navigate('/login');
  }

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({
        x: e.clientX,
        y: e.clientY,
      });
    };

    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <div className="home">

      {/* HEADER */}
      <header className="header">
        <div className="header-left">
          <div className="logo">
            <img className="logo" src="./Logo.png" alt="logo" />
            <h1>INGENIA</h1>
          </div>

          <nav className="nav">
            <a href="#">Catalogo</a>
            <a href="#">Nosotros</a>
            <a href="#">Support</a>
            <a href="#">Software</a>
          </nav>
        </div>

        <div className="header-right">
          <div className="search-box">
            <input type="text" placeholder="Search models or parts..." />
          </div>

          <button className="btn-primary" onClick={HandleLogin}>
            <span className="material-symbols-outlined">Iniciar Sesion</span>
          </button>
        </div>
      </header>

      {/* HERO */}
      <main>
        <section className="hero">
          <div className="hero-content">
            <span className="badge">Industrial Manufacturing 4.0</span>

            <h2 className="hero-title">
              INGENIA PRINT <br />
              <span>IMPRIMIENDO SOLUCIONES</span>
            </h2>

            <p className="hero-text">
              The future of manufacturing is here. INGENIA professional-grade
              3D printers deliver unmatched precision, speed, and reliability.
            </p>

            <div className="hero-actions">
              <button className="btn-primary big">
                Comprar Ahora
              </button>

              <button className="btn-secondary">
                Especificaciones Tecnicas
              </button>
            </div>
          </div>

          {/* GLOBE VISUAL */}
          <div className="hero-visual">
            <div className="globe-container">
              <Globe
                theta={0.01}
                dark={1}
                scale={0.5}
                diffuse={1.2}
                baseColor="#ffffff"
                markerColor="#ff7d04"
                glowColor="#979797"
              />
            </div>
          </div>
        </section>

        {/* FILTER BAR */}
        <section className="filters">
          <div className="filter-left">
            <button className="chip active">Todos Nuestros Modelos</button>
            <button className="chip">Linea Profesional</button>
            <button className="chip">Linea Resina</button>
            <button className="chip">Linea Industrial</button>
            <button className="chip">Insumos / Accesorios / Materiales</button>
          </div>

          <div className="filter-right">
            <span>Ordenar por:</span>
            <select>
              <option>Destacados</option>
              <option>Mayor Precio</option>
              <option>Menor Precio</option>
            </select>
          </div>
        </section>

        {/* PRODUCTS */}
        <section className="products">
          <div className="section-header">
            <div>
              <h3>Professional Printers</h3>
              <p>Precision-engineered hardware for industrial workflows.</p>
            </div>
          </div>

          <div className="product-grid">
            <div className="card">
              <div className="card-image core-x"></div>
              <div className="card-body">
                <h4>INGENIA Core X</h4>
                <ul>
                  <li>300 x 300 x 300 mm</li>
                  <li>600 mm/s</li>
                  <li>PLA, PETG, ABS</li>
                </ul>
                <div className="card-actions">
                  <button className="btn-primary small">Comprar Ahora</button>
                  <button className="btn-info">
                    <span className="material-symbols-outlined">info</span>
                  </button>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="card-image delta"></div>
              <div className="card-body">
                <h4>Delta Pro-S</h4>
                <ul>
                  <li>Ø 250 x 400 mm</li>
                  <li>450 mm/s</li>
                  <li>TPU, PLA+</li>
                </ul>
                <div className="card-actions">
                  <button className="btn-primary small">Comprar Ahora</button>
                  <button className="btn-info">
                    <span className="material-symbols-outlined">info</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FOOTER */}
        <footer className="footer">
          <div className="footer-top">
            <div className="footer-brand">
              <h2>INGENIA</h2>
            </div>

            <div className="footer-links">
              <div>
                <h5>Company</h5>
                <a href="#">About</a>
                <a href="#">Technology</a>
                <a href="#">Careers</a>
              </div>

              <div>
                <h5>Support</h5>
                <a href="#">Manuals</a>
                <a href="#">Firmware</a>
                <a href="#">Community</a>
              </div>
            </div>
          </div>

          <div className="footer-bottom">
            <p>© 2024 INGENIA. Engineered for precision.</p>
          </div>
        </footer>
      </main>
    </div>
  );
}