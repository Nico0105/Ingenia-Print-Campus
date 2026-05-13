import { Router, Request, Response } from "express";
import fs from "fs";
import path from "path";
import { upload } from '../cloudinary';
import cloudinary from '../cloudinary';
import mammoth from "mammoth";
import { getProductoByNombre, getProductoById, getAllProductos, insertProducto, updateProducto, deleteProducto, toggleStock, toggleDestacado } from "../db";

const router = Router();

const PRODUCTOS_BASE = path.join(__dirname, "../uploads/Productos");
const BASE_URL = process.env.BASE_URL || "http://localhost:5000";
const IMAGE_EXTENSIONS = /\.(jpg|jpeg|png|webp|gif)$/i;

const normalizeName = (name: string) =>
  name
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

async function getDescripcionFromDocx(productPath: string): Promise<any | null> {
  try {
    const descPath = path.join(productPath, 'Descripción.docx');
    if (!fs.existsSync(descPath)) return null;

    const result = await mammoth.extractRawText({ path: descPath });
    const text = result.value;
    if (!text || text.trim().length === 0) return null;

    const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);

    let titulo = lines[0] || '';
    let especificaciones: Record<string, string> = {};
    let materiales_compatibles: string[] = [];
    let ideal_para: string[] = [];
    let currentSection = '';

    for (const line of lines) {
      const lowerLine = line.toLowerCase();
      if (lowerLine.includes('especificacion') || lowerLine.includes('caracteristica') || lowerLine.includes('spec')) {
        currentSection = 'especificaciones';
      } else if (lowerLine.includes('material') || lowerLine.includes('filamento')) {
        currentSection = 'materiales';
      } else if (lowerLine.includes('ideal') || lowerLine.includes('para') || lowerLine.includes('uso')) {
        currentSection = 'ideal';
      } else if (currentSection === 'especificaciones' && line.includes(':')) {
        const [key, ...valueParts] = line.split(':');
        if (key && valueParts.length > 0) {
          especificaciones[key.trim()] = valueParts.join(':').trim();
        }
      } else if (currentSection === 'materiales' && line.length > 2) {
        materiales_compatibles.push(line);
      } else if (currentSection === 'ideal' && line.length > 2) {
        ideal_para.push(line);
      }
    }

    return { titulo, especificaciones, materiales_compatibles, ideal_para };
  } catch (err) {
    console.error('Error reading docx:', err);
    return null;
  }
}

function getCategoriesFromFolders(): { categoria: string; subcarpeta: string; fullPath: string }[] {
  const categories: { categoria: string; subcarpeta: string; fullPath: string }[] = [];

  if (!fs.existsSync(PRODUCTOS_BASE)) return categories;

  const mainCategoryMap: Record<string, string> = {
    'Impresoras FDM': 'Impresoras FDM',
    'Impresoras de resina': 'Impresoras de resina',
    'Grabadoras Láser': 'Grabadoras Láser',
    'Filamentos': 'Filamentos',
    'Accesorios': 'Accesorios'
  };

  const mainFolders = fs.readdirSync(PRODUCTOS_BASE);
  for (const mainFolder of mainFolders) {
    if (!mainCategoryMap[mainFolder]) continue;

    const mainPath = path.join(PRODUCTOS_BASE, mainFolder);
    if (!fs.statSync(mainPath).isDirectory()) continue;

    const findFoldersWithImages = (dirPath: string, relativePath: string): void => {
      const items = fs.readdirSync(dirPath);
      const files = items.filter(item => !fs.statSync(path.join(dirPath, item)).isDirectory());
      const hasImages = files.some(f => IMAGE_EXTENSIONS.test(f));

      if (hasImages) {
        categories.push({ categoria: mainFolder, subcarpeta: relativePath, fullPath: dirPath });
      } else {
        const dirs = items.filter(item => fs.statSync(path.join(dirPath, item)).isDirectory());
        for (const dir of dirs) {
          findFoldersWithImages(path.join(dirPath, dir), path.join(relativePath, dir));
        }
      }
    };

    findFoldersWithImages(mainPath, '');
  }
  return categories;
}

function getProductImages(categoria: string, subcarpeta: string, fullPath?: string): string[] {
  let productPath: string;
  if (fullPath && fs.existsSync(fullPath)) {
    productPath = fullPath;
  } else {
    productPath = path.join(PRODUCTOS_BASE, categoria, subcarpeta);
  }

  if (!fs.existsSync(productPath)) return [];

  const files = fs.readdirSync(productPath);
  return files
    .filter(file => IMAGE_EXTENSIONS.test(file))
    .map(file => {
      const relativePath = path.relative(PRODUCTOS_BASE, path.join(productPath, file));
      return `${BASE_URL}/uploads/Productos/${relativePath.replace(/\\/g, '/')}`;
    });
}

