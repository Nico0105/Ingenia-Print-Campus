import React, { useState } from "react";
import "./Catalogo.css";
import MainNavbar from "../Components/MainNavbar";
import { useNavigate } from "react-router-dom";

export default function Catalogo() {
  const navigate = useNavigate();
  
  // Sample products data (5-6 items × 4 columns = 20-24 items)
  const allProducts = [
    { id: 1, name: "Creality Ender 3 V4", category: "fdm", price: "$1.250.000", image: "Creality_Ender_3_V4.JPEG", specs: ["300x300x300mm", "600mm/s", "PLA, PETG, ABS"] },
    { id: 2, name: "Bambu Lab H2D", category: "fdm", price: "$2.100.000", image: "BAMBULAB_H2D.JPEG", specs: ["Ø250x400mm", "450mm/s", "TPU, PLA+"] },
    { id: 3, name: "Bambu Lab H2S", category: "fdm", price: "$1.850.000", image: "BambuLabH2S.JPEG", specs: ["Ø250x400mm", "450mm/s", "TPU, PLA+"] },
    { id: 4, name: "Elegoo Saturn 4 Ultra", category: "resin", price: "$1.343.900", image: "Elegoo_Saturn4_Ultra.jpeg", specs: ["218x122x220mm", "450mm/s", "TPU, PLA+"] },
    { id: 5, name: "Prusa i3 MK3S+", category: "fdm", price: "$1.580.000", image: "prusa_i3.jpeg", specs: ["250x210x210mm", "200mm/s", "PLA, PETG, ABS"] },
    { id: 6, name: "Anycubic Photon M4 Pro", category: "resin", price: "$890.000", image: "anycubic_m4.jpeg", specs: ["153.36x86.4x180mm", "80μm", "Resina UV"] },
    { id: 7, name: "Voron 2.4", category: "fdm", price: "$2.500.000", image: "voron_2_4.jpeg", specs: ["350x350x350mm", "300mm/s", "Multi-material"] },
    { id: 8, name: "Formlabs Form 3", category: "resin", price: "$3.200.000", image: "formlabs_form3.jpeg", specs: ["145x82x100mm", "25μm", "Resina de ingeniería"] },
    { id: 9, name: "Artillery Genius P", category: "fdm", price: "$980.000", image: "artillery_genius.jpeg", specs: ["220x220x250mm", "150mm/s", "PLA, PETG"] },
    { id: 10, name: "Ultimaker S5 Pro", category: "fdm", price: "$4.100.000", image: "ultimaker_s5.jpeg", specs: ["330x240x300mm", "300mm/s", "Multi-extrusor"] },
    { id: 11, name: "XYZprinting da Vinci 2.0", category: "fdm", price: "$750.000", image: "xyz_davinci.jpeg", specs: ["200x200x200mm", "100mm/s", "PLA, PETG"] },
    { id: 12, name: "Chitubox Pro (Software)", category: "software", price: "$0", image: "chitubox.jpeg", specs: ["Slicing 3D", "Resina", "Gratis"] },
    { id: 13, name: "Prusaslicer", category: "software", price: "$0", image: "prusaslicer.jpeg", specs: ["Slicing FDM", "Open Source", "Gratis"] },
    { id: 14, name: "Cura by Ultimaker", category: "software", price: "$0", image: "cura.jpeg", specs: ["Slicing FDM", "Open Source", "Gratis"] },
    { id: 15, name: "Filamento PLA 1kg", category: "consumibles", price: "$45.000", image: "filamento_pla.jpeg", specs: ["1kg", "1.75mm", "Varios colores"] },
    { id: 16, name: "Resina Standard 1L", category: "consumibles", price: "$120.000", image: "resina_standard.jpeg", specs: ["1 Litro", "Transparente", "Uso general"] },
    { id: 17, name: "Nozzle MK8 0.4mm", category: "accesorios", price: "$8.000", image: "nozzle.jpeg", specs: ["0.4mm", "Latón", "Compatible FDM"] },
    { id: 18, name: "Cama Magnética PEI", category: "accesorios", price: "$35.000", image: "cama_magnetica.jpeg", specs: ["PEI", "Adhesión superior", "Reutilizable"] },
    { id: 19, name: "Limpiador Ultrasónico", category: "accesorios", price: "$180.000", image: "limpiador_ultrasonico.jpeg", specs: ["2L", "40kHz", "Para resina"] },
    { id: 20, name: "Guantes Nitrilo Caja", category: "consumibles", price: "$12.000", image: "guantes.jpeg", specs: ["100 pares", "Talla M", "Protección"] },
  ];

  const categories = [
    { id: "all", name: "Todos los Productos" },
    { id: "fdm", name: "Impresoras FDM" },
    { id: "resin", name: "Impresoras Resina" },
    { id: "software", name: "Software" },
    { id: "consumibles", name: "Consumibles" },
    { id: "accesorios", name: "Accesorios" },
  ];

  const [activeCategory, setActiveCategory] = useState("all");
  const [priceRange, setPriceRange] = useState(5000000);

  const filteredProducts = allProducts.filter((product) => {
    const categoryMatch = activeCategory === "all" || product.category === activeCategory;
    const priceMatch = parseInt(product.price.replace(/[^0-9]/g, "")) <= priceRange;
    return categoryMatch && priceMatch;
  });

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
              {categories.map((cat) => (
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

          <div className="filters-section">
            <h3 className="filters-title">Rango de Precio</h3>
            <div className="price-filter">
              <input
                type="range"
                min="0"
                max="5000000"
                step="100000"
                value={priceRange}
                onChange={(e) => setPriceRange(Number(e.target.value))}
                className="price-slider"
              />
              <div className="price-display">
                Hasta: ${(priceRange / 1000).toFixed(0)}K
              </div>
            </div>
          </div>

          <button className="reset-filters" onClick={() => { setActiveCategory("all"); setPriceRange(5000000); }}>
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
                  <img src={product.image} alt={product.name} />
                </div>

                <div className="product-info">
                  <h4 className="product-name">{product.name}</h4>
                  <p className="product-category">{product.category}</p>

                  <ul className="product-specs">
                    {product.specs.map((spec, idx) => (
                      <li key={idx}>{spec}</li>
                    ))}
                  </ul>

                  <div className="product-footer">
                    <span className="product-price">{product.price}</span>
                    <button className="btn-add-cart">Consultar</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
