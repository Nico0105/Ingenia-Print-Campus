import { useState, useEffect, useRef } from "react";
import "./Curso.css";
import MainNavbar from "../Components/MainNavbar";
import Footer from "../Components/Footer";
import { useNavigate } from "react-router-dom";

// ── DATA ──────────────────────────────────────────────────────────────────────

const cursosData = [
  {
    title: "Fundamentos de Impresión 3D",
    duration: "4 semanas",
    level: "Principiante",
    topics: [
      "Conceptos básicos de manufactura aditiva",
      "Tipos de tecnologías (FDM, Resina, SLS)",
      "Componentes y funcionamiento de una impresora",
      "Mantenimiento básico y calibración",
    ],
  },
  {
    title: "Modelado CAD para Impresión",
    duration: "6 semanas",
    level: "Intermedio",
    topics: [
      "Introducción a software CAD (Fusion 360, Tinkercad)",
      "Diseño de piezas funcionales",
      "Optimización para impresión 3D",
      "Exportación y preparación de archivos STL",
    ],
  },
  {
    title: "Slicing & Calibración Avanzada",
    duration: "3 semanas",
    level: "Intermedio",
    topics: [
      "Software de slicing (Cura, PrusaSlicer, Chitubox)",
      "Parámetros de impresión y ajustes finos",
      "Troubleshooting de problemas comunes",
      "Optimización de tiempo y material",
    ],
  },
  {
    title: "Posprocesamiento & Acabado",
    duration: "2 semanas",
    level: "Intermedio",
    topics: [
      "Limpieza y remoción de soportes",
      "Tratamientos químicos y mecánicos",
      "Pintura y acabados profesionales",
      "Técnicas de lijado y pulido",
    ],
  },
];

const beneficiosData = [
  {
    icon: "✓",
    title: "Guía Inicial",
    desc: "Primeros Pasos con tu impresora 3D Un recorrido claro y ordenado para entender como funciona tu equipo, como configurarlo correctamente y como empezar a imprimir con confianza desde cero. Especialmente pensando para quienes estan dando sus primeros pasos",
  },
  {
    icon: "✓",
    title: "Documentacion tecnica clara",
    desc: "Material organizado para entender mejor la impresion 3D en la practica: Configuracion, Materiales, errores comunes, flujo de trabajo, buenas practicas",
  },
  {
    icon: "✓",
    title: "Comunidad Ingenia",
    desc: "Un espacio para compartir proyectos, hacer consultas y aprender junto a otras personas que tambien estan empezando o desarrollar sus ideas",
  },
  {
    icon: "✓",
    title: "Asistente IA especializado en impresion 3D",
    desc: "Un chat inteligente entrenando para ayudarte con dudas tecnicas, configuraciones y problemas habituales durante el uso de tu impresora. Disponible cuando lo necesites",
  },
  {
    icon: "✓",
    title: "Calculadora de costos de impresion",
    desc: "Una herramienta pensada para estimar correctamente el costo real de cada pieza. Ideal si queres emprender o profesionalizar tu producción.",
  },
  {
    icon: "✓",
    title: "Herrameientas de gestión",
    desc: "Un entorno para organizar desde un mismo lugar: Impresoras, Filamentos, Stock, Clientes, Presupuestos",
  },
];

const testimoniosData = [
  {
    name: "Juan Martinez",
    role: "Emprendedor",
    text: "Los cursos fueron absolutamente clave para empezar mi negocio de figuras personalizadas. Aprendí desde cómo calibrar la impresora hasta técnicas de acabado profesional. El soporte técnico es excepcional y siempre responden rápido cuando tengo dudas. No sé qué hubiera hecho sin esta formación.",
  },
  {
    name: "María González",
    role: "Diseñadora Industrial",
    text: "Aprendí desde cero, sin experiencia previa en impresión 3D. Los instructores explican paso a paso, con ejemplos prácticos y proyectos reales. Siempre están disponibles para responder preguntas y ayudarte a resolver problemas. La comunidad es muy amable y colaborativa, el nivel de detalle en los cursos es increíble.",
  },
  {
    name: "Carlos López",
    role: "Maker",
    text: "Gracias a los cursos optimicé completamente mis impresiones en tiempo y calidad. Reduje el desperdicio de material en más del 40% aplicando lo que aprendí en slicing y parametrización. La inversión en la impresora y los cursos valió 100% la pena, ya estoy pensando en expandir mi negocio.",
  },
];

// ── HOOKS & SUB-COMPONENTS ────────────────────────────────────────────────────

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

function CursoCard({ curso, delay }) {
  const ref = useRef(null);
  const inView = useInView(ref);

  return (
    <div
      ref={ref}
      className={`curso-card${inView ? " visible" : ""}`}
      style={{ transitionDelay: `${delay}s` }}
    >
      <div className="curso-header">
        <h3 className="curso-title">{curso.title}</h3>
        <div className="curso-meta">
          <span className="curso-duration">⏱ {curso.duration}</span>
          <span className={`curso-level ${curso.level.toLowerCase()}`}>{curso.level}</span>
        </div>
      </div>
      <ul className="curso-topics">
        {curso.topics.map((topic, idx) => (
          <li key={idx}>{topic}</li>
        ))}
      </ul>
    </div>
  );
}

function BeneficioCard({ ben, delay }) {
  const ref = useRef(null);
  const inView = useInView(ref);

  return (
    <div
      ref={ref}
      className={`beneficio-card${inView ? " visible" : ""}`}
      style={{ transitionDelay: `${delay}s` }}
    >
      <div className="beneficio-icon">{ben.icon}</div>
      <h4 className="beneficio-title">{ben.title}</h4>
      <p className="beneficio-desc">{ben.desc}</p>
    </div>
  );
}

