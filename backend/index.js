import express from 'express';

const app = express();
const PORT = process.env.PORT || 5000;

// TODO (Sprint 03-04): Configurar middlewares globales (express.json(), logger)

// TODO (Sprint 03-04): Definir rutas con express.Router (/api/productos)

// TODO (Sprint 03-04): Configurar manejador de 404 y manejador de errores centralizado

app.listen(PORT, () => {
  console.log(`Servidor Backend corriendo en el puerto ${PORT}`);
});
