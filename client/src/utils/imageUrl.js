/**
 * Imagen de respaldo por defecto cuando un mueble no tiene imagen o la imagen
 * de la nube fue eliminada / da error 404.
 */
export const FALLBACK_PRODUCT_IMAGE = '/assets/products/Imagen Mantenimiento.png';

/**
 * Normaliza y devuelve la URL correcta para la imagen de un producto.
 * Soporta:
 * - URLs web externas (http://, https://)
 * - Data URLs en Base64 (data:image/...)
 * - Blobs temporales (blob:...)
 * - Rutas relativas internas del proyecto (assets/products/... o /assets/products/...)
 *
 * @param {string|null|undefined} image
 * @returns {string} URL utilizable directamente en la propiedad src de un <img>
 */
export function getProductImageUrl(image) {
  if (!image || typeof image !== 'string') {
    return FALLBACK_PRODUCT_IMAGE;
  }

  const trimmed = image.trim();
  if (!trimmed) {
    return FALLBACK_PRODUCT_IMAGE;
  }

  // Si ya es una URL externa o base64, usarla directamente sin anteponer '/'
  if (
    trimmed.startsWith('http://') ||
    trimmed.startsWith('https://') ||
    trimmed.startsWith('data:') ||
    trimmed.startsWith('blob:')
  ) {
    return trimmed;
  }

  // Si es una ruta local relativa del proyecto, garantizar barra inicial
  return trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
}