function TestimonioCard({ t, delay }) {
  const ref = useRef(null);
  const inView = useInView(ref);

  return (
    <div
      ref={ref}
      className={`testimonio-card${inView ? " visible" : ""}`}
      style={{ transitionDelay: `${delay}s` }}
    >
      <p className="testimonio-text">"{t.text}"</p>
      <div className="testimonio-author">
        <div className="testimonio-avatar" />
        <div>
          <div className="testimonio-name">{t.name}</div>
          <div className="testimonio-role">{t.role}</div>
        </div>
      </div>
    </div>
  );
}

function PasoCard({ paso, delay }) {
  const ref = useRef(null);
  const inView = useInView(ref);

  return (
    <div
      ref={ref}
      className={`paso${inView ? " visible" : ""}`}
      style={{ transitionDelay: `${delay}s` }}
    >
      <div className="paso-number">{paso.number}</div>
      <h3 className="paso-title">{paso.title}</h3>
      <p className="paso-desc">{paso.desc}</p>
    </div>
  );
}

// ── MAIN COMPONENT ────────────────────────────────────────────────────────────

export default function Cursos() {
  const navigate = useNavigate();

  const handleCatalogo = () => {
    navigate("/catalogo");
  };

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
        <h1 className="curso-hero-title">
          APRENDE
          <span>CON EXPERTOS</span>
          DESDE EL PRIMER DÍA
        </h1>
        <p className="curso-hero-desc">
          Todos nuestros clientes reciben acceso a cursos profesionales incluidos sin costo adicional.
          Desde fundamentos hasta técnicas avanzadas, te acompañamos en tu camino en manufactura aditiva.
        </p>
        <button className="curso-hero-cta" onClick={handleCatalogo}>
          Ver impresoras disponibles →
        </button>
        <div className="curso-scroll-line">
          <div className="curso-scroll-bar" />
          Scroll para explorar
        </div>
      </section>

      {/* INCLUDED BANNER */}
      <section className="curso-included-banner">
        <div className="included-content">
          <h2>¿Qué recibes al comprar?</h2>
          <p>
            Cada impresora 3D que adquieras en Ingenia Print incluye acceso completo a nuestro programa de formación,
            diseñado por técnicos y makers con años de experiencia en el ecosistema de manufactura aditiva.
          </p>
          <div className="included-highlights">
            <div className="highlight">
              <strong>4 Cursos</strong>
              <span>Desde principiante hasta avanzado</span>
            </div>
            <div className="highlight">
              <strong>+15 horas</strong>
              <span>De contenido en video</span>
            </div>
            <div className="highlight">
              <strong>Soporte lifetime</strong>
              <span>Para tus preguntas técnicas</span>
            </div>
            <div className="highlight">
              <strong>Comunidad global</strong>
              <span>De makers y profesionales</span>
            </div>
          </div>
        </div>
      </section>

      {/* CURSOS */}
      <section className="curso-section" id="cursos">
        <div className="curso-section-label">Nuestros Cursos</div>
        <h2 className="curso-section-title">PROGRAMA COMPLETO DE FORMACIÓN</h2>
        <div className="cursos-grid">
          {cursosData.map((curso, i) => (
            <CursoCard key={i} curso={curso} delay={i * 0.12} />
          ))}
        </div>
      </section>

      <div className="curso-divider" />

      {/* BENEFICIOS */}
      <section className="curso-section">
        <div className="curso-section-label">Beneficios</div>
        <h2 className="curso-section-title">LO QUE INCLUYE TU ACCESO</h2>
        <div className="beneficios-grid">
          {beneficiosData.map((ben, i) => (
            <BeneficioCard key={i} ben={ben} delay={i * 0.08} />
          ))}
        </div>
      </section>

      <div className="curso-divider" />

      {/* CÓMO FUNCIONA */}
      <section className="curso-section curso-como-funciona">
        <div className="curso-section-label">Proceso</div>
        <h2 className="curso-section-title">¿CÓMO EMPEZAR?</h2>
        <div className="pasos-container">
          {[
            { number: "01", title: "Compra tu impresora", desc: "Elige el modelo que mejor se ajuste a tus necesidades en nuestro catálogo." },
            { number: "02", title: "Recibe credenciales", desc: "Con tu compra activamos tu acceso al Campus Ingenia." },
            { number: "03", title: "Comienza a aprender", desc: "Accede a la guia inicial, herramientas, comunidad y soporte para dar tus primeros pasos con confianza" },
          ].map((p, i) => (
            <PasoCard key={i} paso={p} delay={i * 0.08} />
          ))}
        </div>
      </section>

      <div className="curso-divider" />

      {/* TESTIMONIOS */}
      <section className="curso-section">
        <div className="curso-section-label">Comunidad</div>
        <h2 className="curso-section-title">QUÉ DICEN NUESTROS CLIENTES</h2>
        <div className="testimonios-grid">
          {testimoniosData.map((t, i) => (
            <TestimonioCard key={i} t={t} delay={i * 0.1} />
          ))}
        </div>
      </section>

      <div className="curso-divider" />

      {/* CTA FINAL */}
      <section className="curso-cta-final">
        <h2>¿Listo para empezar?</h2>
        <p>Explora nuestro catálogo de impresoras y accede a los cursos desde el primer día.</p>
        <button className="cta-button" onClick={handleCatalogo}>
          Ver catálogo completo
        </button>
      </section>

      {/* FOOTER */}
      <Footer />
    </div>
  );
}