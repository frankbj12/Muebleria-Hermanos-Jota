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
    user: order.user,
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
   * [Admin] Obtiene todos los pedidos de todos los usuarios.
   */
  async getAllOrders({ signal } = {}) {
    const data = await apiRequest(`${API_URL}/admin/all`, { signal });
    const orders = Array.isArray(data)
      ? data
      : Array.isArray(data?.orders)
        ? data.orders
        : [];
    return orders.map(normalizeOrder);
  },

  /**
   * [Admin] Actualiza el estado de un pedido.
   * @param {string} id - ID del pedido
   * @param {string} status - Nuevo estado
   */
  async updateOrderStatus(id, status) {
    const data = await apiRequest(`${API_URL}/admin/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    return normalizeOrder(data);
  },

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

  /**
   * Crea un nuevo pedido para el usuario autenticado.
   * Envía solo { items: [{ productId, quantity }] }; el servidor valida stock y calcula el total.
   */
  async createOrder(items) {
    const normalizedItems = Array.isArray(items)
      ? items
          .map((item) => ({
            productId: String(item?.productId ?? item?.id ?? item?._id ?? ''),
            quantity: Number(item?.quantity) || 1,
          }))
          .filter((item) => item.productId)
      : [];

    const data = await apiRequest(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items: normalizedItems }),
    });

    return normalizeOrder(data?.order ?? data);
  },
};

export default pedidosApi;
