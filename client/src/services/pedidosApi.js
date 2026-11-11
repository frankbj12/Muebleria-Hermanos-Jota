import { apiRequest, getApiBaseUrl } from './apiClient';

const configuredBaseUrl = getApiBaseUrl().replace(/\/api\/productos$/, '');
const API_URL = `${configuredBaseUrl}/api/pedidos`;

function normalizeOrderItem(item) {
  if (!item || typeof item !== 'object') return item;

  const resolvedImage = item.image ?? item.imagenUrl ?? item.imagen;

  return {
    productId: item.productId ?? item.id ?? item._id ?? null,
    name: item.name ?? 'Producto',
    price:
      typeof item.price === 'number' ? item.price : Number(item.price) || 0,
    quantity:
      typeof item.quantity === 'number'
        ? item.quantity
        : Number(item.quantity) || 1,
    ...(resolvedImage ? { image: resolvedImage } : {}),
  };
}

function normalizeOrder(order) {
  if (!order || typeof order !== 'object') return order;

  return {
    ...order,
    id: order.id ?? order._id,
    items: Array.isArray(order.items)
      ? order.items.map(normalizeOrderItem)
      : [],
    total:
      typeof order.total === 'number' ? order.total : Number(order.total) || 0,
    status: order.status || 'pending',
    createdAt: order.createdAt || null,
  };
}

const pedidosApi = {
  /**
   * Obtiene el historial de pedidos del usuario autenticado.
   * El JWT se adjunta automáticamente mediante apiRequest.
   */
  async getMyOrders({ signal } = {}) {
    const data = await apiRequest(`${API_URL}/mis-pedidos`, { signal });
    const orders = Array.isArray(data)
      ? data
      : Array.isArray(data?.orders)
        ? data.orders
        : [];
    return orders.map(normalizeOrder);
  },
};

export default pedidosApi;
