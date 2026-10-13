import dns from 'node:dns';
import mongoose from 'mongoose';

try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch {
  // Fallback si no está disponible o en entornos restringidos
}

export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(
      `[MongoDB Atlas] Conexión establecida con éxito: ${conn.connection.host}/${conn.connection.name}`
    );
  } catch (error) {
    console.error(
      `[MongoDB Atlas] Error al conectar a la base de datos: ${error.message}`
    );
    process.exit(1);
  }
};
