import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "./AdminPanel.css";
import { API_URL } from "../config";

const EMPTY_FORM = {
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
    { key: "Temperatura máxima de cama", value: "" },
  ],
  materiales_compatibles: [""],
  ideal_para: [""],
  colores: [],
};

function buildFormData(form) {
  const formData = new FormData();
  const specsObject = {};
  form.especificaciones.forEach((spec) => {
    if (spec.key) specsObject[spec.key] = spec.value;
  });

  formData.append("nombre", form.nombre);
  formData.append("categoria", form.categoria);
  formData.append("subcategoria", form.subcategoria);
  formData.append("titulo", form.titulo);
  formData.append("especificaciones", JSON.stringify(specsObject));
  formData.append("materiales_compatibles", JSON.stringify(form.materiales_compatibles.filter((m) => m)));
  formData.append("ideal_para", JSON.stringify(form.ideal_para.filter((i) => i)));

  const imagenesOrden = form.imagenes.map(img => ({
    tipo: img.file ? "nueva" : "existente",
    url: img.file ? null : img.url,
  }));
  formData.append("imagenes_orden", JSON.stringify(imagenesOrden));

  form.imagenes
    .filter(img => img.file)
    .forEach(img => formData.append("imagenes_nuevas", img.file));

  const coloresMeta = form.colores.map((c, i) => ({
    nombre: c.nombre,
    imagenUrl: c.imagenUrl || null,
    fileIndex: c.imagenFile ? i : null,
  }));
  formData.append("colores", JSON.stringify(coloresMeta));
  form.colores.forEach((c, i) => {
    if (c.imagenFile) formData.append(`color_imagen_${i}`, c.imagenFile);
  });

  return formData;
}

