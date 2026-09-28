import React, { useState } from 'react';

/**
 * Formatea un número como moneda en pesos argentinos (ARS).
 * @param {number} price
 * @returns {string}
 */
const formatPrice = (price) => {
  if (typeof price !== 'number') return '$ 0';
  return '$\u00A0' + price.toLocaleString('es-AR');
};

/**
 * Mapeo de categorías a etiquetas legibles
 */
const getCategoryLabel = (cat) => {
  const map = {
    living: 'Living & Sala',
    comedor: 'Comedor',
    dormitorio: 'Dormitorio',
    almacenamiento: 'Almacenamiento',
    trabajo: 'Espacios de Trabajo',
  };
  return map[cat] || (cat ? cat.charAt(0).toUpperCase() + cat.slice(1) : '');
};

/**
 * Componente ProductDetail
 * Muestra el detalle completo de un producto seleccionado (fiel al diseño legacy)
 * o un placeholder amigable si no hay ninguno seleccionado.
 *
 * @param {Object} props
 * @param {Object|null} props.product - Datos del producto seleccionado
 * @param {Function} [props.onAddToCart] - Callback para agregar el producto al carrito
 * @param {Function} [props.onClearSelection] - Callback opcional para volver a la lista
 */
function ProductDetail({ product, onAddToCart, onClearSelection }) {
  const [feedbackVisible, setFeedbackVisible] = useState(false);

  const handleAdd = () => {
    if (!product) return;
    if (onAddToCart) {
      onAddToCart(product);
    }
    setFeedbackVisible(true);
    setTimeout(() => {
      setFeedbackVisible(false);
    }, 3000);
  };

  if (!product) {
    return (
      <section
        className="product-detail"
        id="product-detail"
        aria-label="Detalle de producto"
      >
        <div className="container">
          <div
            className="catalog-empty"
            style={{
              gridColumn: '1 / -1',
              margin: '2rem 0',
              textAlign: 'center',
            }}
          >
            <span
              style={{
                fontSize: '3rem',
                display: 'block',
                marginBottom: '1rem',
              }}
              role="img"
              aria-label="mueble"
            >
              🪑
            </span>
            <h2>Ningún producto seleccionado</h2>
            <p>
              Seleccioná cualquier mueble del catálogo para ver sus detalles de
              fabricación, medidas y materiales.
            </p>
          </div>
        </div>
      </section>
    );
  }

  const { name, category, description, price, image, specs } = product;

  return (
    <section
      className="product-detail"
      id="product-detail"
      aria-label={`Detalle de ${name}`}
    >
      <div className="container">
        {onClearSelection && (
          <nav
            className="product-breadcrumb"
            style={{ marginBottom: '1.5rem' }}
            aria-label="Ruta de navegación"
          >
            <button
              type="button"
              onClick={onClearSelection}
              className="btn btn-secondary"
              style={{ padding: '0.4rem 0.8rem', fontSize: 'var(--fs-sm)' }}
            >
              ← Volver al catálogo
            </button>
          </nav>
        )}

        <div className="product-detail-grid" id="product-detail-content">
          <div className="product-gallery">
            <img src={image} alt={name} loading="lazy" />
          </div>

          <div className="product-info">
            {category && (
              <span className="product-card-category">
                {getCategoryLabel(category)}
              </span>
            )}
            <h1>{name}</h1>
            <p className="product-description">{description}</p>
            <span className="product-price-tag">{formatPrice(price)}</span>

            <div className="product-actions">
              <button
                type="button"
                className="btn btn-primary"
                id="btn-add-cart"
                onClick={handleAdd}
              >
                Añadir al Carrito
              </button>
              {onClearSelection && (
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={onClearSelection}
                >
                  Seguir mirando
                </button>
              )}
            </div>

            {feedbackVisible && (
              <div
                id="add-to-cart-feedback"
                style={{
                  color: 'var(--salvia-dark)',
                  fontWeight: 500,
                  marginTop: '0.75rem',
                }}
                role="status"
              >
                ✓ ¡Producto añadido al carrito con éxito!
              </div>
            )}

            {specs && Object.keys(specs).length > 0 && (
              <div className="product-specs">
                <h3>Detalles de Fabricación</h3>
                <table className="specs-table">
                  <tbody>
                    {Object.entries(specs).map(([key, val]) => (
                      <tr key={key}>
                        <td
                          style={{
                            textTransform: 'capitalize',
                            fontWeight: 600,
                          }}
                        >
                          {key}
                        </td>
                        <td>{val}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

export default ProductDetail;
