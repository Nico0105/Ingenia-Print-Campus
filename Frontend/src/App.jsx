import React from 'react';
import {Routes, Route} from 'react-router-dom';
import logo from './logo.svg';
import './App.css';
import Home from './Pages/Home.jsx';
import Curso from './Pages/Curso.jsx';
import { Navigate } from 'react-router-dom';
import Nosotros from './Pages/Nosotros.jsx';
import Catalogo from './Pages/Catalogo.jsx';
import Product from './Pages/Product.jsx';
import Garantia from './Pages/Garantia.jsx';
import LoginAdmin from './Pages/LoginAdmin.jsx';
import AdminPanel from './Pages/AdminPanel.jsx';

const App = () => {
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<Navigate to="/Home" replace />} />
        <Route path="/Home" element={<Home />} />
        <Route path="/Nosotros" element={<Nosotros />} />
        <Route path="/Cursos" element={<Curso />} />
        <Route path="/Catalogo" element={<Catalogo />} />
        <Route path="/Garantia" element={<Garantia />} />
        <Route path="/product/:productId" element={<Product />} />
        <Route path="/login-admin" element={<LoginAdmin />} />
        <Route path="/admin" element={<AdminPanel />} />
      </Routes>
    </div>
  );
}

export default App;
