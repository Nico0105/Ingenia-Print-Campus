import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "./AdminPanel.css";

export default function AdminPanel() {
  const [products, setProducts] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({
    nombre: "",
    categoria: "Impresoras FDM",
    subcategoria: "",
    imagenes: [],
    titulo: "",
    especificaciones: [
      { key: "Tecnología", value: "" },
      { key: "Volumen de impresión", value: "" },
      { key: "Velocidad máxima", value: "" },
      { key: "Temperatura máxima de boquilla", value: "" },
      { key: "Temperatura máxima de cama", value: "" }
    ],
    materiales_compatibles: [""],
    ideal_para: [""]
  });
  const formRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const isLoggedIn = localStorage.getItem("token") || localStorage.getItem("adminLoggedIn");
    if (!isLoggedIn) {
      navigate("/login-admin");
      return;
    }
    fetchProducts();
  }, [navigate]);

  const fetchProducts = () => {
    fetch("http://localhost:5000/api/products")
      .then(res => res.json())
      .then(data => {
        // Filter out null products
        const validProducts = Array.isArray(data) ? data.filter(p => p && p.id) : [];
        setProducts(validProducts);
      })
      .catch(err => console.error(err));
  };

 const handleToggleStock = (id) => {
  const product = products.find(p => p.id === id);

  fetch(`http://localhost:5000/api/products/${id}/stock`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ en_stock: !product.en_stock }),
  })
    .then(response => {
      if (!response.ok) {
        return response.json().then(err => {
          throw new Error(err.message || `Error HTTP: ${response.status}`);
        });
      }
      return response.json();
    })
    .then(() => fetchProducts())
    .catch(err => {
      console.error('Error cambiando stock:', err);
      alert('Error cambiando stock: ' + err.message);
    });
};

  const handleDelete = (id) => {
    if (window.confirm("¿Eliminar producto?")) {
      fetch(`http://localhost:5000/api/products/${id}`, { method: "DELETE" })
        .then(() => fetchProducts());
    }
  };

  const handleEdit = (product) => {
    setEditingId(product.id);
    setForm({
      nombre: product.nombre,
      categoria: product.categoria || "Impresoras FDM",
      subcategoria: product.subcategoria || "",
      imagenes: [],
      titulo: product.contenido?.titulo || "",
      especificaciones: product.contenido?.especificaciones
      ? Object.entries(product.contenido.especificaciones).map(([key, value]) => ({
          key,
          value
        }))
      : [
          { key: "Tecnología", value: "" },
          { key: "Volumen de impresión", value: "" },
          { key: "Velocidad máxima", value: "" },
          { key: "Temperatura máxima de boquilla", value: "" },
          { key: "Temperatura máxima de cama", value: "" }
        ],
      materiales_compatibles: product.contenido?.materiales_compatibles?.length > 0 ? product.contenido.materiales_compatibles : [""],
      ideal_para: product.contenido?.ideal_para?.length > 0 ? product.contenido.ideal_para : [""]
    });
  };

  const handleSave = (e) => {
    e.preventDefault();
    const formData = new FormData();
    const specsObject = {};
    form.especificaciones.forEach(spec => {
      if (spec.key) specsObject[spec.key] = spec.value;
    });
    formData.append('nombre', form.nombre);
    formData.append('categoria', form.categoria);
    formData.append('subcategoria', form.subcategoria);
    formData.append('titulo', form.titulo);
    formData.append('especificaciones', JSON.stringify(specsObject));
    formData.append('materiales_compatibles', JSON.stringify(form.materiales_compatibles.filter(m => m)));
    formData.append('ideal_para', JSON.stringify(form.ideal_para.filter(i => i)));

    for (const file of form.imagenes) {
      formData.append('imagenes', file);
    }

    fetch(`http://localhost:5000/api/products/${editingId}`, {
      method: "PUT",
      body: formData
    })
      .then(res => {
        if (!res.ok) {
          throw new Error('Error en la solicitud');
        }
        return res;
      })
      .then(() => {
        setEditingId(null);
        fetchProducts();
      })
      .catch(err => {
        console.error('Error guardando producto:', err);
        alert('Error guardando producto: ' + err.message);
      });
  };

  const handleAddNew = () => {
    setEditingId("new");
    setForm({
      nombre: "",
      categoria: "Impresoras FDM",
      subcategoria: "",
      imagenes: [],
      titulo: "",
      especificaciones: [
        { key: "Tecnología", value: "" },
        { key: "Volumen de impresión", value: "" },
        { key: "Velocidad máxima", value: "" },
        { key: "Temperatura máxima de boquilla", value: "" },
        { key: "Temperatura máxima de cama", value: "" }
      ],
      materiales_compatibles: [""],
      ideal_para: [""]
    });
  };

  const handleSaveNew = (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('nombre', form.nombre);
    formData.append('categoria', form.categoria);
    formData.append('subcategoria', form.subcategoria);
    formData.append('titulo', form.titulo);

    const specsObject = {};
    form.especificaciones.forEach(spec => {
      if (spec.key) specsObject[spec.key] = spec.value;
    });

    formData.append('especificaciones', JSON.stringify(specsObject));   
    formData.append('materiales_compatibles', JSON.stringify(form.materiales_compatibles.filter(m => m)));
    formData.append('ideal_para', JSON.stringify(form.ideal_para.filter(i => i)));

    for (const file of form.imagenes) {
      formData.append('imagenes', file);
    }

    fetch("http://localhost:5000/api/products", {
      method: "POST",
      body: formData
    })
      .then(res => {
        if (!res.ok) {
          throw new Error('Error en la solicitud');
        }
        return res;
      })
      .then(() => {
        setEditingId(null);
        fetchProducts();
      })
      .catch(err => {
        console.error('Error guardando producto:', err);
        alert('Error guardando producto: ' + err.message);
      });
  };

  const handleCancel = () => {
    setEditingId(null);
  };

  const handleLogout = () => {
    localStorage.removeItem("adminLoggedIn");
    localStorage.removeItem("token");
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
        <div className="products-header">
          <h2>Productos ({products.length})</h2>
          {editingId !== "new" && (
            <button onClick={handleAddNew} className="btn-add">+ Agregar Producto</button>
          )}
        </div>

        {editingId === "new" && (
          <div className="product-item expanded">
            <div className="inline-form">
              <h3>Nuevo Producto</h3>
              <form onSubmit={handleSaveNew}>
                <div className="form-row">
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
                <h4>Especificaciones:</h4>
                {form.especificaciones.map((spec, index) => (
                  <div key={index} className="dynamic-field">

                    <input
                      type="text"
                      placeholder="Nombre"
                      value={spec.key}
                      onChange={(e) => {
                        const newSpecs = [...form.especificaciones];
                        newSpecs[index].key = e.target.value;
                        setForm({ ...form, especificaciones: newSpecs });
                      }}
                    />

                    <input
                      type="text"
                      placeholder="Valor"
                      value={spec.value}
                      onChange={(e) => {
                        const newSpecs = [...form.especificaciones];
                        newSpecs[index].value = e.target.value;
                        setForm({ ...form, especificaciones: newSpecs });
                      }}
                    />

                    {form.especificaciones.length > 1 && (
                      <button
                        type="button"
                        onClick={() => {
                          const newSpecs = form.especificaciones.filter((_, i) => i !== index);
                          setForm({ ...form, especificaciones: newSpecs });
                        }}
                      >
                        ×
                      </button>
                    )}
                  </div>
                ))}

                <button
                  type="button"
                  className="add-field-btn"
                  onClick={() =>
                    setForm({
                      ...form,
                      especificaciones: [...form.especificaciones, { key: "", value: "" }]
                    })
                  }
                >
                  + Agregar especificación
                </button>
                <h4>Materiales Compatibles:</h4>
                {form.materiales_compatibles.map((mat, index) => (
                  <div key={index} className="dynamic-field">
                    <input
                      type="text"
                      value={mat}
                      placeholder="Material..."
                      onChange={(e) => {
                        const newMats = [...form.materiales_compatibles];
                        newMats[index] = e.target.value;
                        setForm({ ...form, materiales_compatibles: newMats });
                      }}
                    />
                    {form.materiales_compatibles.length > 1 && (
                      <button type="button" onClick={() => {
                        const newMats = form.materiales_compatibles.filter((_, i) => i !== index);
                        setForm({ ...form, materiales_compatibles: newMats });
                      }}>×</button>
                    )}
                  </div>
                ))}
                <button type="button" onClick={() => setForm({ ...form, materiales_compatibles: [...form.materiales_compatibles, ""] })} className="add-field-btn">+ Agregar</button>
                
                <h4>Ideal Para:</h4>
                {form.ideal_para.map((ideal, index) => (
                  <div key={index} className="dynamic-field">
                    <input
                      type="text"
                      value={ideal}
                      placeholder="Uso..."
                      onChange={(e) => {
                        const newIdeal = [...form.ideal_para];
                        newIdeal[index] = e.target.value;
                        setForm({ ...form, ideal_para: newIdeal });
                      }}
                    />
                    {form.ideal_para.length > 1 && (
                      <button type="button" onClick={() => {
                        const newIdeal = form.ideal_para.filter((_, i) => i !== index);
                        setForm({ ...form, ideal_para: newIdeal });
                      }}>×</button>
                    )}
                  </div>
                ))}
                <button type="button" onClick={() => setForm({ ...form, ideal_para: [...form.ideal_para, ""] })} className="add-field-btn">+ Agregar</button>
                
                <div className="form-buttons">
                  <button type="submit" className="btn-save">Guardar</button>
                  <button type="button" onClick={handleCancel} className="btn-cancel">Cancelar</button>
                </div>
              </form>
            </div>
          </div>
        )}

        <div className="products-list">
          {products.map((product) => (
            <div key={product.id} className={`product-item ${editingId === product.id ? 'expanded' : ''}`}>
              <div className="product-main" onClick={() => editingId === product.id && handleCancel()}>
                <div className="product-info">
                  <span className="product-name">{product.nombre}</span>
                  <span className="product-category">{product.categoria}</span>
                  <span className={`product-stock ${product.en_stock ? 'in-stock' : 'out-of-stock'}`}>
                    {product.en_stock ? '✓ En Stock' : '✗ Sin Stock'}
                  </span>
                </div>
                <div className="actions">
                  {editingId === product.id ? (
                    <button onClick={handleCancel} className="btn-cancel-action">Cancelar</button>
                  ) : (
                    <>
                      <button onClick={() => handleEdit(product)}>Editar</button>
                      <button onClick={() => handleDelete(product.id)}>Eliminar</button>
                      <button onClick={() => handleToggleStock(product.id)}>
                        {product.en_stock ? 'Sin Stock' : 'En Stock'}
                      </button>
                    </>
                  )}
                </div>
              </div>

              {editingId === product.id && (
                <div className="inline-form">
                  <form onSubmit={handleSave}>
                    <div className="form-row">
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
                    <h4>Especificaciones:</h4>
                    {form.especificaciones.map((spec, index) => (
                      <div key={index} className="dynamic-field">

                        <input
                          type="text"
                          placeholder="Nombre"
                          value={spec.key}
                          onChange={(e) => {
                            const newSpecs = [...form.especificaciones];
                            newSpecs[index].key = e.target.value;
                            setForm({ ...form, especificaciones: newSpecs });
                          }}
                        />

                        <input
                          type="text"
                          placeholder="Valor"
                          value={spec.value}
                          onChange={(e) => {
                            const newSpecs = [...form.especificaciones];
                            newSpecs[index].value = e.target.value;
                            setForm({ ...form, especificaciones: newSpecs });
                          }}
                        />

                        {form.especificaciones.length > 1 && (
                          <button
                            type="button"
                            onClick={() => {
                              const newSpecs = form.especificaciones.filter((_, i) => i !== index);
                              setForm({ ...form, especificaciones: newSpecs });
                            }}
                          >
                            ×
                          </button>
                        )}
                      </div>
                    ))}

                    <button
                      type="button"
                      className="add-field-btn"
                      onClick={() =>
                        setForm({
                          ...form,
                          especificaciones: [...form.especificaciones, { key: "", value: "" }]
                        })
                      }
                    >
                      + Agregar especificación
                    </button>
                    <h4>Materiales Compatibles:</h4>
                    {form.materiales_compatibles.map((mat, index) => (
                      <div key={index} className="dynamic-field">
                        <input
                          type="text"
                          value={mat}
                          placeholder="Material..."
                          onChange={(e) => {
                            const newMats = [...form.materiales_compatibles];
                            newMats[index] = e.target.value;
                            setForm({ ...form, materiales_compatibles: newMats });
                          }}
                        />
                        {form.materiales_compatibles.length > 1 && (
                          <button type="button" onClick={() => {
                            const newMats = form.materiales_compatibles.filter((_, i) => i !== index);
                            setForm({ ...form, materiales_compatibles: newMats });
                          }}>×</button>
                        )}
                      </div>
                    ))}
                    <button type="button" onClick={() => setForm({ ...form, materiales_compatibles: [...form.materiales_compatibles, ""] })} className="add-field-btn">+ Agregar</button>
                    
                    <h4>Ideal Para:</h4>
                    {form.ideal_para.map((ideal, index) => (
                      <div key={index} className="dynamic-field">
                        <input
                          type="text"
                          value={ideal}
                          placeholder="Uso..."
                          onChange={(e) => {
                            const newIdeal = [...form.ideal_para];
                            newIdeal[index] = e.target.value;
                            setForm({ ...form, ideal_para: newIdeal });
                          }}
                        />
                        {form.ideal_para.length > 1 && (
                          <button type="button" onClick={() => {
                            const newIdeal = form.ideal_para.filter((_, i) => i !== index);
                            setForm({ ...form, ideal_para: newIdeal });
                          }}>×</button>
                        )}
                      </div>
                    ))}
                    <button type="button" onClick={() => setForm({ ...form, ideal_para: [...form.ideal_para, ""] })} className="add-field-btn">+ Agregar</button>
                    
                    <div className="form-buttons">
                      <button type="submit" className="btn-save">Guardar Cambios</button>
                      <button type="button" onClick={handleCancel} className="btn-cancel">Cancelar</button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
