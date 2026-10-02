import React from 'react';
import { useCart } from '../../context/CartContext';
import { useToast } from '../../context/ToastContext';
import { Link } from 'react-router-dom';

/**
 * CartPage component
 * Displays the shopping cart, allows quantity updates, removal, and checkout.
 */
export default function CartPage() {
  const { cart, removeFromCart, updateQuantity, clearCart } = useCart();
  const { addToast } = useToast();

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
    addToast(
      '¡Gracias por tu interés! La funcionalidad de pago estará disponible próximamente.',
      'info'
    );
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
              <div className="cart-empty-icon">🛋️</div>
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
                  <article
                    className="cart-item"
                    key={item.id}
                    id={`cart-item-${item.id}`}
                  >
                    <Link
                      to={`/producto?id=${item.id}`}
                      className="cart-item-image"
                      aria-label={`Ver ${item.name}`}
                    >
                      <img src={`/${item.image}`} alt={item.name} />
                    </Link>
                    <div className="cart-item-info">
                      <h2>{item.name}</h2>
                      <span className="cart-item-price">
                        {formatPrice(item.price)}
                      </span>
                    </div>
                    <div className="cart-item-actions">
                      <div className="qty-control">
                        <button
                          className="qty-btn"
                          aria-label="Disminuir cantidad"
                          onClick={() => updateQuantity(item.id, -1)}
                        >
                          -
                        </button>
                        <span className="qty-value">{item.quantity || 1}</span>
                        <button
                          className="qty-btn"
                          aria-label="Aumentar cantidad"
                          onClick={() => updateQuantity(item.id, 1)}
                        >
                          +
                        </button>
                      </div>
                      <button
                        type="button"
                        className="cart-remove-btn"
                        onClick={() => removeFromCart(item.id)}
                      >
                        Eliminar
                      </button>
                    </div>
                  </article>
                ))}
              </div>

              <aside className="cart-summary">
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
