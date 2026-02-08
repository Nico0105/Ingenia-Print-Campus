import React, { useEffect, useState } from "react";
import "./Home.css";
import { useNavigate } from "react-router-dom";


export default function Home() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [scrollY, setScrollY] = useState(0);

  const chips = [
    "Todos Nuestros Modelos",
    "Linea Profesional",
    "Linea Resina",
    "Linea Industrial",
    "Insumos / Accesorios / Materiales"
  ];
  const [activeChip, setActiveChip] = useState(chips[0]);


  const products = [
  {
    id: 1,
    name: "Creality Ender 3 V4",
    price: "$1.250.000",
    description: "Impresora FDM versátil, ideal para producción y prototipado.",
    image: "Creality_Ender_3_V4.JPEG", // futuro
    specs: [
      "300 x 300 x 300 mm",
      "600 mm/s",
      "PLA, PETG, ABS",
    ],
  },
  {
    id: 2,
    name: "Bambu Lab H2D",
    price: "$2.100.000",
    description: "Alta velocidad y precisión para trabajos profesionales.",
    image: "BAMBULAB_H2D.JPEG",
    specs: [
      "Ø 250 x 400 mm",
      "450 mm/s",
      "TPU, PLA+",
    ],
  },
  {
    id: 3,
    name: "Bambu Lab H2S",
    price: "$1.850.000",
    description: "Equilibrio perfecto entre rendimiento y confiabilidad.",
    image: "BambuLabH2S.JPEG",
    specs: [
      "Ø 250 x 400 mm",
      "450 mm/s",
      "TPU, PLA+",
    ],
  },
];

  
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

        {/* Impresora 3D de Sketchfab en el fondo */}
        <div className="printer-embed">
          <iframe 
          title="Makerbot Replicator" 
          frameBorder="0" 
          allowFullScreen 
          mozallowfullscreen="true" 
          webkitallowfullscreen="true" 
          allow="autoplay; fullscreen; xr-spatial-tracking" 
          src="https://sketchfab.com/models/1c9ffb3a75884ef7bbd9fbcda00a8661/embed?autostart=1&autospin=0.2&ui_animations=0&ui_controls=0&ui_infos=0&ui_inspector=0&ui_stop=0&ui_watermark=0&ui_hint=0&ui_help=0&ui_settings=0&ui_vr=0&ui_ar=0&ui_theme=dark&transparent=1&preload=1">
        </iframe>
        </div>
      </section>

        {/* FILTER BAR */}
        <section className="filters">
          <div className="filter-left">
            {chips.map((chip) => (
              <button
                key={chip}
                className={`chip ${activeChip === chip ? "active" : ""}`}
                onClick={() => setActiveChip(chip)}
              >
                {chip}</button>
            ))}
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
            {products.map((product) => (
              <div className="card" key={product.id}>
                <div className="card-image">
                  {/* Imagen futura */}
                  <img src={product.image} alt={product.name} />
                </div>

                <div className="card-body">
                  <h4>{product.name}</h4>

                  <p className="price">{product.price}</p>
                  <p className="description">{product.description}</p>

                  <ul>
                    {product.specs.map((spec, index) => (
                      <li key={index}>{spec}</li>
                    ))}
                  </ul>

                  <div className="card-actions">
                    <button className="btn-primary small">
                      Consulta Aquí
                    </button>
                  </div>
                </div>
              </div>
            ))}
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