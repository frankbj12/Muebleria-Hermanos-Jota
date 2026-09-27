import React, { useState, useEffect } from 'react';
import ProductCard from '../ProductCard/ProductCard';
import { fetchProducts } from '../../data/products';

function ProductList({ onSelectProduct, onAddToCart }) {
  const [mockProducts, setMockProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Usamos el mock local para no depender de la API del backend en este sprint
  useEffect(() => {
    fetchProducts().then((data) => {
      setMockProducts(data);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <section className="featured-products" id="featured-products">
        <div className="container">
          <h2 className="section-title fade-in visible">Piezas Destacadas</h2>
          <div className="products-grid" id="products-grid">
            <p className="products-loading">Cargando productos…</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="featured-products" id="featured-products">
      <div className="container">
        <h2 className="section-title fade-in visible">Piezas Destacadas</h2>
        <p className="section-intro fade-in visible">Diseñadas para quedarse</p>
        
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
