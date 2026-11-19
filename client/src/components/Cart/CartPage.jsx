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
      {/* Banner superior */}
      <section className="page-banner">
        <div className="container">
          <h1 className="section-title">Tu Carrito</h1>
          <p className="section-intro" id="cart-subtitle">
            {subtitle}
          </p>
        </div>
      </section>

      {/* Contenido del carrito */}
      <section className="cart-section" id="cart-section">
        <div className="container" id="cart-container">
          {syncedCart.length === 0 ? (
            <div className="cart-empty">
              <div className="cart-empty-icon" aria-hidden="true">
                🛋️
              </div>
              <h2>Aún no agregaste piezas a tu carrito</h2>
              <p>
                Explorá nuestro catálogo de muebles artesanales y encontrá la
                pieza ideal para tu hogar.
              </p>
              <Link to="/productos" className="btn btn-primary">
                Explorar catálogo
              </Link>
            </div>
          ) : (
            <div className="cart-layout">
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

              <aside className="cart-summary" aria-label="Resumen de compra">
                <h3>Resumen del Pedido</h3>
                <div className="cart-summary-row">
                  <span>Subtotal</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                <div className="cart-summary-row">
                  <span>Envío (CABA y GBA)</span>
                  <span
                    style={{ color: 'var(--salvia-dark)', fontWeight: 500 }}
                  >
                    Gratis
                  </span>
                </div>
                <div className="cart-summary-total">
                  <span>Total</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>

                {hasStockIssue && (
                  <div
                    className="out-of-stock-alert"
                    style={{ marginBottom: '1rem', fontSize: '0.8rem' }}
                    role="alert"
                  >
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
                  className={`btn btn-primary ${
                    hasStockIssue || authLoading ? 'btn-disabled' : ''
                  }`}
                  id="btn-checkout"
                  onClick={handleCheckout}
                  disabled={hasStockIssue || authLoading}
                >
                  {authLoading ? 'Verificando sesión...' : 'Iniciar compra'}
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  id="btn-clear-cart"
                  style={{ marginTop: '0.5rem', width: '100%' }}
                  onClick={handleClearCart}
                >
                  Vaciar carrito
                </button>
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
