import React, { useEffect, useState } from "react";
import "./Home.css";
import { useNavigate } from "react-router-dom";

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
            <button className="nav-btn active">Catalogo</button>
            <button className="nav-btn">Nosotros</button>
            <button className="nav-btn">Cursos</button>
            <button className="nav-btn">Software</button>
          </nav>
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
            <span className="badge">Industrial Manufacturing 4.0</span>

            <h2 className="hero-title">
              INGENIA PRINT <br />
              <span>Ideas que toman forma</span>
            </h2>
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
              <h3>Nuestros Modelos</h3>
              <p>Rendimiento, precisión y durabilidad</p>
            </div>
          </div>

          <div className="product-grid">
            <div className="card">
              <div className="card-image core-x"></div>
              <div className="card-body">
                <h4>Creality Ender 3 V4</h4>
                <ul>
                  <li>300 x 300 x 300 mm</li>
                  <li>600 mm/s</li>
                  <li>PLA, PETG, ABS</li>
                </ul>
                <div className="card-actions">
                  <button className="btn-primary small">Consulta Aquí</button>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="card-image delta"></div>
              <div className="card-body">
                <h4>Bambu Lab H2D</h4>
                <ul>
                  <li>Ø 250 x 400 mm</li>
                  <li>450 mm/s</li>
                  <li>TPU, PLA+</li>
                </ul>
                <div className="card-actions">
                  <button className="btn-primary small">Consulta Aquí</button>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="card-image delta"></div>
              <div className="card-body">
                <h4>Bambu Lab H2S</h4>
                <ul>
                  <li>Ø 250 x 400 mm</li>
                  <li>450 mm/s</li>
                  <li>TPU, PLA+</li>
                </ul>
                <div className="card-actions">
                  <button className="btn-primary small">Consulta Aquí</button>
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