import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useToast } from '../../context/ToastContext';

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

  const itemInCart = cart.find((item) => item.id === product.id);
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
          <div className="product-gallery">
            <img
              src={image?.startsWith('/') ? image : `/${image}`}
              alt={name}
              loading="lazy"
            />
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
                <strong>Aviso:</strong> Este mueble se encuentra temporalmente agotado. No es posible agregarlo al carrito en este momento.
              </div>
            )}

            {isMaxInCart && (
              <div
                className="out-of-stock-alert out-of-stock-alert--warning"
                role="alert"
                id="max-stock-alert"
              >
                <strong>Stock máximo alcanzado:</strong> Ya tenés en tu carrito todas las unidades disponibles ({stock} de {stock}) de este mueble.
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
