import { Router, Request, Response } from "express";
import fs from "fs";
import path from "path";
import multer from "multer";
import { getProductoByNombre, getAllProductos, insertProducto, updateProducto, deleteProducto, toggleStock } from "../db";

const router = Router();

const PRODUCTOS_BASE = path.join(__dirname, "../uploads/Productos");
const CATALOGO_PATH = path.join(__dirname, "../data/catalogo_productos.json");
const BASE_URL = "http://localhost:5000";
const IMAGE_EXTENSIONS = /\.(jpg|jpeg|png|webp|gif)$/i;

const upload = multer({ dest: path.join(__dirname, "../uploads/temp") });

function loadCatalogo(): any[] {
  // Return array of products from DB
  // Since it's async, we'll handle in buildProducts
  return [];
}

async function loadCatalogoAsync(): Promise<any[]> {
  try {
    const productos = await getAllProductos();
    return productos.map(p => ({
      nombre: p.nombre,
      imagenes: JSON.parse(p.imagenes || '[]'),
      descripcion_general: JSON.parse(p.descripcion_general || '{}'),
      en_stock: p.en_stock === 1
    }));
  } catch (err) {
    console.error('Error loading catalogo:', err);
    return [];
  }
}

function saveCatalogo(productos: any[]) {
  // Not needed anymore, saving individually
}

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

async function buildProducts(): Promise<any[]> {
  try {
    const productos = await getAllProductos();
    return productos.map((p, index) => ({
      id: index + 1,
      nombre: p.nombre,
      categoria: p.categoria || 'Sin categoría',
      subcategoria: p.subcategoria || null,
      imagenes: JSON.parse(p.imagenes || '[]'),
      contenido: JSON.parse(p.descripcion_general || '{}'),
      en_stock: p.en_stock === 1,
    }));
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

    const products = await buildProducts();
    const product = products.find((p) => p.id === id);
    if (!product) {
      res.status(404).json({ error: "Producto no encontrado" });
      return;
    }

    // Get current product from DB
    const currentProducto = await getProductoByNombre(product.nombre);
    if (!currentProducto) {
      res.status(404).json({ error: "Producto no encontrado en DB" });
      return;
    }

    // Manejar nuevas imágenes
    let imagenes = JSON.parse(currentProducto.imagenes || '[]');
    if (files && files.length > 0) {
      const categoriaDir = categoria || "Impresoras FDM";
      const productDir = subcategoria
        ? path.join(PRODUCTOS_BASE, categoriaDir, subcategoria, nombre)
        : path.join(PRODUCTOS_BASE, categoriaDir, nombre);
      if (!fs.existsSync(productDir)) {
        fs.mkdirSync(productDir, { recursive: true });
      }
      for (const file of files) {
        const ext = path.extname(file.originalname);
        const newName = `${Date.now()}_${file.originalname}`;
        const newPath = path.join(productDir, newName);
        fs.renameSync(file.path, newPath);
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
    await updateProducto(product.nombre, updatedProduct);

    res.json({ message: "Producto actualizado" });
  } catch (error) {
    console.error("Error actualizando producto:", error);
    res.status(500).json({ error: "Error actualizando producto" });
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

    const products = await buildProducts();
    const product = products.find((p) => p.id === id);
    if (!product) {
      res.status(404).json({ error: "Producto no encontrado" });
      return;
    }

    await deleteProducto(product.nombre);

    res.json({ message: "Producto eliminado" });
  } catch (error) {
    console.error("Error eliminando producto:", error);
    res.status(500).json({ error: "Error eliminando producto" });
  }
});

export default router;