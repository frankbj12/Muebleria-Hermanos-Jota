import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FALLBACK_PRODUCT_IMAGE,
  getProductImageUrl,
} from '../../utils/imageUrl';
import './CheckoutModal.css';

function formatPrice(amount) {
  const numericAmount =
    typeof amount === 'number' ? amount : Number(amount) || 0;
  return `$ ${numericAmount.toLocaleString('es-AR')}`;
}

function formatShortOrderId(id) {
  if (!id) return '---';
  const str = String(id);
  return str.length > 6 ? str.slice(-6).toUpperCase() : str.toUpperCase();
}

function getInitial(name, email) {
  const source = (name || email || 'U').trim();
  return source ? source[0].toUpperCase() : 'U';
}

/**
 * Modal de revisión y confirmación de compra para CartPage (/carrito).
 * Maneja dos estados: revisión previa al POST /api/pedidos y confirmación exitosa (201).
 */
export default function CheckoutModal({
  isOpen,
  items,
  subtotal,
  user,
  isSubmitting,
  error,
  confirmedOrder,
  onConfirm,
  onClose,
}) {
  useEffect(() => {
    if (!isOpen) return undefined;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (event) => {
      if (event.key === 'Escape' && !isSubmitting) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, isSubmitting, onClose]);

  if (!isOpen) return null;

  const isSuccess = Boolean(confirmedOrder);
  const confirmedItems = Array.isArray(confirmedOrder?.items)
    ? confirmedOrder.items
    : [];
  const confirmedUnits = confirmedItems.reduce(
    (sum, item) => sum + (item.quantity || 1),
    0
  );

  const handleBackdropClick = (event) => {
    if (event.target === event.currentTarget && !isSubmitting) {
      onClose();
    }
  };

  return (
    <div
      className="checkout-modal-overlay"
      onClick={handleBackdropClick}
      role="presentation"
    >
      <div
        className="checkout-modal-card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="checkout-modal-title"
      >
        {isSuccess ? (
          <div className="checkout-success-body">
            <div className="checkout-success-icon" aria-hidden="true">
              <svg
                width="32"
                height="32"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M20 6 9 17l-5-5" />
              </svg>
            </div>

            <p className="checkout-modal-eyebrow">Compra registrada</p>
            <h2 id="checkout-modal-title" className="checkout-success-title">
              ¡Pedido confirmado!
            </h2>
            <p className="checkout-success-subtitle">
              Registramos tu orden en Hermanos Jota y reservamos tus piezas.
              Podés consultar el detalle y estado en cualquier momento desde tu
              historial.
            </p>

            <div className="checkout-success-summary">
              <div className="checkout-success-stat">
                <span className="checkout-success-stat-label">Orden</span>
                <span className="checkout-success-stat-value">
                  #{formatShortOrderId(confirmedOrder.id ?? confirmedOrder._id)}
                </span>
              </div>
              <div className="checkout-success-stat">
                <span className="checkout-success-stat-label">Piezas</span>
                <span className="checkout-success-stat-value">
                  {confirmedUnits}{' '}
                  {confirmedUnits === 1 ? 'unidad' : 'unidades'}
                </span>
              </div>
              <div className="checkout-success-stat">
                <span className="checkout-success-stat-label">Total</span>
                <span className="checkout-success-stat-value">
                  {formatPrice(confirmedOrder.total)}
                </span>
              </div>
            </div>

            <div className="checkout-success-actions">
              <Link
                to="/mis-pedidos"
                className="btn btn-primary"
                onClick={onClose}
              >
                Ver mis pedidos
              </Link>
              <Link
                to="/productos"
                className="btn btn-secondary"
                onClick={onClose}
              >
                Seguir explorando
              </Link>
            </div>
          </div>
        ) : (
          <>
            <header className="checkout-modal-header">
              <div>
                <p className="checkout-modal-eyebrow">Confirmación de compra</p>
                <h2 id="checkout-modal-title" className="checkout-modal-title">
                  Revisá tu pedido
                </h2>
              </div>
              <button
                type="button"
                className="checkout-modal-close"
                aria-label="Cerrar ventana de confirmación"
                onClick={onClose}
                disabled={isSubmitting}
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M18 6 6 18" />
                  <path d="m6 6 12 12" />
                </svg>
              </button>
            </header>

            <div className="checkout-modal-body">
              {user && (
                <div className="checkout-buyer-box">
                  <span className="checkout-buyer-avatar" aria-hidden="true">
                    {getInitial(user.name, user.email)}
                  </span>
                  <div className="checkout-buyer-meta">
                    <span className="checkout-buyer-label">Comprador</span>
                    <span className="checkout-buyer-name">
                      {user.name || user.email}
                    </span>
                    {user.name && user.email && (
                      <span className="checkout-buyer-email">{user.email}</span>
                    )}
                  </div>
                </div>
              )}

              <ul
                className="checkout-items-list"
                aria-label="Resumen de muebles a confirmar"
              >
                {items.map((item) => {
                  const itemId = item.id ?? item._id;
                  const quantity = item.quantity || 1;
                  const lineTotal = item.price * quantity;

                  return (
                    <li key={itemId} className="checkout-item-row">
                      <div className="checkout-item-thumb">
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
                      </div>
                      <div className="checkout-item-info">
                        <span className="checkout-item-name">{item.name}</span>
                        <span className="checkout-item-qty">
                          {quantity} {quantity === 1 ? 'unidad' : 'unidades'}{' '}
                          &times; {formatPrice(item.price)}
                        </span>
                      </div>
                      <span className="checkout-item-subtotal">
                        {formatPrice(lineTotal)}
                      </span>
                    </li>
                  );
                })}
              </ul>

              <div className="checkout-totals">
                <div className="checkout-total-row">
                  <span>Subtotal</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                <div className="checkout-total-row">
                  <span>Envío (CABA y GBA)</span>
                  <span className="checkout-shipping-free">Gratis</span>
                </div>
                <div className="checkout-total-final">
                  <span>Total a confirmar</span>
                  <strong>{formatPrice(subtotal)}</strong>
                </div>
              </div>

              {error && (
                <div className="checkout-modal-alert" role="alert">
                  {error}
                </div>
              )}
            </div>

            <footer className="checkout-modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={onClose}
                disabled={isSubmitting}
              >
                Seguir editando
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={onConfirm}
                disabled={isSubmitting || items.length === 0}
              >
                {isSubmitting && (
                  <span className="checkout-btn-spinner" aria-hidden="true" />
                )}
                {isSubmitting ? 'Procesando pedido...' : 'Confirmar pedido'}
              </button>
            </footer>
          </>
        )}
      </div>
    </div>
  );
}
