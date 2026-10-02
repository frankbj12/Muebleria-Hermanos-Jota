import PRODUCTS from '../data/products.js';

/**
 * Controlador de productos
 * Implementa el patrón de controladores para la API de Express (Sprint 03-04).
 */

/**
 * Obtiene el listado completo de productos.
 * GET /api/productos y GET /productos
 */
export const getProductos = (req, res, next) => {
  try {
    const { categoria, destacado } = req.query;
    let resultado = PRODUCTS;

    if (categoria && categoria !== 'todos') {
      resultado = resultado.filter(
        (p) => p.category.toLowerCase() === categoria.toLowerCase()
      );
    }

    if (destacado !== undefined) {
      const isFeatured = destacado === 'true' || destacado === '1';
      resultado = resultado.filter((p) => p.featured === isFeatured);
    }

    res.status(200).json(resultado);
  } catch (error) {
    next(error);
  }
};

/**
 * Obtiene un producto por su identificador único.
 * GET /api/productos/:id y GET /productos/:id
 */
export const getProductoById = (req, res, next) => {
  try {
    const { id } = req.params;
    const numericId = Number(id);

    if (isNaN(numericId)) {
      return res
        .status(400)
        .json({ error: 'El identificador del producto debe ser numérico' });
    }

    const producto = PRODUCTS.find((p) => p.id === numericId);

    if (!producto) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    res.status(200).json(producto);
  } catch (error) {
    next(error);
  }
};
