const fs = require('fs');
const path = require('path');

const DATOS_DIR = path.join(__dirname, '..', 'DATOS_API');

function leer(fichero) {
  return JSON.parse(fs.readFileSync(path.join(DATOS_DIR, fichero), 'utf8'));
}

function guardar(fichero, datos) {
  fs.writeFileSync(path.join(DATOS_DIR, fichero), JSON.stringify(datos, null, 2), 'utf8');
}

module.exports = { leer, guardar };
