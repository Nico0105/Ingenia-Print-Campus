import { useState, useEffect, useRef } from "react";
import "./Nosotros.css";
import MainNavbar from "../Components/MainNavbar";
import Footer from "../Components/Footer";
import { useNavigate } from "react-router-dom";

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

function Counter({ target, suffix }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const inView = useInView(ref);

  useEffect(() => {
    if (!inView) return;
    const duration = 1600;
    const step = 16;
    const total = Math.ceil(duration / step);
    let current = 0;
    const timer = setInterval(() => {
      current++;
      setCount(Math.round((target * current) / total));
      if (current >= total) {
        setCount(target);
        clearInterval(timer);
      }
    }, step);
    return () => clearInterval(timer);
  }, [inView, target]);

  return (
    <span ref={ref} className="nos-stat-number">
      {count}
      <span className="nos-stat-suffix">{suffix}</span>
    </span>
  );
}

function TimelineItem({ item, delay }) {
  const ref = useRef(null);
  const inView = useInView(ref);

  return (
    <div
      ref={ref}
      className={`nos-timeline-item${inView ? " visible" : ""}`}
      style={{ transitionDelay: `${delay}s` }}
    >
      <div className="nos-timeline-year">{item.year}</div>
      <div className="nos-timeline-title">{item.title}</div>
      <div className="nos-timeline-desc">{item.desc}</div>
    </div>
  );
}

function StatCard({ stat, delay }) {
  const ref = useRef(null);
  const inView = useInView(ref);

  return (
    <div
      ref={ref}
      className={`nos-stat-card${inView ? " visible" : ""}`}
      style={{ transitionDelay: `${delay}s` }}
    >
      <Counter target={stat.number} suffix={stat.suffix} />
      <div className="nos-stat-label">{stat.label}</div>
      <div className="nos-stat-desc">{stat.desc}</div>
    </div>
  );
}

