import { useState, useEffect, useRef } from "react";
import "./Nosotros.css";
import MainNavbar from "../Components/MainNavbar";
import Footer from "../Components/Footer";
import { useNavigate } from "react-router-dom";

// ── DATA ──────────────────────────────────────────────────────────────────────

const timelineData = [
  {
    year: "2023",
    title: "Los inicios",
    desc: "Nace Ingenia Print con la primera impresora comprada para fabricar.",
  },
  {
    year: "2024",
    title: "Expansión de catálogo",
    desc: "Incorporamos equipos industriales FDM y resina UV para profesionales y estudios.",
  },
  {
    year: "2025",
    title: "Distribución nacional",
    desc: "Alcanzamos las 23 provincias con envíos y a todo el país.",
  },
  {
    year: "2026",
    title: "Liderazgo regional",
    desc: "Referentes en impresión 3D para Argentina más de 3.000 clientes activos.",
  },
];

const valoresData = [
  {
    icon: "⬡",
    title: "Asesoramiento antes de la compra",
    desc: "No vendemos máquinas, vendemos soluciones. Te ayudamos a elegir el equipo que realmente necesitas, no el más caro.",
  },
  {
    icon: "◈",
    title: "Acompañamiento durante la instalación",
    desc: "Cada cliente recibe soporte personalizado durante la instalación y puesta en marcha, para asegurar que todo funcione desde el primer día.",
  },
  {
    icon: "⬟",
    title: "Respondemos dudas reales",
    desc: "Soporte técnico en tiempo real, sin bots ni respuestas automáticas. Hablás con personas reales que entienden tu problema.",
  },
  {
    icon: "◇",
    title: "Ayudamos a entender",
    desc: "Como usar cada equipo según el objetivo de cada cliente, no solo cómo funciona. Queremos que saques el máximo provecho a tu inversión.",
  },
  {
    icon: "⬠",
    title: "Accesibilidad",
    desc: "Creemos que la fabricación digital debe estar al alcance de todos, sin importar el tamaño del proyecto.",
  },
  {
    icon: "◉",
    title: "Durabilidad y calidad",
    desc: "Promovemos prácticas responsables y materiales de calidad para que tus creaciones duren y sean seguras",
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

function useVisible() {
  const [visible, setVisible] = useState(3);
  useEffect(() => {
    const update = () =>
      setVisible(
        window.innerWidth < 640 ? 1 : window.innerWidth < 1024 ? 2 : 3
      );
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);
  return visible;
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

function ValorCard({ v, idx, visible = 3 }) {
  const ref = useRef(null);
  const inView = useInView(ref);

  return (
    <div
      ref={ref}
      className={`nos-valor-card${inView ? " visible" : ""}`}
      style={{
        transitionDelay: `${(idx % visible) * 0.12}s`,
        flex: `0 0 calc(100% / ${visible})`,
        boxSizing: "border-box",
      }}
    >
      <span className="nos-valor-num">0{idx + 1}</span>
      <span className="nos-valor-icon">{v.icon}</span>
      <div className="nos-valor-title">{v.title}</div>
      <div className="nos-valor-desc">{v.desc}</div>
      <div className="nos-valor-accent" />
    </div>
  );
}

function ValoresCarousel({ valores }) {
  const [current, setCurrent] = useState(0);
  const [animating, setAnimating] = useState(false);
  const visible = useVisible();
  const total = valores.length;
  const maxIndex = total - visible;

  const go = (dir) => {
    if (animating) return;
    setAnimating(true);
    setCurrent((prev) => {
      const next = prev + dir;
      if (next < 0) return maxIndex;
      if (next > maxIndex) return 0;
      return next;
    });
    setTimeout(() => setAnimating(false), 400);
  };

  // Si al cambiar visible el current queda fuera de rango, lo corregimos
  useEffect(() => {
    setCurrent((prev) => Math.min(prev, maxIndex));
  }, [visible, maxIndex]);

  return (
    <div className="nos-carousel-wrapper">
      <button
        className="nos-carousel-btn nos-carousel-prev"
        onClick={() => go(-1)}
        aria-label="Anterior"
      >
        ‹
      </button>

      <div className="nos-carousel-track-outer">
        <div
          className="nos-carousel-track"
          style={{
            transform: `translateX(calc(-${current} * (100% / ${visible})))`,
          }}
        >
          {valores.map((v, i) => (
            <ValorCard key={i} v={v} idx={i} visible={visible} />
          ))}
        </div>
      </div>

      <button
        className="nos-carousel-btn nos-carousel-next"
        onClick={() => go(1)}
        aria-label="Siguiente"
      >
        ›
      </button>

      <div className="nos-carousel-dots">
        {Array.from({ length: maxIndex + 1 }).map((_, i) => (
          <button
            key={i}
            className={`nos-carousel-dot${i === current ? " active" : ""}`}
            onClick={() => setCurrent(i)}
          />
        ))}
      </div>
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
          HACEMOS
          <span>REALIDAD</span>
          LO QUE DISEÑÁS
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
        <h2 className="nos-section-title">DE TALLER A REFERENTE</h2>
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

      {/* VALORES */}
      <section className="nos-section nos-historia" id="valores">
        <div className="nos-section-label">Valores</div>
        <h2 className="nos-section-title">NUESTRA FORMA DE TRABAJAR</h2>
        <ValoresCarousel valores={valoresData} />
      </section>

      {/* FOOTER */}
      <Footer />
    </div>
  );
}