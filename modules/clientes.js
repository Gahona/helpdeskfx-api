const express = require('express');
const { leer, guardar } = require('./persistencia');

const router = express.Router();
const FICHERO = 'clientes.json';
let clientes = leer(FICHERO);

// GET /api/clientes
router.get('/', (req, res) => {
  res.status(200).json(clientes);
});

// GET /api/clientes/:id
router.get('/:id', (req, res) => {
  const cliente = clientes.find((c) => c.id === Number(req.params.id));
  if (!cliente) {
    return res.status(404).json({ error: `Cliente ${req.params.id} no encontrado` });
  }
  res.status(200).json(cliente);
});

// POST /api/clientes
router.post('/', (req, res) => {
  const { nombre, email, telefono } = req.body;
  const ultimoId = clientes.reduce((max, c) => Math.max(max, c.id), 0);
  const nuevo = { id: ultimoId + 1, nombre, email, telefono };

  clientes.push(nuevo);
  guardar(FICHERO, clientes);
  res.status(201).json(nuevo);
});

// PUT /api/clientes/:id
router.put('/:id', (req, res) => {
  const indice = clientes.findIndex((c) => c.id === Number(req.params.id));
  if (indice === -1) {
    return res.status(404).json({ error: `Cliente ${req.params.id} no encontrado` });
  }

  const { nombre, email, telefono } = req.body;
  clientes[indice] = { id: clientes[indice].id, nombre, email, telefono };

  guardar(FICHERO, clientes);
  res.status(200).json(clientes[indice]);
});

// DELETE /api/clientes/:id
router.delete('/:id', (req, res) => {
  const indice = clientes.findIndex((c) => c.id === Number(req.params.id));
  if (indice === -1) {
    return res.status(404).json({ error: `Cliente ${req.params.id} no encontrado` });
  }

  const [eliminado] = clientes.splice(indice, 1);
  guardar(FICHERO, clientes);
  res.status(200).json(eliminado);
});

module.exports = router;
