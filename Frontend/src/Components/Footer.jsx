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
          <a 
          href="https://wa.me/541149455926?text=Hola%20Ingenia%2C%20tengo%20una%20consulta."
          target="_blank"
          rel="noopener noreferrer"
          className="whatsapp-btn"
          aria-label="Contactar por WhatsApp">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
            <path d="M12 0C5.373 0 0 5.373 0 12c0 2.124.558 4.122 1.533 5.857L.057 23.882l6.198-1.625A11.933 11.933 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.894a9.877 9.877 0 01-5.031-1.378l-.361-.214-3.741.981.999-3.648-.235-.374A9.861 9.861 0 012.106 12C2.106 6.58 6.58 2.106 12 2.106c5.421 0 9.894 4.474 9.894 9.894 0 5.421-4.473 9.894-9.894 9.894z"/>
          </svg>
          
        </a>

        <p>© 2024 INGENIA. Engineered for precision.</p>
        <Link to="/login-admin" className="admin-link">Panel Administrador</Link>
      </div>
    </footer>
  );
}