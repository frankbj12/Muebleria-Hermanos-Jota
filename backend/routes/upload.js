import { Router } from 'express';
import multer from 'multer';
import { put, list, del } from '@vercel/blob';

const router = Router();

// Configuración de multer: almacenamiento en memoria RAM (Buffer) y límite de 5MB
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
});

// GET /api/upload - Listar imágenes almacenadas en Vercel Blob
router.get('/', async (req, res, next) => {
  try {
    const token = process.env.BLOB_READ_WRITE_TOKEN;
    if (!token) {
      return res.status(500).json({ error: 'BLOB_READ_WRITE_TOKEN no está configurado en el servidor.' });
    }

    const response = await list({ token });
    // Ordenar de más reciente a más antiguo
    const blobs = (response.blobs || []).sort(
      (a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
    );

    res.status(200).json({ blobs });
  } catch (error) {
    next(error);
  }
});

// POST /api/upload - Subir una imagen a Vercel Blob
router.post('/', upload.single('image'), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No se envió ninguna imagen.' });
    }

    if (!req.file.mimetype.startsWith('image/')) {
      return res.status(400).json({ error: 'El archivo debe ser una imagen válida (JPG, PNG, WEBP).' });
    }

    // Sanitizar el nombre del archivo para evitar caracteres inválidos en la URL
    const sanitizedOriginalName = req.file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
    const blobPath = `products/${Date.now()}-${sanitizedOriginalName}`;

    // Subida a Vercel Blob usando el token de entorno
    const blob = await put(blobPath, req.file.buffer, {
      access: 'public',
      contentType: req.file.mimetype,
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });

    res.status(200).json({ url: blob.url });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/upload - Eliminar una imagen de Vercel Blob por su URL
router.delete('/', async (req, res, next) => {
  try {
    const token = process.env.BLOB_READ_WRITE_TOKEN;
    if (!token) {
      return res.status(500).json({ error: 'BLOB_READ_WRITE_TOKEN no está configurado en el servidor.' });
    }

    const url = req.body?.url || req.query?.url;
    if (!url) {
      return res.status(400).json({ error: 'Se requiere la URL de la imagen a eliminar.' });
    }

    await del(url, { token });

    res.status(200).json({ success: true, message: 'Imagen eliminada exitosamente de Vercel Blob.' });
  } catch (error) {
    next(error);
  }
});

export default router;
