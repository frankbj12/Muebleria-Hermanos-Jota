import React from 'react';
import { Link } from 'react-router-dom';
import { getProductImageUrl } from '../../utils/imageUrl';

function ProductCard({ product, index = 0 }) {
  const formatPrice = (price) => {
    return '$\u00A0' + price.toLocaleString('es-AR');
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

  const delayClass = `fade-in visible fade-in-delay-${(index % 4) + 1}`;
  const outOfStockClass = isOutOfStock ? 'product-card--out-of-stock' : '';

  return (
    <article
      className={`product-card ${delayClass} ${outOfStockClass}`.trim()}
      id={`product-card-${product.id}`}
    >
      <Link to={`/productos/${product.id}`} className="product-card-image">
        <img
          src={getProductImageUrl(product.image)}
          alt={product.name}
          loading="lazy"
          referrerPolicy="no-referrer"
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = '/assets/placeholder-furniture.png';
          }}
        />
        {isOutOfStock && (
          <span className="product-card-image-badge">Sin stock</span>
        )}
      </Link>
      <div className="product-card-body">
        <div className="product-card-meta">
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
              data-testid={`stock-badge-${product.id}`}
            >
              {isOutOfStock
                ? 'Sin stock'
                : isLowStock
                  ? `¡Últimas ${product.stock}!`
                  : `${product.stock} disponibles`}
            </span>
          )}
        </div>
        <h3 className="product-card-name">{product.name}</h3>
        <p className="product-card-description">{product.description}</p>
        <div className="product-card-footer">
          <span className="product-card-price">
            {formatPrice(product.price)}
          </span>
          <Link to={`/productos/${product.id}`} className="product-card-link">
            Ver detalle
            <svg
              viewBox="0 0 24 24"
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
      </div>
    </article>
  );
}

export default ProductCard;
