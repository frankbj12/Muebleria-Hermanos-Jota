import React, { useState, useEffect } from 'react';
import ProductCard from '../ProductCard/ProductCard';
import { fetchProducts, fetchFeaturedProducts, fetchProductsError } from '../../data/products';

function ProductList({ onSelectProduct, onAddToCart }) {
  const [mockProducts, setMockProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Detectamos la ruta para saber si filtramos solo los destacados
  const isHome = window.location.pathname === '/' || window.location.pathname === '/index.html';

  useEffect(() => {
    // TIP: Para probar el estado de error, se puede cambiar fetchFn por fetchProductsError
    const fetchFn = isHome ? fetchFeaturedProducts : fetchProducts;
    //const fetchFn = fetchProductsError;


    fetchFn()
      .then((data) => {
        setMockProducts(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [isHome]);

  const title = isHome ? "Piezas Destacadas" : "Catálogo Completo";
  const subtitle = isHome ? "Diseñadas para quedarse" : "Todos nuestros muebles";

  // Estado 1: Cargando
  if (loading) {
    return (
      <section className="featured-products" id="featured-products">
        <div className="container">
          <h2 className="section-title fade-in visible">{title}</h2>
          <div className="products-grid" id="products-grid">
            <div style={{ textAlign: 'center', gridColumn: '1 / -1', padding: '4rem 2rem' }}>
              <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
              <svg style={{ animation: 'spin 1s linear infinite', width: '40px', height: '40px', color: '#B5A598', margin: '0 auto 1rem' }} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" strokeOpacity="0.25"></circle>
                <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <p style={{ color: '#555', fontSize: '1.1rem' }}>Preparando el catálogo...</p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Estado 2: Error
  if (error) {
    return (
      <section className="featured-products" id="featured-products">
        <div className="container">
          <h2 className="section-title fade-in visible">{title}</h2>
          <div className="products-grid" id="products-grid">
            <div style={{ textAlign: 'center', gridColumn: '1 / -1', padding: '3rem 2rem', backgroundColor: '#FDF7F7', borderRadius: '12px', border: '1px solid #F5C6C6' }}>
              <svg style={{ width: '48px', height: '48px', color: '#D65C5C', margin: '0 auto 1rem' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              <h3 style={{ color: '#A03A3A', marginBottom: '0.5rem', fontSize: '1.25rem' }}>Ups, ocurrió un inconveniente</h3>
              <p style={{ color: '#B94A4A' }}>{error}</p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Estado 3: Éxito (Datos recibidos)
  return (
    <section className="featured-products" id="featured-products">
      <div className="container">
        <h2 className="section-title fade-in visible">{title}</h2>
        <p className="section-intro fade-in visible">{subtitle}</p>

        <div className="products-grid" id="products-grid">
          {mockProducts.map((product, index) => (
            <ProductCard
              key={product.id}
              product={product}
              index={index}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

export default ProductList;
