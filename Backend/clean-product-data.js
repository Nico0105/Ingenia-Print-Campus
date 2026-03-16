const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'data', 'productos.db');
const db = new Database(dbPath);

// Función para limpiar texto
function cleanText(text) {
  if (!text) return '';
  
  // Eliminar emojis (rango unicode amplio)
  let cleaned = text.replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{2702}\u{2705}\u{2708}\u{2709}\u{270A}-\u{270D}\u{270F}\u{2712}\u{2714}\u{2716}\u{271D}\u{271F}\u{2728}\u{2744}\u{2747}\u{274C}\u{274E}\u{2753}-\u{2755}\u{2757}\u{2764}\u{2795}-\u{2797}\u{27A1}\u{27B0}\u{27BF}\u{2934}\u{2935}\u{2B05}-\u{2B07}\u{2B1B}\u{2B1C}\u{2B50}\u{2B55}\u{3030}\u{303D}\u{3297}\u{3299}]/gu, '');
  
  // Eliminar preguntas genéricas sin sentido
  cleaned = cleaned.replace(/\?\*+$/g, '');
  cleaned = cleaned.replace(/^[\s]*\*+[\s]*/g, '');
  
  // Limpiar espacios extra
  cleaned = cleaned.replace(/\s+/g, ' ').trim();
  
  return cleaned;
}

// Obtener todos los productos con descripcion_general
const stmt = db.prepare("SELECT id, nombre, descripcion_general FROM productos WHERE descripcion_general IS NOT NULL AND descripcion_general != ''");
const productos = stmt.all();

console.log(`Limpiando ${productos.length} productos...\n`);

let updatedCount = 0;

for (const producto of productos) {
  try {
    const data = JSON.parse(producto.descripcion_general);
    let modified = false;
    
    // Limpiar título
    if (data.titulo) {
      const oldTitulo = data.titulo;
      data.titulo = cleanText(data.titulo);
      if (oldTitulo !== data.titulo) {
        modified = true;
        console.log(`  ${producto.nombre}:`);
        console.log(`    Titulo: "${oldTitulo}" -> "${data.titulo}"`);
      }
    }
    
    // Limpiar especificaciones
    if (data.especificaciones && typeof data.especificaciones === 'object') {
      const newSpecs = {};
      for (const [key, value] of Object.entries(data.especificaciones)) {
        const cleanKey = cleanText(key);
        const cleanValue = cleanText(value);
        if (cleanKey && cleanValue) {
          newSpecs[cleanKey] = cleanValue;
        }
      }
      if (JSON.stringify(newSpecs) !== JSON.stringify(data.especificaciones)) {
        data.especificaciones = newSpecs;
        modified = true;
      }
    }
    
    // Limpiar ideal_para - eliminar preguntas y textos no útiles
    if (data.ideal_para && Array.isArray(data.ideal_para)) {
      const cleanedIdealPara = data.ideal_para
        .map(item => cleanText(item))
        .filter(item => {
          // Eliminar textos que son preguntas o muy cortos
          if (!item) return false;
          if (item.includes('Para qui') || item.includes('para qui')) return false;
          if (item.length < 10) return false;
          return true;
        });
      
      // Eliminar duplicados
      const uniqueIdealPara = [...new Set(cleanedIdealPara)];
      
      if (uniqueIdealPara.length !== data.ideal_para.length) {
        data.ideal_para = uniqueIdealPara;
        modified = true;
        console.log(`  ${producto.nombre}: Ideal Para limpiado (${data.ideal_para.length} items)`);
      }
    }
    
    // Limpiar materiales_compatibles
    if (data.materiales_compatibles && Array.isArray(data.materiales_compatibles)) {
      const cleanedMateriales = data.materiales_compatibles
        .map(item => cleanText(item))
        .filter(item => item && item.length > 0);
      
      if (cleanedMateriales.length !== data.materiales_compatibles.length) {
        data.materiales_compatibles = cleanedMateriales;
        modified = true;
      }
    }
    
    if (modified) {
      const newJson = JSON.stringify(data, null, 2);
      db.prepare('UPDATE productos SET descripcion_general = ? WHERE id = ?').run(newJson, producto.id);
      updatedCount++;
      console.log(`  Actualizado: ${producto.nombre}\n`);
    }
    
  } catch (e) {
    console.log(`  Error procesando ${producto.nombre}: ${e.message}`);
  }
}

console.log(`\nSe actualizaron ${updatedCount} productos`);
db.close();