const categoryDisplayNames: Record<string, string> = {
  'Impresoras FDM': 'Impresoras FDM',
  'Impresoras de resina': 'Impresoras de Resina',
  'Grabadoras Láser': 'Grabadoras Láser',
  'Filamentos': 'Filamentos',
  'Accesorios': 'Accesorios'
};

function parseImagenesAsUrls(raw: any): string[] {
  try {
    const arr = typeof raw === 'string' ? JSON.parse(raw) : raw;
    if (!Array.isArray(arr)) return [];
    return arr.map((img: any) => typeof img === 'string' ? img : img?.url).filter(Boolean);
  } catch { return []; }
}

async function buildProducts(): Promise<any[]> {
  try {
    const folderProducts = getCategoriesFromFolders();
    const dbProducts = await getAllProductos();
    const dbProductsMap = new Map(dbProducts.map(p => [p.nombre, p]));

    const adoptedFoldersMap = new Map<string, any>();
    for (const p of dbProducts) {
      if (p.origen_carpeta) {
        adoptedFoldersMap.set(normalizeName(p.origen_carpeta), p);
      }
    }

    const usedIds = new Set<number>();

    const folderProductsResolved = await Promise.all(folderProducts.map(async (item, index) => {
      const folderPath = `${item.categoria}/${item.subcarpeta}`;
      const normalizedFolderPath = normalizeName(folderPath);
      const folderName = item.subcarpeta.split(/[\\/]/).pop() || item.subcarpeta;
      const normalizedFolder = normalizeName(folderName);

      if (adoptedFoldersMap.has(normalizedFolderPath)) {
        const adoptedDbProduct = adoptedFoldersMap.get(normalizedFolderPath);
        usedIds.add(adoptedDbProduct.id);
        return null;
      }

      let dbProduct = dbProductsMap.get(folderName);
      if (!dbProduct) {
        for (const [name, product] of dbProductsMap) {
          if (normalizeName(name) === normalizedFolder) {
            dbProduct = product;
            break;
          }
        }
      }

      const images = dbProduct ? parseImagenesAsUrls(dbProduct.imagenes) : [];

      let contenido: any = {};
      if (dbProduct && dbProduct.descripcion_general) {
        try {
          let parsed = JSON.parse(dbProduct.descripcion_general);
          if (typeof parsed === 'string') parsed = JSON.parse(parsed);
          if (parsed && (parsed.titulo || parsed.especificaciones)) contenido = parsed;
        } catch {}
      }

      if (!contenido || (!contenido.titulo && Object.keys(contenido).length === 0)) {
        const docxContent = await getDescripcionFromDocx(item.fullPath);
        if (docxContent) contenido = docxContent;
      }

      let productId: number;
      let productName = folderName;

      if (dbProduct && dbProduct.id && !usedIds.has(dbProduct.id)) {
        productId = dbProduct.id;
        usedIds.add(productId);
        productName = dbProduct.nombre || folderName;
      } else {
        productId = 1000 + index;
        while (usedIds.has(productId)) productId++;
        usedIds.add(productId);
      }

      return {
        id: productId,
        nombre: productName,
        categoria: categoryDisplayNames[item.categoria] || item.categoria,
        subcategoria: dbProduct?.subcategoria || null,
        imagenes: images.length > 0 ? images : [`${BASE_URL}/images/Logo.png`],
        contenido,
        en_stock: dbProduct ? dbProduct.en_stock === 1 : true,
        destacado: dbProduct ? dbProduct.destacado === 1 : false,
      };
    }));

    const filteredProducts: any[] = folderProductsResolved.filter(p => p !== null);
    const alreadyAddedIds = new Set<number>(filteredProducts.map(p => p.id));

    for (const dbProduct of dbProducts) {
      if (alreadyAddedIds.has(dbProduct.id)) continue;

      let contenido: any = {};
      if (dbProduct.descripcion_general) {
        try { contenido = JSON.parse(dbProduct.descripcion_general); } catch {}
      }

      const imagenes = parseImagenesAsUrls(dbProduct.imagenes);

      if (dbProduct.origen_carpeta) {
        const folderCategory = dbProduct.origen_carpeta.split('/')[0];
        filteredProducts.push({
          id: dbProduct.id,
          nombre: dbProduct.nombre,
          categoria: folderCategory || dbProduct.categoria || 'Sin categoría',
          subcategoria: dbProduct.subcategoria || null,
          imagenes: imagenes.length > 0 ? imagenes : [`${BASE_URL}/images/Logo.png`],
          contenido,
          en_stock: dbProduct.en_stock === 1,
          destacado: dbProduct.destacado === 1,
        });
      } else {
        filteredProducts.push({
          id: dbProduct.id,
          nombre: dbProduct.nombre,
          categoria: dbProduct.categoria || 'Sin categoría',
          subcategoria: dbProduct.subcategoria || null,
          imagenes: imagenes.length > 0 ? imagenes : [`${BASE_URL}/images/Logo.png`],
          contenido,
          en_stock: dbProduct.en_stock === 1,
          destacado: dbProduct.destacado === 1,
        });
      }

      alreadyAddedIds.add(dbProduct.id);
    }

    return filteredProducts;
  } catch (err) {
    console.error('Error en buildProducts:', err);
    return [];
  }
}

