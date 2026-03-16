const fs = require('fs');
const path = require('path');

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
    especificaciones: [],
    caracteristicas: [],
    ideal_para: [],
    materiales_compatibles: []
  };

  if (!jsonContent) return result;

  // Extract descripcion_general (first element as main title/description)
  if (jsonContent.descripcion_general && Array.isArray(jsonContent.descripcion_general)) {
    // All paragraphs as description
    result.titulo = jsonContent.descripcion_general
      .map(p => cleanText(p))
      .filter(p => p.length > 0)
      .join('\n\n');
  }

  // Process other keys as "Características" and "Especificaciones"
  const excludedKeys = ['descripcion_general'];
  
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
              result.especificaciones.push({ key: specKey, value: specValue });
            }
          } else if (cleaned.toLowerCase().includes('ideal') || cleaned.toLowerCase().includes('para quién')) {
            result.ideal_para.push(cleaned);
          } else {
            result.caracteristicas.push(cleaned);
          }
        }
      }
    }
  }

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

console.log('=== CATÁLOGO DE PRODUCTOS - CARACTERÍSTICAS EXTRAÍDAS ===\n');
console.log(`Total de productos: ${jsonData.productos.length}\n`);

// Process each product
for (const jsonProduct of jsonData.productos) {
  const parsed = parseJsonContent(jsonProduct.contenido);
  
  console.log(`═══════════════════════════════════════════════════════════`);
  console.log(`PRODUCTO: ${jsonProduct.nombre}`);
  console.log(`═══════════════════════════════════════════════════════════`);
  
  if (parsed.titulo) {
    console.log(`\n--- DESCRIPCIÓN ---`);
    console.log(parsed.titulo.substring(0, 300) + (parsed.titulo.length > 300 ? '...' : ''));
  }
  
  if (parsed.especificaciones.length > 0) {
    console.log(`\n--- ESPECIFICACIONES TÉCNICAS ---`);
    for (const spec of parsed.especificaciones.slice(0, 15)) {
      console.log(`  ${spec.key}: ${spec.value}`);
    }
  }
  
  if (parsed.caracteristicas.length > 0) {
    console.log(`\n--- CARACTERÍSTICAS ---`);
    for (const carac of parsed.caracteristicas.slice(0, 10)) {
      console.log(`  - ${carac}`);
    }
  }
  
  if (parsed.ideal_para.length > 0) {
    console.log(`\n--- IDEAL PARA ---`);
    for (const ideal of parsed.ideal_para.slice(0, 5)) {
      console.log(`  - ${ideal}`);
    }
  }
  
  if (parsed.materiales_compatibles.length > 0) {
    console.log(`\n--- MATERIALES COMPATIBLES ---`);
    for (const mat of parsed.materiales_compatibles) {
      console.log(`  - ${mat}`);
    }
  }
  
  console.log('\n');
}
