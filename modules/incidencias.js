const express = require('express');
const { leer, guardar } = require('./persistencia');

const router = express.Router();
const FICHERO = 'incidencias.json';
let incidencias = leer(FICHERO);

// GET /api/incidencias
router.get('/', (req, res) => {
  res.status(200).json(incidencias);
});

// GET /api/incidencias/:codigo
router.get('/:codigo', (req, res) => {
  const incidencia = incidencias.find((i) => i.codigo === req.params.codigo);
  if (!incidencia) {
    return res.status(404).json({ error: `Incidencia ${req.params.codigo} no encontrada` });
  }
  res.status(200).json(incidencia);
});

// POST /api/incidencias
router.post('/', (req, res) => {
  const { titulo, prioridad, fecha, descripcion } = req.body;

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
  guardar(FICHERO, incidencias);
  res.status(201).json(nueva);
});

module.exports = router;
