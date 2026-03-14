"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getProductoByNombre = getProductoByNombre;
exports.getAllProductos = getAllProductos;
exports.insertProducto = insertProducto;
exports.updateProducto = updateProducto;
exports.deleteProducto = deleteProducto;
exports.toggleStock = toggleStock;
const sqlite3_1 = __importDefault(require("sqlite3"));
const path_1 = __importDefault(require("path"));
const DB_PATH = path_1.default.join(__dirname, '../data/productos.db');
const db = new sqlite3_1.default.Database(DB_PATH, (err) => {
    if (err) {
        console.error('Error opening database:', err.message);
    }
    else {
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
      en_stock INTEGER DEFAULT 1
    )
  `);
}
function getProductoByNombre(nombre) {
    return new Promise((resolve, reject) => {
        db.get('SELECT * FROM productos WHERE nombre = ?', [nombre], (err, row) => {
            if (err)
                reject(err);
            else
                resolve(row || null);
        });
    });
}
function getAllProductos() {
    return new Promise((resolve, reject) => {
        db.all('SELECT * FROM productos', [], (err, rows) => {
            if (err)
                reject(err);
            else
                resolve(rows || []);
        });
    });
}
function insertProducto(producto) {
    return new Promise((resolve, reject) => {
        const { nombre, imagenes, descripcion_general, en_stock = true } = producto;
        db.run('INSERT OR REPLACE INTO productos (nombre, imagenes, descripcion_general, en_stock) VALUES (?, ?, ?, ?)', [nombre, JSON.stringify(imagenes), JSON.stringify(descripcion_general), en_stock ? 1 : 0], function (err) {
            if (err)
                reject(err);
            else
                resolve(this.lastID);
        });
    });
}
function updateProducto(nombre, producto) {
    return new Promise((resolve, reject) => {
        const { imagenes, descripcion_general, en_stock } = producto;
        db.run('UPDATE productos SET imagenes = ?, descripcion_general = ?, en_stock = ? WHERE nombre = ?', [JSON.stringify(imagenes), JSON.stringify(descripcion_general), en_stock ? 1 : 0, nombre], (err) => {
            if (err)
                reject(err);
            else
                resolve();
        });
    });
}
function deleteProducto(nombre) {
    return new Promise((resolve, reject) => {
        db.run('DELETE FROM productos WHERE nombre = ?', [nombre], (err) => {
            if (err)
                reject(err);
            else
                resolve();
        });
    });
}
function toggleStock(nombre) {
    return new Promise((resolve, reject) => {
        db.run('UPDATE productos SET en_stock = 1 - en_stock WHERE nombre = ?', [nombre], (err) => {
            if (err)
                reject(err);
            else
                resolve();
        });
    });
}
