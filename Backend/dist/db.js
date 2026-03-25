"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.db = void 0;
exports.getProductoByNombre = getProductoByNombre;
exports.getProductoById = getProductoById;
exports.getAllProductos = getAllProductos;
exports.insertProducto = insertProducto;
exports.updateProducto = updateProducto;
exports.deleteProducto = deleteProducto;
exports.toggleStock = toggleStock;
exports.getAdminByUsername = getAdminByUsername;
exports.verifyPassword = verifyPassword;
const pg_1 = require("pg");
const bcrypt_1 = __importDefault(require("bcrypt"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';
exports.db = new pg_1.Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production'
        ? { rejectUnauthorized: false }
        : false
});
async function initDB() {
    await exports.db.query(`
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
    await exports.db.query(`
    CREATE TABLE IF NOT EXISTS admins (
      id SERIAL PRIMARY KEY,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      email TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
    const result = await exports.db.query('SELECT id FROM admins WHERE username = $1', [ADMIN_USERNAME]);
    if (result.rows.length === 0) {
        const hashedPassword = await bcrypt_1.default.hash(ADMIN_PASSWORD, 10);
        await exports.db.query('INSERT INTO admins (username, password, email) VALUES ($1, $2, $3)', [ADMIN_USERNAME, hashedPassword, 'admin@ingenia.com']);
        console.log('✅ Admin creado:', ADMIN_USERNAME);
    }
    else {
        console.log('ℹ️ Admin ya existe');
    }
}
initDB().catch(console.error);
async function getProductoByNombre(nombre) {
    const result = await exports.db.query('SELECT * FROM productos WHERE nombre = $1', [nombre]);
    return result.rows[0] || null;
}
async function getProductoById(id) {
    const result = await exports.db.query('SELECT * FROM productos WHERE id = $1', [id]);
    return result.rows[0] || null;
}
async function getAllProductos() {
    const result = await exports.db.query('SELECT * FROM productos');
    return result.rows;
}
async function insertProducto(producto) {
    const { nombre, imagenes, descripcion_general, en_stock = true, origen_carpeta, categoria } = producto;
    const result = await exports.db.query(`INSERT INTO productos (nombre, imagenes, descripcion_general, en_stock, origen_carpeta, categoria)
     VALUES ($1, $2, $3, $4, $5, $6)
     ON CONFLICT (nombre) DO UPDATE SET
       imagenes = EXCLUDED.imagenes,
       descripcion_general = EXCLUDED.descripcion_general,
       en_stock = EXCLUDED.en_stock,
       origen_carpeta = EXCLUDED.origen_carpeta,
       categoria = EXCLUDED.categoria
     RETURNING id`, [
        nombre,
        JSON.stringify(imagenes),
        JSON.stringify(descripcion_general),
        en_stock ? 1 : 0,
        origen_carpeta || null,
        categoria || 'Sin categoría'
    ]);
    return result.rows[0].id;
}
async function updateProducto(id, producto) {
    const { nombre, categoria, imagenes, descripcion_general, en_stock } = producto;
    await exports.db.query('UPDATE productos SET nombre = $1, categoria = $2, imagenes = $3, descripcion_general = $4, en_stock = $5 WHERE id = $6', [nombre, categoria || 'Sin categoría', JSON.stringify(imagenes), JSON.stringify(descripcion_general), en_stock ? 1 : 0, id]);
}
async function deleteProducto(nombre) {
    await exports.db.query('DELETE FROM productos WHERE nombre = $1', [nombre]);
}
async function toggleStock(id) {
    await exports.db.query('UPDATE productos SET en_stock = 1 - en_stock WHERE id = $1', [id]);
}
async function getAdminByUsername(username) {
    const result = await exports.db.query('SELECT * FROM admins WHERE username = $1', [username]);
    return result.rows[0] || null;
}
async function verifyPassword(plainPassword, hashedPassword) {
    try {
        return await bcrypt_1.default.compare(plainPassword, hashedPassword);
    }
    catch (error) {
        console.error('Error comparing passwords:', error);
        return false;
    }
}
