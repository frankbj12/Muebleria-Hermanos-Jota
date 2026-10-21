const configuredApiUrl = process.env.REACT_APP_API_URL?.replace(/\/+$/, '');
const API_URL = configuredApiUrl
  ? configuredApiUrl.endsWith('/api/productos')
    ? configuredApiUrl
    : `${configuredApiUrl}/api/productos`
  : 'http://localhost:5000/api/productos';

async function request(url, options = {}) {
  const response = await fetch(url, options);
  const contentType = response.headers.get('content-type') || '';
  const data = contentType.includes('application/json')
    ? await response.json()
    : null;

  if (!response.ok) {
    const error = new Error(
      data?.error ||
        data?.message ||
        `Error en la petición: ${response.status} ${response.statusText}`
    );
    error.status = response.status;
    throw error;
  }

  if (response.status !== 204 && data === null) {
    throw new Error('La API respondió con un formato inesperado.');
  }

  return data;
}

function jsonOptions(method, product) {
  return {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(product),
  };
}

function normalizeProduct(product) {
  if (!product || typeof product !== 'object') return product;

  const {
    _id,
    id,
    nombre,
    descripcion,
    precio,
    imagen,
    imagenUrl,
    categoria,
    destacado,
    detalles,
    ...englishFields
  } = product;

  return {
    ...englishFields,
    id: id ?? _id,
    name: product.name ?? nombre,
    description: product.description ?? descripcion ?? '',
    price: product.price ?? precio,
    image: product.image ?? imagenUrl ?? imagen ?? '',
    category: product.category ?? categoria ?? 'general',
    featured: product.featured ?? destacado ?? false,
    specs: product.specs ?? detalles ?? {},
  };
}

function normalizeProductResponse(data) {
  if (Array.isArray(data)) return data.map(normalizeProduct);
  return normalizeProduct(data);
}

const productosApi = {
  async getAll({ signal } = {}) {
    return normalizeProductResponse(await request(API_URL, { signal }));
  },

  async getById(id, { signal } = {}) {
    return normalizeProductResponse(
      await request(`${API_URL}/${encodeURIComponent(id)}`, { signal })
    );
  },

  async create(product) {
    return normalizeProductResponse(
      await request(API_URL, jsonOptions('POST', product))
    );
  },

  async update(id, product) {
    return normalizeProductResponse(
      await request(
        `${API_URL}/${encodeURIComponent(id)}`,
        jsonOptions('PUT', product)
      )
    );
  },

  async remove(id) {
    const data = await request(`${API_URL}/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });

    if (!data || typeof data !== 'object' || Array.isArray(data)) return data;

    const { producto, ...englishFields } = data;
    if (producto) englishFields.product = normalizeProduct(producto);
    return englishFields;
  },
};

export default productosApi;
