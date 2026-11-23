const express = require('express');
const pc = require('picocolors');
const incidenciasRouter = require('./modules/incidencias');
const clientesRouter = require('./modules/clientes');

const app = express();
const PUERTO = 5082;

// Logger de consola: método, URL y código de estado (verde 2xx, rojo 4xx/5xx)
app.use((req, res, next) => {
  res.on('finish', () => {
    const estado = res.statusCode;
    let color = pc.yellow;
    if (estado >= 200 && estado < 300) color = pc.green;
    if (estado >= 400) color = pc.red;
    console.log(`${pc.bold(req.method)} ${req.originalUrl} -> ${color(String(estado))}`);
  });
  next();
});

app.use(express.json());

app.use('/api/incidencias', incidenciasRouter);
app.use('/api/clientes', clientesRouter);

app.use((req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada' });
});

app.listen(PUERTO, '127.0.0.1', () => {
  console.log(pc.cyan(`Servidor HelpDeskFX API escuchando en http://127.0.0.1:${PUERTO}/`));
});
