import React from 'react';
import { Link } from 'react-router-dom';
import {
  getProductImageUrl,
  FALLBACK_PRODUCT_IMAGE,
} from '../../utils/imageUrl';

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

  const isOutOfStock = typeof item.stock === 'number' && item.stock === 0;
  const isMaxStockReached =
    typeof item.stock === 'number' && item.stock > 0 && quantity >= item.stock;

  return (
    <article
      className={`cart-item ${isOutOfStock ? 'cart-item--out-of-stock' : ''}`}
      id={`cart-item-${itemId}`}
    >
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
        {isOutOfStock && (
          <span className="cart-item-badge-stock">Sin Stock</span>
        )}
      </Link>

      <div className="cart-item-info">
        {item.category && (
          <span className="cart-item-category">{item.category}</span>
        )}
        <Link to={`/productos/${itemId}`} className="cart-item-title-link">
          <h3 className="cart-item-name">{item.name}</h3>
        </Link>
        <div className="cart-item-unit-price">
          Precio unitario: <span>{formatPrice(item.price)}</span>
        </div>

        {isOutOfStock && (
          <div className="cart-item-stock-warning">
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
            Agotado (sin stock disponible en taller)
          </div>
        )}
        {!isOutOfStock && isMaxStockReached && (
          <div className="cart-item-stock-warning">
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
            Máximo disponible alcanzado ({item.stock} un.)
          </div>
        )}
      </div>

      <div className="cart-item-actions">
        <div className="cart-item-qty-wrapper">
          <span className="cart-item-qty-label">Cantidad</span>
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
              disabled={quantity <= 1}
            >
              −
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
        </div>

        <div className="cart-item-subtotal-box">
          <span className="cart-item-subtotal-label">Subtotal</span>
          <span className="cart-item-subtotal-value">
            {formatPrice(item.price * quantity)}
          </span>
        </div>

        <button
          type="button"
          className="cart-remove-btn"
          aria-label={`Eliminar ${item.name} del carrito`}
          onClick={handleRemove}
          title="Eliminar pieza"
        >
          <svg
            width="17"
            height="17"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="3 6 5 6 21 6"></polyline>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
            <line x1="10" y1="11" x2="10" y2="17"></line>
            <line x1="14" y1="11" x2="14" y2="17"></line>
          </svg>
        </button>
      </div>
    </article>
  );
}

export default CartItem;
