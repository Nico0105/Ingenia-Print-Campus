import fs from "fs";
import path from "path";
import mammoth from "mammoth";
import { getAllProductos, insertProducto, db } from "./db";

const PRODUCTOS_BASE = path.join(__dirname, "./uploads/Productos");

// Read description from Description.docx file
async function getDescripcionFromDocx(productPath: string): Promise<any | null> {
  try {
    const descPath = path.join(productPath, "Descripción.docx");
    if (!fs.existsSync(descPath)) {
      return null;
    }

    const result = await mammoth.extractRawText({ path: descPath });
    const text = result.value;

    if (!text || text.trim().length === 0) {
      return null;
    }

    const lines = text.split("\n").map((l) => l.trim()).filter((l) => l.length > 0);

    let titulo = lines[0] || "";
    let especificaciones: Record<string, string> = {};
    let materiales_compatibles: string[] = [];
    let ideal_para: string[] = [];

    let currentSection = "";
    for (const line of lines) {
      const lowerLine = line.toLowerCase();

      if (lowerLine.includes("especificacion") || lowerLine.includes("caracteristica") || lowerLine.includes("spec")) {
        currentSection = "especificaciones";
      } else if (lowerLine.includes("material") || lowerLine.includes("filamento")) {
        currentSection = "materiales";
      } else if (lowerLine.includes("ideal") || lowerLine.includes("para") || lowerLine.includes("uso")) {
        currentSection = "ideal";
      } else if (currentSection === "especificaciones" && line.includes(":")) {
        const [key, ...valueParts] = line.split(":");
        if (key && valueParts.length > 0) {
          especificaciones[key.trim()] = valueParts.join(":").trim();
        }
      } else if (currentSection === "materiales" && line.length > 2) {
        materiales_compatibles.push(line);
      } else if (currentSection === "ideal" && line.length > 2) {
        ideal_para.push(line);
      }
    }

    return {
      titulo,
      especificaciones,
      materiales_compatibles,
      ideal_para,
    };
  } catch (err) {
    console.error("Error reading docx:", err);
    return null;
  }
}

const mainCategoryMap: Record<string, string> = {
  "Impresoras FDM": "Impresoras FDM",
  "Impresoras de resina": "Impresoras de resina",
  "Grabadoras Láser": "Grabadoras Láser",
  "Filamentos": "Filamentos",
  "Accesorios": "Accesorios",
};

const categoryDisplayNames: Record<string, string> = {
  "Impresoras FDM": "Impresoras FDM",
  "Impresoras de Resina": "Impresoras de Resina",
  "Grabadoras LÃ¡ser": "Grabadoras Láser",
  "Filamentos": "Filamentos",
  "Accesorios": "Accesorios",
};

function getProductImages(categoria: string, subcarpeta: string, fullPath: string): string[] {
  const images: string[] = [];
  if (!fs.existsSync(fullPath)) return images;

  const files = fs.readdirSync(fullPath);
  const imageExtensions = /\.(jpg|jpeg|png|webp|gif|avif)$/i;

  for (const file of files) {
    if (imageExtensions.test(file)) {
      images.push(`http://localhost:5000/uploads/Productos/${categoria}/${subcarpeta}/${file}`.replace(/\\/g, "/"));
    }
  }

  return images;
}

async function migrateProducts() {
  console.log("🔄 Iniciando migración de productos a la base de datos...\n");

  // Get existing products to see current state
  const existingProducts = await getAllProductos();
  console.log(`📊 Productos actuales en DB: ${existingProducts.length}`);

  const categories: { categoria: string; subcarpeta: string; fullPath: string }[] = [];

  if (!fs.existsSync(PRODUCTOS_BASE)) {
    console.error("❌ No existe la carpeta de productos");
    return;
  }

  const mainFolders = fs.readdirSync(PRODUCTOS_BASE);
  for (const mainFolder of mainFolders) {
    if (!mainCategoryMap[mainFolder]) continue;

    const mainPath = path.join(PRODUCTOS_BASE, mainFolder);
    if (!fs.statSync(mainPath).isDirectory()) continue;

    // Get subfolders
    const subfolders = fs.readdirSync(mainPath);
    for (const subfolder of subfolders) {
      const subPath = path.join(mainPath, subfolder);
      if (!fs.statSync(subPath).isDirectory()) continue;

      // Check if folder has images
      const files = fs.readdirSync(subPath);
      const hasImages = files.some((f) => /\.(jpg|jpeg|png|webp|gif|avif)$/i.test(f));

      if (hasImages) {
        categories.push({
          categoria: mainFolder,
          subcarpeta: subfolder,
          fullPath: subPath,
        });
      }
    }
  }

  console.log(`📁 Productos encontrados en carpetas: ${categories.length}\n`);

  // First, delete ALL existing products from DB to start fresh with IDs 1-34
  // Note: This will reset the products table
  db.run("DELETE FROM productos");
  console.log("🗑️  Limpiando productos existentes de la DB...\n");

  let migratedCount = 0;

  for (let i = 0; i < categories.length; i++) {
    const item = categories[i];
    const folderName = item.subcarpeta;
    const images = getProductImages(item.categoria, item.subcarpeta, item.fullPath);

    // Get description from docx
    const contenido = await getDescripcionFromDocx(item.fullPath);

    const producto = {
      nombre: folderName,
      categoria: categoryDisplayNames[item.categoria] || item.categoria,
      imagenes: images.length > 0 ? images : ["http://localhost:5000/images/Logo.png"],
      descripcion_general: contenido || {},
      en_stock: true,
      origen_carpeta: `${item.categoria}/${folderName}` // Store original folder path
    };

    try {
      const newId = await insertProducto(producto);
      console.log(`✅ Migrado: ${producto.nombre} (ID: ${newId})`);
      migratedCount++;
    } catch (err: any) {
      console.error(`❌ Error migrando ${producto.nombre}:`, err.message);
    }
  }

  console.log(`\n🎉 Migración completada: ${migratedCount} productos migrados a la base de datos`);

  // Show final count
  const finalProducts = await getAllProductos();
  console.log(`📊 Total de productos en DB: ${finalProducts.length}`);
}

migrateProducts()
  .then(() => {
    console.log("\n✅ Proceso terminado");
    process.exit(0);
  })
  .catch((err) => {
    console.error("❌ Error:", err);
    process.exit(1);
  });
