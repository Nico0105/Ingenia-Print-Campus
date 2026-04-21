import React from 'react';
import './Garantia.css';
import MainNavbar from '../Components/MainNavbar';
import Footer from '../Components/Footer';
import { WhatsAppFloat } from '../Components/WhatsAppFloat';
import { useNavigate } from "react-router-dom";

const ShieldIcon = () => (
  <svg width="44" height="44" viewBox="0 0 24 24" fill="none" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <defs>
      <linearGradient id="garantia-shield-grad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#1e40af" />
        <stop offset="100%" stopColor="#d97706" />
      </linearGradient>
    </defs>
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="url(#garantia-shield-grad)" />
  </svg>
);

const HeadsetIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 18v-6a9 9 0 0118 0v6" />
    <path d="M21 19a2 2 0 01-2 2h-1a2 2 0 01-2-2v-3a2 2 0 012-2h3zM3 19a2 2 0 002 2h1a2 2 0 002-2v-3a2 2 0 00-2-2H3z" />
  </svg>
);

const BoxIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#1e40af" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" />
    <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
    <line x1="12" y1="22.08" x2="12" y2="12" />
  </svg>
);

const WrenchIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z" />
  </svg>
);

const AlertIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="2" strokeLinecap="round">
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="8" x2="12" y2="12" />
    <line x1="12" y1="16" x2="12.01" y2="16" />
  </svg>
);

const CrossIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round">
    <circle cx="12" cy="12" r="10" />
    <line x1="15" y1="9" x2="9" y2="15" />
    <line x1="9" y1="9" x2="15" y2="15" />
  </svg>
);

const WhatsAppIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
);

const SERVICES = [
  {
    number: '01',
    icon: <HeadsetIcon />,
    title: 'Asesoramiento técnico especializado',
    desc: 'Para detectar y resolver cualquier problema, nuestro equipo de soporte te guía paso a paso con soluciones claras y efectivas.',
  },
  {
    number: '02',
    icon: <BoxIcon />,
    title: 'Reposición sin costo',
    desc: 'De la pieza defectuosa, la reponemos sin cargo si corresponde',
  },
  {
    number: '03',
    icon: <WrenchIcon />,
    title: 'Servicio técnico de reparación',
    desc: 'Reparamos la impresora para dejarla funcionando perfectamente cuando sea necesario.',
  },
];

const COVERAGE = [
  {
    months: '12',
    items: ['Motherboard', 'Display PCB', 'Fuente de alimentación', 'Estructura metálica', 'Calefactor de cama'],
  },
  {
    months: '6',
    items: ['Drivers extraíbles'],
  },
  {
    months: '3',
    items: [
      'Ventiladores y Motores',
      'Termistores, Calefactores y Cables',
      'Extrusor, Hotend (Nozzle, Bloque)',
      'Selector de Control y Correas',
      'Tubos de Teflón y Conectores',
      'Sensores y Rodamientos',
    ],
  },
];

export default function Garantia() {
  return (
    <div className="garantia-page">
        <header>
            <MainNavbar />
        </header>
      {/* ── HERO ── */}
      <section className="garantia-hero">
        <div className="garantia-hero-glow-blue" />
        <div className="garantia-hero-glow-orange" />

        <div className="garantia-hero-badge">
          <span className="garantia-hero-badge-dot" />
          Ingenia Print · Soporte Oficial
        </div>

        <div className="garantia-hero-shield">
          <div className="garantia-shield-ring">
            <ShieldIcon />
          </div>
        </div>

        <h1 className="garantia-hero-title">
          GARANTIA DE<br />
          <span>NUESTROS PRODUCTOS</span>
        </h1>

        <div className="garantia-hero-line" />

        <p className="garantia-hero-subtitle">
          En Ingenia Print <strong>respaldamos cada impresora 3D que vendemos.</strong> Si tu equipo
          presenta una falla de fábrica o un problema técnico, te damos una solución completa y sin
          complicaciones.
        </p>
      </section>

      {/* ── SERVICES ── */}
      <section className="garantia-section">
        <p className="garantia-section-label">Lo que incluye</p>
        <h2 className="garantia-section-title">Nuestra cobertura completa</h2>
        <div className="garantia-services-grid">
          {SERVICES.map((s) => (
            <div key={s.number} className="garantia-service-card">
              <div className="garantia-service-number">{s.number}</div>
              <div className="garantia-service-icon-wrap">{s.icon}</div>
              <h3>{s.title}</h3>
              <p>{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── COVERAGE PERIODS ── */}
      <div className="garantia-coverage-section">
        <div className="garantia-coverage-inner">
          <p className="garantia-section-label">Período de cobertura</p>
          <h2 className="garantia-section-title">Por componentes</h2>
          <div className="garantia-coverage-grid">
            {COVERAGE.map((c) => (
              <div key={c.months} className="garantia-coverage-card">
                <div className="garantia-coverage-months">{c.months}</div>
                <div className="garantia-coverage-label">meses de garantía</div>
                <div className="garantia-coverage-divider" />
                <div className="garantia-coverage-items">
                  {c.items.map((item) => (
                    <div key={item} className="garantia-coverage-item">
                      <div className="garantia-coverage-dot" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── EXCLUSIONS ── */}
      <section className="garantia-section">
        <p className="garantia-section-label">Limitaciones</p>
        <h2 className="garantia-section-title">Qué no está cubierto</h2>
        <div className="garantia-exclusions-grid">
          <div className="garantia-exclusion-card">
            <div className="garantia-exclusion-title">
              <AlertIcon />
              La garantía no cubre
            </div>
            <ul className="garantia-exclusion-list">
              <li>Daños derivados de un uso o cuidado inadecuado del equipo</li>
              <li>Visitas técnicas a domicilio</li>
              <li>Falta de mantenimiento o limpieza o uso en condiciones inadecuadas</li>
              <li>Destapado del hotend</li>
            </ul>
          </div>

          <div className="garantia-exclusion-card garantia-no-warranty">
            <div className="garantia-exclusion-title">
              <CrossIcon />
              Sin garantía
            </div>
            <ul className="garantia-exclusion-list garantia-red">
              <li>Cama de impresión</li>
              <li>Memorias SD / Adaptadores</li>
              <li>Kit de herramientas</li>
            </ul>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="garantia-cta-section">
        <div className="garantia-cta-inner">
         <h2 className="garantia-cta-title">
          <span style={{display: 'block', whiteSpace: 'nowrap'}}>Tu impresora</span>
          <span className="garantia-cta-gradient-text" style={{display: 'block', whiteSpace: 'nowrap'}}>debe funcionar siempre</span>
        </h2>
          <p className="garantia-cta-desc">
            Nuestro objetivo es simple: que tu impresora funcione como debe y que siempre tengas a
            alguien que te acompañe. No hay bots — hablás con personas reales.
          </p>
          <a
            href="https://wa.me/541149455926?text=Hola%20Ingenia%20Print!%20Tengo%20una%20consulta%20sobre%20la%20garantía."
            className="garantia-cta-btn"
            target="_blank"
            rel="noopener noreferrer"
          >
            <WhatsAppIcon />
            Hablar por WhatsApp
          </a>
          <p className="garantia-cta-note">Te acompañamos en lo que necesites · Soporte en tiempo real</p>
        </div>
      </section>
      <WhatsAppFloat />

      <Footer />
    </div>
  );
}