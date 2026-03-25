"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const multer_1 = __importDefault(require("multer"));
const mammoth_1 = __importDefault(require("mammoth"));
const db_1 = require("../db");
const router = (0, express_1.Router)();
const PRODUCTOS_BASE = path_1.default.join(__dirname, "../uploads/Productos");
const BASE_URL = process.env.BASE_URL || "http://localhost:5000";
const IMAGE_EXTENSIONS = /\.(jpg|jpeg|png|webp|gif)$/i;
// ✅ Normaliza quitando espacios, mayúsculas Y acentos para comparaciones robustas
const normalizeName = (name) => name
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
const upload = (0, multer_1.default)({ dest: path_1.default.join(__dirname, "../uploads/temp") });
async function getDescripcionFromDocx(productPath) {
    try {
        const descPath = path_1.default.join(productPath, 'Descripción.docx');
        if (!fs_1.default.existsSync(descPath))
            return null;
        const result = await mammoth_1.default.extractRawText({ path: descPath });
        const text = result.value;
        if (!text || text.trim().length === 0)
            return null;
        const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
        let titulo = lines[0] || '';
        let especificaciones = {};
        let materiales_compatibles = [];
        let ideal_para = [];
        let currentSection = '';
        for (const line of lines) {
            const lowerLine = line.toLowerCase();
            if (lowerLine.includes('especificacion') || lowerLine.includes('caracteristica') || lowerLine.includes('spec')) {
                currentSection = 'especificaciones';
            }
            else if (lowerLine.includes('material') || lowerLine.includes('filamento')) {
                currentSection = 'materiales';
            }
            else if (lowerLine.includes('ideal') || lowerLine.includes('para') || lowerLine.includes('uso')) {
                currentSection = 'ideal';
            }
            else if (currentSection === 'especificaciones' && line.includes(':')) {
                const [key, ...valueParts] = line.split(':');
                if (key && valueParts.length > 0) {
                    especificaciones[key.trim()] = valueParts.join(':').trim();
                }
            }
            else if (currentSection === 'materiales' && line.length > 2) {
                materiales_compatibles.push(line);
            }
            else if (currentSection === 'ideal' && line.length > 2) {
                ideal_para.push(line);
            }
        }
        return { titulo, especificaciones, materiales_compatibles, ideal_para };
    }
    catch (err) {
        console.error('Error reading docx:', err);
        return null;
    }
}
function getCategoriesFromFolders() {
    const categories = [];
    if (!fs_1.default.existsSync(PRODUCTOS_BASE))
        return categories;
    const mainCategoryMap = {
        'Impresoras FDM': 'Impresoras FDM',
        'Impresoras de resina': 'Impresoras de resina',
        'Grabadoras Láser': 'Grabadoras Láser',
        'Filamentos': 'Filamentos',
        'Accesorios': 'Accesorios'
    };
    const mainFolders = fs_1.default.readdirSync(PRODUCTOS_BASE);
    for (const mainFolder of mainFolders) {
        if (!mainCategoryMap[mainFolder])
            continue;
        const mainPath = path_1.default.join(PRODUCTOS_BASE, mainFolder);
        if (!fs_1.default.statSync(mainPath).isDirectory())
            continue;
        const findFoldersWithImages = (dirPath, relativePath) => {
            const items = fs_1.default.readdirSync(dirPath);
            const files = items.filter(item => !fs_1.default.statSync(path_1.default.join(dirPath, item)).isDirectory());
            const hasImages = files.some(f => IMAGE_EXTENSIONS.test(f));
            if (hasImages) {
                categories.push({ categoria: mainFolder, subcarpeta: relativePath, fullPath: dirPath });
            }
            else {
                const dirs = items.filter(item => fs_1.default.statSync(path_1.default.join(dirPath, item)).isDirectory());
                for (const dir of dirs) {
                    findFoldersWithImages(path_1.default.join(dirPath, dir), path_1.default.join(relativePath, dir));
                }
            }
        };
        findFoldersWithImages(mainPath, '');
    }
    return categories;
}
function getProductImages(categoria, subcarpeta, fullPath) {
    let productPath;
    if (fullPath && fs_1.default.existsSync(fullPath)) {
        productPath = fullPath;
    }
    else {
        productPath = path_1.default.join(PRODUCTOS_BASE, categoria, subcarpeta);
    }
    if (!fs_1.default.existsSync(productPath))
        return [];
    const files = fs_1.default.readdirSync(productPath);
    return files
        .filter(file => IMAGE_EXTENSIONS.test(file))
        .map(file => {
        const relativePath = path_1.default.relative(PRODUCTOS_BASE, path_1.default.join(productPath, file));
        return `${BASE_URL}/uploads/Productos/${relativePath.replace(/\\/g, '/')}`;
    });
}
const categoryDisplayNames = {
    'Impresoras FDM': 'Impresoras FDM',
    'Impresoras de resina': 'Impresoras de Resina',
    'Grabadoras Láser': 'Grabadoras Láser',
    'Filamentos': 'Filamentos',
    'Accesorios': 'Accesorios'
};
async function buildProducts() {
    try {
        const folderProducts = getCategoriesFromFolders();
        console.log('Folder products found:', folderProducts.length);
        const dbProducts = await (0, db_1.getAllProductos)();
        const dbProductsMap = new Map(dbProducts.map(p => [p.nombre, p]));
        // ✅ Normalizar origen_carpeta con normalizeName (quita acentos + mayúsculas)
        const adoptedFoldersMap = new Map();
        for (const p of dbProducts) {
            if (p.origen_carpeta) {
                adoptedFoldersMap.set(normalizeName(p.origen_carpeta), p);
            }
        }
        console.log('Adopted folders:', adoptedFoldersMap.size);
        const usedIds = new Set();
        const folderProductsResolved = await Promise.all(folderProducts.map(async (item, index) => {
            const folderPath = `${item.categoria}/${item.subcarpeta}`;
            // ✅ Usar normalizeName en vez de .toLowerCase() para que matchee correctamente
            const normalizedFolderPath = normalizeName(folderPath);
            const folderName = item.subcarpeta.split(/[\\/]/).pop() || item.subcarpeta;
            const normalizedFolder = normalizeName(folderName);
            if (adoptedFoldersMap.has(normalizedFolderPath)) {
                const adoptedDbProduct = adoptedFoldersMap.get(normalizedFolderPath);
                usedIds.add(adoptedDbProduct.id);
                console.log('Skipping adopted folder:', folderPath, '- using DB product ID:', adoptedDbProduct.id);
                return null;
            }
            let dbProduct = dbProductsMap.get(folderName);
            if (!dbProduct) {
                for (const [name, product] of dbProductsMap) {
                    if (normalizeName(name) === normalizedFolder) {
                        dbProduct = product;
                        console.log('Found match (normalized):', folderName, '=', name);
                        break;
                    }
                }
            }
            const images = getProductImages(item.categoria, item.subcarpeta, item.fullPath);
            let contenido = {};
            if (dbProduct && dbProduct.descripcion_general) {
                try {
                    const parsed = JSON.parse(dbProduct.descripcion_general);
                    if (parsed && (parsed.titulo || parsed.especificaciones)) {
                        contenido = parsed;
                    }
                }
                catch { }
            }
            if (!contenido || (!contenido.titulo && Object.keys(contenido).length === 0)) {
                const docxContent = await getDescripcionFromDocx(item.fullPath);
                if (docxContent)
                    contenido = docxContent;
            }
            let productId;
            let productName = folderName;
            if (dbProduct && dbProduct.id && !usedIds.has(dbProduct.id)) {
                productId = dbProduct.id;
                usedIds.add(productId);
                productName = dbProduct.nombre || folderName;
            }
            else {
                productId = 1000 + index;
                while (usedIds.has(productId))
                    productId++;
                usedIds.add(productId);
            }
            return {
                id: productId,
                nombre: productName,
                categoria: categoryDisplayNames[item.categoria] || item.categoria,
                subcategoria: null,
                imagenes: images.length > 0 ? images : [`${BASE_URL}/images/Logo.png`],
                contenido,
                en_stock: dbProduct ? dbProduct.en_stock === 1 : true,
            };
        }));
        // Filtrar nulls (carpetas adoptadas)
        const filteredProducts = folderProductsResolved.filter(p => p !== null);
        // ✅ Trackear IDs ya agregados para evitar duplicados
        const alreadyAddedIds = new Set(filteredProducts.map(p => p.id));
        // Agregar productos de DB que no están en filteredProducts todavía
        for (const dbProduct of dbProducts) {
            if (alreadyAddedIds.has(dbProduct.id))
                continue;
            let contenido = {};
            if (dbProduct.descripcion_general) {
                try {
                    contenido = JSON.parse(dbProduct.descripcion_general);
                }
                catch { }
            }
            let imagenes = [];
            try {
                imagenes = dbProduct.imagenes ? JSON.parse(dbProduct.imagenes) : [];
                if (!Array.isArray(imagenes))
                    imagenes = [];
            }
            catch {
                imagenes = [];
            }
            if (dbProduct.origen_carpeta) {
                const folderCategory = dbProduct.origen_carpeta.split('/')[0];
                filteredProducts.push({
                    id: dbProduct.id,
                    nombre: dbProduct.nombre,
                    categoria: folderCategory || dbProduct.categoria || 'Sin categoría',
                    subcategoria: null,
                    imagenes: imagenes.length > 0 ? imagenes : [`${BASE_URL}/images/Logo.png`],
                    contenido,
                    en_stock: dbProduct.en_stock === 1,
                });
            }
            else {
                filteredProducts.push({
                    id: dbProduct.id,
                    nombre: dbProduct.nombre,
                    categoria: dbProduct.categoria || 'Sin categoría',
                    subcategoria: null,
                    imagenes: imagenes.length > 0 ? imagenes : [`${BASE_URL}/images/Logo.png`],
                    contenido,
                    en_stock: dbProduct.en_stock === 1,
                });
            }
            alreadyAddedIds.add(dbProduct.id);
        }
        return filteredProducts; // ✅ siempre retornar filteredProducts
    }
    catch (err) {
        console.error('Error en buildProducts:', err);
        return [];
    }
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
        const validProducts = products.filter(p => p && p.id);
        const product = validProducts.find((p) => p.id === id);
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
        const productDir = subcategoria
            ? path_1.default.join(PRODUCTOS_BASE, categoria, subcategoria, nombre)
            : path_1.default.join(PRODUCTOS_BASE, categoria, nombre);
        if (!fs_1.default.existsSync(productDir)) {
            fs_1.default.mkdirSync(productDir, { recursive: true });
        }
        if (files) {
            for (const file of files) {
                const newName = `${Date.now()}_${file.originalname}`;
                const newPath = path_1.default.join(productDir, newName);
                fs_1.default.renameSync(file.path, newPath);
                imagenes.push(newName);
            }
        }
        await (0, db_1.insertProducto)({
            nombre,
            categoria,
            imagenes: JSON.stringify(imagenes),
            descripcion_general: JSON.stringify({
                titulo,
                especificaciones: JSON.parse(especificaciones || "{}"),
                materiales_compatibles: JSON.parse(materiales_compatibles || "[]"),
                ideal_para: JSON.parse(ideal_para || "[]")
            })
        });
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
        let currentProducto = await (0, db_1.getProductoById)(id);
        let dbId = id;
        if (!currentProducto && id >= 1000) {
            const products = await buildProducts();
            if (!products || products.length === 0) {
                return res.status(404).json({ error: 'Producto no encontrado' });
            }
            const folderProduct = products.find((p) => p && p.id === id);
            if (folderProduct) {
                const dbProducts = await (0, db_1.getAllProductos)();
                const existingDbProduct = dbProducts.find((p) => normalizeName(p.nombre || '') === normalizeName(folderProduct.nombre));
                if (existingDbProduct) {
                    dbId = existingDbProduct.id;
                    currentProducto = existingDbProduct;
                    console.log('Producto ya existe en DB con ID:', dbId);
                }
                else {
                    // ✅ origen_carpeta usando la categoria REAL de la carpeta (no el display name)
                    const folderProductsList = getCategoriesFromFolders();
                    const folderItem = folderProductsList.find(item => {
                        const fn = item.subcarpeta.split(/[\\/]/).pop() || item.subcarpeta;
                        return normalizeName(fn) === normalizeName(folderProduct.nombre);
                    });
                    const origenCarpeta = folderItem
                        ? `${folderItem.categoria}/${folderItem.subcarpeta}`
                        : `${folderProduct.categoria}/${folderProduct.nombre}`;
                    const newDbId = await (0, db_1.insertProducto)({
                        nombre: folderProduct.nombre,
                        categoria: folderProduct.categoria,
                        imagenes: folderProduct.imagenes,
                        descripcion_general: JSON.stringify(folderProduct.contenido || {}),
                        en_stock: folderProduct.en_stock,
                        origen_carpeta: origenCarpeta
                    });
                    dbId = newDbId;
                    currentProducto = await (0, db_1.getProductoById)(newDbId);
                    console.log('Creado producto en DB con ID:', newDbId, 'origen:', origenCarpeta);
                }
            }
        }
        if (!currentProducto) {
            res.status(404).json({ error: "Producto no encontrado" });
            return;
        }
        let imagenes = [];
        try {
            imagenes = JSON.parse(currentProducto.imagenes || '[]');
            if (!Array.isArray(imagenes))
                imagenes = [];
        }
        catch {
            imagenes = [];
        }
        if (files && files.length > 0) {
            const categoriaDir = categoria || currentProducto.categoria || "Impresoras FDM";
            const productDir = subcategoria
                ? path_1.default.join(PRODUCTOS_BASE, categoriaDir, subcategoria, nombre || currentProducto.nombre)
                : path_1.default.join(PRODUCTOS_BASE, categoriaDir, nombre || currentProducto.nombre);
            if (!fs_1.default.existsSync(productDir)) {
                fs_1.default.mkdirSync(productDir, { recursive: true });
            }
            for (const file of files) {
                const newName = `${Date.now()}_${file.originalname}`;
                const targetPath = path_1.default.join(productDir, newName);
                fs_1.default.renameSync(file.path, targetPath);
                imagenes.push(newName);
            }
        }
        const updatedProduct = {
            nombre: nombre || currentProducto.nombre,
            categoria: categoria || currentProducto.categoria,
            imagenes,
            en_stock: currentProducto.en_stock,
            descripcion_general: {
                titulo: titulo || (JSON.parse(currentProducto.descripcion_general || '{}').titulo) || '',
                especificaciones: (() => {
                    try {
                        return especificaciones ? JSON.parse(especificaciones) : (JSON.parse(currentProducto.descripcion_general || '{}').especificaciones || {});
                    }
                    catch {
                        return {};
                    }
                })(),
                materiales_compatibles: (() => {
                    try {
                        return materiales_compatibles ? JSON.parse(materiales_compatibles) : (JSON.parse(currentProducto.descripcion_general || '{}').materiales_compatibles || []);
                    }
                    catch {
                        return [];
                    }
                })(),
                ideal_para: (() => {
                    try {
                        return ideal_para ? JSON.parse(ideal_para) : (JSON.parse(currentProducto.descripcion_general || '{}').ideal_para || []);
                    }
                    catch {
                        return [];
                    }
                })()
            }
        };
        await (0, db_1.updateProducto)(dbId, updatedProduct);
        res.json({ message: "Producto actualizado" });
    }
    catch (error) {
        console.error("Error actualizando producto:", error);
        res.status(500).json({ error: "Error actualizando producto: " + error.message });
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
        const validProducts = products.filter(p => p && p.id);
        const product = validProducts.find((p) => p.id === id);
        if (!product) {
            res.status(404).json({ error: "Producto no encontrado" });
            return;
        }
        let dbProduct = await (0, db_1.getProductoById)(id);
        if (!dbProduct) {
            // ✅ origen_carpeta con categoria real de la carpeta
            const folderProductsList = getCategoriesFromFolders();
            const folderItem = folderProductsList.find(item => {
                const fn = item.subcarpeta.split(/[\\/]/).pop() || item.subcarpeta;
                return normalizeName(fn) === normalizeName(product.nombre);
            });
            const origenCarpeta = folderItem
                ? `${folderItem.categoria}/${folderItem.subcarpeta}`
                : `${product.categoria}/${product.nombre}`;
            const newDbId = await (0, db_1.insertProducto)({
                nombre: product.nombre,
                categoria: product.categoria,
                imagenes: JSON.stringify(product.imagenes),
                descripcion_general: JSON.stringify(product.contenido || {}),
                en_stock: product.en_stock ? 1 : 0,
                origen_carpeta: origenCarpeta
            });
            dbProduct = await (0, db_1.getProductoById)(newDbId);
        }
        if (!dbProduct) {
            res.status(500).json({ error: "Error creando producto en base de datos" });
            return;
        }
        // ✅ toggleStock por ID
        await (0, db_1.toggleStock)(dbProduct.id);
        res.json({ message: "Stock actualizado" });
    }
    catch (error) {
        console.error("Error actualizando stock:", error);
        res.status(500).json({ error: "Error actualizando stock" });
    }
});
function deleteProductFolder(nombre, categoria) {
    try {
        const categorias = ['Impresoras FDM', 'Impresoras de resina', 'Grabadoras Láser', 'Filamentos', 'Accesorios'];
        for (const cat of categorias) {
            const productPath = path_1.default.join(PRODUCTOS_BASE, cat, nombre);
            if (fs_1.default.existsSync(productPath)) {
                fs_1.default.rmSync(productPath, { recursive: true, force: true });
                console.log('Carpeta eliminada:', productPath);
                return true;
            }
            const catPath = path_1.default.join(PRODUCTOS_BASE, cat);
            if (fs_1.default.existsSync(catPath)) {
                const subdirs = fs_1.default.readdirSync(catPath).filter(f => fs_1.default.statSync(path_1.default.join(catPath, f)).isDirectory());
                for (const subdir of subdirs) {
                    const subProductPath = path_1.default.join(catPath, subdir, nombre);
                    if (fs_1.default.existsSync(subProductPath)) {
                        fs_1.default.rmSync(subProductPath, { recursive: true, force: true });
                        console.log('Carpeta eliminada (subcarpeta):', subProductPath);
                        return true;
                    }
                }
            }
        }
        return false;
    }
    catch (err) {
        console.error('Error eliminando carpeta:', err);
        return false;
    }
}
// DELETE /api/products/:id
router.delete("/:id", async (req, res) => {
    try {
        const id = parseInt(req.params.id, 10);
        if (isNaN(id)) {
            res.status(400).json({ error: "ID inválido" });
            return;
        }
        const products = await buildProducts();
        const validProducts = products.filter(p => p && p.id);
        const productToDelete = validProducts.find((p) => p.id === id);
        if (!productToDelete) {
            res.status(404).json({ error: "Producto no encontrado" });
            return;
        }
        console.log('Delete - Producto encontrado:', productToDelete.nombre, 'categoría:', productToDelete.categoria);
        const dbProduct = await (0, db_1.getProductoByNombre)(productToDelete.nombre);
        if (!dbProduct) {
            console.log('Delete - Producto solo en carpeta, eliminando:', productToDelete.nombre);
            const folderDeleted = deleteProductFolder(productToDelete.nombre, productToDelete.categoria);
            if (folderDeleted) {
                res.json({ message: "Producto eliminado (carpeta)" });
            }
            else {
                res.status(404).json({ error: "Producto no encontrado en carpeta" });
            }
            return;
        }
        await (0, db_1.deleteProducto)(dbProduct.nombre);
        res.json({ message: "Producto eliminado" });
    }
    catch (error) {
        console.error("Error eliminando producto:", error);
        res.status(500).json({ error: "Error eliminando producto" });
    }
});
exports.default = router;
