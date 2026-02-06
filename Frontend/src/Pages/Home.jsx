import React, { useState, useEffect } from 'react';
import './Home.css';
import { Navigate } from 'react-router-dom';

export default function Home() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [scrollY, setScrollY] = useState(0);

  const HandleLogin = () => {
    Navigate('/Login');
  };

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth) * 2 - 1,
        y: (e.clientY / window.innerHeight) * 2 - 1,
      });
    };

    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const floatingCubes = [
    { delay: 0, duration: 20 },
    { delay: 2, duration: 25 },
    { delay: 4, duration: 18 },
    { delay: 6, duration: 22 },
    { delay: 8, duration: 19 },
  ];

  return (
    <div className="home3d-container">
      {/* Animated Background */}
      <div className="background-3d">
        <div className="gradient-orb orb-1"></div>
        <div className="gradient-orb orb-2"></div>
        <div className="gradient-orb orb-3"></div>
        <div className="grid-3d"></div>
      </div>

      {/* Floating 3D Cubes */}
      <div className="floating-cubes">
        {floatingCubes.map((cube, index) => (
          <div
            key={index}
            className="cube-wrapper"
            style={{
              animationDelay: `${cube.delay}s`,
              animationDuration: `${cube.duration}s`,
            }}
          >
            <div className="cube">
              <div className="cube-face front"></div>
              <div className="cube-face back"></div>
              <div className="cube-face right"></div>
              <div className="cube-face left"></div>
              <div className="cube-face top"></div>
              <div className="cube-face bottom"></div>
            </div>
          </div>
        ))}
      </div>

      {/* Header */}
      <header className="header-3d">
        <div className="logo-3d">
          <div className="logo-cube">
            <span>G3D</span>
          </div>
        </div>
        <nav className="nav-3d">
          <a href="#marketplace" className="nav-link">Catalogo</a>
          <a href="#creators" className="nav-link">Creadores</a>
          <a href="#stats" className="nav-link">Live Stats</a>
          <a href="#ecosystem" className="nav-link">Nosotros</a>
        </nav>
        <button className="connect-btn" onClick={HandleLogin}>
          <span className="btn-text">Iniciar Sesion</span>
          
          <span className="btn-glow"></span>
        </button>
      </header>

      {/* Hero Section */}
      <section className="hero-3d">
        <div className="hero-content">
          <div className="badge-3d">
            <span className="pulse-dot"></span>
            <span>INGENIA PRINT ES AHORA</span>
          </div>
          
          <h1 
            className="hero-title"
            style={{
              transform: `perspective(1000px) rotateY(${mousePosition.x * 5}deg) rotateX(${-mousePosition.y * 5}deg)`,
            }}
          >
            Shape the
            <span className="gradient-text"> Future </span>
            in 3D
          </h1>

          <p className="hero-subtitle">
            A global decentralized marketplace for ultra-high fidelity 3D assets.
            <br />
            Experience commerce in a new dimension with interactive glassmorphism.
          </p>

          <div className="cta-buttons">
            <button className="primary-btn">
              <span>Explore World</span>
              <div className="btn-3d-effect"></div>
            </button>
            <button className="secondary-btn">
              <span>Mint Asset</span>
              <div className="btn-3d-effect"></div>
            </button>
          </div>
        </div>

        {/* 3D Interactive Card */}
        <div 
          className="hero-card-3d"
          style={{
            transform: `perspective(2000px) rotateY(${mousePosition.x * 15}deg) rotateX(${-mousePosition.y * 15}deg) translateZ(${scrollY * 0.5}px)`,
          }}
        >
          <div className="card-glow"></div>
          <div className="card-content">
            <div className="card-top">
              <span className="card-label">Current Bid</span>
              <span className="live-indicator">
                <span className="live-dot"></span>
                LIVE
              </span>
            </div>
            <div className="card-price">12.45 ETH</div>
            <div className="card-usd">$24,190.00 USD</div>
          </div>
          
          {/* Rotating Ring */}
          <div className="rotating-ring"></div>
        </div>
      </section>

      {/* Trending Section */}
      <section className="trending-section">
        <div className="section-header">
          <div>
            <h2 className="section-title">Trending Dimensions</h2>
            <p className="section-subtitle">Top performing 3D environments this week</p>
          </div>
          <div className="carousel-controls">
            <button className="control-btn">←</button>
            <button className="control-btn">→</button>
          </div>
        </div>

        <div className="cards-carousel">
          {[1, 2, 3, 4].map((item) => (
            <div key={item} className="asset-card">
              <div className="card-image">
                <div className="card-overlay"></div>
                <span className="badge-premium">PREMIUM</span>
                <div className="card-3d-layer"></div>
              </div>
              <div className="card-info">
                <h3 className="asset-name">Cyber Core Alpha #{item}</h3>
                <div className="card-footer">
                  <span className="asset-price">{item}.{item} ETH</span>
                  <div className="avatars-stack">
                    <div className="avatar avatar-1"></div>
                    <div className="avatar avatar-2"></div>
                    <div className="avatar avatar-3"></div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Features Grid */}
      <section className="features-section">
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon icon-1">
              <div className="icon-3d">🎯</div>
            </div>
            <h3 className="feature-title">True 3D Preview</h3>
            <p className="feature-description">
              Inspect every polygon before you buy. Our WebGL 2.0 engine allows 
              real-time interactive viewing in your browser.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon icon-2">
              <div className="icon-3d">🔒</div>
            </div>
            <h3 className="feature-title">Proven Scarcity</h3>
            <p className="feature-description">
              Each asset is minted as a unique NFT on the Ethereum blockchain, 
              ensuring provenance and digital ownership.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon icon-3">
              <div className="icon-3d">⚡</div>
            </div>
            <h3 className="feature-title">Fast Deployment</h3>
            <p className="feature-description">
              One-click export to Unity, Unreal Engine, or Blender. Assets come 
              pre-optimized for real-time applications.
            </p>
          </div>
        </div>
      </section>

      {/* Global Map Section */}
      <section className="map-section">
        <h2 className="map-title">Live Global Presence</h2>
        <p className="map-subtitle">
          Track real-time 3D asset deployment and sales across the globe
        </p>
        
        <div className="globe-container">
          <div className="globe">
            <div className="globe-inner"></div>
            <div className="globe-rings">
              <div className="ring ring-1"></div>
              <div className="ring ring-2"></div>
              <div className="ring ring-3"></div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="stats-floating">
            <div className="stat-card stat-1">
              <div className="stat-label">Total Volume</div>
              <div className="stat-value">14.2M ETH</div>
            </div>
            <div className="stat-card stat-2">
              <div className="stat-label">Active Assets</div>
              <div className="stat-value">2.4k Items</div>
            </div>
            <div className="stat-card stat-3">
              <div className="stat-label">Global Users</div>
              <div className="stat-value">140+ Countries</div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer-3d">
        <div className="footer-content">
          <div className="footer-brand">
            <div className="footer-logo">
              <div className="logo-cube">
                <span>G3D</span>
              </div>
            </div>
            <p className="footer-tagline">
              The world's leading marketplace for high-end 3D content and virtual 
              real estate. Building the foundation of the open metaverse.
            </p>
          </div>

          <div className="footer-links">
            <div className="footer-column">
              <h4>Marketplace</h4>
              <a href="#all">All NFTs</a>
              <a href="#art">Art</a>
              <a href="#vr">Virtual Reality</a>
              <a href="#gaming">Gaming</a>
            </div>

            <div className="footer-column">
              <h4>Community</h4>
              <a href="#discord">Discord</a>
              <a href="#twitter">Twitter</a>
              <a href="#telegram">Telegram</a>
              <a href="#instagram">Instagram</a>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© 2024 Global 3D Experience. All rights reserved.</p>
          <div className="footer-legal">
            <a href="#privacy">Privacy Policy</a>
            <a href="#terms">Terms of Service</a>
          </div>
        </div>
      </footer>
    </div>
  );
}