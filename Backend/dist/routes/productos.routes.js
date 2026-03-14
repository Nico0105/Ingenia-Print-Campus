"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const multer_1 = __importDefault(require("multer"));
const db_1 = require("../db");
const router = (0, express_1.Router)();
const PRODUCTOS_BASE = path_1.default.join(__dirname, "../uploads/Productos");
const CATALOGO_PATH = path_1.default.join(__dirname, "../data/catalogo_productos.json");
const BASE_URL = "http://localhost:5000";
const IMAGE_EXTENSIONS = /\.(jpg|jpeg|png|webp|gif)$/i;
const upload = (0, multer_1.default)({ dest: path_1.default.join(__dirname, "../uploads/temp") });
function loadCatalogo() {
    // Return array of products from DB
    // Since it's async, we'll handle in buildProducts
    return [];
}
async function loadCatalogoAsync() {
    try {
        const productos = await (0, db_1.getAllProductos)();
        return productos.map(p => ({
            nombre: p.nombre,
            imagenes: JSON.parse(p.imagenes || '[]'),
            descripcion_general: JSON.parse(p.descripcion_general || '{}'),
            en_stock: p.en_stock === 1
        }));
    }
    catch (err) {
        console.error('Error loading catalogo:', err);
        return [];
    }
}
function saveCatalogo(productos) {
    // Not needed anymore, saving individually
}
async function findContenido(nombre) {
    try {
        const producto = await (0, db_1.getProductoByNombre)(nombre);
        if (producto) {
            return {
                ...JSON.parse(producto.descripcion_general || '{}'),
                en_stock: producto.en_stock === 1
            };
        }
        return null;
    }
    catch (err) {
        console.error('Error finding contenido:', err);
        return null;
    }
}
function isDirectory(fullPath) {
    return fs_1.default.statSync(fullPath).isDirectory();
}
function getImages(productoPath, categoria, subcategoria, nombreProducto) {
    const archivos = fs_1.default.readdirSync(productoPath);
    return archivos
        .filter((f) => IMAGE_EXTENSIONS.test(f))
        .map((img) => {
        if (subcategoria) {
            return `${BASE_URL}/uploads/Productos/${encodeURIComponent(categoria)}/${encodeURIComponent(subcategoria)}/${encodeURIComponent(nombreProducto)}/${encodeURIComponent(img)}`;
        }
        return `${BASE_URL}/uploads/Productos/${encodeURIComponent(categoria)}/${encodeURIComponent(nombreProducto)}/${encodeURIComponent(img)}`;
    });
}
async function buildProducts() {
    const products = [];
    let id = 1;
    // const catalogo = loadCatalogo();
    const categorias = fs_1.default
        .readdirSync(PRODUCTOS_BASE)
        .filter((f) => isDirectory(path_1.default.join(PRODUCTOS_BASE, f)));
    for (const categoria of categorias) {
        const categoriaPath = path_1.default.join(PRODUCTOS_BASE, categoria);
        const nivel2 = fs_1.default
            .readdirSync(categoriaPath)
            .filter((f) => isDirectory(path_1.default.join(categoriaPath, f)));
        for (const nivel2Item of nivel2) {
            const nivel2Path = path_1.default.join(categoriaPath, nivel2Item);
            const nivel2Contents = fs_1.default.readdirSync(nivel2Path);
            const tieneImagenes = nivel2Contents.some((f) => IMAGE_EXTENSIONS.test(f));
            const subcarpetas = nivel2Contents.filter((f) => isDirectory(path_1.default.join(nivel2Path, f)));
            if (tieneImagenes || subcarpetas.length === 0) {
                // Caso simple: Accesorios, Filamentos, etc.
                const imagenes = getImages(nivel2Path, categoria, null, nivel2Item);
                const contenido = await findContenido(nivel2Item);
                products.push({
                    id: id++,
                    nombre: nivel2Item,
                    categoria,
                    subcategoria: null,
                    imagenes,
                    contenido,
                    en_stock: contenido?.en_stock ?? true,
                });
            }
            else {
                // Caso con subcarpeta de marca: Impresoras FDM/Bambu Lab/ o /Creality/
                for (const nombreProducto of subcarpetas) {
                    if (nombreProducto.startsWith("(NO SUBIR)"))
                        continue;
                    const productoPath = path_1.default.join(nivel2Path, nombreProducto);
                    const imagenes = getImages(productoPath, categoria, nivel2Item, nombreProducto);
                    const contenido = await findContenido(nombreProducto);
                    products.push({
                        id: id++,
                        nombre: nombreProducto,
                        categoria,
                        subcategoria: nivel2Item,
                        imagenes,
                        contenido,
                        en_stock: contenido?.en_stock ?? true,
                    });
                }
            }
        }
    }
    return products;
}
// GET /api/products
router.get("/", async (req, res) => {
    try {
        const products = await buildProducts();
        res.json(products);
    }
    catch (error) {
        console.error("Error en buildProducts:", error);
        res.status(500).json({ error: "Error leyendo productos" });
    }
});
// GET /api/products/:id
router.get("/:id", async (req, res) => {
    try {
        const id = parseInt(req.params.id, 10);
        if (isNaN(id)) {
            res.status(400).json({ error: "ID inválido" });
            return;
        }
        const products = await buildProducts();
        const product = products.find((p) => p.id === id);
        if (!product) {
            res.status(404).json({ error: "Producto no encontrado" });
            return;
        }
        res.json(product);
    }
    catch (error) {
        res.status(500).json({ error: "Error leyendo producto" });
    }
});
// POST /api/products - Crear producto
router.post("/", upload.array('imagenes'), async (req, res) => {
    try {
        let { nombre, categoria, subcategoria, titulo, especificaciones, materiales_compatibles, ideal_para } = req.body;
        if (!nombre) {
            res.status(400).json({ error: "Nombre requerido" });
            return;
        }
        categoria = categoria || "Impresoras FDM";
        if (categoria === "Impresoras FDM" && !subcategoria) {
            subcategoria = "Otros";
        }
        const files = req.files;
        const imagenes = [];
        // Mover archivos a la carpeta del producto
        const categoriaDir = categoria;
        const productDir = subcategoria
            ? path_1.default.join(PRODUCTOS_BASE, categoriaDir, subcategoria, nombre)
            : path_1.default.join(PRODUCTOS_BASE, categoriaDir, nombre);
        if (!fs_1.default.existsSync(productDir)) {
            fs_1.default.mkdirSync(productDir, { recursive: true });
        }
        if (files) {
            for (const file of files) {
                const ext = path_1.default.extname(file.originalname);
                const newName = `${Date.now()}_${file.originalname}`;
                const newPath = path_1.default.join(productDir, newName);
                fs_1.default.renameSync(file.path, newPath);
                imagenes.push(newName);
            }
        }
        const catalogo = await loadCatalogoAsync();
        const newProduct = {
            nombre,
            imagenes,
            descripcion_general: {
                titulo,
                especificaciones: JSON.parse(especificaciones || "{}"),
                materiales_compatibles: JSON.parse(materiales_compatibles || "[]"),
                ideal_para: JSON.parse(ideal_para || "[]")
            }
        };
        // catalogo.push(newProduct);
        // saveCatalogo(catalogo);
        await (0, db_1.insertProducto)(newProduct);
        res.status(201).json({ message: "Producto creado" });
    }
    catch (error) {
        console.error("Error creando producto:", error);
        res.status(500).json({ error: "Error creando producto" });
    }
});
// PUT /api/products/:id - Editar producto
router.put("/:id", upload.array('imagenes'), async (req, res) => {
    try {
        const id = parseInt(req.params.id, 10);
        if (isNaN(id)) {
            res.status(400).json({ error: "ID inválido" });
            return;
        }
        const { nombre, categoria, subcategoria, titulo, especificaciones, materiales_compatibles, ideal_para } = req.body;
        const files = req.files;
        const products = await buildProducts();
        const product = products.find((p) => p.id === id);
        if (!product) {
            res.status(404).json({ error: "Producto no encontrado" });
            return;
        }
        // Get current product from DB
        const currentProducto = await (0, db_1.getProductoByNombre)(product.nombre);
        if (!currentProducto) {
            res.status(404).json({ error: "Producto no encontrado en DB" });
            return;
        }
        // Manejar nuevas imágenes
        let imagenes = JSON.parse(currentProducto.imagenes || '[]');
        if (files && files.length > 0) {
            const categoriaDir = categoria || "Impresoras FDM";
            const productDir = subcategoria
                ? path_1.default.join(PRODUCTOS_BASE, categoriaDir, subcategoria, nombre)
                : path_1.default.join(PRODUCTOS_BASE, categoriaDir, nombre);
            if (!fs_1.default.existsSync(productDir)) {
                fs_1.default.mkdirSync(productDir, { recursive: true });
            }
            for (const file of files) {
                const ext = path_1.default.extname(file.originalname);
                const newName = `${Date.now()}_${file.originalname}`;
                const newPath = path_1.default.join(productDir, newName);
                fs_1.default.renameSync(file.path, newPath);
                imagenes.push(newName);
            }
        }
        const updatedProduct = {
            nombre: nombre || currentProducto.nombre,
            imagenes,
            descripcion_general: {
                titulo: titulo || JSON.parse(currentProducto.descripcion_general || '{}').titulo,
                especificaciones: especificaciones ? JSON.parse(especificaciones) : JSON.parse(currentProducto.descripcion_general || '{}').especificaciones || {},
                materiales_compatibles: materiales_compatibles ? JSON.parse(materiales_compatibles) : JSON.parse(currentProducto.descripcion_general || '{}').materiales_compatibles || [],
                ideal_para: ideal_para ? JSON.parse(ideal_para) : JSON.parse(currentProducto.descripcion_general || '{}').ideal_para || []
            }
        };
        await (0, db_1.updateProducto)(product.nombre, updatedProduct);
        res.json({ message: "Producto actualizado" });
    }
    catch (error) {
        console.error("Error actualizando producto:", error);
        res.status(500).json({ error: "Error actualizando producto" });
    }
});
// PUT /api/products/:id/stock - Toggle stock
router.put("/:id/stock", async (req, res) => {
    try {
        const id = parseInt(req.params.id, 10);
        if (isNaN(id)) {
            res.status(400).json({ error: "ID inválido" });
            return;
        }
        const products = await buildProducts();
        const product = products.find((p) => p.id === id);
        if (!product) {
            res.status(404).json({ error: "Producto no encontrado" });
            return;
        }
        await (0, db_1.toggleStock)(product.nombre);
        res.json({ message: "Stock actualizado" });
    }
    catch (error) {
        console.error("Error actualizando stock:", error);
        res.status(500).json({ error: "Error actualizando stock" });
    }
});
// DELETE /api/products/:id - Eliminar producto
router.delete("/:id", async (req, res) => {
    try {
        const id = parseInt(req.params.id, 10);
        if (isNaN(id)) {
            res.status(400).json({ error: "ID inválido" });
            return;
        }
        const products = await buildProducts();
        const product = products.find((p) => p.id === id);
        if (!product) {
            res.status(404).json({ error: "Producto no encontrado" });
            return;
        }
        await (0, db_1.deleteProducto)(product.nombre);
        res.json({ message: "Producto eliminado" });
    }
    catch (error) {
        console.error("Error eliminando producto:", error);
        res.status(500).json({ error: "Error eliminando producto" });
    }
});
exports.default = router;
