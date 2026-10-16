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

const productosApi = {
  getAll({ signal } = {}) {
    return request(API_URL, { signal });
  },

  getById(id, { signal } = {}) {
    return request(`${API_URL}/${encodeURIComponent(id)}`, { signal });
  },

  create(product) {
    return request(API_URL, jsonOptions('POST', product));
  },

  update(id, product) {
    return request(
      `${API_URL}/${encodeURIComponent(id)}`,
      jsonOptions('PUT', product)
    );
  },

  remove(id) {
    return request(`${API_URL}/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
  },
};

export default productosApi;
