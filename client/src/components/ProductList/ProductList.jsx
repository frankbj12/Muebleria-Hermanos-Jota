import React, { useState } from 'react';
import ProductCard from '../ProductCard/ProductCard';

const CATEGORIES = [
  { value: 'todos', label: 'Todos' },
  { value: 'living', label: 'Living' },
  { value: 'comedor', label: 'Comedor' },
  { value: 'dormitorio', label: 'Dormitorio' },
  { value: 'almacenamiento', label: 'Almacenamiento' },
  { value: 'trabajo', label: 'Trabajo' },
];

function ProductList({ products = [], loading = false, error = null }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('todos');

  const handleReset = () => {
    setSearchQuery('');
    setActiveFilter('todos');
  };

  const filteredProducts = products.filter((prod) => {
    const matchCategory =
      activeFilter === 'todos' || prod.category === activeFilter;
    const query = searchQuery.toLowerCase();
    const matchSearch =
      !query ||
      prod.name.toLowerCase().includes(query) ||
      prod.description.toLowerCase().includes(query);
    return matchCategory && matchSearch;
  });

  return (
    <>
      {/* Banner superior */}
      <section className="page-banner">
        <div className="container">
          <h1 className="section-title">Nuestra Colección</h1>
          <p className="section-intro">
            Cada pieza diseñada para convertirse en parte de tu historia
          </p>
        </div>
      </section>

      {/* Catálogo */}
      <section className="catalog" id="catalog">
        <div className="container">
          {/* Controles de búsqueda y filtros */}
          <div className="catalog-controls">
            <div className="catalog-search">
              <svg
                className="catalog-search-icon"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.3-4.3" />
              </svg>
              <input
                type="search"
                className="catalog-search-input"
                id="catalog-search"
                placeholder="Buscar productos…"
                aria-label="Buscar productos"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div
              className="catalog-filters"
              id="catalog-filters"
              role="group"
              aria-label="Filtrar por categoría"
            >
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.value}
                  className={`filter-btn${activeFilter === cat.value ? ' active' : ''}`}
                  data-filter={cat.value}
                  onClick={() => setActiveFilter(cat.value)}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Grid de productos */}
          <div className="catalog-grid" id="catalog-grid">
            {loading && (
              <p className="products-loading" role="status">
                Cargando productos…
              </p>
            )}

            {!loading && error && (
              <div className="catalog-empty">
                <p>{error}</p>
              </div>
            )}

            {!loading && !error && filteredProducts.length === 0 && (
              <div className="catalog-empty">
                <p>
                  No se encontraron productos que coincidan con tu búsqueda.
                </p>
                <button
                  className="btn btn-secondary"
                  id="btn-reset-filters"
                  onClick={handleReset}
                >
                  Limpiar filtros
                </button>
              </div>
            )}

            {!loading &&
              !error &&
              filteredProducts.map((product, index) => (
                <ProductCard key={product.id} product={product} index={index} />
              ))}
          </div>
        </div>
      </section>
    </>
  );
}

export default ProductList;
