"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const db_1 = require("./db");
const CATALOGO_PATH = path_1.default.join(__dirname, '../../Frontend/src/Data/catalogo_productos.json');
async function importProducts() {
    try {
        console.log('Importing products from JSON...');
        const data = fs_1.default.readFileSync(CATALOGO_PATH, 'utf8');
        const catalogo = JSON.parse(data);
        for (const producto of catalogo.productos) {
            const { nombre, imagenes, contenido } = producto;
            await (0, db_1.insertProducto)({
                nombre,
                imagenes: JSON.stringify(imagenes),
                descripcion_general: JSON.stringify(contenido),
                en_stock: true
            });
            console.log(`Imported: ${nombre}`);
        }
        console.log('Import completed successfully!');
    }
    catch (error) {
        console.error('Error importing products:', error);
    }
}
importProducts();
