import { Router, Request, Response } from "express";
import fs from "fs";
import path from "path";
import multer from "multer";
import mammoth from "mammoth";
import { getProductoByNombre, getProductoById, getAllProductos, insertProducto, updateProducto, deleteProducto, toggleStock } from "../db";

const router = Router();

const PRODUCTOS_BASE = path.join(__dirname, "../uploads/Productos");
const BASE_URL = "http://localhost:5000";
const IMAGE_EXTENSIONS = /\.(jpg|jpeg|png|webp|gif)$/i;

// Normalize name for matching - remove extra spaces and convert to lowercase
const normalizeName = (name: string) => name.toLowerCase().replace(/\s+/g, ' ').trim();

const upload = multer({ dest: path.join(__dirname, "../uploads/temp") });

// Read description from Description.docx file in product folder
async function getDescripcionFromDocx(productPath: string): Promise<any | null> {
  try {
    const descPath = path.join(productPath, 'Descripción.docx');
    if (!fs.existsSync(descPath)) {
      return null;
    }
    
    const result = await mammoth.extractRawText({ path: descPath });
    const text = result.value;
    
    if (!text || text.trim().length === 0) {
      return null;
    }
    
    // Parse the text to extract structured information
    // The docx files seem to have a specific format, so we'll try to parse it
    const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    
    // Default structure
    let titulo = lines[0] || '';
    let especificaciones: Record<string, string> = {};
    let materiales_compatibles: string[] = [];
    let ideal_para: string[] = [];
    
    // Try to parse the content based on common patterns
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
    
    return {
      titulo,
      especificaciones,
      materiales_compatibles,
      ideal_para
    };
  } catch (err) {
    console.error('Error reading docx:', err);
    return null;
  }
}

