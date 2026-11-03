export const getJwtSecret = () => {
  if (!process.env.JWT_SECRET) {
    const error = new Error('JWT_SECRET no está configurado en el servidor.');
    error.statusCode = 500;
    throw error;
  }

  return process.env.JWT_SECRET;
};

export const getJwtExpiresIn = () => process.env.JWT_EXPIRES_IN || '1d';
