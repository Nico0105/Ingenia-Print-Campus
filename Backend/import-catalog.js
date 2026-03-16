const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');

const dbPath = path.join(__dirname, 'data', 'productos.db');
const db = new Database(dbPath);

// Function to remove emojis from text
function removeEmojis(text) {
  if (!text) return '';
  // Remove emojis but keep basic punctuation and numbers
  return text
    .replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '')
    .replace(/[^\w\sáéíóúñÁÉÍÓÚÑüÜ:;.,\-–—()\/¿?¡!0123456789]/gi, '')
    .replace(/\s+/g, ' ')
    .trim();
}

// Function to clean text - remove emojis and extra whitespace
function cleanText(text) {
  if (!text) return '';
  let cleaned = removeEmojis(text);
  // Clean up extra spaces
  cleaned = cleaned.replace(/\s+/g, ' ').trim();
  return cleaned;
}

// Function to extract content from the JSON structure
function parseJsonContent(jsonContent) {
  const result = {
    titulo: '',
    especificaciones: {},
    materiales_compatibles: [],
    ideal_para: []
  };

  if (!jsonContent) return result;

  // Extract descripcion_general (first element as main title/description)
  if (jsonContent.descripcion_general && Array.isArray(jsonContent.descripcion_general)) {
    // First paragraph is the main description
    result.titulo = cleanText(jsonContent.descripcion_general[0]);
  }

  // Process other keys as "Características"
  const excludedKeys = ['descripcion_general'];
  const caracteristicas = [];
  
  for (const [key, value] of Object.entries(jsonContent)) {
    if (excludedKeys.includes(key)) continue;
    
    if (Array.isArray(value)) {
      for (const item of value) {
        const cleaned = cleanText(item);
        if (cleaned && cleaned.length > 2) {
          // Check if it's a spec (contains key: value pattern)
          if (cleaned.includes(':') && !cleaned.startsWith('✔') && !cleaned.startsWith('-')) {
            const colonIndex = cleaned.indexOf(':');
            const specKey = cleaned.substring(0, colonIndex).trim();
            const specValue = cleaned.substring(colonIndex + 1).trim();
            if (specKey && specValue && specKey.length < 50) {
              result.especificaciones[specKey] = specValue;
            }
          } else {
            caracteristicas.push(cleaned);
          }
        }
      }
    }
  }

  // Extract "Ideal para" from caracteristicas (lines with ✔ or starting with ideal)
  result.ideal_para = caracteristicas.filter(c => 
    c.toLowerCase().includes('ideal') || 
    c.toLowerCase().includes('para quién') ||
    c.includes('✔')
  ).slice(0, 5);

  // Extract "Materiales compatibles" - look for material-related content
  const materialesKeys = Object.keys(jsonContent).filter(k => 
    k.toLowerCase().includes('material') || 
    k.toLowerCase().includes('filamento') ||
    k.toLowerCase().includes('compat')
  );
  
  for (const key of materialesKeys) {
    const value = jsonContent[key];
    if (Array.isArray(value)) {
      for (const item of value) {
        const cleaned = cleanText(item);
        // Look for actual material names
        if (cleaned && (
          cleaned.toUpperCase() === cleaned || // All caps like PLA, PETG
          cleaned.toLowerCase().includes('pla') ||
          cleaned.toLowerCase().includes('petg') ||
          cleaned.toLowerCase().includes('abs') ||
          cleaned.toLowerCase().includes('tpu') ||
          cleaned.toLowerCase().includes('nylon') ||
          cleaned.toLowerCase().includes('pc ') ||
          cleaned.toLowerCase().includes('asa')
        )) {
          if (!result.materiales_compatibles.includes(cleaned)) {
            result.materiales_compatibles.push(cleaned);
          }
        }
      }
    }
  }

  return result;
}

// Read the JSON file
const jsonPath = path.join(__dirname, 'catalogo_productos.json');
const jsonData = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));

console.log('Starting catalog import...');
console.log(`Found ${jsonData.productos.length} products in JSON`);

// Get all products from database
const dbProducts = db.prepare('SELECT id, nombre, descripcion_general FROM productos').all();
console.log(`Found ${dbProducts.length} products in database`);

// Create a map for quick lookup
const productMap = new Map();
for (const p of dbProducts) {
  productMap.set(p.nombre.toLowerCase().trim(), p);
}

let updated = 0;
let notFound = [];

// Process each product in JSON
for (const jsonProduct of jsonData.productos) {
  const productName = jsonProduct.nombre.trim();
  const dbProduct = productMap.get(productName.toLowerCase());
  
  if (dbProduct) {
    // Parse content from JSON
    const parsedContent = parseJsonContent(jsonProduct.contenido);
    
    // Update database
    const descripcionGeneral = JSON.stringify({
      titulo: parsedContent.titulo,
      especificaciones: parsedContent.especificaciones,
      materiales_compatibles: parsedContent.materiales_compatibles,
      ideal_para: parsedContent.ideal_para
    });
    
    db.prepare('UPDATE productos SET descripcion_general = ? WHERE id = ?')
      .run(descripcionGeneral, dbProduct.id);
    
    updated++;
    console.log(`Updated: ${productName}`);
  } else {
    notFound.push(productName);
  }
}

console.log(`\nImport complete!`);
console.log(`Updated: ${updated} products`);
console.log(`Not found in database: ${notFound.length}`);
if (notFound.length > 0) {
  console.log('Products not found:', notFound.join(', '));
}

db.close();