// Get categories and products from folder structure (handles nested folders)
function getCategoriesFromFolders(): { categoria: string; subcarpeta: string; fullPath: string }[] {
  const categories: { categoria: string; subcarpeta: string; fullPath: string }[] = [];
  
  if (!fs.existsSync(PRODUCTOS_BASE)) {
    return categories;
  }
  
  // Map of main categories
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
    
    // Recursively find all folders with images
    const findFoldersWithImages = (dirPath: string, relativePath: string): void => {
      const items = fs.readdirSync(dirPath);
      const files = items.filter(item => !fs.statSync(path.join(dirPath, item)).isDirectory());
      const hasImages = files.some(f => IMAGE_EXTENSIONS.test(f));
      
      if (hasImages) {
        // This folder has images, it's a product
        categories.push({
          categoria: mainFolder,
          subcarpeta: relativePath,
          fullPath: dirPath
        });
      } else {
        // Check subdirectories
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

// Get images for a product from its folder (uses fullPath for nested folders)
function getProductImages(categoria: string, subcarpeta: string, fullPath?: string): string[] {
  // Use fullPath if provided (for nested folders), otherwise construct from category
  let productPath: string;
  if (fullPath && fs.existsSync(fullPath)) {
    productPath = fullPath;
  } else {
    productPath = path.join(PRODUCTOS_BASE, categoria, subcarpeta);
  }
  
  if (!fs.existsSync(productPath)) {
    return [];
  }
  
  const files = fs.readdirSync(productPath);
  return files
    .filter(file => IMAGE_EXTENSIONS.test(file))
    .map(file => {
      // Calculate relative path from Productos folder
      const relativePath = path.relative(PRODUCTOS_BASE, path.join(productPath, file));
      return `${BASE_URL}/uploads/Productos/${relativePath.replace(/\\/g, '/')}`;
    });
}

// Map category folder names to display names
const categoryDisplayNames: Record<string, string> = {
  'Impresoras FDM': 'Impresoras FDM',
  'Impresoras de resina': 'Impresoras de Resina',
  'Grabadoras Láser': 'Grabadoras Láser',
  'Filamentos': 'Filamentos',
  'Accesorios': 'Accesorios'
};

async function findContenido(nombre: string): Promise<any | null> {
  try {
    const producto = await getProductoByNombre(nombre);
    if (producto) {
      return {
        ...JSON.parse(producto.descripcion_general || '{}'),
        en_stock: producto.en_stock === 1
      };
    }
    return null;
  } catch (err) {
    console.error('Error finding contenido:', err);
    return null;
  }
}

function isDirectory(fullPath: string): boolean {
  return fs.statSync(fullPath).isDirectory();
}

function getImages(
  productoPath: string,
  categoria: string,
  subcategoria: string | null,
  nombreProducto: string
): string[] {
  const archivos = fs.readdirSync(productoPath);

  return archivos
    .filter((f) => IMAGE_EXTENSIONS.test(f))
    .map((img) => {
      if (subcategoria) {
        return `${BASE_URL}/uploads/Productos/${encodeURIComponent(categoria)}/${encodeURIComponent(subcategoria)}/${encodeURIComponent(nombreProducto)}/${encodeURIComponent(img)}`;
      }
      return `${BASE_URL}/uploads/Productos/${encodeURIComponent(categoria)}/${encodeURIComponent(nombreProducto)}/${encodeURIComponent(img)}`;
    });
}

// Function to infer category from product name
function inferCategory(nombre: string): string {
  const n = nombre.toLowerCase();
  if (n.includes('bambu') || n.includes('creality') || n.includes('elegoo')) {
    if (n.includes('halot') || n.includes('resina')) return 'Impresoras de Resina';
    if (n.includes('laser') || n.includes('falcon')) return 'Grabadoras Láser';
    if (n.includes('scan') || n.includes('escaner')) return 'Escáneres 3D';
    return 'Impresoras FDM';
  }
  if (n.includes('pla') || n.includes('petg') || n.includes('filamento')) return 'Filamentos';
  if (n.includes('ams') || n.includes('space pi') || n.includes('secador')) return 'Accesorios';
  if (n.includes('rodillo') || n.includes('accesorio')) return 'Accesorios';
  return 'Impresoras FDM';
}

// Build products from folder structure
async function buildProducts(): Promise<any[]> {
  try {
    // Get products from folder structure
    const folderProducts = getCategoriesFromFolders();
    console.log('Folder products found:', folderProducts.length);
    
    // Also get products from database for their descriptions
    const dbProducts = await getAllProductos();
    const dbProductsMap = new Map(dbProducts.map(p => [p.nombre, p]));
    
    // Build map of folder paths to DB products (for tracking adopted folders)
    // Use normalized (lowercase) keys for case-insensitive matching
    const adoptedFoldersMap = new Map<string, any>();
    for (const p of dbProducts) {
      if (p.origen_carpeta) {
        const normalizedPath = p.origen_carpeta.toLowerCase();
        adoptedFoldersMap.set(normalizedPath, p);
      }
    }
    console.log('Adopted folders:', adoptedFoldersMap.size);
    
    // Track used IDs to avoid collisions - include DB IDs and generated IDs
    const usedIds = new Set<number>();
    
    // Build products array from folders (async to read docx files)
    const products = await Promise.all(folderProducts.map(async (item, index) => {
      // Extract just the folder name (last part of the path) for matching
      // Handle both backslash (Windows) and forward slash (Unix)
      const folderPath = `${item.categoria}/${item.subcarpeta}`;
      const normalizedFolderPath = folderPath.toLowerCase();
      const folderName = item.subcarpeta.split(/[\\/]/).pop() || item.subcarpeta;
      const normalizedFolder = normalizeName(folderName);
      
      // Check if this folder has been adopted by a DB product
      // If so, skip loading this folder product (use DB product instead)
      // Use normalized (lowercase) path for case-insensitive matching
      if (adoptedFoldersMap.has(normalizedFolderPath)) {
        const adoptedDbProduct = adoptedFoldersMap.get(normalizedFolderPath);
        // Mark this DB ID as used so we don't add it again
        usedIds.add(adoptedDbProduct.id);
        console.log('Skipping adopted folder:', folderPath, '- using DB product ID:', adoptedDbProduct.id);
        // Return null to indicate this folder should be skipped
        return null;
      }
      
      // Try to find by exact folder name match first
      let dbProduct = dbProductsMap.get(folderName);
      
      // Try with normalized name (case-insensitive exact match)
      if (!dbProduct) {
        for (const [name, product] of dbProductsMap) {
          if (normalizeName(name) === normalizedFolder) {
            dbProduct = product;
            console.log('Found match (normalized):', folderName, '=', name);
            break;
          }
        }
      }
      
      // NOTE: Removed partial matching because it causes issues when editing product names
      // If a product name is changed, partial matching would still match with the old folder name
      // This would create duplicates or wrong associations
      
      const images = getProductImages(item.categoria, item.subcarpeta, item.fullPath);
      
      // Get description from DB or from docx file
      let contenido: any = {};
      if (dbProduct && dbProduct.descripcion_general) {
        try {
          contenido = JSON.parse(dbProduct.descripcion_general);
        } catch {}
      }
      
      // If no description from DB, try to read from docx file
      if (!contenido || !contenido.titulo) {
        const docxContent = await getDescripcionFromDocx(item.fullPath);
        if (docxContent) {
          contenido = docxContent;
        }
      }
      
      // Generate unique ID: use DB id if available and not already used
      let productId: number;
      let productName = folderName; // Default to folder name
      
      if (dbProduct && dbProduct.id && !usedIds.has(dbProduct.id)) {
        productId = dbProduct.id;
        usedIds.add(productId);
        // Use DB name if available, otherwise use folder name
        productName = dbProduct.nombre || folderName;
      } else {
        // Use IDs starting from 1000 for folder-only products (no DB match)
        // These are products that exist in folders but not in database
        productId = 1000 + index;
        while (usedIds.has(productId)) {
          productId++;
        }
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
    
    // Filter out null products (adopted folders) and add to final array
    const filteredProducts: any[] = [];
    for (const p of products) {
      if (p !== null) {
        filteredProducts.push(p);
      }
    }
    
    // Also add products that exist only in database (created via admin, no folder)
    const matchedDbProductIds = new Set<number>();
    const folderProductNames = new Set<string>();
    
    // Get all folder product names
    for (const item of folderProducts) {
      const folderName = item.subcarpeta.split(/[\\/]/).pop() || item.subcarpeta;
      folderProductNames.add(normalizeName(folderName));
    }
    
    // Mark which DB products have been matched to folders
    for (const p of filteredProducts) {
      if (p.id > 0) {
        matchedDbProductIds.add(p.id);
      }
    }
    
    // Add DB products that have origen_carpeta (these were filtered out as null)
    // We need to add them back because they're the "adopted" version
    for (const dbProduct of dbProducts) {
      if (dbProduct.origen_carpeta) {
        // Extract category from the folder path (e.g., "Accesorios/Bambu Lab AMS" -> "Accesorios")
        const folderCategory = dbProduct.origen_carpeta.split('/')[0];
        
        let contenido: any = {};
        if (dbProduct.descripcion_general) {
          try {
            contenido = JSON.parse(dbProduct.descripcion_general);
          } catch {}
        }
        
        products.push({
          id: dbProduct.id,
          nombre: dbProduct.nombre,
          categoria: folderCategory || dbProduct.categoria || 'Sin categoría',
          subcategoria: null,
          imagenes: dbProduct.imagenes ? JSON.parse(dbProduct.imagenes) : [`${BASE_URL}/images/Logo.png`],
          contenido,
          en_stock: dbProduct.en_stock === 1,
        });
      } else {
        // NEW PRODUCT: Product created directly in DB (no folder, no origen_carpeta)
        // Add it directly to the results
        let contenido: any = {};
        if (dbProduct.descripcion_general) {
          try {
            contenido = JSON.parse(dbProduct.descripcion_general);
          } catch {}
        }
        
        products.push({
          id: dbProduct.id,
          nombre: dbProduct.nombre,
          categoria: dbProduct.categoria || 'Sin categoría',
          subcategoria: null,
          imagenes: dbProduct.imagenes ? JSON.parse(dbProduct.imagenes) : [`${BASE_URL}/images/Logo.png`],
          contenido,
          en_stock: dbProduct.en_stock === 1,
        });
      }
    }
    
    return products;
  } catch (err) {
    console.error('Error en buildProducts:', err);
    return [];
  }
}

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

    if (isNaN(id)) {
      res.status(400).json({ error: "ID inválido" });
      return;
    }

    const products = await buildProducts();
    // Filter out null products before finding
    const validProducts = products.filter(p => p && p.id);
    const product = validProducts.find((p) => p.id === id);

    if (!product) {
      res.status(404).json({ error: "Producto no encontrado" });
      return;
    }

    res.json(product);
  } catch (error) {
    res.status(500).json({ error: "Error leyendo producto" });
  }
});

// POST /api/products - Crear producto
router.post("/", upload.array('imagenes'), async (req: Request, res: Response) => {
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

    const files = req.files as Express.Multer.File[];
    const imagenes: string[] = [];

    // Mover archivos a la carpeta del producto
    const categoriaDir = categoria;
    const productDir = subcategoria
      ? path.join(PRODUCTOS_BASE, categoriaDir, subcategoria, nombre)
      : path.join(PRODUCTOS_BASE, categoriaDir, nombre);
    if (!fs.existsSync(productDir)) {
      fs.mkdirSync(productDir, { recursive: true });
    }

    if (files) {
      for (const file of files) {
        const ext = path.extname(file.originalname);
        const newName = `${Date.now()}_${file.originalname}`;
        const newPath = path.join(productDir, newName);
        fs.renameSync(file.path, newPath);
        imagenes.push(newName);
      }
    }

    const catalogo = getCategoriesFromFolders();
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
    await insertProducto(newProduct);

    res.status(201).json({ message: "Producto creado" });
  } catch (error) {
    console.error("Error creando producto:", error);
    res.status(500).json({ error: "Error creando producto" });
  }
});

// PUT /api/products/:id - Editar producto
router.put("/:id", upload.array('imagenes'), async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id as string, 10);
    if (isNaN(id)) {
      res.status(400).json({ error: "ID inválido" });
      return;
    }

    const { nombre, categoria, subcategoria, titulo, especificaciones, materiales_compatibles, ideal_para } = req.body;
    const files = req.files as Express.Multer.File[];

    // Buscar producto directamente en la DB por ID
    let currentProducto = await getProductoById(id);
    
    // Si el producto no está en DB pero el ID >= 1000, es un producto de carpeta
    // Por lo tanto necesitamos crearlo en la base de datos
    let dbId = id; // Usar este ID para las operaciones de DB
    if (!currentProducto && id >= 1000) {
      // Obtener los productos de las carpetas
      const products = await buildProducts();
      const folderProduct = products.find((p) => p.id === id);
      
      if (folderProduct) {
        // Buscar si ya existe un producto en la DB con el mismo nombre (puede haber sido editado antes)
        const dbProducts = await getAllProductos();
        const existingDbProduct = dbProducts.find((p: any) => 
          normalizeName(p.nombre || '') === normalizeName(folderProduct.nombre)
        );
        
        if (existingDbProduct) {
          // Ya existe en DB - usar ese ID para actualizar
          dbId = existingDbProduct.id;
          currentProducto = existingDbProduct;
          console.log('Producto ya existe en DB con ID:', dbId, '- actualizando en lugar de crear nuevo');
        } else {
          // Crear nueva entrada en la base de datos
          const newDbId = await insertProducto({
            nombre: folderProduct.nombre,
            categoria: folderProduct.categoria,
            imagenes: folderProduct.imagenes,
            descripcion_general: JSON.stringify(folderProduct.contenido || {}),
            en_stock: folderProduct.en_stock
          });
          // Usar el nuevo ID de la base de datos
          dbId = newDbId;
          currentProducto = await getProductoById(newDbId);
          console.log('Creado producto en DB con ID:', newDbId, 'para producto de carpeta:', id);
        }
      }
    }
    
    if (!currentProducto) {
      res.status(404).json({ error: "Producto no encontrado" });
      return;
    }

    // Manejar nuevas imágenes
    let imagenes = JSON.parse(currentProducto.imagenes || '[]');
    if (files && files.length > 0) {
      const categoriaDir = categoria || currentProducto.categoria || "Impresoras FDM";
      const productDir = subcategoria
        ? path.join(PRODUCTOS_BASE, categoriaDir, subcategoria, nombre || currentProducto.nombre)
        : path.join(PRODUCTOS_BASE, categoriaDir, nombre || currentProducto.nombre);
      if (!fs.existsSync(productDir)) {
        fs.mkdirSync(productDir, { recursive: true });
      }
      for (const file of files) {
        const ext = path.extname(file.originalname);
        const newName = `${Date.now()}_${file.originalname}`;
        const targetPath = path.join(productDir, newName);
        fs.renameSync(file.path, targetPath);
        imagenes.push(newName);
      }
    }

    const updatedProduct = {
      nombre: nombre || currentProducto.nombre,
      categoria: categoria || currentProducto.categoria,
      imagenes,
      en_stock: currentProducto.en_stock, // Preserve current stock status
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
        })()
      }
    };
    await updateProducto(dbId, updatedProduct);

    res.json({ message: "Producto actualizado" });
  } catch (error) {
    console.error("Error actualizando producto:", error);
    console.error("Request body:", req.body);
    res.status(500).json({ error: "Error actualizando producto: " + (error as Error).message });
  }
});

