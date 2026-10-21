import Product from '../models/Product.js';

/**
 * Controlador de productos
 * Implementa el CRUD completo con persistencia en MongoDB (Mongoose) para el Sprint 05-06.
 */

/**
 * Obtiene todos los productos con soporte para filtros opcionales.
 * GET /api/productos
 */
export const getProductos = async (req, res, next) => {
  try {
    const { categoria, destacado } = req.query;
    const filtro = {};

    if (categoria && categoria.toLowerCase() !== 'todos') {
      filtro.categoria = new RegExp(`^${categoria}$`, 'i');
    }

    if (destacado !== undefined) {
      filtro.destacado = destacado === 'true' || destacado === '1';
    }

    const productos = await Product.find(filtro);
    res.status(200).json(productos);
  } catch (error) {
    next(error);
  }
};

/**
 * Obtiene un producto por su ObjectId.
 * GET /api/productos/:id
 */
export const getProductoById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const producto = await Product.findById(id);

    if (!producto) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    res.status(200).json(producto);
  } catch (error) {
    next(error);
  }
};

/**
 * Crea un nuevo producto en la base de datos.
 * POST /api/productos
 */
export const createProducto = async (req, res, next) => {
  try {
    const datos = {
      ...req.body,
      nombre: req.body.nombre || req.body.name,
      descripcion: req.body.descripcion || req.body.description,
      precio: req.body.precio !== undefined ? req.body.precio : req.body.price,
      imagenUrl: req.body.imagenUrl || req.body.image,
      categoria: req.body.categoria || req.body.category,
      destacado:
        req.body.destacado !== undefined
          ? req.body.destacado
          : req.body.featured,
    };

    const nuevoProducto = await Product.create(datos);
    res.status(201).json(nuevoProducto);
  } catch (error) {
    next(error);
  }
};

/**
 * Actualiza un producto existente por su ObjectId.
 * PUT /api/productos/:id
 */
export const updateProducto = async (req, res, next) => {
  try {
    const { id } = req.params;
    const datosActualizados = {
      ...req.body,
    };

    if (req.body.name && !req.body.nombre)
      datosActualizados.nombre = req.body.name;
    if (req.body.description && !req.body.descripcion)
      datosActualizados.descripcion = req.body.description;
    if (req.body.price !== undefined && req.body.precio === undefined)
      datosActualizados.precio = req.body.price;
    if (req.body.image && !req.body.imagenUrl)
      datosActualizados.imagenUrl = req.body.image;
    if (req.body.category && !req.body.categoria)
      datosActualizados.categoria = req.body.category;
    if (req.body.featured !== undefined && req.body.destacado === undefined)
      datosActualizados.destacado = req.body.featured;

    const productoActualizado = await Product.findByIdAndUpdate(
      id,
      datosActualizados,
      {
        new: true,
        returnDocument: 'after',
        runValidators: true,
      }
    );

    if (!productoActualizado) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    res.status(200).json(productoActualizado);
  } catch (error) {
    next(error);
  }
};

/**
 * Elimina un producto por su ObjectId.
 * DELETE /api/productos/:id
 */
export const deleteProducto = async (req, res, next) => {
  try {
    const { id } = req.params;
    const productoEliminado = await Product.findByIdAndDelete(id);

    if (!productoEliminado) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    res.status(200).json({
      message: 'Producto eliminado con éxito',
      producto: productoEliminado,
    });
  } catch (error) {
    next(error);
  }
};