// GET /api/products/destacados  ← DEBE ir antes de /:id
router.get("/destacados", async (req: Request, res: Response) => {
  try {
    const products = await buildProducts();
    const destacados = products.filter(p => p && p.destacado);
    res.json(destacados);
  } catch (error) {
    res.status(500).json({ error: "Error leyendo destacados" });
  }
});

// GET /api/products
router.get("/", async (req: Request, res: Response) => {
  try {
    const products = await buildProducts();
    res.json(products);
  } catch (error) {
    console.error("Error en buildProducts:", error);
    res.status(500).json({ error: "Error leyendo productos" });
  }
});

// GET /api/products/:id
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id as string, 10);
    if (isNaN(id)) { res.status(400).json({ error: "ID inválido" }); return; }

    const products = await buildProducts();
    const product = products.filter(p => p && p.id).find((p) => p.id === id);
    if (!product) { res.status(404).json({ error: "Producto no encontrado" }); return; }

    res.json(product);
  } catch (error) {
    res.status(500).json({ error: "Error leyendo producto" });
  }
});

// POST /api/products
router.post("/", upload.any(), async (req: Request, res: Response) => {
  try {
    let { nombre, categoria, subcategoria, titulo, especificaciones, materiales_compatibles, ideal_para, colores } = req.body;
    if (!nombre) { res.status(400).json({ error: "Nombre requerido" }); return; }

    categoria = categoria || "Impresoras FDM";
    if (categoria === "Impresoras FDM" && !subcategoria) subcategoria = "Otros";

    const allFiles = req.files as (Express.Multer.File & { path: string; filename: string })[];
    const imagenesFiles = allFiles.filter(f => f.fieldname === 'imagenes');
    const imagenes = imagenesFiles.map(f => ({ url: f.path, public_id: f.filename }));

    let coloresMeta: any[] = [];
    try { coloresMeta = JSON.parse(colores || '[]'); } catch { coloresMeta = []; }

    const coloresFinales = coloresMeta.map((c: any, i: number) => {
      const colorFile = allFiles.find(f => f.fieldname === `color_imagen_${i}`) as any;
      return {
        nombre: c.nombre,
        imagenUrl: colorFile ? colorFile.path : (c.imagenUrl || null),
        public_id: colorFile ? colorFile.filename : null,
      };
    });

    await insertProducto({
      nombre,
      categoria,
      subcategoria: subcategoria || null,
      imagenes: JSON.stringify(imagenes),
      descripcion_general: JSON.stringify({
        titulo,
        especificaciones: JSON.parse(especificaciones || "{}"),
        materiales_compatibles: JSON.parse(materiales_compatibles || "[]"),
        ideal_para: JSON.parse(ideal_para || "[]"),
        colores: coloresFinales,
      })
    });

    res.status(201).json({ message: "Producto creado" });
  } catch (error) {
    console.error("Error creando producto:", error);
    res.status(500).json({ error: "Error creando producto" });
  }
});