// PUT /api/products/:id/stock - Toggle stock
router.put("/:id/stock", async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id as string, 10);
    if (isNaN(id)) {
      res.status(400).json({ error: "ID inválido" });
      return;
    }

    const products = await buildProducts();
    // Filter out null products before finding to avoid errors
    const validProducts = products.filter(p => p && p.id);
    const product = validProducts.find((p) => p.id === id);
    if (!product) {
      res.status(404).json({ error: "Producto no encontrado" });
      return;
    }

    // Check if product exists in database
    const dbProduct = await getProductoById(id);
    if (!dbProduct) {
      // Product is from folder only - can't toggle stock
      res.status(400).json({ error: "No se puede cambiar stock de productos de carpeta" });
      return;
    }

    await toggleStock(dbProduct.nombre);

    res.json({ message: "Stock actualizado" });
  } catch (error) {
    console.error("Error actualizando stock:", error);
    res.status(500).json({ error: "Error actualizando stock" });
  }
});

// Función para eliminar carpeta de producto
function deleteProductFolder(nombre: string, categoria: string): boolean {
  try {
    // Buscar la carpeta del producto en todas las categorías
    const categorias = ['Impresoras FDM', 'Impresoras de resina', 'Grabadoras Láser', 'Filamentos', 'Accesorios'];
    
    for (const cat of categorias) {
      const productPath = path.join(PRODUCTOS_BASE, cat, nombre);
      if (fs.existsSync(productPath)) {
        fs.rmSync(productPath, { recursive: true, force: true });
        console.log('Carpeta eliminada:', productPath);
        return true;
      }
      // También buscar en subcarpetas
      const catPath = path.join(PRODUCTOS_BASE, cat);
      if (fs.existsSync(catPath)) {
        const subdirs = fs.readdirSync(catPath).filter(f => fs.statSync(path.join(catPath, f)).isDirectory());
        for (const subdir of subdirs) {
          const subProductPath = path.join(catPath, subdir, nombre);
          if (fs.existsSync(subProductPath)) {
            fs.rmSync(subProductPath, { recursive: true, force: true });
            console.log('Carpeta eliminada (subcarpeta):', subProductPath);
            return true;
          }
        }
      }
    }
    return false;
  } catch (err) {
    console.error('Error eliminando carpeta:', err);
    return false;
  }
}

