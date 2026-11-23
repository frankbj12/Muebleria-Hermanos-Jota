import 'dotenv/config'; // Primera línea para garantizar carga de variables
import app from './app.js';
import { connectDB } from './config/db.js';

const PORT = process.env.PORT || 5000;

// Conectar a la base de datos
connectDB();

app.listen(PORT, () => {
  console.log(`Servidor Backend corriendo en el puerto ${PORT}`);
});

export default app;
