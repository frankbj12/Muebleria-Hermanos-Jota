import React from 'react';
import { Link } from 'react-router-dom';
import { getProductImageUrl, FALLBACK_PRODUCT_IMAGE } from '../../utils/imageUrl';

/**
 * Componente CartItem
 * Renderiza una línea de producto dentro del carrito de compras.
 *
 * @param {Object} props
 * @param {Object} props.item - Datos del producto en el carrito (id, name, price, image, quantity)
 * @param {Function} props.onUpdateQuantity - Función callback para actualizar cantidad: (id, delta) => void
 * @param {Function} props.onRemove - Función callback para remover el item: (id) => void
 */
function CartItem({ item, onUpdateQuantity, onRemove }) {
  const itemId = item.id ?? item._id;
  const formatPrice = (price) => `$ ${price.toLocaleString('es-AR')}`;
  const quantity = item.quantity || 1;

  const handleDecrease = () => {
    onUpdateQuantity(itemId, -1);
  };

  const handleIncrease = () => {
    onUpdateQuantity(itemId, 1);
  };

  const handleRemove = () => {
    onRemove(itemId);
  };

  return (
    <article className="cart-item" id={`cart-item-${itemId}`}>
      <Link
        to={`/productos/${itemId}`}
        className="cart-item-image"
        aria-label={`Ver detalle de ${item.name}`}
      >
        <img
          src={getProductImageUrl(item.image)}
          alt={item.name}
          loading="lazy"
          referrerPolicy="no-referrer"
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = FALLBACK_PRODUCT_IMAGE;
          }}
        />
      </Link>

      <div className="cart-item-info">
        <h3>{item.name}</h3>
        <span className="cart-item-price">{formatPrice(item.price)}</span>
        {typeof item.stock === 'number' && item.stock === 0 && (
          <span
            className="stock-badge stock-badge--out"
            style={{ marginTop: '0.4rem', display: 'inline-flex' }}
          >
            Agotado (sin stock)
          </span>
        )}
        {typeof item.stock === 'number' &&
          item.stock > 0 &&
          quantity >= item.stock && (
            <span
              style={{
                display: 'block',
                fontSize: '0.75rem',
                color: 'var(--gris)',
                marginTop: '0.35rem',
                fontWeight: 500,
              }}
            >
              Máximo disponible alcanzado ({item.stock})
            </span>
          )}
      </div>

      <div className="cart-item-actions">
        <div
          className="qty-control"
          role="group"
          aria-label={`Cantidad para ${item.name}`}
        >
          <button
            type="button"
            className="qty-btn"
            aria-label="Disminuir cantidad"
            onClick={handleDecrease}
          >
            -
          </button>
          <span className="qty-value" aria-live="polite">
            {quantity}
          </span>
          <button
            type="button"
            className="qty-btn"
            aria-label="Aumentar cantidad"
            onClick={handleIncrease}
            disabled={
              typeof item.stock === 'number' &&
              (item.stock === 0 || quantity >= item.stock)
            }
            title={
              typeof item.stock === 'number' && quantity >= item.stock
                ? 'Stock máximo disponible alcanzado'
                : undefined
            }
          >
            +
          </button>
        </div>

        <button
          type="button"
          className="cart-remove-btn"
          aria-label={`Eliminar ${item.name} del carrito`}
          onClick={handleRemove}
        >
          Eliminar
        </button>
      </div>
    </article>
  );
}

export default CartItem;