// TESTIMONIOS
function TestimoniosCarousel({ items }) {
  const [current, setCurrent] = useState(0);
  const [animating, setAnimating] = useState(false);
  const total = items.length;

  const go = (dir) => {
    if (animating) return;
    setAnimating(true);
    setCurrent((prev) => (prev + dir + total) % total);
    setTimeout(() => setAnimating(false), 400);
  };

  const t = items[current];

  return (
    <div className="testimonios-carousel">
      <div className="testimonio-featured">
        <div className="testimonio-quote-mark">"</div>
        <p className="testimonio-featured-text">{t.text}</p>
        <div className="testimonio-featured-author">
          <div className="testimonio-avatar">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          </div>
          <div>
            <div className="testimonio-name">{t.name}</div>
            <div className="testimonio-role">{t.role}</div>
          </div>
        </div>
      </div>

      <div className="testimonios-nav">
        <button className="curso-carousel-btn" onClick={() => go(-1)} aria-label="Anterior">‹</button>
        <div className="curso-carousel-dots">
          {items.map((_, i) => (
            <button
              key={i}
              className={`curso-carousel-dot${i === current ? " active" : ""}`}
              onClick={() => setCurrent(i)}
            />
          ))}
        </div>
        <button className="curso-carousel-btn" onClick={() => go(1)} aria-label="Siguiente">›</button>
      </div>

      <div className="testimonios-thumbs">
        {items.map((item, i) => (
          <button
            key={i}
            className={`testimonio-thumb${i === current ? " active" : ""}`}
            onClick={() => setCurrent(i)}
          >
            <div className="testimonio-thumb-avatar">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </div>
            <div>
              <div className="testimonio-thumb-name">{item.name}</div>
              <div className="testimonio-thumb-role">{item.role}</div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

const testimoniosData = [
  {
    name: "Ivan Paez",
    role: "Emprendedor",
    text: "Muy recomendable Ingenia Print, mi experiencia para comprar una máquina desde Tucumán, la verdad muy confiables, Muchas Gracias.",
  },
  {
    name: "Rodrigo Santoja",
    role: "Emprendedor",
    text: "Le compre mas de 7 maquinas y jamas tuve un problema, contesta al momento y cualquier detalle que necesites lo soluciona al instante, super recomendables. 10 puntos en todo el servicio gracias!.",
  },
  {
    name: "Daniela  Di Lullo",
    role: "Maker",
    text: "Les compre mas de 10 impresoras y siempre todo perfecto. Son muy confiables y el envio super rapido. Cuando tuve problemas siempre me respondieron al instante. Los recomiendo.",
  },
  {
    name: "Agostina Zunino",
    role: "Maker",
    text: "Es la segunda maquina que compramos, muy recomendable. Responden por la garantia y todo 10 puntos.",
  },
  {
    name: "Tomas Esteverena",
    role: "Emprendedor",
    text: "10 puntos la atención, el asesoramiento y la buena onda de Fabri, ademas de muy buenos precios. Le compre mi primera maquina hace un par de años y hace un mes le compre 2 mas para el laburo. Se los recomiendo a todo el que quiera su primera impresora o comprar varias para equipar su granja o empresa.",
  }
];
// ── VALORES GRID ──────────────────────────────────────────────────────────────

function ValorCard({ num, verb, complement, icon, delay, wide }) {
  const ref = useRef(null);
  const inView = useInView(ref);

  return (
    <div
      ref={ref}
      className={`nos-valor2-card${wide ? " nos-valor2-card--wide" : ""}${inView ? " visible" : ""}`}
      style={{ transitionDelay: `${delay}s` }}
    >
      <div className="nos-valor2-bar" />
      <div className="nos-valor2-num">{num}</div>
      <div className="nos-valor2-icon-wrap">
        <div className="nos-valor2-icon-ring" />
        {icon}
      </div>
      <div className="nos-valor2-verb">{verb}</div>
      <div className="nos-valor2-complement">{complement}</div>
    </div>
  );
}

function ValoresGrid() {
  return (
    <div className="nos-valor2-grid">
      <ValorCard
        num="01"
        verb="Asesoramos"
        complement="antes de la compra"
        delay={0}
        icon={
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 20h9" />
            <path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z" />
          </svg>
        }
      />
      <ValorCard
        num="02"
        verb="Acompañamos"
        complement="durante la instalación"
        delay={0.08}
        icon={
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 00-3-3.87" />
            <path d="M16 3.13a4 4 0 010 7.75" />
          </svg>
        }
      />
      <ValorCard
        num="03"
        verb="Respondemos"
        complement="dudas reales"
        delay={0.16}
        icon={
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3" />
            <line x1="12" y1="17" x2="12.01" y2="17" strokeWidth="2.5" />
          </svg>
        }
      />
      <ValorCard
        num="04"
        verb="Ayudamos"
        complement="a entender cómo usar cada equipo según el objetivo de cada persona"
        delay={0.24}
        icon={
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
        }
      />
      <ValorCard
        num="05"
        verb="Y seguimos presentes"
        complement="después"
        delay={0.32}
        wide
        icon={
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
          </svg>
        }
      />
    </div>
  );
}

// ── MAIN COMPONENT ────────────────────────────────────────────────────────────

export default function Nosotros() {
  const navigate = useNavigate();

  const handleCatalogo = () => {
    navigate("/catalogo");
  };

  return (
    <div className="nosotros">
      <div className="grid-bg" />

      {/* NAV */}
      <MainNavbar />

      {/* HERO */}
      <section className="nos-hero">
        <div className="nos-hero-orb-blue" />
        <div className="nos-hero-orb-orange" />
        <div className="nos-hero-label">Quiénes somos</div>
        <h1 className="nos-hero-title">
          SOBRE
          <span>INGENIA PRINT</span>
        </h1>
        <button className="nos-hero-cta" onClick={handleCatalogo}>
          Conocé nuestro catálogo →
        </button>
        <div className="nos-scroll-line">
          <div className="nos-scroll-bar" />
          Scroll para explorar
        </div>
      </section>

      {/* HISTORIA */}
      <section className="nos-section nos-historia" id="historia">
        <div className="nos-section-label">Historia</div>
        <div className="nos-historia-inner">
          <div className="nos-historia-text">
            <p>
              <strong>Ingenia Print</strong> nació con una idea clara: que la
              impresion 3D y las tecnologías de fabricacion personal sean
              accesibles, comprensibles y útiles para más personas. Nuestro
              acercamiento a este mundo empezó como un hobby, con impresoras
              propias y muchas horas de aprendizaje desde casa. Con el tiempo,
              esa curiosidad se transformó en una pasión por la tecnología y por
              compartir conocimiento. Así nació Ingenia Print, a comienzos de
              2023.
            </p>
            <p>
              Hoy acompañamos a personas que quieren empezar desde cero, a
              familia interesadas en herramientas educativas, a perfiles
              creativos y a quienes buscan desarrollar proyectos o
              emprendimientos con estas tecnologás.
            </p>
            <p>
              Trabajamos con{" "}
              <strong>
                impresoras 3D, filamentos, accesorios, grabadoras láser y
                herramientas relacionadas con este universo
              </strong>
              , siempre priorizando algo fundamental: el acompañamiento real.
            </p>
            <p>
              Sabemos que muchas personas llegan a la impresión 3D con
              información desordenada o sin saber por dónde empezar. Nuestro
              objetivo es justamente ese: ordenar, explicar y acompañar cada
              paso del proceso para que la tecnología deje de parecer lejana o
              compleja y se convierta en una herramienta posible.
            </p>
            <p>
              Creemos que este tipo de tecnologías abren muchas puertas. Y que
              entenderlas bien puede marcar la diferencia entre frustrarse… o
              descubrir todo lo que pueden hacer por vos.
            </p>
          </div>
        </div>
      </section>

      <div className="nos-divider" />

      {/* VALORES */}
      <section className="nos-section nos-historia" id="valores">
        <div className="nos-section-label">Valores</div>
        <h2 className="nos-section-title">NUESTRA FORMA DE TRABAJAR</h2>
        <p className="nos-valores-sub">
          En Ingenia Print creemos que la tecnología tiene que ser clara, accesible y acompañada. Por eso:
        </p>
        <ValoresGrid />
      </section>

      <div className="nos-divider" />

      {/* TESTIMONIOS */}
      <section className="nos-section">
        <div className="nos-section-label">Comunidad</div>
        <h2 className="nos-section-title">QUÉ DICEN NUESTROS CLIENTES</h2>
        <TestimoniosCarousel items={testimoniosData} />
      </section>

      <div className="nos-divider" />

      {/* FOOTER */}
      <Footer />
    </div>
  );
}