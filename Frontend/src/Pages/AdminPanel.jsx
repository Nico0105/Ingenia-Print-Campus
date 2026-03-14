import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./AdminPanel.css";

export default function AdminPanel() {
  const [products, setProducts] = useState([]);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({
    nombre: "",
    categoria: "Impresoras FDM",
    subcategoria: "",
    imagenes: [],
    titulo: "",
    especificaciones: {
      Tecnologia: "",
      "Volumen de impresión": "",
      "Velocidad máxima": "",
      "Temperatura máxima de boquilla": "",
      "Temperatura máxima de cama": ""
    },
    materiales_compatibles: [""],
    ideal_para: [""]
  });
  const navigate = useNavigate();

  useEffect(() => {
    if (!localStorage.getItem("adminLoggedIn")) {
      navigate("/login-admin");
      return;
    }
    fetchProducts();
  }, [navigate]);

  const fetchProducts = () => {
    fetch("http://localhost:5000/api/products")
      .then(res => res.json())
      .then(data => setProducts(data))
      .catch(err => console.error(err));
  };

  const handleToggleStock = (id) => {
    fetch(`http://localhost:5000/api/products/${id}/stock`, { method: "PUT" })
      .then(() => fetchProducts());
  };

  const handleDelete = (id) => {
    if (window.confirm("¿Eliminar producto?")) {
      fetch(`http://localhost:5000/api/products/${id}`, { method: "DELETE" })
        .then(() => fetchProducts());
    }
  };

  const handleEdit = (product) => {
    setEditing(product.id);
    setForm({
      nombre: product.nombre,
      categoria: product.categoria || "Impresoras FDM",
      subcategoria: product.subcategoria || "",
      imagenes: [],
      titulo: product.contenido?.titulo || "",
      especificaciones: product.contenido?.especificaciones || {
        Tecnologia: "",
        "Volumen de impresión": "",
        "Velocidad máxima": "",
        "Temperatura máxima de boquilla": "",
        "Temperatura máxima de cama": ""
      },
      materiales_compatibles: product.contenido?.materiales_compatibles || [""],
      ideal_para: product.contenido?.ideal_para || [""]
    });
  };

  const handleSave = () => {
    const formData = new FormData();
    formData.append('nombre', form.nombre);
    formData.append('categoria', form.categoria);
    formData.append('subcategoria', form.subcategoria);
    formData.append('titulo', form.titulo);
    formData.append('especificaciones', JSON.stringify(form.especificaciones));
    formData.append('materiales_compatibles', JSON.stringify(form.materiales_compatibles.filter(m => m)));
    formData.append('ideal_para', JSON.stringify(form.ideal_para.filter(i => i)));

    // Agregar archivos
    for (const file of form.imagenes) {
      formData.append('imagenes', file);
    }

    const method = editing ? "PUT" : "POST";
    const url = editing ? `http://localhost:5000/api/products/${editing}` : "http://localhost:5000/api/products";

    fetch(url, {
      method,
      body: formData
    })
      .then(res => {
        if (!res.ok) {
          throw new Error('Error en la solicitud');
        }
        return res;
      })
      .then(() => {
        setEditing(null);
        setForm({
          nombre: "",
          categoria: "Impresoras FDM",
          subcategoria: "",
          imagenes: [],
          titulo: "",
          especificaciones: {
            Tecnologia: "",
            "Volumen de impresión": "",
            "Velocidad máxima": "",
            "Temperatura máxima de boquilla": "",
            "Temperatura máxima de cama": ""
          },
          materiales_compatibles: [""],
          ideal_para: [""]
        });
        fetchProducts();
        navigate("/Catalogo");
      })
      .catch(err => {
        console.error('Error guardando producto:', err);
        alert('Error guardando producto: ' + err.message);
      });
  };

  const handleLogout = () => {
    localStorage.removeItem("adminLoggedIn");
    navigate("/");
  };

  return (
    <div className="admin-panel">
      <header className="admin-header">
        <h1>Panel Administrador</h1>
        <div className="header-actions">
          <button onClick={() => navigate("/Catalogo")} className="btn-catalog">Ver Catálogo</button>
          <button onClick={handleLogout} className="btn-logout">Cerrar Sesión</button>
        </div>
      </header>

      <div className="admin-content">
        <button onClick={() => setEditing("new")} className="btn-add">Agregar Producto</button>

        {(editing || editing === "new") && (
          <div className="form-container">
            <h2>{editing === "new" ? "Agregar Producto" : "Editar Producto"}</h2>
            <form onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
              <div className="form-group">
                <label>Nombre:</label>
                <input
                  type="text"
                  value={form.nombre}
                  onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Categoría:</label>
                <input
                  type="text"
                  value={form.categoria}
                  onChange={(e) => setForm({ ...form, categoria: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Subcategoría:</label>
                <input
                  type="text"
                  value={form.subcategoria}
                  onChange={(e) => setForm({ ...form, subcategoria: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Imágenes:</label>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={(e) => setForm({ ...form, imagenes: Array.from(e.target.files || []) })}
                />
              </div>
              <div className="form-group">
                <label>Título:</label>
                <textarea
                  value={form.titulo}
                  onChange={(e) => setForm({ ...form, titulo: e.target.value })}
                />
              </div>
              <h3>Especificaciones:</h3>
              {Object.keys(form.especificaciones).map(key => (
                <div key={key} className="form-group">
                  <label>{key}:</label>
                  <input
                    type="text"
                    value={form.especificaciones[key]}
                    onChange={(e) => setForm({
                      ...form,
                      especificaciones: { ...form.especificaciones, [key]: e.target.value }
                    })}
                  />
                </div>
              ))}
              <h3>Materiales Compatibles:</h3>
              {form.materiales_compatibles.map((mat, index) => (
                <div key={index} className="form-group">
                  <input
                    type="text"
                    value={mat}
                    onChange={(e) => {
                      const newMats = [...form.materiales_compatibles];
                      newMats[index] = e.target.value;
                      setForm({ ...form, materiales_compatibles: newMats });
                    }}
                  />
                  <button type="button" onClick={() => {
                    const newMats = form.materiales_compatibles.filter((_, i) => i !== index);
                    setForm({ ...form, materiales_compatibles: newMats });
                  }}>Eliminar</button>
                </div>
              ))}
              <button type="button" onClick={() => setForm({ ...form, materiales_compatibles: [...form.materiales_compatibles, ""] })}>Agregar Material</button>
              <h3>Ideal Para:</h3>
              {form.ideal_para.map((ideal, index) => (
                <div key={index} className="form-group">
                  <input
                    type="text"
                    value={ideal}
                    onChange={(e) => {
                      const newIdeal = [...form.ideal_para];
                      newIdeal[index] = e.target.value;
                      setForm({ ...form, ideal_para: newIdeal });
                    }}
                  />
                  <button type="button" onClick={() => {
                    const newIdeal = form.ideal_para.filter((_, i) => i !== index);
                    setForm({ ...form, ideal_para: newIdeal });
                  }}>Eliminar</button>
                </div>
              ))}
              <button type="button" onClick={() => setForm({ ...form, ideal_para: [...form.ideal_para, ""] })}>Agregar Uso</button>
              <button type="submit">Guardar</button>
              <button type="button" onClick={() => setEditing(null)}>Cancelar</button>
            </form>
          </div>
        )}

        <div className="products-list">
          {products.map((product) => (
            <div key={product.id} className="product-item">
              <span className="product-name">{product.nombre}</span>
              <div className="actions">
                <button onClick={() => handleEdit(product)}>Editar</button>
                <button onClick={() => handleDelete(product.id)}>Eliminar</button>
                <button onClick={() => handleToggleStock(product.id)}>
                  {product.en_stock ? "Marcar Sin Stock" : "Marcar En Stock"}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}