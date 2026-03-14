import sqlite3 from 'sqlite3';
import path from 'path';

const DB_PATH = path.join(__dirname, '../data/productos.db');

const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('Connected to SQLite database.');
    initDB();
  }
});

function initDB() {
  db.run(`
    CREATE TABLE IF NOT EXISTS productos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nombre TEXT UNIQUE NOT NULL,
      imagenes TEXT,
      descripcion_general TEXT,
      en_stock INTEGER DEFAULT 1,
      categoria TEXT DEFAULT 'Sin categoría',
      subcategoria TEXT
    )
  `);
}

export function getProductoByNombre(nombre: string): Promise<any | null> {
  return new Promise((resolve, reject) => {
    db.get('SELECT * FROM productos WHERE nombre = ?', [nombre], (err, row) => {
      if (err) reject(err);
      else resolve(row || null);
    });
  });
}

export function getAllProductos(): Promise<any[]> {
  return new Promise((resolve, reject) => {
    db.all('SELECT * FROM productos', [], (err, rows) => {
      if (err) reject(err);
      else resolve(rows || []);
    });
  });
}

export function insertProducto(producto: any): Promise<number> {
  return new Promise((resolve, reject) => {
    const { nombre, imagenes, descripcion_general, en_stock = true } = producto;
    db.run(
      'INSERT OR REPLACE INTO productos (nombre, imagenes, descripcion_general, en_stock) VALUES (?, ?, ?, ?)',
      [nombre, JSON.stringify(imagenes), JSON.stringify(descripcion_general), en_stock ? 1 : 0],
      function(err) {
        if (err) reject(err);
        else resolve(this.lastID);
      }
    );
  });
}

export function updateProducto(nombre: string, producto: any): Promise<void> {
  return new Promise((resolve, reject) => {
    const { imagenes, descripcion_general, en_stock } = producto;
    db.run(
      'UPDATE productos SET imagenes = ?, descripcion_general = ?, en_stock = ? WHERE nombre = ?',
      [JSON.stringify(imagenes), JSON.stringify(descripcion_general), en_stock ? 1 : 0, nombre],
      (err) => {
        if (err) reject(err);
        else resolve();
      }
    );
  });
}

export function deleteProducto(nombre: string): Promise<void> {
  return new Promise((resolve, reject) => {
    db.run('DELETE FROM productos WHERE nombre = ?', [nombre], (err) => {
      if (err) reject(err);
      else resolve();
    });
  });
}

export function toggleStock(nombre: string): Promise<void> {
  return new Promise((resolve, reject) => {
    db.run(
      'UPDATE productos SET en_stock = 1 - en_stock WHERE nombre = ?',
      [nombre],
      (err) => {
        if (err) reject(err);
        else resolve();
      }
    );
  });
}