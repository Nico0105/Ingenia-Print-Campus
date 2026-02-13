import React, { useState, useEffect } from "react";
import "./Product.css";
import MainNavbar from "../Components/MainNavbar";
import { useParams, useNavigate } from "react-router-dom";

export default function Product() {
  const { productId } = useParams();
  const navigate = useNavigate();

  // TODOS LOS PRODUCTOS (mismos datos del Catalogo)
  const allProducts = [
    { id: 1, name: "Creality Ender 3 V4", category: "fdm", price: "$1.250.000", image: "Creality_Ender_3_V4.JPEG", 
      description: "Impresora FDM versátil, ideal para producción y prototipado.", 
      fullDescription: "La Creality Ender 3 V4 es una impresora 3D de filamento (FDM) diseñada para profesionales y entusiastas. Ofrece una cama de impresión de 300x300x300mm con calefacción rápida y precisión de ±0.1mm. Compatible con múltiples materiales incluyendo PLA, PETG y ABS. Velocidad máxima de 600mm/s.",
      specs: ["300x300x300mm", "600mm/s", "PLA, PETG, ABS"],
      longSpecs: [
        { icon: "📏", label: "Volumen de Impresión", value: "300 x 300 x 300 mm" },
        { icon: "⚡", label: "Velocidad Máxima", value: "600 mm/s" },
        { icon: "🌡️", label: "Temperatura Cama", value: "110°C" },
        { icon: "📠", label: "Espesor de Capas", value: "0.1 - 0.4 mm" },
        { icon: "📤", label: "Materiales", value: "PLA, PETG, ABS, TPU" },
        { icon: "💾", label: "Conexión", value: "USB, SD Card, WiFi" }
      ],
      features: ["Cama calefactada rápida", "Nivelación automática", "Extrusor MK8", "Pantalla táctil", "Soporte multi-material"],
      inStock: true,
      rating: 4.8,
      reviews: 245
    },
    { id: 2, name: "Bambu Lab H2D", category: "fdm", price: "$2.100.000", image: "BAMBULAB_H2D.JPEG", 
      description: "Alta velocidad y precisión para trabajos profesionales.",
      fullDescription: "Bambu Lab H2D es una impresora de alta performance diseñada para producción en serie. Con velocidades de hasta 450mm/s y sistemas de calibración automática, es la mejor opción para producción profesional.",
      specs: ["Ø250x400mm", "450mm/s", "TPU, PLA+"],
      longSpecs: [
        { icon: "📏", label: "Volumen de Impresión", value: "250 x 400 x (altura variable)" },
        { icon: "⚡", label: "Velocidad Máxima", value: "450 mm/s" },
        { icon: "🤖", label: "Sistema", value: "Automatizado + Calibración AI" },
        { icon: "📠", label: "Espesor de Capas", value: "0.1 - 0.3 mm" },
        { icon: "📤", label: "Materiales", value: "PLA+, PETG, TPU, CF-Reforzado" },
        { icon: "📊", label: "Precisión", value: "±0.05 mm" }
      ],
      features: ["Calibración AI", "Múltiples extrusores", "Detección de colisión", "Cámara integrada", "Control cloud"],
      inStock: true,
      rating: 4.9,
      reviews: 512
    },
    { id: 3, name: "Bambu Lab H2S", category: "fdm", price: "$1.850.000", image: "BambuLabH2S.JPEG", 
      description: "Equilibrio perfecto entre rendimiento y confiabilidad.",
      fullDescription: "Versión mejorada del modelo anterior con mejor relación costo-beneficio. Perfecto para pequeños talleres y makerspaces.",
      specs: ["Ø250x400mm", "450mm/s", "TPU, PLA+"],
      longSpecs: [
        { icon: "📏", label: "Volumen de Impresión", value: "250 x 400 x (altura variable)" },
        { icon: "⚡", label: "Velocidad Máxima", value: "450 mm/s" },
        { icon: "🤖", label: "Sistema", value: "Calibración Manual + Asistentes" },
        { icon: "📠", label: "Espesor de Capas", value: "0.1 - 0.3 mm" },
        { icon: "📤", label: "Materiales", value: "PLA+, PETG, TPU" },
        { icon: "💰", label: "Relación P/P", value: "Premium en Calidad" }
      ],
      features: ["Buena relación costo-beneficio", "Fácil mantenimiento", "Soporte comunitario", "Múltiples accesorios"],
      inStock: true,
      rating: 4.7,
      reviews: 387
    },
    { id: 4, name: "Elegoo Saturn 4 Ultra", category: "resin", price: "$1.343.900", image: "Elegoo_Saturn4_Ultra.jpeg", 
      description: "Impresora 3D de resina Saturn-4ULTRA MSLA 12K LCD mono 10″ Wi-Fi",
      fullDescription: "La Elegoo Saturn 4 Ultra es una impresora de resina de alto rendimiento con pantalla LCD monocromática de 10 pulgadas y tecnología 12K.",
      specs: ["218x122x220mm", "450mm/s", "TPU, PLA+"],
      longSpecs: [
        { icon: "📏", label: "Volumen de Impresión", value: "218 x 122 x 220 mm" },
        { icon: "🖥️", label: "Pantalla", value: "LCD Monocromática 12K 10 pulgadas" },
        { icon: "📱", label: "Conectividad", value: "WiFi integrado" },
        { icon: "⚙️", label: "Tipo de Resina", value: "UV - Estándar, Flexible, Tech" },
        { icon: "🔬", label: "Precisión XY", value: "47.25 μm" },
        { icon: "🌡️", label: "Temperatura", value: "Calentamiento automático" }
      ],
      features: ["Pantalla LCD 12K", "WiFi integrado", "Calefacción de tanque", "Soporte cloud", "Velocidad 80mm/h"],
      inStock: true,
      rating: 4.6,
      reviews: 198
    },
    { id: 5, name: "Prusa i3 MK3S+", category: "fdm", price: "$1.580.000", image: "prusa_i3.jpeg", 
      description: "Impresora FDM confiable y de fácil uso",
      fullDescription: "La Prusa i3 MK3S+ es una impresora legendaria en la comunidad maker, conocida por su confiabilidad y facilidad de uso.",
      specs: ["250x210x210mm", "200mm/s", "PLA, PETG, ABS"],
      longSpecs: [
        { icon: "📏", label: "Volumen de Impresión", value: "250 x 210 x 210 mm" },
        { icon: "⚡", label: "Velocidad", value: "200 mm/s" },
        { icon: "🔧", label: "Nivelación", value: "Automática" },
        { icon: "📤", label: "Materiales", value: "PLA, PETG, ABS, ASA" },
        { icon: "🎯", label: "Precisión", value: "±0.05 mm" },
        { icon: "🌍", label: "Comunidad", value: "Una de las más grandes" }
      ],
      features: ["Fácil montaje", "Comunidad activa", "Open source", "Soporte excelente"],
      inStock: true,
      rating: 4.9,
      reviews: 678
    },
    { id: 6, name: "Anycubic Photon M4 Pro", category: "resin", price: "$890.000", image: "anycubic_m4.jpeg", 
      description: "Impresora de resina con buena relación precio-rendimiento",
      fullDescription: "Anycubic Photon M4 Pro ofrece una excelente relación precio-rendimiento para empezar en impresión de resina.",
      specs: ["153.36x86.4x180mm", "80μm", "Resina UV"],
      longSpecs: [
        { icon: "📏", label: "Volumen de Impresión", value: "153.36 x 86.4 x 180 mm" },
        { icon: "🖥️", label: "Pantalla", label: "LCD" },
        { icon: "📱", label: "Conectividad", value: "USB" },
        { icon: "⚙️", label: "Tipo de Resina", value: "UV - Estándar" },
        { icon: "🔬", label: "Precisión", value: "80 μm XY" },
        { icon: "💰", label: "Presupuesto", value: "Accesible" }
      ],
      features: ["Pantalla 2K", "Precio accesible", "Fácil de usar", "Buen soporte"],
      inStock: true,
      rating: 4.5,
      reviews: 342
    },
    { id: 7, name: "Voron 2.4", category: "fdm", price: "$2.500.000", image: "voron_2_4.jpeg", 
      description: "Impresora modular de alta gama",
      fullDescription: "Voron 2.4 es un diseño de impresora de código abierto known por su precisión y capacidad de personalización.",
      specs: ["350x350x350mm", "300mm/s", "Multi-material"],
      longSpecs: [
        { icon: "📏", label: "Volumen de Impresión", value: "350 x 350 x 350 mm (configurable)" },
        { icon: "⚡", label: "Velocidad", value: "300+ mm/s" },
        { icon: "🔧", label: "Construcción", value: "Modular - CoreXY" },
        { icon: "📤", label: "Materiales", value: "Todos los filamentos" },
        { icon: "🎯", label: "Precisión", value: "±0.05 mm" },
        { icon: "🔓", label: "Licencia", value: "Open Source" }
      ],
      features: ["Diseño modular", "CoreXY kinematics", "Altamente eficiente", "Comunidad global"],
      inStock: false,
      rating: 4.8,
      reviews: 421
    },
    { id: 8, name: "Formlabs Form 3", category: "resin", price: "$3.200.000", image: "formlabs_form3.jpeg", 
      description: "Impresora de resina profesional de gama alta",
      fullDescription: "Formlabs Form 3 es una impresora de resina profesional diseñada para producción industrial y prototipado de precisión.",
      specs: ["145x82x100mm", "25μm", "Resina de ingeniería"],
      longSpecs: [
        { icon: "📏", label: "Volumen de Impresión", value: "145 x 82 x (altura variable)" },
        { icon: "🖥️", label: "Tecnología", value: "SLA de precisión" },
        { icon: "⚙️", label: "Tipo de Resina", value: "Engineering Resins" },
        { icon: "🔬", label: "Precisión", value: "25 μm" },
        { icon: "🏗️", label: "Aplicación", value: "Industria, Joyería, Odontología" },
        { icon: "🎯", label: "Acabado", value: "Óptimo" }
      ],
      features: ["Precisión ultra-fina", "Resinas de ingeniería", "Software profesional", "Soporte post-venta"],
      inStock: true,
      rating: 4.9,
      reviews: 156
    },
    { id: 9, name: "Artillery Genius P", category: "fdm", price: "$980.000", image: "artillery_genius.jpeg", 
      description: "Impresora FDM presupuesto amigable",
      fullDescription: "Artillery Genius P es una excelente opción para quienes comienzan en impresión 3D con presupuesto limitado.",
      specs: ["220x220x250mm", "150mm/s", "PLA, PETG"],
      longSpecs: [
        { icon: "📏", label: "Volumen de Impresión", value: "220 x 220 x 250 mm" },
        { icon: "⚡", label: "Velocidad", value: "150 mm/s" },
        { icon: "🌡️", label: "Temperatura", value: "Cama calentada" },
        { icon: "📤", label: "Materiales", value: "PLA, PETG, TPU" },
        { icon: "💰", label: "Precio", value: "Muy accesible" },
        { icon: "🎯", label: "Público", value: "Principiantes" }
      ],
      features: ["Presupuesto accesible", "Fácil armado", "Buen rendimiento", "Comunidad activa"],
      inStock: true,
      rating: 4.4,
      reviews: 289
    },
    { id: 10, name: "Ultimaker S5 Pro", category: "fdm", price: "$4.100.000", image: "ultimaker_s5.jpeg", 
      description: "Impresora industrial multi-extrusor",
      fullDescription: "Ultimaker S5 Pro es una impresora industrial diseñada para producción en masa con múltiples materiales.",
      specs: ["330x240x300mm", "300mm/s", "Multi-extrusor"],
      longSpecs: [
        { icon: "📏", label: "Volumen de Impresión", value: "330 x 240 x 300 mm" },
        { icon: "🔄", label: "Extrusores", value: "Dual (2 materiales)" },
        { icon: "⚡", label: "Velocidad", value: "300 mm/s" },
        { icon: "🏭", label: "Aplicación", value: "Producción Industrial" },
        { icon: "🖥️", label: "Control", value: "Software profesional" },
        { icon: "🌐", label: "Conectividad", value: "Cloud + Red" }
      ],
      features: ["Dual extrusor", "Software profesional", "Alta productividad", "Garantía extendida"],
      inStock: true,
      rating: 4.8,
      reviews: 167
    },
    { id: 11, name: "XYZprinting da Vinci 2.0", category: "fdm", price: "$750.000", image: "xyz_davinci.jpeg", 
      description: "Impresora FDM compacta y versátil",
      fullDescription: "XYZprinting da Vinci 2.0 es una impresora compacta ideal para escritorios pequeños.",
      specs: ["200x200x200mm", "100mm/s", "PLA, PETG"],
      longSpecs: [
        { icon: "📏", label: "Volumen de Impresión", value: "200 x 200 x 200 mm" },
        { icon: "📦", label: "Tamaño", value: "Compacta" },
        { icon: "⚡", label: "Velocidad", value: "100 mm/s" },
        { icon: "📤", label: "Materiales", value: "PLA, PETG" },
        { icon: "🏠", label: "Uso", value: "Hogar/Pequeñas oficinas" },
        { icon: "💚", label: "Eco", value: "Filamento reciclable" }
      ],
      features: ["Tamaño compacto", "Precio muy bajo", "Silencioso", "Software adaptado"],
      inStock: true,
      rating: 4.3,
      reviews: 203
    },
    { id: 12, name: "Chitubox Pro (Software)", category: "software", price: "$0", image: "chitubox.jpeg", 
      description: "Software de slicing premium para resina",
      fullDescription: "Chitubox Pro es el software de slicing más popular para impresoras de resina con herramientas profesionales.",
      specs: ["Slicing 3D", "Resina", "Gratis"],
      longSpecs: [
        { icon: "💻", label: "Plataforma", value: "Windows, Mac, Linux" },
        { icon: "🎯", label: "Compatibilidad", value: "La mayoría de impresoras resina" },
        { icon: "🛠️", label: "Herramientas", value: "Avanzadas y profesionales" },
        { icon: "💰", label: "Precio", value: "Gratis + Versión Pro" },
        { icon: "📚", label: "Comunidad", value: "Muy activa" },
        { icon: "🔄", label: "Actualizaciones", value: "Regulares" }
      ],
      features: ["Versión gratuita disponible", "Herramientas avanzadas", "UI intuitiva", "Exportación múltiple"],
      inStock: true,
      rating: 4.7,
      reviews: 1240
    },
    { id: 13, name: "Prusaslicer", category: "software", price: "$0", image: "prusaslicer.jpeg", 
      description: "Software de slicing open source para FDM",
      fullDescription: "Prusaslicer es el software slicing más popular para FDM, desarrollado por Prusa Research y 100% open source.",
      specs: ["Slicing FDM", "Open Source", "Gratis"],
      longSpecs: [
        { icon: "💻", label: "Plataforma", value: "Windows, Mac, Linux" },
        { icon: "🎯", label: "Para", value: "Cualquier impresora FDM" },
        { icon: "🔶", label: "Interfaz", value: "Moderna y completa" },
        { icon: "💰", label: "Costo", value: "100% Gratuito" },
        { icon: "🔓", label: "Código", value: "Open Source" },
        { icon: "🚀", label: "Velocidad", value: "Computación rápida" }
      ],
      features: ["Totalmente gratis", "Open source", "Actualizado regularmente", "Comunidad global"],
      inStock: true,
      rating: 4.8,
      reviews: 2340
    },
    { id: 14, name: "Cura by Ultimaker", category: "software", price: "$0", image: "cura.jpeg", 
      description: "Software de slicing de propósito general",
      fullDescription: "Cura es el software de slicing más versátil, mantenido por Ultimaker y compatible con cientos de impresoras.",
      specs: ["Slicing FDM", "Open Source", "Gratis"],
      longSpecs: [
        { icon: "💻", label: "Plataforma", value: "Windows, Mac, Linux" },
        { icon: "🌍", label: "Compatibilidad", value: "1000+ modelos de impresoras" },
        { icon: "🎨", label: "Perfiles", value: "Perfiles comunitarios" },
        { icon: "💰", label: "Precio", value: "Gratuito" },
        { icon: "📈", label: "Popularidad", value: "Más usado" },
        { icon: "🔧", label: "Customización", value: "Altamente configurable" }
      ],
      features: ["Amplia compatibilidad", "UI intuitiva", "Previsualizador 3D", "Perfiles comunitarios"],
      inStock: true,
      rating: 4.6,
      reviews: 3120
    },
    { id: 15, name: "Filamento PLA 1kg", category: "consumibles", price: "$45.000", image: "filamento_pla.jpeg", 
      description: "Filamento PLA de alta calidad",
      fullDescription: "Filamento PLA 1kg de excelente calidad, diámetro precision 1.75mm, colores variados, biodegradable.",
      specs: ["1kg", "1.75mm", "Varios colores"],
      longSpecs: [
        { icon: "⚖️", label: "Peso", value: "1 kg" },
        { icon: "📏", label: "Diámetro", value: "1.75 mm (±0.05)" },
        { icon: "🎨", label: "Colores", value: "40+ opciones disponibles" },
        { icon: "🌡️", label: "Temp. Cama", value: "20-60°C" },
        { icon: "🌱", label: "Material", value: "Biodegradable" },
        { icon: "💚", label: "Eco", value: "Material de biomasa" }
      ],
      features: ["Biodegradable", "Fácil de imprimir", "Colores vibrantes", "Excelente acabado"],
      inStock: true,
      rating: 4.7,
      reviews: 890
    },
    { id: 16, name: "Resina Standard 1L", category: "consumibles", price: "$120.000", image: "resina_standard.jpeg", 
      description: "Resina UV estándar para impresoras de resina",
      fullDescription: "Resina UV 1L de uso general, transparente, para la mayoría de impresoras de resina.",
      specs: ["1 Litro", "Transparente", "Uso general"],
      longSpecs: [
        { icon: "📦", label: "Volumen", value: "1 Litro" },
        { icon: "🎨", label: "Color", value: "Transparente" },
        { icon: "🔬", label: "Tipo", value: "UV Estándar" },
        { icon: "⚙️", label: "Compatibilidad", value: "Mayoría de impresoras" },
        { icon: "🌡️", label: "Temperatura", value: "20-25°C óptimo" },
        { icon: "⏱️", label: "Almacenaje", value: "A oscuras, 1 año" }
      ],
      features: ["Compatible universal", "Transparente", "Buen acabado", "Almacenamiento seguro"],
      inStock: true,
      rating: 4.6,
      reviews: 567
    },
    { id: 17, name: "Nozzle MK8 0.4mm", category: "accesorios", price: "$8.000", image: "nozzle.jpeg", 
      description: "Boquilla MK8 de latón para FDM",
      fullDescription: "Boquilla de latón MK8 compatible con la mayoría de impresoras FDM, diámetro 0.4mm estándar.",
      specs: ["0.4mm", "Latón", "Compatible FDM"],
      longSpecs: [
        { icon: "📏", label: "Diámetro", value: "0.4 mm (estándar)" },
        { icon: "🧊", label: "Material", value: "Latón maquinado" },
        { icon: "🔧", label: "Rosca", value: "M6" },
        { icon: "🔥", label: "Temp. Máx", value: "300°C" },
        { icon: "♻️", label: "Vida útil", value: "500-1000 horas" },
        { icon: "💰", label: "Precio", value: "Muy económico" }
      ],
      features: ["Material latón puro", "Reemplazo simple", "Durabilidad probada", "Stock disponible"],
      inStock: true,
      rating: 4.8,
      reviews: 342
    },
    { id: 18, name: "Cama Magnética PEI", category: "accesorios", price: "$35.000", image: "cama_magnetica.jpeg", 
      description: "Cama magnética con recubrimiento PEI",
      fullDescription: "Cama magnética flexible con recubrimiento PEI para mejor adhesión y facilidad de remoción.",
      specs: ["PEI", "Adhesión superior", "Reutilizable"],
      longSpecs: [
        { icon: "📏", label: "Tamaño", value: "Standard 300x300mm (ajustable)" },
        { icon: "🧲", label: "Sistema", value: "Magnético flexible" },
        { icon: "🎯", label: "Superficie", value: "PEI textured" },
        { icon: "🔄", label: "Adhesión", value: "Excelente" },
        { icon: "♻️", label: "Vida útil", value: "5000+ ciclos" },
        { icon: "⚡", label: "Instalación", value: "Instant-snap" }
      ],
      features: ["Adhesión mejorada", "Fácil remoción", "Reutilizable", "Larga duración"],
      inStock: true,
      rating: 4.9,
      reviews: 456
    },
    { id: 19, name: "Limpiador Ultrasónico", category: "accesorios", price: "$180.000", image: "limpiador_ultrasonico.jpeg", 
      description: "Limpiador ultrasónico para resina",
      fullDescription: "Limpiador ultrasónico 2L para limpiar piezas impresas en resina con precisión.",
      specs: ["2L", "40kHz", "Para resina"],
      longSpecs: [
        { icon: "📦", label: "Capacidad", value: "2 Litros" },
        { icon: "📻", label: "Frecuencia", value: "40 kHz" },
        { icon: "⚙️", label: "Tipo", value: "Digital" },
        { icon: "🔊", label: "Ruido", value: "< 70 dB" },
        { icon: "⏱️", label: "Timer", value: "Hasta 20 min" },
        { icon: "🌡️", label: "Temperatura", value: "hasta 60°C" }
      ],
      features: ["Timer programable", "Función calentamiento", "Limpieza profunda", "Tanque removible"],
      inStock: true,
      rating: 4.7,
      reviews: 234
    },
    { id: 20, name: "Guantes Nitrilo Caja", category: "consumibles", price: "$12.000", image: "guantes.jpeg", 
      description: "Guantes de nitrilo x100 pares",
      fullDescription: "Caja de 100 pares de guantes de nitrilo ajustados, talla M estándar.",
      specs: ["100 pares", "Talla M", "Protección"],
      longSpecs: [
        { icon: "📦", label: "Cantidad", value: "100 pares" },
        { icon: "📏", label: "Talla", value: "M (mediano)" },
        { icon: "🧤", label: "Material", value: "Nitrilo 100%" },
        { icon: "🔬", label: "Uso", value: "Industria, Laboratorio, 3D" },
        { icon: "♻️", label: "Grosor", value: "0.11 mm - Extra resistente" },
        { icon: "💚", label: "Propiedad", value: "Látex free" }
      ],
      features: ["Súper resistentes", "Ajuste cómodo", "Látex-free", "Económicos"],
      inStock: true,
      rating: 4.5,
      reviews: 612
    },
  ];

  // HOOKS - SIEMPRE ANTES DE CONDICIONALES
  const [quantity, setQuantity] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);

  const handleAddToCart = () => {
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  // Buscar el producto por ID
  const product = allProducts.find((p) => p.id === parseInt(productId));

  if (!product) {
    return (
      <div className="product-error">
        <MainNavbar />
        <div className="error-container">
          <h2>Producto no encontrado</h2>
          <button onClick={() => navigate("/catalogo")}>Volver al Catálogo</button>
        </div>
      </div>
    );
  }

  return (
    <div className="product-page">
      {/* HEADER */}
      <header className="product-header">
        <MainNavbar />
      </header>

      {/* BREADCRUMB */}
      <div className="breadcrumb">
        <span onClick={() => navigate("/")} className="breadcrumb-link">Home</span>
        <span>/</span>
        <span onClick={() => navigate("/catalogo")} className="breadcrumb-link">Catálogo</span>
        <span>/</span>
        <span className="breadcrumb-current">{product.name}</span>
      </div>

      {/* MAIN CONTENT */}
      <main className="product-main">
        {/* LEFT: IMAGE & GALLERY */}
        <section className="product-gallery">
          <div className="main-image">
            <img src={product.image} alt={product.name} />
            {!product.inStock && <div className="out-of-stock-badge">Agotado</div>}
          </div>

          <div className="thumbnail-gallery">
            {/* 4 thumbnails simuladas */}
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="thumbnail">
                <img src={product.image} alt={`Thumbnail ${i}`} />
              </div>
            ))}
          </div>
        </section>

        {/* RIGHT: DETAILS & BUY */}
        <section className="product-details">
          {/* HEADER */}
          <div className="product-title-section">
            <span className="category-badge">{product.category.toUpperCase()}</span>
            <h1>{product.name}</h1>
            <div className="rating-section">
              <span className="rating">⭐ {product.rating}</span>
              <span className="reviews">({product.reviews} reseñas)</span>
            </div>
          </div>

          {/* PRICE */}
          <div className="price-section">
            <span className="price">{product.price}</span>
            <span className={`stock-indicator ${product.inStock ? "in-stock" : "out-of-stock"}`}>
              {product.inStock ? "✓ En Stock" : "✗ Agotado"}
            </span>
          </div>

          {/* DESCRIPTION */}
          <p className="description">{product.fullDescription}</p>

          {/* SPECS */}
          <div className="specs-grid">
            {product.longSpecs.map((spec, idx) => (
              <div key={idx} className="spec-item">
                <span className="spec-icon">{spec.icon}</span>
                <div className="spec-text">
                  <p className="spec-label">{spec.label}</p>
                  <p className="spec-value">{spec.value}</p>
                </div>
              </div>
            ))}
          </div>

          {/* FEATURES */}
          {product.features && product.features.length > 0 && (
            <div className="features-section">
              <h3>Características Principales</h3>
              <ul className="features-list">
                {product.features.map((feature, idx) => (
                  <li key={idx}>✓ {feature}</li>
                ))}
              </ul>
            </div>
          )}

          {/* CTA SECTION */}
          <div className="cta-section">
            {product.inStock && (
              <div className="quantity-selector">
                <label>Cantidad:</label>
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))}>−</button>
                <input type="number" value={quantity} readOnly />
                <button onClick={() => setQuantity(quantity + 1)}>+</button>
              </div>
            )}

            <button 
              className={`btn-cart ${addedToCart ? "added" : ""}`}
              onClick={handleAddToCart}
              disabled={!product.inStock}
            >
              {addedToCart ? "✓ Agregado al Carrito" : "Agregar al Carrito"}
            </button>

            <button className="btn-inquiry">
              💬 Consultar Disponibilidad
            </button>
          </div>

          {/* INFO BOXES */}
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

      {/* RELATED PRODUCTS */}
      <section className="related-products">
        <h2>Productos Relacionados</h2>
        <div className="related-grid">
          {allProducts
            .filter((p) => p.category === product.category && p.id !== product.id)
            .slice(0, 4)
            .map((relatedProduct) => (
              <div
                key={relatedProduct.id}
                className="related-card"
                onClick={() => navigate(`/product/${relatedProduct.id}`)}
              >
                <img src={relatedProduct.image} alt={relatedProduct.name} />
                <h4>{relatedProduct.name}</h4>
                <p>{relatedProduct.price}</p>
              </div>
            ))}
        </div>
      </section>

      {/* FOOTER */}
      <footer className="product-footer">
        <p>© 2024 INGENIA. Engineered for precision.</p>
      </footer>
    </div>
  );
}
