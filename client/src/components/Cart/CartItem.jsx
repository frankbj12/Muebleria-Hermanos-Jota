import React from 'react';
import { Link } from 'react-router-dom';

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
  const formatPrice = (price) => `$ ${price.toLocaleString('es-AR')}`;
  const quantity = item.quantity || 1;

  const handleDecrease = () => {
    onUpdateQuantity(item.id, -1);
  };

  const handleIncrease = () => {
    onUpdateQuantity(item.id, 1);
  };

  const handleRemove = () => {
    onRemove(item.id);
  };

  return (
    <article className="cart-item" id={`cart-item-${item.id}`}>
      <Link
        to={`/producto?id=${item.id}`}
        className="cart-item-image"
        aria-label={`Ver detalle de ${item.name}`}
      >
        <img
          src={item.image?.startsWith('/') ? item.image : `/${item.image}`}
          alt={item.name}
          loading="lazy"
        />
      </Link>

      <div className="cart-item-info">
        <h3>{item.name}</h3>
        <span className="cart-item-price">{formatPrice(item.price)}</span>
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
