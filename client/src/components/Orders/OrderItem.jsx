import React from 'react';
import { Link } from 'react-router-dom';
import {
  FALLBACK_PRODUCT_IMAGE,
  getProductImageUrl,
} from '../../utils/imageUrl';

const STATUS_LABELS = {
  pending: 'Pendiente',
  processing: 'En preparación',
  completed: 'Completado',
  cancelled: 'Cancelado',
};

const ORDER_STEPS = [
  { key: 'pending', label: 'Recibido' },
  { key: 'processing', label: 'En taller' },
  { key: 'completed', label: 'Entregado' },
];

const CATEGORY_LABELS = {
  living: 'Living',
  comedor: 'Comedor',
  dormitorio: 'Dormitorio',
  almacenamiento: 'Almacenamiento',
  trabajo: 'Espacio de trabajo',
};

function getCategoryLabel(category) {
  if (!category) return '';
  return CATEGORY_LABELS[category] || category;
}

function formatPrice(amount) {
  const numericAmount =
    typeof amount === 'number' ? amount : Number(amount) || 0;
  return `$ ${numericAmount.toLocaleString('es-AR')}`;
}

function formatOrderDate(dateValue) {
  if (!dateValue) return 'Fecha no disponible';
  const parsed = new Date(dateValue);
  if (Number.isNaN(parsed.getTime())) return 'Fecha no disponible';

  return new Intl.DateTimeFormat('es-AR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(parsed);
}

function formatShortOrderId(id) {
  if (!id) return '---';
  const str = String(id);
  return str.length > 6 ? str.slice(-6).toUpperCase() : str.toUpperCase();
}

function getActiveStepIndex(statusKey) {
  if (statusKey === 'completed') return 2;
  if (statusKey === 'processing') return 1;
  return 0;
}

/**
 * Componente OrderItem
 * Renderiza la tarjeta editorial de un pedido con miniatura fotográfica por producto.
 */
export default function OrderItem({
  order,
  productsById,
  catalogLoading = false,
}) {
  const orderId = order.id ?? order._id;
  const items = Array.isArray(order.items) ? order.items : [];
  const totalUnits = items.reduce((sum, item) => sum + (item.quantity || 1), 0);
  const statusKey = STATUS_LABELS[order.status] ? order.status : 'pending';
  const statusLabel = STATUS_LABELS[statusKey];
  const activeStepIndex = getActiveStepIndex(statusKey);

  return (
    <article
      className="order-card"
      aria-label={`Pedido #${formatShortOrderId(orderId)}`}
    >
      <header className="order-card-header">
        <div className="order-card-heading">
          <span className="order-card-icon" aria-hidden="true">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
              <path d="m3.3 7 8.7 5 8.7-5" />
              <path d="M12 22V12" />
            </svg>
          </span>
          <div className="order-card-meta">
            <span className="order-id-label">
              Pedido #{formatShortOrderId(orderId)}
            </span>
            <time
              className="order-date"
              dateTime={order.createdAt || undefined}
            >
              {formatOrderDate(order.createdAt)}
            </time>
          </div>
        </div>

        <span className={`order-status-badge order-status-badge--${statusKey}`}>
          <span className="order-status-dot" aria-hidden="true" />
          {statusLabel}
        </span>
      </header>

      {statusKey !== 'cancelled' && (
        <div className="order-progress" aria-label="Seguimiento del pedido">
          {ORDER_STEPS.map((step, index) => {
            const isCompleted =
              index < activeStepIndex ||
              (statusKey === 'completed' && index === ORDER_STEPS.length - 1);
            const isCurrent =
              index === activeStepIndex && statusKey !== 'completed';
            const stepStateClass = isCompleted
              ? 'order-progress-step--done'
              : isCurrent
                ? 'order-progress-step--current'
                : '';

            return (
              <div
                key={step.key}
                className={`order-progress-step ${stepStateClass}`.trim()}
              >
                <span className="order-progress-marker" aria-hidden="true" />
                <span className="order-progress-label">{step.label}</span>
              </div>
            );
          })}
        </div>
      )}

      <ul className="order-items-list" aria-label="Productos del pedido">
        {items.map((item, index) => {
          const quantity = item.quantity || 1;
          const unitPrice =
            typeof item.price === 'number'
              ? item.price
              : Number(item.price) || 0;
          const lineTotal = unitPrice * quantity;
          const itemName = item.name || 'Producto';
          const catalogProduct =
            item.productId && productsById
              ? productsById.get(String(item.productId))
              : null;
          const rawImage = item.image || catalogProduct?.image || '';
          const categoryLabel = getCategoryLabel(catalogProduct?.category);
          const productKey = `${orderId}-${item.productId || itemName}-${index}`;

          const thumbMedia =
            catalogLoading && !rawImage ? (
              <span className="order-item-thumb-skeleton" aria-hidden="true" />
            ) : (
              <img
                src={getProductImageUrl(rawImage)}
                alt={itemName}
                loading="lazy"
                referrerPolicy="no-referrer"
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = FALLBACK_PRODUCT_IMAGE;
                }}
              />
            );

          return (
            <li key={productKey} className="order-item-row">
              {item.productId ? (
                <Link
                  to={`/productos/${item.productId}`}
                  className="order-item-thumb order-item-thumb--interactive"
                  tabIndex={-1}
                  aria-hidden="true"
                >
                  {thumbMedia}
                </Link>
              ) : (
                <div className="order-item-thumb">{thumbMedia}</div>
              )}

              <div className="order-item-info">
                {categoryLabel && (
                  <span className="order-item-category">{categoryLabel}</span>
                )}
                {item.productId ? (
                  <Link
                    to={`/productos/${item.productId}`}
                    className="order-item-name order-item-link"
                  >
                    {itemName}
                  </Link>
                ) : (
                  <span className="order-item-name">{itemName}</span>
                )}
                <span className="order-item-qty">
                  {quantity} {quantity === 1 ? 'unidad' : 'unidades'} &times;{' '}
                  {formatPrice(unitPrice)}
                </span>
              </div>

              <div className="order-item-aside">
                <span className="order-item-subtotal">
                  {formatPrice(lineTotal)}
                </span>
              </div>
            </li>
          );
        })}
      </ul>

      <footer className="order-card-footer">
        <span className="order-units-count">
          {totalUnits} {totalUnits === 1 ? 'pieza' : 'piezas'}
        </span>
        <div className="order-total-wrapper">
          <span className="order-total-label">Total abonado</span>
          <strong className="order-total-value">
            {formatPrice(order.total)}
          </strong>
        </div>
      </footer>
    </article>
  );
}
