import dotenv from 'dotenv';
dotenv.config();
import { Pool } from 'pg';
import bcrypt from 'bcryptjs';

const ADMIN_USERNAME = process.env.ADMIN_USERNAME!;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD!;


export const db = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});


async function initDB() {
  await db.query(`
    CREATE TABLE IF NOT EXISTS productos (
      id SERIAL PRIMARY KEY,
      nombre TEXT UNIQUE NOT NULL,
      imagenes TEXT,
      descripcion_general TEXT,
      en_stock INTEGER DEFAULT 1,
      categoria TEXT DEFAULT 'Sin categoría',
      subcategoria TEXT,
      origen_carpeta TEXT
    )
  `);

  await db.query(`
    CREATE TABLE IF NOT EXISTS admins (
      id SERIAL PRIMARY KEY,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      email TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  const result = await db.query(
    'SELECT id FROM admins WHERE username = $1',
    [ADMIN_USERNAME]
  );

  if (result.rows.length === 0) {
    const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 10);
    await db.query(
      'INSERT INTO admins (username, password, email) VALUES ($1, $2, $3)',
      [ADMIN_USERNAME, hashedPassword, 'admin@ingenia.com']
    );
    console.log('✅ Admin creado:', ADMIN_USERNAME);
  } else {
    console.log('ℹ️ Admin ya existe');
  }
}

initDB().catch(console.error);

export async function getProductoByNombre(nombre: string): Promise<any | null> {
  const result = await db.query('SELECT * FROM productos WHERE nombre = $1', [nombre]);
  return result.rows[0] || null;
}

export async function getProductoById(id: number): Promise<any | null> {
  const result = await db.query('SELECT * FROM productos WHERE id = $1', [id]);
  return result.rows[0] || null;
}

export async function getAllProductos(): Promise<any[]> {
  const result = await db.query('SELECT * FROM productos');
  return result.rows;
}

export async function insertProducto(producto: any): Promise<number> {
  const { nombre, imagenes, descripcion_general, en_stock = true, origen_carpeta, categoria } = producto;
  
  const imagenesStr = typeof imagenes === 'string' ? imagenes : JSON.stringify(imagenes);
  const descripcionStr = typeof descripcion_general === 'string' ? descripcion_general : JSON.stringify(descripcion_general);

  const result = await db.query(
    `INSERT INTO productos (nombre, imagenes, descripcion_general, en_stock, origen_carpeta, categoria)
     VALUES ($1, $2, $3, $4, $5, $6)
     ON CONFLICT (nombre) DO UPDATE SET
       imagenes = EXCLUDED.imagenes,
       descripcion_general = EXCLUDED.descripcion_general,
       en_stock = EXCLUDED.en_stock,
       origen_carpeta = EXCLUDED.origen_carpeta,
       categoria = EXCLUDED.categoria
     RETURNING id`,
    [nombre, imagenesStr, descripcionStr, en_stock ? 1 : 0, origen_carpeta || null, categoria || 'Sin categoría']
  );
  return result.rows[0].id;
}

export async function updateProducto(id: number, producto: any): Promise<void> {
  const { nombre, categoria, imagenes, descripcion_general, en_stock } = producto;
  await db.query(
    'UPDATE productos SET nombre = $1, categoria = $2, imagenes = $3, descripcion_general = $4, en_stock = $5 WHERE id = $6',
    [nombre, categoria || 'Sin categoría', JSON.stringify(imagenes), JSON.stringify(descripcion_general), en_stock ? 1 : 0, id]
  );
}

export async function deleteProducto(nombre: string): Promise<void> {
  await db.query('DELETE FROM productos WHERE nombre = $1', [nombre]);
}

export async function toggleStock(id: number): Promise<void> {
  await db.query('UPDATE productos SET en_stock = 1 - en_stock WHERE id = $1', [id]);
}

export async function getAdminByUsername(username: string): Promise<any | null> {
  const result = await db.query('SELECT * FROM admins WHERE username = $1', [username]);
  return result.rows[0] || null;
}

export async function verifyPassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
  try {
    return await bcrypt.compare(plainPassword, hashedPassword);
  } catch (error) {
    console.error('Error comparing passwords:', error);
    return false;
  }
}