import mongoose from 'mongoose';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import User from '../models/User.js';

class OrderRequestError extends Error {
  constructor(message, statusCode = 400) {
    super(message);
    this.statusCode = statusCode;
  }
}

const validateAndCombineItems = (items) => {
  if (!Array.isArray(items) || items.length === 0) {
    throw new OrderRequestError('El pedido debe contener productos válidos.');
  }

  const quantitiesByProduct = new Map();

  for (const item of items) {
    if (
      !item ||
      typeof item.productId !== 'string' ||
      !/^[a-f\d]{24}$/i.test(item.productId) ||
      !Number.isSafeInteger(item.quantity) ||
      item.quantity < 1
    ) {
      throw new OrderRequestError(
        'Cada producto debe tener un productId válido y una cantidad entera mayor a cero.'
      );
    }

    const productId = item.productId.toLowerCase();
    const quantity = (quantitiesByProduct.get(productId) || 0) + item.quantity;

    if (!Number.isSafeInteger(quantity)) {
      throw new OrderRequestError('La cantidad solicitada no es válida.');
    }

    quantitiesByProduct.set(productId, quantity);
  }

  return [...quantitiesByProduct].map(([productId, quantity]) => ({
    productId,
    quantity,
  }));
};

const getAuthenticatedUserId = (req) => {
  if (typeof req.user?.id !== 'string' || !/^[a-f\d]{24}$/i.test(req.user.id)) {
    throw new OrderRequestError('Token inválido o expirado.', 401);
  }

  return new mongoose.Types.ObjectId(req.user.id);
};

export const createPedido = async (req, res, next) => {
  let items;
  let userId;

  try {
    items = validateAndCombineItems(req.body?.items);
    userId = getAuthenticatedUserId(req);
  } catch (error) {
    return res.status(error.statusCode || 400).json({ error: error.message });
  }

  let session;

  try {
    session = await mongoose.startSession();
    const order = await session.withTransaction(async () => {
      const userExists = await User.exists({ _id: userId }).session(session);

      if (!userExists) {
        throw new OrderRequestError('Usuario no encontrado.', 401);
      }

      const orderItems = [];

      for (const item of items) {
        const product = await Product.findOneAndUpdate(
          {
            _id: item.productId,
            stock: { $gte: item.quantity },
          },
          { $inc: { stock: -item.quantity } },
          { new: true, session }
        );

        if (!product) {
          throw new OrderRequestError(
            'Uno o más productos no existen o no tienen stock suficiente.'
          );
        }

        orderItems.push({
          productId: product._id,
          name: product.name,
          price: product.price,
          quantity: item.quantity,
        });
      }

      const calculatedTotal = orderItems.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      );

      if (!Number.isFinite(calculatedTotal)) {
        throw new OrderRequestError('El total del pedido no es válido.');
      }

      const total = Number(calculatedTotal.toFixed(2));
      const [createdOrder] = await Order.create(
        [{ user: userId, items: orderItems, total }],
        { session }
      );

      return createdOrder;
    });

    return res.status(201).json({ order });
  } catch (error) {
    if (error instanceof OrderRequestError) {
      return res.status(error.statusCode).json({ error: error.message });
    }

    return next(error);
  } finally {
    if (session) {
      await session.endSession();
    }
  }
};

export const getMisPedidos = async (req, res, next) => {
  try {
    const userId = getAuthenticatedUserId(req);
    const orders = await Order.find({ user: userId }).sort({ createdAt: -1 });

    return res.status(200).json(orders);
  } catch (error) {
    if (error instanceof OrderRequestError) {
      return res.status(error.statusCode).json({ error: error.message });
    }

    return next(error);
  }
};
