const express = require('express');
const fs = require('fs');
const path = require('path');
const pc = require('picocolors');

const app = express();
const PUERTO = 5082;

// ---------- Rutas de los ficheros de datos ----------
const DATOS_DIR = path.join(__dirname, 'DATOS_API');
const FICHERO_INCIDENCIAS = path.join(DATOS_DIR, 'incidencias.json');
const FICHERO_CLIENTES = path.join(DATOS_DIR, 'clientes.json');

// ---------- Persistencia en JSON ----------
function leerJSON(ruta) {
  return JSON.parse(fs.readFileSync(ruta, 'utf8'));
}

function guardarJSON(ruta, datos) {
  fs.writeFileSync(ruta, JSON.stringify(datos, null, 2), 'utf8');
}

let incidencias = leerJSON(FICHERO_INCIDENCIAS);
let clientes = leerJSON(FICHERO_CLIENTES);

// ---------- Middlewares ----------
app.use(express.json());

// Logger de consola: método, URL y código de estado (verde 2xx, rojo 4xx/5xx)
app.use((req, res, next) => {
  res.on('finish', () => {
    const estado = res.statusCode;
    let colorEstado = pc.yellow;
    if (estado >= 200 && estado < 300) colorEstado = pc.green;
    if (estado >= 400) colorEstado = pc.red;

    console.log(
      `${pc.bold(req.method)} ${req.originalUrl} -> ${colorEstado(String(estado))}`
    );
  });
  next();
});

// ---------- Endpoints de Incidencias ----------
app.get('/api/incidencias', (req, res) => {
  res.status(200).json(incidencias);
});

app.get('/api/incidencias/:codigo', (req, res) => {
  const incidencia = incidencias.find((i) => i.codigo === req.params.codigo);
  if (!incidencia) {
    return res.status(404).json({ error: `Incidencia ${req.params.codigo} no encontrada` });
  }
  res.status(200).json(incidencia);
});

app.post('/api/incidencias', (req, res) => {
  const { titulo, prioridad, fecha, descripcion } = req.body;

  // Código correlativo: H004, H005, ...
  const ultimoNumero = incidencias.reduce(
    (max, i) => Math.max(max, parseInt(i.codigo.slice(1), 10)),
    0
  );

  const nueva = {
    codigo: 'H' + String(ultimoNumero + 1).padStart(3, '0'),
    titulo,
    prioridad,
    fecha, // se guarda tal cual llega, sin new Date()
    descripcion,
    estado: 'Pendiente'
  };

  incidencias.push(nueva);
  guardarJSON(FICHERO_INCIDENCIAS, incidencias);
  res.status(201).json(nueva);
});

// ---------- Endpoints de Clientes (CRUD) ----------
app.get('/api/clientes', (req, res) => {
  res.status(200).json(clientes);
});

app.get('/api/clientes/:id', (req, res) => {
  const cliente = clientes.find((c) => c.id === Number(req.params.id));
  if (!cliente) {
    return res.status(404).json({ error: `Cliente ${req.params.id} no encontrado` });
  }
  res.status(200).json(cliente);
});

app.post('/api/clientes', (req, res) => {
  const { nombre, email, telefono } = req.body;

  const ultimoId = clientes.reduce((max, c) => Math.max(max, c.id), 0);

  const nuevo = { id: ultimoId + 1, nombre, email, telefono };

  clientes.push(nuevo);
  guardarJSON(FICHERO_CLIENTES, clientes);
  res.status(201).json(nuevo);
});

app.put('/api/clientes/:id', (req, res) => {
  const indice = clientes.findIndex((c) => c.id === Number(req.params.id));
  if (indice === -1) {
    return res.status(404).json({ error: `Cliente ${req.params.id} no encontrado` });
  }

  const { nombre, email, telefono } = req.body;
  clientes[indice] = { id: clientes[indice].id, nombre, email, telefono };

  guardarJSON(FICHERO_CLIENTES, clientes);
  res.status(200).json(clientes[indice]);
});

app.delete('/api/clientes/:id', (req, res) => {
  const indice = clientes.findIndex((c) => c.id === Number(req.params.id));
  if (indice === -1) {
    return res.status(404).json({ error: `Cliente ${req.params.id} no encontrado` });
  }

  const [eliminado] = clientes.splice(indice, 1);
  guardarJSON(FICHERO_CLIENTES, clientes);
  res.status(200).json(eliminado);
});

// ---------- Ruta no encontrada ----------
app.use((req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada' });
});

// ---------- Arranque ----------
app.listen(PUERTO, '127.0.0.1', () => {
  console.log(pc.cyan(`Servidor HelpDeskFX API escuchando en http://127.0.0.1:${PUERTO}/`));
});
