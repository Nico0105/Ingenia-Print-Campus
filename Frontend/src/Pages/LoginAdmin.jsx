import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./LoginAdmin.css";

export default function LoginAdmin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    
    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password })
      });

      const data = await response.json();

      if (data.success) {
        localStorage.setItem('token', data.token || 'logged_in');
        localStorage.setItem('adminLoggedIn', 'true');
        navigate("/admin");
      } else {
        setError(data.message || "Credenciales incorrectas");
      }
    } catch (err) {
      console.error('Login error:', err);
      setError("Error al conectar con el servidor");
    }
  };

  return (
    <div className="login-admin">
      <div className="login-container">
        <div className="login-form-wrapper">
          <h2>Panel Administrador</h2>
          <p>Inicia sesión para acceder al panel de control.</p>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Usuario:</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label>Contraseña:</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            {error && <p className="error">{error}</p>}
            <button type="submit" className="btn-login">Ingresar</button>
            <button type="button" onClick={() => navigate("/")} className="btn-back">Volver al Inicio</button>
            </form>
        </div>
      </div>
    </div>
  );
}