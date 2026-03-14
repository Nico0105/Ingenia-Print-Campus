import fs from 'fs';
import path from 'path';
import { insertProducto } from './db';

const CATALOGO_PATH = path.join(__dirname, '../../Frontend/src/Data/catalogo_productos.json');

async function importProducts() {
  try {
    console.log('Importing products from JSON...');

    const data = fs.readFileSync(CATALOGO_PATH, 'utf8');
    const catalogo = JSON.parse(data);

    for (const producto of catalogo.productos) {
      const { nombre, imagenes, contenido } = producto;

      await insertProducto({
        nombre,
        imagenes: JSON.stringify(imagenes),
        descripcion_general: JSON.stringify(contenido),
        en_stock: true
      });

      console.log(`Imported: ${nombre}`);
    }

    console.log('Import completed successfully!');
  } catch (error) {
    console.error('Error importing products:', error);
  }
}

importProducts();