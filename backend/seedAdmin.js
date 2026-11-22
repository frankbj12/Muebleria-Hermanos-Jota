import 'dotenv/config';
import mongoose from 'mongoose';
import User from './models/User.js';

const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

const validateAdminConfig = () => {
  const { ADMIN_EMAIL, ADMIN_PASSWORD } = process.env;
  const name = process.env.ADMIN_NAME || 'Administrador';

  if (!process.env.MONGODB_URI) {
    throw new Error('Falta la variable MONGODB_URI en el entorno.');
  }

  if (
    !ADMIN_EMAIL ||
    !isValidEmail(ADMIN_EMAIL.trim()) ||
    typeof ADMIN_PASSWORD !== 'string' ||
    ADMIN_PASSWORD.length < 8 ||
    Buffer.byteLength(ADMIN_PASSWORD, 'utf8') > 72
  ) {
    throw new Error(
      'Configurá ADMIN_EMAIL válido y ADMIN_PASSWORD de entre 8 y 72 bytes.'
    );
  }

  return {
    name: name.trim() || 'Administrador',
    email: ADMIN_EMAIL.trim().toLowerCase(),
    password: ADMIN_PASSWORD,
  };
};

const seedAdmin = async () => {
  const adminData = validateAdminConfig();

  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const existingUser = await User.findOne({ email: adminData.email });

    if (existingUser) {
      if (existingUser.role !== 'admin') {
        throw new Error(
          'ADMIN_EMAIL ya pertenece a un usuario no administrador; no se modificó su rol.'
        );
      }

      console.log(
        'El usuario administrador ya existe; no se realizaron cambios.'
      );
      return;
    }

    await User.create({ ...adminData, role: 'admin' });
    console.log('Usuario administrador creado correctamente.');
  } finally {
    await mongoose.disconnect();
  }
};

seedAdmin().catch((error) => {
  console.error(`No se pudo crear el usuario administrador: ${error.message}`);
  process.exitCode = 1;
});
