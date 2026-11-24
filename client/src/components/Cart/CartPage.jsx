import React, { useContext, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import CartItem from './CartItem';
import CheckoutModal from './CheckoutModal';
import { useCart } from '../../context/CartContext';
import { AuthContext } from '../../context/AuthContext';
import { ProductsContext } from '../../context/ProductsContext';
import { useToast } from '../../context/ToastContext';
import pedidosApi from '../../services/pedidosApi';
import './CheckoutModal.css';

/**
 * Componente CartPage
 * Vista completa de la página del carrito de compras (/carrito) con flujo de checkout.
 */
function CartPage() {
  const { cart, removeFromCart, updateQuantity, clearCart } = useCart();
  const authContext = useContext(AuthContext);
  const productsContext = useContext(ProductsContext);
  const toastContext = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [checkoutError, setCheckoutError] = useState('');
  const [confirmedOrder, setConfirmedOrder] = useState(null);

  const isAuthenticated = Boolean(authContext?.isAuthenticated);
  const authLoading = Boolean(authContext?.loading);
  const user = authContext?.user ?? null;

  const catalogProducts = productsContext?.products;
  const productsById = useMemo(() => {
    const map = new Map();
    if (!Array.isArray(catalogProducts)) return map;

    catalogProducts.forEach((product) => {
      const productId = product?.id ?? product?._id;
      if (productId) {
        map.set(String(productId), product);
      }
    });

    return map;
  }, [catalogProducts]);

  const syncedCart = useMemo(
    () =>
      cart.map((item) => {
        const itemId = item.id ?? item._id;
        const catalogProduct = itemId ? productsById.get(String(itemId)) : null;

        if (!catalogProduct) return item;

        return {
          ...item,
          stock:
            typeof catalogProduct.stock === 'number'
              ? catalogProduct.stock
              : item.stock,
          image: item.image || catalogProduct.image,
        };
      }),
    [cart, productsById]
  );

  const subtotal = syncedCart.reduce(
    (sum, item) => sum + item.price * (item.quantity || 1),
    0
  );
  const totalItems = syncedCart.reduce(
    (sum, item) => sum + (item.quantity || 1),
    0
  );
  const formatPrice = (price) => `$ ${price.toLocaleString('es-AR')}`;

  const hasOutOfStockItems = syncedCart.some(
    (item) => typeof item.stock === 'number' && item.stock === 0
  );
  const hasExceededStockItems = syncedCart.some(
    (item) =>
      typeof item.stock === 'number' &&
      item.stock > 0 &&
      (item.quantity || 1) > item.stock
  );
  const hasStockIssue = hasOutOfStockItems || hasExceededStockItems;

  const subtitle =
    syncedCart.length === 0
      ? 'Tu carrito está actualmente vacío'
      : 'Revisá tus productos antes de continuar';

  const handleCheckout = () => {
    if (hasStockIssue) {
      toastContext?.addToast?.(
        'Hay productos sin stock o que superan la disponibilidad en tu carrito.',
        'error'
      );
      return;
    }

    if (authLoading) return;

    if (!isAuthenticated) {
      toastContext?.addToast?.(
        'Iniciá sesión para finalizar tu compra.',
        'info'
      );
      navigate('/login', { state: { from: location } });
      return;
    }

    setCheckoutError('');
    setConfirmedOrder(null);
    setIsCheckoutOpen(true);
  };

  const handleConfirmOrder = async () => {
    if (isSubmitting || syncedCart.length === 0) return;

    setIsSubmitting(true);
    setCheckoutError('');

    try {
      const createdOrder = await pedidosApi.createOrder(syncedCart);
      setConfirmedOrder(createdOrder);
      clearCart();
      productsContext?.refreshProducts?.().catch(() => {});
      toastContext?.addToast?.(
        '¡Tu pedido fue confirmado con éxito!',
        'success'
      );
    } catch (error) {
      const message =
        error?.message ||
        'No pudimos procesar tu pedido. Por favor, intentá nuevamente.';

      if (error?.status === 401) {
        setIsCheckoutOpen(false);
        setCheckoutError('');
        toastContext?.addToast?.(
          'Tu sesión expiró. Iniciá sesión nuevamente para finalizar tu compra.',
          'error'
        );
        navigate('/login', { state: { from: location } });
        return;
      }

      if (error?.status === 400) {
        productsContext?.refreshProducts?.().catch(() => {});
      }

      setCheckoutError(message);
      toastContext?.addToast?.(message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseModal = () => {
    if (isSubmitting) return;
    setIsCheckoutOpen(false);
    setConfirmedOrder(null);
  };

  const handleClearCart = () => {
    if (window.confirm('¿Estás seguro de que deseás vaciar el carrito?')) {
      setCheckoutError('');
      clearCart();
    }
  };

  return (
    <>
      {/* Banner superior Hero de Marca */}
      <section className="cart-hero-banner">
        <div className="cart-hero-content">
          <h1 className="cart-hero-title">Tu carrito</h1>
          <p className="cart-hero-subtitle" id="cart-subtitle">
            {subtitle}
          </p>
        </div>
      </section>

      {/* Contenido del carrito */}
      <section className="cart-section" id="cart-section">
        <div className="container" id="cart-container">
          {syncedCart.length === 0 ? (
            <div className="cart-empty" data-testid="cart-empty">
              <div className="cart-empty-icon-wrap" aria-hidden="true">
                <svg
                  width="46"
                  height="46"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
                  <line x1="3" y1="6" x2="21" y2="6"></line>
                  <path d="M16 10a4 4 0 0 1-8 0"></path>
                </svg>
              </div>
              <span className="cart-empty-tag">ESPACIO DISPONIBLE</span>
              <h2 className="cart-empty-title">
                Aún no agregaste piezas a tu carrito
              </h2>
              <p className="cart-empty-text">
                Explorá nuestro catálogo de muebles artesanales y encontrá la
                pieza ideal de autor para transformar tu hogar.
              </p>
              <Link to="/productos" className="btn-cart-continue">
                Explorar catálogo
              </Link>
            </div>
          ) : (
            <div className="cart-layout">
              <div className="cart-items-wrapper">
                <div className="cart-items-header">
                  <span className="cart-items-count-badge">
                    Piezas Seleccionadas ({totalItems})
                  </span>
                  <span className="cart-shipping-notice">
                    <svg
                      width="15"
                      height="15"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <rect x="1" y="3" width="15" height="13"></rect>
                      <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon>
                      <circle cx="5.5" cy="18.5" r="2.5"></circle>
                      <circle cx="18.5" cy="18.5" r="2.5"></circle>
                    </svg>
                    Entrega segura a todo el país
                  </span>
                </div>

                <div className="cart-items">
                  {syncedCart.map((item) => (
                    <CartItem
                      key={item.id ?? item._id}
                      item={item}
                      onUpdateQuantity={updateQuantity}
                      onRemove={removeFromCart}
                    />
                  ))}
                </div>

                <div className="cart-actions-row">
                  <Link to="/productos" className="btn-cart-back-link">
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <line x1="19" y1="12" x2="5" y2="12"></line>
                      <polyline points="12 19 5 12 12 5"></polyline>
                    </svg>
                    Seguir explorando piezas
                  </Link>
                  <button
                    type="button"
                    className="btn-cart-clear"
                    id="btn-clear-cart"
                    onClick={handleClearCart}
                  >
                    <svg
                      width="15"
                      height="15"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="3 6 5 6 21 6"></polyline>
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                    </svg>
                    Vaciar selección
                  </button>
                </div>
              </div>

              <aside className="cart-summary" aria-label="Resumen de compra">
                <div className="cart-summary-header">
                  <span className="cart-summary-badge">RESUMEN DEL PEDIDO</span>
                  <h3 className="cart-summary-title">Detalle de Compra</h3>
                </div>

                <div className="cart-summary-divider"></div>

                <div className="cart-summary-row">
                  <span className="cart-summary-label">
                    Productos ({totalItems})
                  </span>
                  <span className="cart-summary-value">
                    {formatPrice(subtotal)}
                  </span>
                </div>
                <div className="cart-summary-row">
                  <span className="cart-summary-label">Envío (CABA y GBA)</span>
                  <span className="cart-summary-shipping-tag">Gratis</span>
                </div>

                <div className="cart-summary-divider"></div>

                <div className="cart-summary-total">
                  <div>
                    <span className="cart-total-label">Total</span>
                  </div>
                  <span className="cart-total-amount">
                    {formatPrice(subtotal)}
                  </span>
                </div>

                <div className="cart-financing-banner">
                  <span className="financing-icon">💳</span>
                  <span>
                    Hasta <strong>6 cuotas sin interés</strong> de{' '}
                    <strong>{formatPrice(Math.round(subtotal / 6))}</strong>
                  </span>
                </div>

                {hasStockIssue && (
                  <div className="out-of-stock-alert" role="alert">
                    <strong>Atención:</strong> Hay productos en tu carrito que
                    ya no tienen stock disponible. Por favor eliminalos o ajustá
                    sus cantidades para finalizar la compra.
                  </div>
                )}

                {!hasStockIssue && !isCheckoutOpen && checkoutError && (
                  <div className="cart-checkout-error" role="alert">
                    {checkoutError}
                  </div>
                )}

                {!authLoading && !isAuthenticated && !hasStockIssue && (
                  <div className="cart-auth-notice">
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <circle cx="12" cy="12" r="10" />
                      <path d="M12 16v-4" />
                      <path d="M12 8h.01" />
                    </svg>
                    <span>
                      Para confirmar tu pedido necesitás iniciar sesión. Al
                      ingresar volverás automáticamente a tu carrito.
                    </span>
                  </div>
                )}

                <button
                  type="button"
                  className={`btn-checkout ${
                    hasStockIssue || authLoading ? 'btn-disabled' : ''
                  }`}
                  id="btn-checkout"
                  onClick={handleCheckout}
                  disabled={hasStockIssue || authLoading}
                >
                  {authLoading ? 'Verificando sesión...' : 'Iniciar compra'}
                </button>

                {/* Sellos de confianza y servicio */}
                <div className="cart-trust-box">
                  <div className="trust-item">
                    <span className="trust-icon">✦</span>
                    <div>
                      <strong>Fabricación Artesanal</strong>
                      <p>Maderas macizas con trazabilidad sustentable.</p>
                    </div>
                  </div>
                  <div className="trust-item">
                    <span className="trust-icon">🛡️</span>
                    <div>
                      <strong>Garantía Hermanos Jota</strong>
                      <p>
                        5 años de respaldo directo sobre estructura y ensambles.
                      </p>
                    </div>
                  </div>
                  <div className="trust-item">
                    <span className="trust-icon">🚛</span>
                    <div>
                      <strong>Coordinación Personalizada</strong>
                      <p>Pactamos día y franja horaria exacta de entrega.</p>
                    </div>
                  </div>
                </div>
              </aside>
            </div>
          )}
        </div>
      </section>

      <CheckoutModal
        isOpen={isCheckoutOpen}
        items={syncedCart}
        subtotal={subtotal}
        user={user}
        isSubmitting={isSubmitting}
        error={checkoutError}
        confirmedOrder={confirmedOrder}
        onConfirm={handleConfirmOrder}
        onClose={handleCloseModal}
      />
    </>
  );
}

export default CartPage;
