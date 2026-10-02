import React from 'react';
import { Link } from 'react-router-dom';
import CartItem from './CartItem';
import { useCart } from '../../context/CartContext';
import { useToast } from '../../context/ToastContext';

/**
 * Componente CartPage
 * Vista completa de la página del carrito de compras (/carrito).
 */
function CartPage() {
  const { cart, removeFromCart, updateQuantity, clearCart } = useCart();
  const toastContext = useToast();

  const subtotal = cart.reduce(
    (sum, item) => sum + item.price * (item.quantity || 1),
    0
  );
  const formatPrice = (price) => `$ ${price.toLocaleString('es-AR')}`;

  const subtitle =
    cart.length === 0
      ? 'Tu carrito está actualmente vacío'
      : 'Revisá tus productos antes de continuar';

  const handleCheckout = () => {
    if (toastContext?.addToast) {
      toastContext.addToast(
        '¡Gracias por tu interés! La funcionalidad de pago estará disponible próximamente.',
        'info'
      );
    } else {
      alert(
        '¡Gracias por tu interés! La funcionalidad de pago estará disponible próximamente.'
      );
    }
  };

  const handleClearCart = () => {
    if (window.confirm('¿Estás seguro de que deseás vaciar el carrito?')) {
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
          {cart.length === 0 ? (
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
                {cart.map((item) => (
                  <CartItem
                    key={item.id}
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
                <button
                  type="button"
                  className="btn btn-primary"
                  id="btn-checkout"
                  onClick={handleCheckout}
                >
                  Iniciar compra
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
    </>
  );
}

export default CartPage;
