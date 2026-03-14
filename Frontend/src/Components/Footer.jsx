import React from "react";
import { Link } from "react-router-dom";
import "./Footer.css";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-top">
        <div className="footer-brand">
          <h2>INGENIA</h2>
        </div>

        <div className="footer-links">
          <div>
            <h5>Company</h5>
            <Link to="/nosotros">Nosotros</Link>
            <Link to="/curso">Cursos</Link>
            <Link to="/garantia">Garantía</Link>
          </div>

          <div>
            <h5>Support</h5>
            <Link to="/catalogo">Catálogo</Link>
            <a href="#">Firmware</a>
            <a href="#">Community</a>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <p>© 2024 INGENIA. Engineered for precision.</p>
        <Link to="/login-admin" className="admin-link">Panel Administrador</Link>
      </div>
    </footer>
  );
}