// DELETE /api/products/:id - Eliminar producto
router.delete("/:id", async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id as string, 10);
    if (isNaN(id)) {
      res.status(400).json({ error: "ID inválido" });
      return;
    }

    // Primero buscar en buildProducts (que tiene todos los productos合并)
    const products = await buildProducts();
    // Filter out null products before finding
    const validProducts = products.filter(p => p && p.id);
    const productToDelete = validProducts.find((p) => p.id === id);
    
    if (!productToDelete) {
      res.status(404).json({ error: "Producto no encontrado" });
      return;
    }

    console.log('Delete - Producto encontrado:', productToDelete.nombre, 'categoría:', productToDelete.categoria);
    
    // Ahora buscar en la base de datos por nombre
    const dbProduct = await getProductoByNombre(productToDelete.nombre);
    
    if (!dbProduct) {
      // Producto solo existe en carpeta, no en DB - eliminar la carpeta
      console.log('Delete - Producto solo en carpeta, eliminando carpeta:', productToDelete.nombre);
      const folderDeleted = deleteProductFolder(productToDelete.nombre, productToDelete.categoria);
      if (folderDeleted) {
        res.json({ message: "Producto eliminado (carpeta)" });
      } else {
        res.status(404).json({ error: "Producto no encontrado en carpeta" });
      }
      return;
    }

    await deleteProducto(dbProduct.nombre);
    res.json({ message: "Producto eliminado" });
  } catch (error) {
    console.error("Error eliminando producto:", error);
    res.status(500).json({ error: "Error eliminando producto" });
  }
});

export default router;