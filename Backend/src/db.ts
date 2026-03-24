import sqlite3 from 'sqlite3';
import path from 'path';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';

dotenv.config();

const DB_PATH = path.join(__dirname, '../data/productos.db');

const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';

export const db = new sqlite3.Database(DB_PATH, (err) => {
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
      subcategoria TEXT,
      origen_carpeta TEXT
    )
  `);

  // Agregar columna origen_carpeta si no existe (para DBs existentes)
  db.run(`ALTER TABLE productos ADD COLUMN origen_carpeta TEXT`, (err: any) => {
    // Ignorar error si ya existe
  });

  db.run(`
    CREATE TABLE IF NOT EXISTS admins (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      email TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Crear admin por defecto si no existe
  db.get('SELECT id FROM admins WHERE username = ?', [ADMIN_USERNAME], async (err, row) => {
    if (!row) {
      try {
        const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 10);
        db.run('INSERT INTO admins (username, password, email) VALUES (?, ?, ?)',
          [ADMIN_USERNAME, hashedPassword, 'admin@ingenia.com']);
        console.log('Admin creado:', ADMIN_USERNAME);
      } catch (hashErr) {
        console.error('Error hashing password:', hashErr);
      }
    }
  });
}

export function getProductoByNombre(nombre: string): Promise<any | null> {
  return new Promise((resolve, reject) => {
    db.get('SELECT * FROM productos WHERE nombre = ?', [nombre], (err, row) => {
      if (err) reject(err);
      else resolve(row || null);
    });
  });
}

export function getProductoById(id: number): Promise<any | null> {
  return new Promise((resolve, reject) => {
    db.get('SELECT * FROM productos WHERE id = ?', [id], (err, row) => {
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
    // ✅ categoria incluida en la query
    const { nombre, imagenes, descripcion_general, en_stock = true, origen_carpeta, categoria } = producto;
    db.run(
      'INSERT OR REPLACE INTO productos (nombre, imagenes, descripcion_general, en_stock, origen_carpeta, categoria) VALUES (?, ?, ?, ?, ?, ?)',
      [
        nombre,
        JSON.stringify(imagenes),
        JSON.stringify(descripcion_general),
        en_stock ? 1 : 0,
        origen_carpeta || null,
        categoria || 'Sin categoría'
      ],
      function(err) {
        if (err) reject(err);
        else resolve(this.lastID);
      }
    );
  });
}

export function updateProducto(id: number, producto: any): Promise<void> {
  return new Promise((resolve, reject) => {
    const { nombre, categoria, imagenes, descripcion_general, en_stock } = producto;
    db.run(
      'UPDATE productos SET nombre = ?, categoria = ?, imagenes = ?, descripcion_general = ?, en_stock = ? WHERE id = ?',
      [nombre, categoria || 'Sin categoría', JSON.stringify(imagenes), JSON.stringify(descripcion_general), en_stock ? 1 : 0, id],
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

// ✅ toggleStock por ID en lugar de nombre (más seguro y preciso)
export function toggleStock(id: number): Promise<void> {
  return new Promise((resolve, reject) => {
    db.run(
      'UPDATE productos SET en_stock = 1 - en_stock WHERE id = ?',
      [id],
      (err) => {
        if (err) reject(err);
        else resolve();
      }
    );
  });
}

export function getAdminByUsername(username: string): Promise<any | null> {
  return new Promise((resolve, reject) => {
    db.get('SELECT * FROM admins WHERE username = ?', [username], (err, row) => {
      if (err) reject(err);
      else resolve(row || null);
    });
  });
}

export async function verifyPassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
  try {
    return await bcrypt.compare(plainPassword, hashedPassword);
  } catch (error) {
    console.error('Error comparing passwords:', error);
    return false;
  }
}