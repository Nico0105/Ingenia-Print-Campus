import { Router, Request, Response } from "express";
import fs from "fs";
import path from "path";
import multer from "multer";
import { getProductoByNombre, getProductoById, getAllProductos, insertProducto, updateProducto, deleteProducto, toggleStock } from "../db";

const router = Router();

const PRODUCTOS_BASE = path.join(__dirname, "../uploads/Productos");
const BASE_URL = "http://localhost:5000";
const IMAGE_EXTENSIONS = /\.(jpg|jpeg|png|webp|gif)$/i;

const upload = multer({ dest: path.join(__dirname, "../uploads/temp") });

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
    
    // Track used IDs to avoid collisions - include DB IDs and generated IDs
    const usedIds = new Set<number>();
    
    // Normalize name for matching - remove extra spaces and convert to lowercase
    const normalizeName = (name: string) => name.toLowerCase().replace(/\s+/g, ' ').trim();
    
    // Build products array from folders
    const products = folderProducts.map((item, index) => {
      // Extract just the folder name (last part of the path) for matching
      // Handle both backslash (Windows) and forward slash (Unix)
      const folderName = item.subcarpeta.split(/[\\/]/).pop() || item.subcarpeta;
      const normalizedFolder = normalizeName(folderName);
      
      // Try to find by exact folder name match first
      let dbProduct = dbProductsMap.get(folderName);
      
      // Try with normalized name
      if (!dbProduct) {
        for (const [name, product] of dbProductsMap) {
          if (normalizeName(name) === normalizedFolder) {
            dbProduct = product;
            console.log('Found match (normalized):', folderName, '=', name);
            break;
          }
        }
      }
      
      // If still not found, try partial matching
      if (!dbProduct) {
        for (const [name, product] of dbProductsMap) {
          // Skip if this DB product has already been used
          if (usedIds.has(product.id)) continue;
          
          const normalizedName = normalizeName(name);
          
          // Check for exact match or partial match
          const isMatch = normalizedFolder === normalizedName || 
                         normalizedFolder.includes(normalizedName) || 
                         normalizedName.includes(normalizedFolder);
          
          // Require minimum length to avoid false positives
          if (isMatch && normalizedName.length >= 3 && normalizedFolder.length >= 3) {
            dbProduct = product;
            console.log('Found partial match:', folderName, '=', name);
            break;
          }
        }
      }
      
      const images = getProductImages(item.categoria, item.subcarpeta, item.fullPath);
      
      // Generate unique ID: use DB id if available and not already used
      let productId: number;
      if (dbProduct && dbProduct.id && !usedIds.has(dbProduct.id)) {
        productId = dbProduct.id;
        usedIds.add(productId);
      } else {
        // Use negative index starting from -1 to avoid collision with positive DB IDs
        // Keep decrementing until we find an unused ID
        productId = -1 - index;
        while (usedIds.has(productId)) {
          productId--;
        }
        usedIds.add(productId);
      }
      
      return {
        id: productId,
        nombre: folderName,
        categoria: categoryDisplayNames[item.categoria] || item.categoria,
        subcategoria: null,
        imagenes: images.length > 0 ? images : [`${BASE_URL}/images/Logo.png`],
        contenido: dbProduct ? JSON.parse(dbProduct.descripcion_general || '{}') : {},
        en_stock: dbProduct ? dbProduct.en_stock === 1 : true,
      };
    });
    
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
    const product = products.find((p) => p.id === id);

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
    const currentProducto = await getProductoById(id);
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
    await updateProducto(id, updatedProduct);

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
    const product = products.find((p) => p.id === id);
    if (!product) {
      res.status(404).json({ error: "Producto no encontrado" });
      return;
    }

    await toggleStock(product.nombre);

    res.json({ message: "Stock actualizado" });
  } catch (error) {
    console.error("Error actualizando stock:", error);
    res.status(500).json({ error: "Error actualizando stock" });
  }
});

// DELETE /api/products/:id - Eliminar producto
router.delete("/:id", async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id as string, 10);
    if (isNaN(id)) {
      res.status(400).json({ error: "ID inválido" });
      return;
    }

    // Buscar producto directamente en la DB por ID
    const product = await getProductoById(id);
    if (!product) {
      res.status(404).json({ error: "Producto no encontrado" });
      return;
    }

    console.log('Delete - Producto encontrado:', product.nombre);
    await deleteProducto(product.nombre);

    res.json({ message: "Producto eliminado" });
  } catch (error) {
    console.error("Error eliminando producto:", error);
    res.status(500).json({ error: "Error eliminando producto" });
  }
});

export default router;