// PUT /api/products/:id
router.put("/:id", upload.any(), async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id as string, 10);
    if (isNaN(id)) { res.status(400).json({ error: "ID inválido" }); return; }

    const { nombre, categoria, subcategoria, titulo, especificaciones,
            materiales_compatibles, ideal_para, colores, imagenes_orden } = req.body;

    const allFiles = req.files as (Express.Multer.File & { path: string; filename: string })[];
    const imagenesNuevasFiles = allFiles.filter(f => f.fieldname === 'imagenes_nuevas');

    let currentProducto = await getProductoById(id);
    let dbId = id;

    if (!currentProducto && id >= 1000) {
      const products = await buildProducts();
      if (!products || products.length === 0) return res.status(404).json({ error: 'Producto no encontrado' });

      const folderProduct = products.find((p) => p && p.id === id);
      if (folderProduct) {
        const dbProducts = await getAllProductos();
        const existingDbProduct = dbProducts.find((p: any) =>
          normalizeName(p.nombre || '') === normalizeName(folderProduct.nombre)
        );

        if (existingDbProduct) {
          dbId = existingDbProduct.id;
          currentProducto = existingDbProduct;
        } else {
          const folderProductsList = getCategoriesFromFolders();
          const folderItem = folderProductsList.find(item => {
            const fn = item.subcarpeta.split(/[\\/]/).pop() || item.subcarpeta;
            return normalizeName(fn) === normalizeName(folderProduct.nombre);
          });
          const origenCarpeta = folderItem
            ? `${folderItem.categoria}/${folderItem.subcarpeta}`
            : `${folderProduct.categoria}/${folderProduct.nombre}`;

          const newDbId = await insertProducto({
            nombre: folderProduct.nombre,
            categoria: folderProduct.categoria,
            imagenes: JSON.stringify(folderProduct.imagenes.map((url: string) => ({ url, public_id: '' }))),
            descripcion_general: JSON.stringify(folderProduct.contenido || {}),
            en_stock: folderProduct.en_stock,
            origen_carpeta: origenCarpeta
          });
          dbId = newDbId;
          currentProducto = await getProductoById(newDbId);
        }
      }
    }

    if (!currentProducto) { res.status(404).json({ error: "Producto no encontrado" }); return; }

    let imagenesFinal: { url: string; public_id: string }[] = [];
    try {
      const orden: { tipo: string; url: string | null }[] = JSON.parse(imagenes_orden || '[]');
      let nuevasCursor = 0;
      for (const item of orden) {
        if (item.tipo === "existente" && item.url) {
          imagenesFinal.push({ url: item.url, public_id: '' });
        } else if (item.tipo === "nueva") {
          const file = imagenesNuevasFiles[nuevasCursor++] as any;
          if (file) imagenesFinal.push({ url: file.path, public_id: file.filename });
        }
      }
    } catch {
      try {
        const parsed = JSON.parse(currentProducto.imagenes || '[]');
        imagenesFinal = Array.isArray(parsed)
          ? parsed.map((img: any) => typeof img === 'string' ? { url: img, public_id: '' } : img)
          : [];
      } catch { imagenesFinal = []; }
    }

    let coloresMeta: any[] = [];
    try { coloresMeta = JSON.parse(colores || '[]'); } catch { coloresMeta = []; }

    const coloresFinales = coloresMeta.map((c: any, i: number) => {
      const colorFile = allFiles.find(f => f.fieldname === `color_imagen_${i}`) as any;
      return {
        nombre: c.nombre,
        imagenUrl: colorFile ? colorFile.path : (c.imagenUrl || null),
        public_id: colorFile ? colorFile.filename : null,
      };
    });

    const updatedProduct = {
      nombre: nombre || currentProducto.nombre,
      categoria: categoria || currentProducto.categoria,
      subcategoria: subcategoria ?? currentProducto.subcategoria ?? null,
      imagenes: imagenesFinal,
      en_stock: currentProducto.en_stock,
      descripcion_general: {
        titulo: titulo || (JSON.parse(currentProducto.descripcion_general || '{}').titulo) || '',
        especificaciones: (() => {
          try { return especificaciones ? JSON.parse(especificaciones) : (JSON.parse(currentProducto.descripcion_general || '{}').especificaciones || {}); }
          catch { return {}; }
        })(),
        materiales_compatibles: (() => {
          try { return materiales_compatibles ? JSON.parse(materiales_compatibles) : (JSON.parse(currentProducto.descripcion_general || '{}').materiales_compatibles || []); }
          catch { return []; }
        })(),
        ideal_para: (() => {
          try { return ideal_para ? JSON.parse(ideal_para) : (JSON.parse(currentProducto.descripcion_general || '{}').ideal_para || []); }
          catch { return []; }
        })(),
        colores: coloresFinales,
      }
    };

    await updateProducto(dbId, updatedProduct);
    res.json({ message: "Producto actualizado" });

  } catch (error) {
    console.error("Error actualizando producto:", String(error));
    res.status(500).json({ error: String(error) });
  }
});

