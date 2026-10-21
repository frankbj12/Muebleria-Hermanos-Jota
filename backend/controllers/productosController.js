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
    const name = req.body.name || req.body.nombre;
    const description = req.body.description || req.body.descripcion || '';
    const price =
      req.body.price !== undefined ? req.body.price : req.body.precio;
    const stock = req.body.stock !== undefined ? req.body.stock : 0;
    const image = req.body.image || req.body.imagenUrl || '';
    const category = req.body.category || req.body.categoria || 'general';
    const featured =
      req.body.featured !== undefined
        ? req.body.featured
        : req.body.destacado !== undefined
          ? req.body.destacado
          : false;

    const datos = {
      ...req.body,
      name,
      nombre: name,
      description,
      descripcion: description,
      price,
      precio: price,
      stock,
      image,
      imagenUrl: image,
      category,
      categoria: category,
      featured,
      destacado: featured,
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

    if (req.body.name || req.body.nombre) {
      const val = req.body.name || req.body.nombre;
      datosActualizados.name = val;
      datosActualizados.nombre = val;
    }
    if (
      req.body.description !== undefined ||
      req.body.descripcion !== undefined
    ) {
      const val =
        req.body.description !== undefined
          ? req.body.description
          : req.body.descripcion;
      datosActualizados.description = val;
      datosActualizados.descripcion = val;
    }
    if (req.body.price !== undefined || req.body.precio !== undefined) {
      const val =
        req.body.price !== undefined ? req.body.price : req.body.precio;
      datosActualizados.price = val;
      datosActualizados.precio = val;
    }
    if (req.body.stock !== undefined) {
      datosActualizados.stock = req.body.stock;
    }
    if (req.body.image !== undefined || req.body.imagenUrl !== undefined) {
      const val =
        req.body.image !== undefined ? req.body.image : req.body.imagenUrl;
      datosActualizados.image = val;
      datosActualizados.imagenUrl = val;
    }
    if (req.body.category || req.body.categoria) {
      const val = req.body.category || req.body.categoria;
      datosActualizados.category = val;
      datosActualizados.categoria = val;
    }
    if (req.body.featured !== undefined || req.body.destacado !== undefined) {
      const val =
        req.body.featured !== undefined
          ? req.body.featured
          : req.body.destacado;
      datosActualizados.featured = val;
      datosActualizados.destacado = val;
    }

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