function ImageSorter({ images, onChange }) {
  const dragIndex = useRef(null);
  const [dragOver, setDragOver] = useState(null);

  const handleDragStart = (e, index) => {
    dragIndex.current = index;
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragOver(index);
  };

  const handleDrop = (e, index) => {
    e.preventDefault();
    if (dragIndex.current === null || dragIndex.current === index) {
      setDragOver(null);
      return;
    }
    const reordered = [...images];
    const [moved] = reordered.splice(dragIndex.current, 1);
    reordered.splice(index, 0, moved);
    dragIndex.current = null;
    setDragOver(null);
    onChange(reordered);
  };

  const handleDragEnd = () => {
    dragIndex.current = null;
    setDragOver(null);
  };

  const handleRemove = (index) => {
    onChange(images.filter((_, i) => i !== index));
  };

  const moveLeft = (index) => {
    if (index === 0) return;
    const reordered = [...images];
    [reordered[index - 1], reordered[index]] = [reordered[index], reordered[index - 1]];
    onChange(reordered);
  };

  const moveRight = (index) => {
    if (index === images.length - 1) return;
    const reordered = [...images];
    [reordered[index + 1], reordered[index]] = [reordered[index], reordered[index + 1]];
    onChange(reordered);
  };

  if (!images || images.length === 0) return null;

  return (
    <div className="image-sorter">
      <p className="image-sorter-hint">
        🖱️ Arrastrá para reordenar · La primera imagen es la principal
      </p>
      <div className="image-sorter-grid">
        {images.map((img, index) => (
          <div
            key={img.id}
            className={`image-sorter-item${dragOver === index ? " drag-over" : ""}${index === 0 ? " is-main" : ""}`}
            draggable
            onDragStart={(e) => handleDragStart(e, index)}
            onDragOver={(e) => handleDragOver(e, index)}
            onDrop={(e) => handleDrop(e, index)}
            onDragEnd={handleDragEnd}
          >
            {index === 0 && <span className="image-main-badge">Principal</span>}
            <img
              src={img.preview}
              alt={`imagen ${index + 1}`}
              className="image-sorter-thumb"
              onError={(e) => { e.target.style.opacity = "0.3"; }}
            />
            <div className="image-sorter-name" title={img.file?.name || img.url}>
              {img.file?.name || "📷 existente"}
            </div>
            <div className="image-sorter-controls">
              <button type="button" title="Mover izquierda" onClick={() => moveLeft(index)} disabled={index === 0}>←</button>
              <button type="button" title="Eliminar" className="btn-remove-img" onClick={() => handleRemove(index)}>×</button>
              <button type="button" title="Mover derecha" onClick={() => moveRight(index)} disabled={index === images.length - 1}>→</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ColoresSection({ form, setForm }) {
  const isFilamento = form.categoria?.toLowerCase().includes("filament");
  if (!isFilamento) return null;

  return (
    <div className="colores-section">
      <h4>Colores disponibles:</h4>
      <p className="colores-hint">Cada color tiene su nombre y su imagen propia.</p>

      {form.colores.map((color, index) => (
        <div key={index} className="color-field">
          <input
            type="text"
            placeholder="Nombre del color (ej: Verde)"
            value={color.nombre}
            onChange={(e) => {
              const newColores = [...form.colores];
              newColores[index] = { ...newColores[index], nombre: e.target.value };
              setForm({ ...form, colores: newColores });
            }}
          />
          <label className="file-label">
            {color.imagenPreview || color.imagenUrl ? "Cambiar imagen" : "Subir imagen"}
            <input
              type="file"
              accept="image/*"
              style={{ display: "none" }}
              onChange={(e) => {
                const file = e.target.files[0];
                if (!file) return;
                const newColores = [...form.colores];
                newColores[index] = {
                  ...newColores[index],
                  imagenFile: file,
                  imagenPreview: URL.createObjectURL(file),
                };
                setForm({ ...form, colores: newColores });
              }}
            />
          </label>
          {(color.imagenPreview || color.imagenUrl) && (
            <img
              src={color.imagenPreview || color.imagenUrl}
              alt={color.nombre || "preview"}
              className="color-preview-img"
            />
          )}
          <button
            type="button"
            className="btn-remove-color"
            onClick={() => {
              const newColores = form.colores.filter((_, i) => i !== index);
              setForm({ ...form, colores: newColores });
            }}
          >
            ×
          </button>
        </div>
      ))}

      <button
        type="button"
        className="add-field-btn"
        onClick={() =>
          setForm({
            ...form,
            colores: [
              ...form.colores,
              { nombre: "", imagenFile: null, imagenPreview: null, imagenUrl: null },
            ],
          })
        }
      >
        + Agregar color
      </button>
    </div>
  );
}

export default function AdminPanel() {
  const [products, setProducts] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
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
    fetch(`${API_URL}/api/products`)
      .then((res) => res.json())
      .then((data) => {
        const validProducts = Array.isArray(data) ? data.filter((p) => p && p.id) : [];
        setProducts(validProducts);
      })
      .catch((err) => console.error(err));
  };

  const handleToggleStock = (id) => {
    const product = products.find((p) => p.id === id);
    fetch(`${API_URL}/api/products/${id}/stock`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ en_stock: !product.en_stock }),
    })
      .then((response) => {
        if (!response.ok) {
          return response.json().then((err) => {
            throw new Error(err.message || `Error HTTP: ${response.status}`);
          });
        }
        return response.json();
      })
      .then(() => fetchProducts())
      .catch((err) => {
        console.error("Error cambiando stock:", err);
        alert("Error cambiando stock: " + err.message);
      });
  };

  const handleDelete = (id) => {
    if (window.confirm("¿Eliminar producto?")) {
      fetch(`${API_URL}/api/products/${id}`, { method: "DELETE" }).then(() => fetchProducts());
    }
  };

  const handleEdit = (product) => {
    setEditingId(product.id);

    let coloresExistentes = product.contenido?.colores || [];
    if (typeof coloresExistentes === "string") {
      try { coloresExistentes = JSON.parse(coloresExistentes); }
      catch { coloresExistentes = []; }
    }

    // Cargar imágenes existentes — cubre tanto strings como objetos {url}
    const imagenesExistentes = (product.imagenes || []).map((img) => {
      const url = typeof img === "string" ? img : img?.url;
      return { id: `existing-${url}`, url, preview: url, file: null };
    }).filter(img => img.url);

    setForm({
      nombre: product.nombre,
      categoria: product.categoria || "Impresoras FDM",
      subcategoria: product.subcategoria || "",
      imagenes: imagenesExistentes,
      titulo: product.contenido?.titulo || "",
      especificaciones: product.contenido?.especificaciones
        ? Object.entries(product.contenido.especificaciones).map(([key, value]) => ({ key, value }))
        : [
            { key: "Tecnología", value: "" },
            { key: "Volumen de impresión", value: "" },
            { key: "Velocidad máxima", value: "" },
            { key: "Temperatura máxima de boquilla", value: "" },
            { key: "Temperatura máxima de cama", value: "" },
          ],
      materiales_compatibles:
        product.contenido?.materiales_compatibles?.length > 0
          ? product.contenido.materiales_compatibles
          : [""],
      ideal_para:
        product.contenido?.ideal_para?.length > 0
          ? product.contenido.ideal_para
          : [""],
      colores: coloresExistentes.map((c) => ({
        nombre: c.nombre || "",
        imagenUrl: c.imagenUrl || null,
        imagenFile: null,
        imagenPreview: null,
      })),
    });
  };

  const handleSave = (e) => {
    e.preventDefault();
    const formData = buildFormData(form);
    fetch(`${API_URL}/api/products/${editingId}`, { method: "PUT", body: formData })
      .then((res) => {
        if (!res.ok) return res.json().then((err) => { throw new Error(JSON.stringify(err)); });
        return res;
      })
      .then(() => { setEditingId(null); fetchProducts(); })
      .catch((err) => { console.error("Error guardando producto:", err); alert("Error guardando producto: " + err.message); });
  };

  const handleAddNew = () => {
    setEditingId("new");
    setForm(EMPTY_FORM);
  };

  const handleSaveNew = (e) => {
    e.preventDefault();
    const formData = buildFormData(form);
    fetch(`${API_URL}/api/products`, { method: "POST", body: formData })
      .then((res) => {
        if (!res.ok) throw new Error("Error en la solicitud");
        return res;
      })
      .then(() => { setEditingId(null); fetchProducts(); })
      .catch((err) => { console.error("Error guardando producto:", err); alert("Error guardando producto: " + err.message); });
  };

  const handleCancel = () => setEditingId(null);

  const handleLogout = () => {
    localStorage.removeItem("adminLoggedIn");
    localStorage.removeItem("token");
    navigate("/");
  };

  const handleImagenesChange = (e) => {
    const files = Array.from(e.target.files || []);
    const nuevas = files.map((file) => ({
      id: `${file.name}-${file.lastModified}-${Math.random()}`,
      file,
      preview: URL.createObjectURL(file),
      url: null,
    }));
    setForm((prev) => ({ ...prev, imagenes: [...prev.imagenes, ...nuevas] }));
    e.target.value = "";
  };

  const renderForm = (onSubmit, submitLabel) => (
    <form onSubmit={onSubmit}>
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
            list="subcategorias-list"
            value={form.subcategoria}
            onChange={(e) => setForm({ ...form, subcategoria: e.target.value })}
            placeholder="Escribí o elegí una subcategoría..."
          />
          <datalist id="subcategorias-list">
            {[...new Set(
              products
                .filter(p => p.categoria === form.categoria && p.subcategoria)
                .map(p => p.subcategoria)
            )].map((sub) => (
              <option key={sub} value={sub} />
            ))}
          </datalist>
        </div>
      </div>

      <div className="form-group">
        <label>Imágenes:</label>
        <input
          type="file"
          multiple
          accept="image/*"
          onChange={handleImagenesChange}
        />
        <ImageSorter
          images={form.imagenes}
          onChange={(reordered) => setForm({ ...form, imagenes: reordered })}
        />
      </div>

      <div className="form-group">
        <label>Título / Descripción:</label>
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
          setForm({ ...form, especificaciones: [...form.especificaciones, { key: "", value: "" }] })
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
            <button
              type="button"
              onClick={() => {
                const newMats = form.materiales_compatibles.filter((_, i) => i !== index);
                setForm({ ...form, materiales_compatibles: newMats });
              }}
            >
              ×
            </button>
          )}
        </div>
      ))}
      <button
        type="button"
        onClick={() => setForm({ ...form, materiales_compatibles: [...form.materiales_compatibles, ""] })}
        className="add-field-btn"
      >
        + Agregar
      </button>

      <h4>Ideal Para:</h4>
      {form.ideal_para.map((ideal, index) => (
        <div key={index} className="dynamic-field">
          <textarea
            value={ideal}
            placeholder="Uso... (podés usar Enter para saltar líneas)"
            rows={3}
            onChange={(e) => {
              const newIdeal = [...form.ideal_para];
              newIdeal[index] = e.target.value;
              setForm({ ...form, ideal_para: newIdeal });
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") e.stopPropagation();
            }}
          />
          {form.ideal_para.length > 1 && (
            <button
              type="button"
              onClick={() => {
                const newIdeal = form.ideal_para.filter((_, i) => i !== index);
                setForm({ ...form, ideal_para: newIdeal });
              }}
            >
              ×
            </button>
          )}
        </div>
      ))}
      <button
        type="button"
        onClick={() => setForm({ ...form, ideal_para: [...form.ideal_para, ""] })}
        className="add-field-btn"
      >
        + Agregar
      </button>

      <ColoresSection form={form} setForm={setForm} />

      <div className="form-buttons">
        <button type="submit" className="btn-save">{submitLabel}</button>
        <button type="button" onClick={handleCancel} className="btn-cancel">Cancelar</button>
      </div>
    </form>
  );

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
              {renderForm(handleSaveNew, "Guardar")}
            </div>
          </div>
        )}

        <div className="products-list">
          {products.map((product) => (
            <div
              key={product.id}
              className={`product-item ${editingId === product.id ? "expanded" : ""}`}
            >
              <div className="product-main" onClick={() => editingId === product.id && handleCancel()}>
                <div className="product-info">
                  <span className="product-name">{product.nombre}</span>
                  <span className="product-category">{product.categoria}</span>
                  <span className={`product-stock ${product.en_stock ? "in-stock" : "out-of-stock"}`}>
                    {product.en_stock ? "✓ En Stock" : "✗ Sin Stock"}
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
                        {product.en_stock ? "Sin Stock" : "En Stock"}
                      </button>
                    </>
                  )}
                </div>
              </div>

              {editingId === product.id && (
                <div className="inline-form">
                  {renderForm(handleSave, "Guardar Cambios")}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}