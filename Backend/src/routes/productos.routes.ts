import { Router, Request, Response } from "express";
import fs from "fs";
import path from "path";

const router = Router();

const PRODUCTOS_BASE = path.join(__dirname, "../uploads/Productos");
const CATALOGO_PATH = path.join(__dirname, "../data/catalogo_productos.json");
const BASE_URL = "http://localhost:5000";
const IMAGE_EXTENSIONS = /\.(jpg|jpeg|png|webp|gif)$/i;

function loadCatalogo(): any[] {
  try {
    const raw = fs.readFileSync(CATALOGO_PATH, "utf-8");
    return JSON.parse(raw).productos || [];
  } catch {
    return [];
  }
}

function findContenido(nombre: string, catalogo: any[]): any | null {
  const match = catalogo.find(
    (p) => p.nombre.toLowerCase().trim() === nombre.toLowerCase().trim()
  );
  return match ? match.contenido : null;
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

function buildProducts() {
  const products: any[] = [];
  let id = 1;
  const catalogo = loadCatalogo();

  const categorias = fs
    .readdirSync(PRODUCTOS_BASE)
    .filter((f) => isDirectory(path.join(PRODUCTOS_BASE, f)));

  for (const categoria of categorias) {
    const categoriaPath = path.join(PRODUCTOS_BASE, categoria);
    const nivel2 = fs
      .readdirSync(categoriaPath)
      .filter((f) => isDirectory(path.join(categoriaPath, f)));

    for (const nivel2Item of nivel2) {
      const nivel2Path = path.join(categoriaPath, nivel2Item);
      const nivel2Contents = fs.readdirSync(nivel2Path);

      const tieneImagenes = nivel2Contents.some((f) =>
        IMAGE_EXTENSIONS.test(f)
      );

      const subcarpetas = nivel2Contents.filter((f) =>
        isDirectory(path.join(nivel2Path, f))
      );

      if (tieneImagenes || subcarpetas.length === 0) {
        // Caso simple: Accesorios, Filamentos, etc.
        const imagenes = getImages(nivel2Path, categoria, null, nivel2Item);
        products.push({
          id: id++,
          nombre: nivel2Item,
          categoria,
          subcategoria: null,
          imagenes,
          contenido: findContenido(nivel2Item, catalogo),
        });
      } else {
        // Caso con subcarpeta de marca: Impresoras FDM/Bambu Lab/ o /Creality/
        for (const nombreProducto of subcarpetas) {
          if (nombreProducto.startsWith("(NO SUBIR)")) continue;

          const productoPath = path.join(nivel2Path, nombreProducto);
          const imagenes = getImages(
            productoPath,
            categoria,
            nivel2Item,
            nombreProducto
          );
          products.push({
            id: id++,
            nombre: nombreProducto,
            categoria,
            subcategoria: nivel2Item,
            imagenes,
            contenido: findContenido(nombreProducto, catalogo),
          });
        }
      }
    }
  }

  return products;
}

// GET /api/products
router.get("/", (req: Request, res: Response) => {
  try {
    const products = buildProducts();
    res.json(products);
  } catch (error) {
    console.error("Error en buildProducts:", error);
    res.status(500).json({ error: "Error leyendo productos" });
  }
});

// GET /api/products/:id
router.get("/:id", (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id as string, 10);

    if (isNaN(id)) {
      res.status(400).json({ error: "ID inválido" });
      return;
    }

    const products = buildProducts();
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

export default router;