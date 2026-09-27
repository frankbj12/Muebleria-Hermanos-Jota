import React from 'react';

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

  const delayClass = `fade-in visible fade-in-delay-${(index % 4) + 1}`;

  return (
    <article className={`product-card ${delayClass}`} id={`product-card-${product.id}`}>
      <a href={`/producto?id=${product.id}`} className="product-card-image">
        <img src={`/${product.image}`} alt={product.name} loading="lazy" />
      </a>
      <div className="product-card-body">
        <span className="product-card-category">{getCategoryLabel(product.category)}</span>
        <h3 className="product-card-name">{product.name}</h3>
        <p className="product-card-description">{product.description}</p>
        <div className="product-card-footer">
          <span className="product-card-price">{formatPrice(product.price)}</span>
          <a href={`/producto?id=${product.id}`} className="product-card-link">
            Ver detalle
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M5 12h14" />
              <path d="m12 5 7 7-7 7" />
            </svg>
          </a>
        </div>
      </div>
    </article>
  );
}

export default ProductCard;
