import { useState, useEffect, useRef } from "react";
import "./Curso.css";
import MainNavbar from "../Components/MainNavbar";
import Footer from "../Components/Footer";
import WhatsAppFloat from "../Components/WhatsAppFloat";
import { useNavigate } from "react-router-dom";

// ── DATA ──────────────────────────────────────────────────────────────────────

const beneficiosData = [
  {
    icon: "✓",
    title: "Guía Inicial",
    desc: "Primeros Pasos con tu impresora 3D. Un recorrido claro y ordenado para entender cómo funciona tu equipo, cómo configurarlo correctamente y cómo empezar a imprimir con confianza desde cero.",
  },
  {
    icon: "✓",
    title: "Documentación técnica clara",
    desc: "Material organizado para entender mejor la impresión 3D en la práctica: configuración, materiales, errores comunes, flujo de trabajo y buenas prácticas.",
  },
  {
    icon: "✓",
    title: "Comunidad Ingenia",
    desc: "Un espacio para compartir proyectos, hacer consultas y aprender junto a otras personas que también están empezando o desarrollando sus ideas.",
  },
  {
    icon: "✓",
    title: "Asistente IA especializado",
    desc: "Un chat inteligente entrenado para ayudarte con dudas técnicas, configuraciones y problemas habituales durante el uso de tu impresora. Disponible cuando lo necesites.",
  },
  {
    icon: "✓",
    title: "Calculadora de costos",
    desc: "Una herramienta pensada para estimar correctamente el costo real de cada pieza. Ideal si querés emprender o profesionalizar tu producción.",
  },
  {
    icon: "✓",
    title: "Herramientas de gestión",
    desc: "Un entorno para organizar desde un mismo lugar: impresoras, filamentos, stock, clientes y presupuestos.",
  },
];

const pasosData = [
  {
    number: "01",
    title: "Compra tu impresora",
    desc: "Elegí el modelo que mejor se ajuste a tus necesidades en nuestro catálogo.",
  },
  {
    number: "02",
    title: "Recibí tus credenciales",
    desc: "Con tu compra activamos tu acceso al Campus Ingenia automáticamente.",
  },
  {
    number: "03",
    title: "Comenzá a aprender",
    desc: "Accedé a la guía inicial, herramientas, comunidad y soporte para dar tus primeros pasos con confianza.",
  },
  {
    number: "04",
    title: "Acompañamiento permanente",
    desc: "Comprar una impresora es solo el comienzo. Tenés acceso permanente a recursos, herramientas y soporte.",
  },
];

// ── HOOKS ─────────────────────────────────────────────────────────────────────

function useInView(ref, options = {}) {
  const [inView, setInView] = useState(false);

  useEffect(() => {
    if (!ref.current) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          obs.disconnect();
        }
      },
      { threshold: 0.15, ...options }
    );
    obs.observe(ref.current);
    return () => obs.disconnect();
  }, [ref]);

  return inView;
}

// ── SUB-COMPONENTS ────────────────────────────────────────────────────────────

function BeneficioCard({ ben, idx }) {
  const ref = useRef(null);
  const inView = useInView(ref);

  return (
    <div
      ref={ref}
      className={`beneficio-card${inView ? " visible" : ""}`}
      style={{ transitionDelay: `${(idx % 3) * 0.1}s` }}
    >
      <div className="beneficio-number">0{idx + 1}</div>
      <div className="beneficio-icon-wrap">
        <div className="beneficio-icon">{ben.icon}</div>
      </div>
      <h4 className="beneficio-title">{ben.title}</h4>
      <p className="beneficio-desc">{ben.desc}</p>
    </div>
  );
}

function PasoCard({ paso, delay, isLast }) {
  const ref = useRef(null);
  const inView = useInView(ref);

  return (
    <div className="paso-wrapper">
      <div
        ref={ref}
        className={`paso${inView ? " visible" : ""}`}
        style={{ transitionDelay: `${delay}s` }}
      >
        <div className="paso-number">{paso.number}</div>
        <h3 className="paso-title">{paso.title}</h3>
        <p className="paso-desc">{paso.desc}</p>
      </div>
      {!isLast && <div className="paso-connector">→</div>}
    </div>
  );
}

// ── MAIN COMPONENT ────────────────────────────────────────────────────────────

export default function Cursos() {
  const navigate = useNavigate();

  const handleCatalogo = () => navigate("/catalogo");

  return (
    <div className="cursos">
      <div className="grid-bg" />

      {/* NAV */}
      <MainNavbar />

      {/* HERO */}
      <section className="curso-hero">
        <div className="curso-hero-orb-blue" />
        <div className="curso-hero-orb-orange" />
        <div className="curso-hero-label">Formación Incluida</div>
        <h1 className="curso-hero-title hero-content-down">
          APRENDE
          <span>ACOMPAÑADO</span>
          DESDE EL PRIMER DÍA
        </h1>

        <div className="garantia-hero-line" />

        <p className="curso-hero-desc hero-content-down">
          Cuando comprás tu impresora en <strong>Ingenia Print</strong> accedés sin costo al Campus Ingenia: un espacio pensado para acompañarte en cada etapa del proceso. Desde la primera impresión hasta el desarrollo de proyectos más avanzados.
        </p>
      </section>

      {/* BENEFICIOS */}
      <section className="curso-section">
        <div className="curso-section-label">Beneficios</div>
        <h2 className="curso-section-title">QUÉ INCLUYE EL CAMPUS INGENIA</h2>
        <div className="beneficios-grid">
          {beneficiosData.map((ben, idx) => (
            <BeneficioCard key={idx} ben={ben} idx={idx} />
          ))}
        </div>
      </section>

      <div className="curso-divider" />

      {/* CÓMO FUNCIONA */}
      <section className="curso-section curso-como-funciona">
        <div className="curso-section-label">Proceso</div>
        <h2 className="curso-section-title">¿CÓMO EMPEZAR?</h2>
        <div className="pasos-container">
          {pasosData.map((p, i) => (
            <PasoCard key={i} paso={p} delay={i * 0.1} isLast={i === pasosData.length - 1} />
          ))}
        </div>
      </section>

      <div className="curso-divider" />

      {/* CTA FINAL */}
      <section className="curso-cta-final">
        <h2>¿Listo para empezar?</h2>
        <p>Explorá nuestro catálogo de impresoras y accedé al Campus Ingenia desde el primer día.</p>
        <button className="cta-button" onClick={handleCatalogo}>
          Ver catálogo completo
        </button>
      </section>
      <WhatsAppFloat />


      {/* FOOTER */}
      <Footer />
    </div>
  );
}