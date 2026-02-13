import React from 'react';
import {Routes, Route} from 'react-router-dom';
import logo from './logo.svg';
import './App.css';
import Login from './Pages/Login.jsx';
import Dashboard from './Pages/Dashboard.jsx';
import Home from './Pages/Home.jsx';
import { Navigate } from 'react-router-dom';
import Nosotros from './Pages/Nosotros.jsx';
import Catalogo from './Pages/Catalogo.jsx';

const App = () => {
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<Navigate to="/Login" replace />} />
        <Route path="/Login" element={<Login />} />
        <Route path="/Dashboard" element={<Dashboard />} />
        <Route path="/Home" element={<Home />} />
        <Route path="/Nosotros" element={<Nosotros />} />
        <Route path="/Catalogo" element={<Catalogo />} />




        {/* Aca añadimos mas rutas */}

      </Routes>
    </div>
  );
}

export default App;
