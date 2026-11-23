import React, { useContext, useState } from 'react';
import { Link } from 'react-router-dom';
import { CartContext } from '../../context/CartContext';
import { ToastContext } from '../../context/ToastContext';
import {
  getProductImageUrl,
  FALLBACK_PRODUCT_IMAGE,
} from '../../utils/imageUrl';

function ProductCard({ product, index = 0 }) {
  const [localQty, setLocalQty] = useState(0);
  const cartContext = useContext(CartContext);
  const toastContext = useContext(ToastContext);

  const addToCart = cartContext?.addToCart;
  const updateQuantity = cartContext?.updateQuantity;
  const addToast = toastContext?.addToast;

  const productId = product.id ?? product._id;

  // Obtener la cantidad actual en el carrito
  const cartItem = cartContext?.cart?.find(
    (item) => (item.id ?? item._id) === productId
  );
  const quantityInCart = cartContext ? cartItem?.quantity || 0 : localQty;

  const formatPrice = (price) => {
    return '$\u00A0' + Number(price || 0).toLocaleString('es-AR');
  };

  const getCategoryLabel = (category) => {
    const categoryLabels = {
      living: 'Living',
      comedor: 'Comedor',
      dormitorio: 'Dormitorio',
      almacenamiento: 'Almacenamiento',
      trabajo: 'Espacio de trabajo',
    };
    return categoryLabels[category] || category;
  };

  const hasStock = typeof product.stock === 'number';
  const isOutOfStock = hasStock && product.stock === 0;
  const isLowStock = hasStock && product.stock > 0 && product.stock <= 3;
  const isMaxStock = hasStock && quantityInCart >= product.stock;

  const delayClass = `fade-in visible fade-in-delay-${(index % 4) + 1}`;
  const outOfStockClass = isOutOfStock ? 'product-card--out-of-stock' : '';

  // Información de precios y promociones
  const originalPrice =
    product.originalPrice && product.originalPrice > product.price
      ? product.originalPrice
      : product.discount
        ? Math.round(product.price / (1 - product.discount / 100))
        : null;

  const discountPercent = originalPrice
    ? Math.round(((originalPrice - product.price) / originalPrice) * 100)
    : product.discount || null;

  const brand = product.brand || 'Hermanos Jota';
  const installments = 3;
  const installmentAmount = Math.round((product.price || 0) / installments);

  // Manejadores de interacción de carrito
  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (isOutOfStock) return;

    if (addToCart) {
      const result = addToCart(product);
      if (result !== false) {
        if (addToast) {
          addToast(`"${product.name}" agregado al carrito`, 'success');
        }
      } else if (addToast) {
        addToast(`No hay más stock disponible de "${product.name}"`, 'error');
      }
    } else {
      setLocalQty(1);
    }
  };

  const removeFromCart = cartContext?.removeFromCart;

  const handleIncrease = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (isMaxStock) {
      if (addToast) {
        addToast(
          `Alcanzaste el límite de stock de "${product.name}" (${product.stock} unidades)`,
          'info'
        );
      }
      return;
    }

    if (updateQuantity) {
      updateQuantity(productId, 1);
      if (addToast) {
        addToast(`Se sumó 1 unidad de "${product.name}"`, 'info');
      }
    } else {
      setLocalQty((prev) => prev + 1);
    }
  };

  const handleDecrease = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (quantityInCart === 1) {
      // Eliminar completamente del carrito
      if (removeFromCart) {
        removeFromCart(productId);
        if (addToast)
          addToast(`"${product.name}" eliminado del carrito`, 'info');
      } else {
        setLocalQty(0);
      }
    } else {
      if (updateQuantity) {
        updateQuantity(productId, -1);
      } else {
        setLocalQty((prev) => Math.max(0, prev - 1));
      }
    }
  };

  return (
    <article
      className={`product-card ${delayClass} ${outOfStockClass}`.trim()}
      id={`product-card-${productId}`}
    >
      <Link
        to={`/productos/${productId}`}
        className="product-card-image"
        aria-label={`Ver detalle de ${product.name}`}
      >
        <img
          src={getProductImageUrl(product.image)}
          alt={product.name}
          loading="lazy"
          referrerPolicy="no-referrer"
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = FALLBACK_PRODUCT_IMAGE;
          }}
        />

        {/* Badges superiores sobre imagen */}
        <div className="product-card-badges-top">
          {discountPercent && discountPercent > 0 && (
            <span className="product-card-discount-badge">
              -{discountPercent}%
            </span>
          )}
          {product.featured && (
            <span className="product-card-featured-badge">Destacado</span>
          )}
        </div>

        {isOutOfStock && (
          <span className="product-card-image-badge">Sin stock</span>
        )}
      </Link>

      <div className="product-card-body">
        <div className="product-card-meta">
          <span className="product-card-brand">{brand}</span>
          <span className="product-card-category-dot" aria-hidden="true">
            •
          </span>
          <span className="product-card-category">
            {getCategoryLabel(product.category)}
          </span>

          {hasStock && (
            <span
              className={`stock-badge ${
                isOutOfStock
                  ? 'stock-badge--out'
                  : isLowStock
                    ? 'stock-badge--low'
                    : 'stock-badge--in'
              }`}
              data-testid={`stock-badge-${productId}`}
            >
              {isOutOfStock
                ? 'Sin stock'
                : isLowStock
                  ? `¡Últimas ${product.stock}!`
                  : `${product.stock} disponibles`}
            </span>
          )}
        </div>

        <h3 className="product-card-name">
          <Link to={`/productos/${productId}`}>{product.name}</Link>
        </h3>

        {product.description && (
          <p className="product-card-description">{product.description}</p>
        )}

        {/* Sección de Precios */}
        <div className="product-card-pricing">
          <div className="product-card-price-row">
            <span className="product-card-price">
              {formatPrice(product.price)}
            </span>
            {originalPrice && originalPrice > product.price && (
              <span className="product-card-original-price">
                {formatPrice(originalPrice)}
              </span>
            )}
          </div>
          <p className="product-card-installments">
            <strong>{installments} cuotas sin interés</strong> de{' '}
            {formatPrice(installmentAmount)}
          </p>
        </div>

        {/* Acciones principales: Estado Inicial vs Selector de Cantidad + Ver Carrito */}
        {quantityInCart > 0 ? (
          <div className="product-card-actions in-cart">
            <div
              className="product-card-qty-stepper"
              role="group"
              aria-label="Cantidad a comprar"
            >
              <button
                type="button"
                className="btn-qty btn-qty-minus"
                onClick={handleDecrease}
                title={
                  quantityInCart === 1
                    ? 'Eliminar del carrito'
                    : 'Quitar una unidad'
                }
                aria-label={
                  quantityInCart === 1
                    ? 'Eliminar del carrito'
                    : 'Quitar una unidad'
                }
              >
                {quantityInCart === 1 ? (
                  <svg
                    viewBox="0 0 24 24"
                    width="14"
                    height="14"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <polyline points="3 6 5 6 21 6" />
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                  </svg>
                ) : (
                  '−'
                )}
              </button>

              <span
                className="qty-value"
                aria-label={`Cantidad actual en carrito: ${quantityInCart}`}
              >
                {quantityInCart}
              </span>

              <button
                type="button"
                className="btn-qty btn-qty-plus"
                onClick={handleIncrease}
                disabled={isMaxStock}
                title={
                  isMaxStock
                    ? 'Máximo de stock alcanzado'
                    : 'Agregar una unidad más'
                }
                aria-label="Aumentar cantidad"
              >
                +
              </button>
            </div>

            <Link
              to="/carrito"
              className="btn-view-cart"
              title="Ir al carrito de compras"
            >
              <span>Ver carrito</span>
              <svg
                viewBox="0 0 24 24"
                width="14"
                height="14"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M5 12h14" />
                <path d="m12 5 7 7-7 7" />
              </svg>
            </Link>
          </div>
        ) : (
          <div className="product-card-actions">
            <button
              type="button"
              className="btn-add-to-cart"
              onClick={handleAddToCart}
              disabled={isOutOfStock}
              aria-label={
                isOutOfStock
                  ? `${product.name} sin stock`
                  : `Agregar ${product.name} al carrito`
              }
            >
              <svg
                viewBox="0 0 24 24"
                width="16"
                height="16"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <circle cx="8" cy="21" r="1" />
                <circle cx="19" cy="21" r="1" />
                <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
              </svg>
              <span>{isOutOfStock ? 'Sin stock' : 'Agregar'}</span>
            </button>

            <Link
              to={`/productos/${productId}`}
              className="product-card-link"
              title="Ver especificaciones completas"
            >
              <span>Detalle</span>
              <svg
                viewBox="0 0 24 24"
                width="14"
                height="14"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M5 12h14" />
                <path d="m12 5 7 7-7 7" />
              </svg>
            </Link>
          </div>
        )}
      </div>
    </article>
  );
}

export default ProductCard;
