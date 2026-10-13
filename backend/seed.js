import dns from 'node:dns';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import PRODUCTS from './data/products.js';

try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch {
  // Fallback si no está disponible
}

dotenv.config();

const runSeed = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error('Falta la variable MONGODB_URI en el entorno.');
    }

    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Conectado a MongoDB para poblar catálogo...');

    const db = mongoose.connection.db;
    const collection = db.collection('products');

    // 1. Limpieza para garantizar idempotencia
    await collection.deleteMany({});
    console.log('Colección "products" limpiada con éxito.');

    // 2. Mapeo al nuevo modelo requerido por el Sprint
    const mappedProducts = PRODUCTS.map((item) => ({
      name: item.name,
      description: item.description,
      price: item.price,
      stock: 10, // Stock inicial por defecto
      image: item.image,
      category: item.category || 'living',
      featured: Boolean(item.featured),
      specs: item.specs || {},
      createdAt: new Date(),
      updatedAt: new Date(),
    }));

    // 3. Inserción masiva
    const result = await collection.insertMany(mappedProducts);
    console.log(`¡Éxito! Se insertaron ${result.insertedCount} productos.`);

    await mongoose.disconnect();
    console.log('Desconectado de MongoDB.');
    process.exit(0);
  } catch (error) {
    console.error('Error durante la ejecución del seed:', error);
    process.exit(1);
  }
};

runSeed();