// PUT /api/products/:id/stock
router.put("/:id/stock", async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id as string, 10);
    if (isNaN(id)) { res.status(400).json({ error: "ID inválido" }); return; }

    const products = await buildProducts();
    const product = products.filter(p => p && p.id).find((p) => p.id === id);
    if (!product) { res.status(404).json({ error: "Producto no encontrado" }); return; }

    let dbProduct = await getProductoById(id);

    if (!dbProduct) {
      const folderProductsList = getCategoriesFromFolders();
      const folderItem = folderProductsList.find(item => {
        const fn = item.subcarpeta.split(/[\\/]/).pop() || item.subcarpeta;
        return normalizeName(fn) === normalizeName(product.nombre);
      });
      const origenCarpeta = folderItem
        ? `${folderItem.categoria}/${folderItem.subcarpeta}`
        : `${product.categoria}/${product.nombre}`;

      const newDbId = await insertProducto({
        nombre: product.nombre,
        categoria: product.categoria,
        imagenes: JSON.stringify(product.imagenes.map((url: string) => ({ url, public_id: '' }))),
        descripcion_general: JSON.stringify(product.contenido || {}),
        en_stock: product.en_stock ? 1 : 0,
        origen_carpeta: origenCarpeta
      });
      dbProduct = await getProductoById(newDbId);
    }

    if (!dbProduct) { res.status(500).json({ error: "Error creando producto en base de datos" }); return; }

    await toggleStock(dbProduct.id);
    res.json({ message: "Stock actualizado" });
  } catch (error) {
    console.error("Error actualizando stock:", error);
    res.status(500).json({ error: "Error actualizando stock" });
  }
});

// PUT /api/products/:id/destacado
router.put("/:id/destacado", async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id as string, 10);
    if (isNaN(id)) { res.status(400).json({ error: "ID inválido" }); return; }

    const products = await buildProducts();
    const product = products.filter(p => p && p.id).find((p) => p.id === id);
    if (!product) { res.status(404).json({ error: "Producto no encontrado" }); return; }

    let dbProduct = await getProductoById(id);

    if (!dbProduct) {
      const folderProductsList = getCategoriesFromFolders();
      const folderItem = folderProductsList.find(item => {
        const fn = item.subcarpeta.split(/[\\/]/).pop() || item.subcarpeta;
        return normalizeName(fn) === normalizeName(product.nombre);
      });
      const origenCarpeta = folderItem
        ? `${folderItem.categoria}/${folderItem.subcarpeta}`
        : `${product.categoria}/${product.nombre}`;

      const newDbId = await insertProducto({
        nombre: product.nombre,
        categoria: product.categoria,
        imagenes: JSON.stringify(product.imagenes.map((url: string) => ({ url, public_id: '' }))),
        descripcion_general: JSON.stringify(product.contenido || {}),
        en_stock: product.en_stock ? 1 : 0,
        origen_carpeta: origenCarpeta
      });
      dbProduct = await getProductoById(newDbId);
    }

    if (!dbProduct) { res.status(500).json({ error: "Error creando producto en base de datos" }); return; }

    await toggleDestacado(dbProduct.id);
    res.json({ message: "Destacado actualizado" });
  } catch (error) {
    console.error("Error actualizando destacado:", error);
    res.status(500).json({ error: "Error actualizando destacado" });
  }
});

// DELETE /api/products/:id
router.delete("/:id", async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id as string, 10);
    if (isNaN(id)) { res.status(400).json({ error: "ID inválido" }); return; }

    const products = await buildProducts();
    const productToDelete = products.filter(p => p && p.id).find((p) => p.id === id);
    if (!productToDelete) { res.status(404).json({ error: "Producto no encontrado" }); return; }

    const dbProduct = await getProductoByNombre(productToDelete.nombre);
    if (!dbProduct) { res.status(404).json({ error: "Producto no encontrado en base de datos" }); return; }

    try {
      const imgs = JSON.parse(dbProduct.imagenes || '[]');
      for (const img of imgs) {
        if (img.public_id) await cloudinary.uploader.destroy(img.public_id);
      }
    } catch {}

    await deleteProducto(dbProduct.nombre);
    res.json({ message: "Producto eliminado" });
  } catch (error) {
    console.error("Error eliminando producto:", error);
    res.status(500).json({ error: "Error eliminando producto" });
  }
});

export default router;