const sqlite3 = require('sqlite3');
const db = new sqlite3.Database('./data/productos.db');

const mappings = [
  ['Accesorios/Bambu Lab AMS', 'Bambu Lab AMS'],
  ['Accesorios/Bambu Lab AMS 2 Pro', 'Bambu Lab AMS 2 Pro'],
  ['Accesorios/Bambu Lab AMS HT', 'Bambu Lab AMS HT'],
  ['Accesorios/Bambu Lab AMS Lite', 'Bambu Lab AMS Lite'],
  ['Accesorios/Creality Rodillo Giratorio Pro', 'Creality Rodillo Giratorio Pro'],
  ['Accesorios/Creality Space Pi', 'Creality Space Pi'],
  ['Accesorios/Creality Space Pi Plus', 'Creality Space Pi Plus'],
  ['Accesorios/Creality Space Pi x4', 'Creality Space Pi x4'],
  ['Accesorios/Escáner 3D CR-Scan Raptor', 'Escáner 3D CR-Scan Raptor'],
  ['Filamentos/Bambu Lab PLA Lite (CON CARRETE)', 'Bambu Lab PLA Lite (CON CARRETE)'],
  ['Filamentos/Creality Ender Fast PLA', 'Creality Ender Fast PLA'],
  ['Filamentos/Creality Ender PLA+', 'Creality Ender PLA+'],
  ['Filamentos/Creality Hyper PETG', 'Creality Hyper PETG'],
  ['Grabadoras Láser/Creality Láser Falcon A1 Pro 20w', 'Creality László Falcon A1 Pro 20w'],
  ['Grabadoras Láser/Creality Láser Falcon Pro S 22w', 'Creality László Falcon Pro S 22w'],
  ['Grabadoras Láser/Creality László Falcon Pro S 40w', 'Creality László Falcon Pro S 40w'],
  ['Impresoras de resina/Creality Halot-X1 Combo', 'Creality Halot-X1 Combo']
];

let done = 0;
mappings.forEach(function(m) {
  db.run('UPDATE productos SET origen_carpeta = ? WHERE nombre = ?', [m[0], m[1]], function(err) {
    console.log('Updated: ' + m[1] + ' = ' + m[0] + ' (changes: ' + this.changes + ')');
    done++;
    if (done === mappings.length) {
      db.all('SELECT id, nombre, origen_carpeta FROM productos', [], function(err, rows) {
        console.log('\nAll products:');
        rows.forEach(function(r) { console.log(r.id + ': ' + r.nombre + ' -> ' + r.origen_carpeta); });
        db.close();
      });
    }
  });
});
