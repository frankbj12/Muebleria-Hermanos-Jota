import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useToast } from '../../context/ToastContext';
import {
  getProductImageUrl,
  FALLBACK_PRODUCT_IMAGE,
} from '../../utils/imageUrl';

const PRODUCT_MODEL_MAP = [
  {
    keywords: ['biblioteca', 'recoleta'],
    model: '/models/biblioteca_recoleta.glb',
  },
  { keywords: ['aparador', 'uspallata'], model: '/models/aparador.glb' },
  { keywords: ['sillon', 'copacabana'], model: '/models/sillon.glb' },
  { keywords: ['silla', 'cordoba'], model: '/models/silla.glb' },
  { keywords: ['escritorio', 'costa'], model: '/models/escritorio.glb' },
];

const getProductModelUrl = (product) => {
  if (!product) return null;
  if (product.modelUrl) return product.modelUrl;
  const normalizedName = (product.name || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
  const match = PRODUCT_MODEL_MAP.find(({ keywords }) =>
    keywords.every((kw) => normalizedName.includes(kw))
  );
  return match ? match.model : null;
};

/**
 * Formatea un número como moneda en pesos argentinos (ARS).
 * @param {number} price
 * @returns {string}
 */
const formatPrice = (price) => {
  if (typeof price !== 'number') return '$ 0';
  return '$\u00A0' + price.toLocaleString('es-AR');
};

/**
 * Mapeo de categorías a etiquetas legibles
 */
const getCategoryLabel = (cat) => {
  const map = {
    living: 'Living & Sala',
    comedor: 'Comedor',
    dormitorio: 'Dormitorio',
    almacenamiento: 'Almacenamiento',
    trabajo: 'Espacios de Trabajo',
  };
  return map[cat] || (cat ? cat.charAt(0).toUpperCase() + cat.slice(1) : '');
};

/**
 * Componente ProductDetail
 * Muestra el detalle completo de un producto seleccionado (fiel al diseño legacy)
 * o un placeholder amigable si no hay ninguno seleccionado.
 *
 * @param {Object} props
 * @param {Object|null} props.product - Datos del producto seleccionado
 * @param {Function} [props.onClearSelection] - Callback opcional para volver a la lista
 */
function ProductDetail({ product, onClearSelection }) {
  const { cart, addToCart } = useCart();
  const { addToast } = useToast();
  const is3DFromUrl =
    typeof window !== 'undefined' &&
    new URLSearchParams(window.location.search).get('vista') === '3d';
  const [show3D, setShow3D] = useState(is3DFromUrl);
  const [showQrModal, setShowQrModal] = useState(false);
  const modelViewerRef = useRef(null);

  useEffect(() => {
    const viewer = modelViewerRef.current;
    if (!is3DFromUrl || !viewer) return;

    const handleLoad = () => {
      try {
        if (typeof viewer.activateAR === 'function') {
          viewer.activateAR();
        }
      } catch {
        // Algunos navegadores bloquean AR sin toque previo; el botón AR queda visible.
      }
    };

    viewer.addEventListener('load', handleLoad);
    return () => viewer.removeEventListener('load', handleLoad);
  }, [is3DFromUrl]);

  if (!product) {
    return (
      <section
        className="product-detail"
        id="product-detail"
        aria-label="Detalle de producto"
      >
        <div className="container">
          <div
            className="catalog-empty"
            style={{
              gridColumn: '1 / -1',
              margin: '2rem 0',
              textAlign: 'center',
            }}
          >
            <span
              style={{
                fontSize: '3rem',
                display: 'block',
                marginBottom: '1rem',
              }}
              role="img"
              aria-label="mueble"
            >
              🪑
            </span>
            <h2>Ningún producto seleccionado</h2>
            <p>
              Seleccioná cualquier mueble del catálogo para ver sus detalles de
              fabricación, medidas y materiales.
            </p>
          </div>
        </div>
      </section>
    );
  }

  const { name, category, description, price, image, specs, stock } = product;
  const modelUrl = getProductModelUrl(product);
  const qrTargetUrl = (() => {
    if (typeof window === 'undefined') return '';
    const url = new URL(window.location.href);
    url.searchParams.set('vista', '3d');
    return url.toString();
  })();
  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrTargetUrl)}`;

  const productId = product.id ?? product._id;
  const itemInCart = cart.find((item) => (item.id ?? item._id) === productId);
  const inCartQty = itemInCart ? itemInCart.quantity || 1 : 0;
  const hasStock = typeof stock === 'number';
  const isOutOfStock = hasStock && stock === 0;
  const remainingStock = hasStock ? Math.max(0, stock - inCartQty) : null;
  const isMaxInCart = hasStock && !isOutOfStock && remainingStock === 0;
  const isLowStock =
    hasStock && !isOutOfStock && remainingStock > 0 && remainingStock <= 3;

  const handleAdd = () => {
    if (!product || isOutOfStock) return;
    if (isMaxInCart) {
      addToast(
        `Ya agregaste todas las unidades disponibles de este mueble (${stock} ${stock === 1 ? 'unidad' : 'unidades'}).`,
        'warning'
      );
      return;
    }

    const added = addToCart(product);
    if (added !== false) {
      addToast('¡Producto añadido al carrito con éxito!', 'success');
    } else {
      addToast('No hay más unidades disponibles de este mueble.', 'warning');
    }
  };

  return (
    <section
      className="product-detail"
      id="product-detail"
      aria-label={`Detalle de ${name}`}
    >
      <div className="container">
        {onClearSelection && (
          <nav
            className="product-breadcrumb container"
            aria-label="Ruta de navegación"
          >
            <Link to="/">Inicio</Link>
            <span>›</span>
            <Link to="/productos">Productos</Link>
            <span>›</span>
            <span id="breadcrumb-name">{name}</span>
          </nav>
        )}

        <div className="product-detail-grid" id="product-detail-content">
          <div className="product-gallery-column">
            <div className="product-gallery">
              {modelUrl && show3D ? (
                <model-viewer
                  ref={modelViewerRef}
                  src={modelUrl}
                  alt={`Modelo 3D de ${name}`}
                  ar
                  ar-modes="webxr scene-viewer quick-look"
                  camera-controls
                  auto-rotate
                  shadow-intensity="1"
                  style={{
                    width: '100%',
                    height: '420px',
                    backgroundColor: '#f8f5f0',
                    borderRadius: '12px',
                  }}
                >
                  <button
                    slot="ar-button"
                    type="button"
                    className="btn btn-primary"
                    style={{
                      position: 'absolute',
                      bottom: '16px',
                      right: '16px',
                    }}
                  >
                    Ver en tu espacio (AR)
                  </button>
                </model-viewer>
              ) : (
                <img
                  src={getProductImageUrl(image)}
                  alt={name}
                  loading="lazy"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = FALLBACK_PRODUCT_IMAGE;
                  }}
                />
              )}
            </div>

            {modelUrl && (
              <div
                style={{
                  display: 'flex',
                  gap: '0.5rem',
                  marginTop: '0.75rem',
                  justifyContent: 'center',
                }}
              >
                <button
                  type="button"
                  className={`btn ${!show3D ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => setShow3D(false)}
                >
                  Foto
                </button>
                <button
                  type="button"
                  className={`btn ${show3D ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => setShow3D(true)}
                >
                  Vista 3D
                </button>
              </div>
            )}
          </div>

          <div className="product-info">
            <div className="product-card-meta">
              {category && (
                <span className="product-card-category">
                  {getCategoryLabel(category)}
                </span>
              )}
              {hasStock && (
                <span
                  className={`stock-badge stock-badge--lg ${
                    isOutOfStock
                      ? 'stock-badge--out'
                      : isMaxInCart
                        ? 'stock-badge--low'
                        : isLowStock
                          ? 'stock-badge--low'
                          : 'stock-badge--in'
                  }`}
                  id="product-detail-stock-badge"
                  data-testid="product-detail-stock"
                >
                  {isOutOfStock
                    ? 'Sin stock'
                    : isMaxInCart
                      ? `Límite en carrito (${stock} de ${stock})`
                      : inCartQty > 0
                        ? `${remainingStock} disponibles (${inCartQty} en carrito)`
                        : remainingStock <= 3
                          ? `¡Últimas ${remainingStock} unidades!`
                          : `${remainingStock} unidades disponibles`}
                </span>
              )}
            </div>

            <h1>{name}</h1>
            <p className="product-description">{description}</p>
            <span className="product-price-tag">{formatPrice(price)}</span>

            {isOutOfStock && (
              <div
                className="out-of-stock-alert"
                role="alert"
                id="out-of-stock-alert"
              >
                <strong>Aviso:</strong> Este mueble se encuentra temporalmente
                agotado. No es posible agregarlo al carrito en este momento.
              </div>
            )}

            {isMaxInCart && (
              <div
                className="out-of-stock-alert out-of-stock-alert--warning"
                role="alert"
                id="max-stock-alert"
              >
                <strong>Stock máximo alcanzado:</strong> Ya tenés en tu carrito
                todas las unidades disponibles ({stock} de {stock}) de este
                mueble.
              </div>
            )}

            <div className="product-actions">
              <button
                type="button"
                className={`btn btn-primary ${isOutOfStock || isMaxInCart ? 'btn-disabled' : ''}`}
                id="btn-add-cart"
                onClick={handleAdd}
                disabled={isOutOfStock || isMaxInCart}
                aria-disabled={isOutOfStock || isMaxInCart}
              >
                {isOutOfStock
                  ? 'Sin stock'
                  : isMaxInCart
                    ? 'Máximo en carrito'
                    : 'Añadir al Carrito'}
              </button>
              {modelUrl && (
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowQrModal((prev) => !prev)}
                >
                  {showQrModal ? 'Ocultar QR 3D' : 'Ver en tu espacio (QR)'}
                </button>
              )}
              {onClearSelection && (
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={onClearSelection}
                >
                  Seguir mirando
                </button>
              )}
            </div>

            {modelUrl && showQrModal && (
              <div
                style={{
                  marginTop: '1rem',
                  padding: '1rem',
                  border: '1px solid #e5dfd5',
                  borderRadius: '12px',
                  backgroundColor: '#faf7f2',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  flexWrap: 'wrap',
                }}
              >
                <img
                  src={qrImageUrl}
                  alt={`Código QR para ver ${name} en 3D`}
                  width={140}
                  height={140}
                  style={{ borderRadius: '8px', backgroundColor: '#fff' }}
                />
                <div style={{ flex: '1 1 200px' }}>
                  <strong style={{ display: 'block', marginBottom: '0.35rem' }}>
                    Proyectalo en tu espacio con el celular
                  </strong>
                  <p
                    style={{ margin: 0, fontSize: '0.92rem', lineHeight: 1.45 }}
                  >
                    Escaneá este QR con la cámara de tu teléfono, tocá{' '}
                    <strong>Vista 3D</strong> y luego{' '}
                    <strong>Ver en tu espacio (AR)</strong>.
                  </p>
                </div>
              </div>
            )}

            {specs && Object.keys(specs).length > 0 && (
              <div className="product-specs">
                <h3>Detalles de Fabricación</h3>
                <table className="specs-table">
                  <tbody>
                    {Object.entries(specs).map(([key, val]) => (
                      <tr key={key}>
                        <td
                          style={{
                            textTransform: 'capitalize',
                            fontWeight: 600,
                          }}
                        >
                          {key}
                        </td>
                        <td>{val}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

export default ProductDetail;
