export const AUTH_STORAGE_KEY = 'hermanos-jota-auth';
export const UNAUTHORIZED_EVENT = 'hermanos-jota:unauthorized';

export function getApiBaseUrl() {
  const configuredUrl = process.env.REACT_APP_API_URL?.replace(/\/+$/, '');
  return configuredUrl || 'http://localhost:5000';
}

export function getStoredToken() {
  try {
    const storedSession = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!storedSession) return null;

    const session = JSON.parse(storedSession);
    return typeof session.token === 'string' ? session.token : null;
  } catch (error) {
    console.error('No se pudo recuperar el token guardado:', error);
    return null;
  }
}

export async function apiRequest(path, options = {}) {
  const url = path.startsWith('http')
    ? path
    : `${getApiBaseUrl()}${path.startsWith('/') ? '' : '/'}${path}`;
  const token = getStoredToken();
  const headers = { ...(options.headers || {}) };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const requestOptions = { ...options };
  if (token || options.headers) {
    requestOptions.headers = headers;
  } else {
    delete requestOptions.headers;
  }

  const response = await fetch(url, requestOptions);
  if (!response) {
    throw new Error('La API no devolvió una respuesta.');
  }
  const contentType =
    typeof response.headers?.get === 'function'
      ? response.headers.get('content-type') || ''
      : '';
  const data = contentType.includes('application/json')
    ? await response.json()
    : null;

  if (response.status === 401) {
    window.dispatchEvent(new Event(UNAUTHORIZED_EVENT));
  }

  if (!response.ok) {
    const error = new Error(
      data?.error ||
        data?.message ||
      `Error en la petición: ${response.status} ${response.statusText || ''}`
    );
    error.status = response.status;
    throw error;
  }

  if (response.status !== 204 && data === null) {
    throw new Error('La API respondió con un formato inesperado.');
  }

  return data;
}
