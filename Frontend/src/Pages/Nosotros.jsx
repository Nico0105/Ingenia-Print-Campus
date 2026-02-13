import { useState, useEffect, useRef } from "react";
import "./Nosotros.css";
import MainNavbar from "../Components/MainNavbar";
import { useNavigate } from "react-router-dom";

// ── DATA ──────────────────────────────────────────────────────────────────────

const timelineData = [
  {
    year: "2018",
    title: "Los inicios",
    desc: "Nace Ingenia Print con la primera impresora ensamblada en un taller en Buenos Aires.",
  },
  {
    year: "2020",
    title: "Expansión de catálogo",
    desc: "Incorporamos equipos industriales FDM y resina UV para profesionales y estudios.",
  },
  {
    year: "2022",
    title: "Distribución nacional",
    desc: "Alcanzamos las 23 provincias con red propia de técnicos certificados.",
  },
  {
    year: "2024",
    title: "Liderazgo regional",
    desc: "Referentes en impresión 3D para LATAM: más de 3.000 clientes activos.",
  },
];

const statsData = [
  {
    number: 3000,
    suffix: "+",
    label: "Clientes activos",
    desc: "Empresas, estudios y makers en toda la región",
  },
  {
    number: 6,
    suffix: "años",
    label: "En el mercado",
    desc: "Construyendo expertise en manufactura aditiva",
  },
  {
    number: 98,
    suffix: "%",
    label: "Satisfacción",
    desc: "Tasa de satisfacción post-venta 2024",
  },
  {
    number: 23,
    suffix: "",
    label: "Provincias",
    desc: "Cobertura y soporte técnico en todo el país",
  },
];

const valoresData = [
  {
    icon: "⬡",
    title: "Innovación continua",
    desc: "Actualizamos nuestro catálogo con la tecnología más avanzada del mercado global. No vendemos lo de ayer.",
  },
  {
    icon: "◈",
    title: "Precisión técnica",
    desc: "Cada máquina pasa por control de calidad antes de llegar al cliente. La tolerancia cero al error es nuestra norma.",
  },
  {
    icon: "⬟",
    title: "Soporte real",
    desc: "Técnicos humanos, no bots. Acompañamos desde la instalación hasta el primer prototipo terminado.",
  },
  {
    icon: "◇",
    title: "Comunidad maker",
    desc: "Fomentamos el ecosistema local: talleres, capacitaciones y foros para creadores y empresas.",
  },
  {
    icon: "⬠",
    title: "Accesibilidad",
    desc: "Creemos que la fabricación digital debe estar al alcance de todos, sin importar el tamaño del proyecto.",
  },
  {
    icon: "◉",
    title: "Sustentabilidad",
    desc: "Filamentos reciclados, embalaje responsable y plan de retiro de equipos obsoletos.",
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

function ValorCard({ v, idx }) {
  const ref = useRef(null);
  const inView = useInView(ref);

  return (
    <div
      ref={ref}
      className={`nos-valor-card${inView ? " visible" : ""}`}
      style={{ transitionDelay: `${(idx % 3) * 0.12}s` }}
    >
      <span className="nos-valor-num">0{idx + 1}</span>
      <span className="nos-valor-icon">{v.icon}</span>
      <div className="nos-valor-title">{v.title}</div>
      <div className="nos-valor-desc">{v.desc}</div>
      <div className="nos-valor-accent" />
    </div>
  );
}

// ── MAIN COMPONENT ────────────────────────────────────────────────────────────

export default function Nosotros() {
    const navigate = useNavigate();

    const Handlehome = () =>{
        navigate('/Home')
    }


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
          HACEMOS
          <span>REALIDAD</span>
          LO QUE DISEÑÁS
        </h1>
        <p className="nos-hero-desc">
          Desde 2018 llevamos la impresión 3D de vanguardia a manos de ingenieros,
          diseñadores, makers y empresas de toda Argentina. Más que vender equipos:
          construimos el futuro de la manufactura aditiva.
        </p>
        <button className="nos-hero-cta">Conocé nuestro catálogo →</button>
        <div className="nos-scroll-line">
          <div className="nos-scroll-bar" />
          Scroll para explorar
        </div>
      </section>

      {/* HISTORIA */}
      <section className="nos-section nos-historia" id="historia">
        <div className="nos-section-label">Historia</div>
        <h2 className="nos-section-title">DE TALLER A REFERENTE</h2>
        <div className="nos-historia-inner">
          <div className="nos-historia-text">
            <p>
              Todo comenzó con una impresora ensamblada en un garaje y una pregunta simple:
              <strong> ¿por qué en Argentina es tan difícil acceder a tecnología de fabricación digital de calidad?</strong>
            </p>
            <p>
              Fundada en Buenos Aires en 2018, Ingenia Print nació para cerrar esa brecha.
              Empezamos importando, probando y aprendiendo cada equipo que vendemos,
              hasta conocerlo de adentro hacia afuera.
            </p>
            <p>
              Hoy somos el punto de referencia para quienes necesitan{" "}
              <strong>precisión, soporte real y tecnología que no quede obsoleta al mes siguiente</strong>.
              No vendemos cajas: vendemos herramientas para crear.
            </p>
          </div>

          <div>
            <div className="nos-timeline">
              {timelineData.map((item, i) => (
                <TimelineItem key={i} item={item} delay={i * 0.15} />
              ))}
            </div>
          </div>
        </div>
      </section>

      <div className="nos-divider" />

      {/* MISIÓN */}
      <div className="nos-mision-banner">
        <div className="nos-mision-tag">// Nuestra misión</div>
        <div className="nos-mision-text">
          Democratizar la fabricación aditiva para que{" "}
          <span>cualquier idea, sin importar su escala</span>, pueda volverse un objeto real.
        </div>
      </div>

      <div className="nos-divider" />

      {/* STATS */}
      <section className="nos-section" id="stats">
        <div className="nos-section-label">En números</div>
        <h2 className="nos-section-title">RESULTADOS QUE HABLAN</h2>
        <div className="nos-stats-grid">
          {statsData.map((s, i) => (
            <StatCard key={i} stat={s} delay={i * 0.1} />
          ))}
        </div>
      </section>

      <div className="nos-divider" />

      {/* VALORES */}
      <section className="nos-section nos-historia" id="valores">
        <div className="nos-section-label">Valores</div>
        <h2 className="nos-section-title">LOS PILARES DE INGENIA</h2>
        <div className="nos-valores-grid">
          {valoresData.map((v, i) => (
            <ValorCard key={i} v={v} idx={i} />
          ))}
        </div>
      </section>

      {/* FOOTER */}
      <footer className="nos-footer">
        <div className="nos-footer-logo">INGENIA PRINT</div>
        <div className="nos-footer-copy">© 2024 INGENIA PRINT — TODOS LOS DERECHOS RESERVADOS</div>
      </footer>
    </div>
  );
}