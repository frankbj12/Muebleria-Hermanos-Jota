import React, { useState, useMemo, useEffect } from 'react';
import ProductCard from '../ProductCard/ProductCard';

const CATEGORIES = [
  {
    value: 'todos',
    label: 'Todas las categorías',
    title: 'Nuestra Colección',
    description:
      'Piezas atemporales construidas en maderas nobles FSC®, concebidas para trascender generaciones en tu hogar.',
  },
  {
    value: 'living',
    label: 'Living',
    title: 'Living & Confort',
    description:
      'Sillones, butacas y mesas de centro diseñadas para el encuentro, la serenidad y la calidez.',
  },
  {
    value: 'comedor',
    label: 'Comedor',
    title: 'Comedor & Encuentro',
    description:
      'Mesas y sillas que reúnen la ebanistería tradicional y el diseño contemporáneo en torno a la mesa.',
  },
  {
    value: 'dormitorio',
    label: 'Dormitorio',
    title: 'Dormitorio & Calma',
    description:
      'Líneas puras, maderas sustentables y texturas orgánicas que invitan a un descanso reparador.',
  },
  {
    value: 'almacenamiento',
    label: 'Almacenamiento',
    title: 'Almacenamiento & Orden',
    description:
      'Aparadores, consolas y bibliotecas modulares que combinan funcionalidad precisa y refinamiento estético.',
  },
  {
    value: 'trabajo',
    label: 'Trabajo',
    title: 'Espacios de Trabajo',
    description:
      'Escritorios y sillería creados para acompañar la creatividad, la concentración y la postura ergonómica.',
  },
];

const SORT_OPTIONS = [
  { value: 'relevancia', label: 'Relevancia (Destacados)' },
  { value: 'precio-menor', label: 'Menor precio' },
  { value: 'precio-mayor', label: 'Mayor precio' },
  { value: 'nombre-az', label: 'Nombre: A - Z' },
  { value: 'nombre-za', label: 'Nombre: Z - A' },
  { value: 'recientes', label: 'Más recientes' },
];

function ProductList({ products = [], loading = false, error = null }) {
  // Filtros de estado
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('todos');
  const [inStockOnly, setInStockOnly] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState('todos');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [sortBy, setSortBy] = useState('relevancia');
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

  // Rango de precios límite del catálogo actual
  const { catalogMinPrice, catalogMaxPrice } = useMemo(() => {
    if (!products.length)
      return { catalogMinPrice: 0, catalogMaxPrice: 3000000 };
    const prices = products.map((p) => Number(p.price) || 0);
    return {
      catalogMinPrice: Math.min(...prices),
      catalogMaxPrice: Math.max(...prices),
    };
  }, [products]);

  // Lista dinámica de materiales disponibles a partir de los datos
  const availableMaterials = useMemo(() => {
    const materialsSet = new Set();
    products.forEach((p) => {
      const mat = p.specs?.materiales || p.specs?.madera;
      if (mat) {
        if (/nogal/i.test(mat)) materialsSet.add('Nogal');
        if (/roble/i.test(mat)) materialsSet.add('Roble');
        if (/guatamb[uú]/i.test(mat)) materialsSet.add('Guatambú');
        if (/petirib[ií]/i.test(mat)) materialsSet.add('Petiribí');
        if (/para[ií]so/i.test(mat)) materialsSet.add('Paraíso');
        if (/cuero/i.test(mat)) materialsSet.add('Cuero');
        if (/boucl[eé]/i.test(mat)) materialsSet.add('Bouclé');
        if (/acero|metal/i.test(mat)) materialsSet.add('Acero / Metal');
      }
    });
    return Array.from(materialsSet).sort();
  }, [products]);

  // Cantidad de productos por categoría
  const categoryCounts = useMemo(() => {
    const counts = { todos: products.length };
    CATEGORIES.forEach((cat) => {
      if (cat.value !== 'todos') {
        counts[cat.value] = products.filter(
          (p) => p.category === cat.value
        ).length;
      }
    });
    return counts;
  }, [products]);

  // Cantidad de productos en stock
  const inStockCount = useMemo(() => {
    return products.filter((p) => typeof p.stock !== 'number' || p.stock > 0)
      .length;
  }, [products]);

  // Limpiar todos los filtros
  const handleResetFilters = () => {
    setSearchQuery('');
    setActiveCategory('todos');
    setInStockOnly(false);
    setSelectedMaterial('todos');
    setMinPrice('');
    setMaxPrice('');
    setSortBy('relevancia');
  };

  // Filtrado y ordenamiento
  const filteredProducts = useMemo(() => {
    const filtered = products.filter((prod) => {
      // 1. Categoría
      if (activeCategory !== 'todos' && prod.category !== activeCategory) {
        return false;
      }

      // 2. Búsqueda por nombre, descripción, marca, categoría o materiales
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const nameMatch = prod.name?.toLowerCase().includes(q);
        const descMatch = prod.description?.toLowerCase().includes(q);
        const catMatch = prod.category?.toLowerCase().includes(q);
        const brandMatch = (prod.brand || 'hermanos jota')
          .toLowerCase()
          .includes(q);
        const matMatch = (prod.specs?.materiales || prod.specs?.madera || '')
          .toLowerCase()
          .includes(q);

        if (!nameMatch && !descMatch && !catMatch && !brandMatch && !matMatch) {
          return false;
        }
      }

      // 3. Stock
      if (inStockOnly && typeof prod.stock === 'number' && prod.stock <= 0) {
        return false;
      }

      // 4. Rango de precio
      const price = Number(prod.price) || 0;
      if (minPrice !== '' && price < Number(minPrice)) {
        return false;
      }
      if (maxPrice !== '' && price > Number(maxPrice)) {
        return false;
      }

      // 5. Material
      if (selectedMaterial !== 'todos') {
        const matStr = (
          prod.specs?.materiales ||
          prod.specs?.madera ||
          ''
        ).toLowerCase();
        if (!matStr.includes(selectedMaterial.toLowerCase())) {
          return false;
        }
      }

      return true;
    });

    // Ordenamiento
    const sorted = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'precio-menor':
          return (a.price || 0) - (b.price || 0);
        case 'precio-mayor':
          return (b.price || 0) - (a.price || 0);
        case 'nombre-az':
          return (a.name || '').localeCompare(b.name || '', 'es');
        case 'nombre-za':
          return (b.name || '').localeCompare(a.name || '', 'es');
        case 'recientes':
          return (b.id ?? 0) - (a.id ?? 0);
        case 'relevancia':
        default:
          if (a.featured && !b.featured) return -1;
          if (!a.featured && b.featured) return 1;
          return (a.id ?? 0) - (b.id ?? 0);
      }
    });

    return sorted;
  }, [
    products,
    activeCategory,
    searchQuery,
    inStockOnly,
    minPrice,
    maxPrice,
    selectedMaterial,
    sortBy,
  ]);

  // Anuncio accesible por cambio de filtro u orden (modern-web-guidance: dynamic-sort)
  /*  useEffect(() => {
      const currentSort = SORT_OPTIONS.find((opt) => opt.value === sortBy)?.label;
      setStatusMessage(
        `Mostrando ${filteredProducts.length} productos ordenados por ${currentSort}.`
      );
    }, [filteredProducts.length, sortBy]);*/

  // Categoría actual seleccionada
  const currentCategoryInfo =
    CATEGORIES.find((cat) => cat.value === activeCategory) || CATEGORIES[0];

  // Filtros activos para renderizar chips de borrado rápido
  const activeChips = useMemo(() => {
    const chips = [];
    if (searchQuery.trim()) {
      chips.push({
        id: 'search',
        label: `Búsqueda: "${searchQuery}"`,
        onRemove: () => setSearchQuery(''),
      });
    }
    if (activeCategory !== 'todos') {
      const catLabel =
        CATEGORIES.find((c) => c.value === activeCategory)?.label ||
        activeCategory;
      chips.push({
        id: 'category',
        label: `Categoría: ${catLabel}`,
        onRemove: () => setActiveCategory('todos'),
      });
    }
    if (inStockOnly) {
      chips.push({
        id: 'stock',
        label: 'Solo en stock',
        onRemove: () => setInStockOnly(false),
      });
    }
    if (minPrice !== '' || maxPrice !== '') {
      const minTxt = minPrice
        ? `$${Number(minPrice).toLocaleString('es-AR')}`
        : '$0';
      const maxTxt = maxPrice
        ? `$${Number(maxPrice).toLocaleString('es-AR')}`
        : 'Sin límite';
      chips.push({
        id: 'price',
        label: `Precio: ${minTxt} - ${maxTxt}`,
        onRemove: () => {
          setMinPrice('');
          setMaxPrice('');
        },
      });
    }
    if (selectedMaterial !== 'todos') {
      chips.push({
        id: 'material',
        label: `Material: ${selectedMaterial}`,
        onRemove: () => setSelectedMaterial('todos'),
      });
    }
    return chips;
  }, [
    searchQuery,
    activeCategory,
    inStockOnly,
    minPrice,
    maxPrice,
    selectedMaterial,
  ]);

  const activeFiltersCount = activeChips.length;

  return (
    <>
      {/* Banner superior con jerarquía visual de tienda de alta gama */}
      <section className="catalog-hero-banner">
        <div className="container">
          <div className="catalog-hero-content">
            <span className="catalog-hero-eyebrow">Catálogo Exclusivo</span>
            <h1 className="catalog-hero-title">{currentCategoryInfo.title}</h1>
            <p className="catalog-hero-subtitle">
              {currentCategoryInfo.description}
            </p>
          </div>

          {/* Barra de Búsqueda destacada en la parte superior */}
          <div className="catalog-search-wrapper">
            <form
              className="catalog-search-form"
              onSubmit={(e) => e.preventDefault()}
              role="search"
            >
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
                placeholder="Buscar por mueble, madera, colección o ambiente…"
                aria-label="Buscar en el catálogo"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button
                  type="button"
                  className="catalog-search-clear"
                  onClick={() => setSearchQuery('')}
                  aria-label="Limpiar término de búsqueda"
                  title="Limpiar búsqueda"
                >
                  ✕
                </button>
              )}
            </form>
          </div>
        </div>
      </section>

      {/* Anuncio accesible de cambios de orden y cantidad */}
      <div role="status" aria-live="polite" className="visually-hidden">
        {statusMessage}
      </div>

      {/* Contenido principal del Catálogo */}
      <section className="catalog-section" id="catalog">
        <div className="container">
          {/* Barra superior de controles: Resultados + Botón Filtros móvil + Selector de orden */}
          <div className="catalog-top-bar">
            <div className="catalog-top-results">
              <span className="catalog-results-badge">
                {filteredProducts.length === 1
                  ? '1 pieza encontrada'
                  : `${filteredProducts.length} piezas encontradas`}
              </span>
              {products.length > 0 && (
                <span className="catalog-results-total">
                  de {products.length} productos en catálogo
                </span>
              )}
            </div>

            <div className="catalog-top-actions">
              {/* Botón para abrir filtros en pantallas pequeñas */}
              <button
                type="button"
                className="catalog-mobile-filters-trigger"
                onClick={() => setMobileDrawerOpen(true)}
                aria-label="Abrir panel de filtros"
              >
                <svg
                  viewBox="0 0 24 24"
                  width="18"
                  height="18"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <line x1="4" y1="21" x2="4" y2="14" />
                  <line x1="4" y1="10" x2="4" y2="3" />
                  <line x1="12" y1="21" x2="12" y2="12" />
                  <line x1="12" y1="8" x2="12" y2="3" />
                  <line x1="20" y1="21" x2="20" y2="16" />
                  <line x1="20" y1="12" x2="20" y2="3" />
                  <line x1="1" y1="14" x2="7" y2="14" />
                  <line x1="9" y1="8" x2="15" y2="8" />
                  <line x1="17" y1="16" x2="23" y2="16" />
                </svg>
                <span>Filtros</span>
                {activeFiltersCount > 0 && (
                  <span className="catalog-filters-count-badge">
                    {activeFiltersCount}
                  </span>
                )}
              </button>

              {/* Selector de ordenamiento nativo accesible */}
              <div className="catalog-sort-wrapper">
                <label
                  htmlFor="catalog-sort-select"
                  className="catalog-sort-label"
                >
                  Ordenar por:
                </label>
                <select
                  id="catalog-sort-select"
                  className="catalog-sort-select"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  {SORT_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Chips de filtros activos */}
          {activeChips.length > 0 && (
            <div
              className="catalog-active-chips"
              aria-label="Filtros aplicados"
            >
              <span className="active-chips-title">Filtros aplicados:</span>
              <div className="active-chips-list">
                {activeChips.map((chip) => (
                  <button
                    key={chip.id}
                    type="button"
                    className="filter-chip"
                    onClick={chip.onRemove}
                    title="Remover filtro"
                  >
                    <span>{chip.label}</span>
                    <span className="filter-chip-remove" aria-hidden="true">
                      ✕
                    </span>
                  </button>
                ))}
                <button
                  type="button"
                  className="filter-chips-clear-all"
                  onClick={handleResetFilters}
                >
                  Limpiar todos
                </button>
              </div>
            </div>
          )}

          {/* Estructura del Catálogo: Sidebar a la izquierda + Productos a la derecha */}
          <div className="catalog-layout">
            {/* Overlay para móvil */}
            {mobileDrawerOpen && (
              <div
                className="catalog-sidebar-overlay"
                onClick={() => setMobileDrawerOpen(false)}
                aria-hidden="true"
              />
            )}

            {/* Columna Lateral de Filtros */}
            <aside
              className={`catalog-sidebar ${
                mobileDrawerOpen ? 'is-drawer-open' : ''
              }`}
              aria-label="Filtros del catálogo"
            >
              <div className="sidebar-header-mobile">
                <h2 className="sidebar-mobile-title">Filtrar catálogo</h2>
                <button
                  type="button"
                  className="sidebar-close-btn"
                  onClick={() => setMobileDrawerOpen(false)}
                  aria-label="Cerrar filtros"
                >
                  ✕
                </button>
              </div>

              {/* Botón de limpiar filtros en sidebar */}
              {activeFiltersCount > 0 && (
                <div className="sidebar-reset-block">
                  <button
                    type="button"
                    className="sidebar-reset-btn"
                    onClick={handleResetFilters}
                  >
                    <svg
                      viewBox="0 0 24 24"
                      width="14"
                      height="14"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                      <path d="M3 3v5h5" />
                    </svg>
                    Restablecer todos los filtros ({activeFiltersCount})
                  </button>
                </div>
              )}

              {/* Grupo: Categorías */}
              <div className="sidebar-filter-group">
                <h3 className="filter-group-title">Categorías</h3>
                <ul className="filter-category-list">
                  {CATEGORIES.map((cat) => {
                    const isSelected = activeCategory === cat.value;
                    const count = categoryCounts[cat.value] || 0;
                    return (
                      <li key={cat.value}>
                        <button
                          type="button"
                          className={`filter-category-btn ${
                            isSelected ? 'is-active' : ''
                          }`}
                          onClick={() => {
                            setActiveCategory(cat.value);
                            if (window.innerWidth <= 900)
                              setMobileDrawerOpen(false);
                          }}
                        >
                          <span className="category-btn-text">{cat.label}</span>
                          <span className="category-btn-count">({count})</span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>

              {/* Grupo: Disponibilidad / Stock */}
              <div className="sidebar-filter-group">
                <h3 className="filter-group-title">Disponibilidad</h3>
                <label className="filter-checkbox-label">
                  <input
                    type="checkbox"
                    className="filter-checkbox-input"
                    checked={inStockOnly}
                    onChange={(e) => setInStockOnly(e.target.checked)}
                  />
                  <span className="checkbox-custom" aria-hidden="true" />
                  <span className="checkbox-text">Solo productos en stock</span>
                  <span className="checkbox-count">({inStockCount})</span>
                </label>
              </div>

              {/* Grupo: Rango de Precios */}
              <div className="sidebar-filter-group">
                <h3 className="filter-group-title">Rango de Precios (ARS)</h3>
                <div className="filter-price-inputs">
                  <div className="price-input-field">
                    <label htmlFor="price-min" className="price-label">
                      Mínimo
                    </label>
                    <div className="price-input-wrapper">
                      <span className="price-currency">$</span>
                      <input
                        type="number"
                        id="price-min"
                        className="price-number-input"
                        placeholder={
                          catalogMinPrice
                            ? catalogMinPrice.toLocaleString('es-AR')
                            : '0'
                        }
                        value={minPrice}
                        min="0"
                        step="50000"
                        onChange={(e) => setMinPrice(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="price-input-separator" aria-hidden="true">
                    —
                  </div>
                  <div className="price-input-field">
                    <label htmlFor="price-max" className="price-label">
                      Máximo
                    </label>
                    <div className="price-input-wrapper">
                      <span className="price-currency">$</span>
                      <input
                        type="number"
                        id="price-max"
                        className="price-number-input"
                        placeholder={
                          catalogMaxPrice
                            ? catalogMaxPrice.toLocaleString('es-AR')
                            : '3000000'
                        }
                        value={maxPrice}
                        min="0"
                        step="50000"
                        onChange={(e) => setMaxPrice(e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                {/* Presets de precio rápido */}
                <div className="price-quick-presets">
                  <button
                    type="button"
                    className={`preset-pill ${
                      maxPrice === '1000000' && minPrice === ''
                        ? 'is-active'
                        : ''
                    }`}
                    onClick={() => {
                      setMinPrice('');
                      setMaxPrice('1000000');
                    }}
                  >
                    Hasta $1.000.000
                  </button>
                  <button
                    type="button"
                    className={`preset-pill ${
                      minPrice === '1000000' && maxPrice === '1800000'
                        ? 'is-active'
                        : ''
                    }`}
                    onClick={() => {
                      setMinPrice('1000000');
                      setMaxPrice('1800000');
                    }}
                  >
                    $1M - $1.8M
                  </button>
                  <button
                    type="button"
                    className={`preset-pill ${
                      minPrice === '1800000' && maxPrice === ''
                        ? 'is-active'
                        : ''
                    }`}
                    onClick={() => {
                      setMinPrice('1800000');
                      setMaxPrice('');
                    }}
                  >
                    Más de $1.8M
                  </button>
                </div>
              </div>

              {/* Grupo: Maderas y Materiales */}
              {availableMaterials.length > 0 && (
                <div className="sidebar-filter-group">
                  <h3 className="filter-group-title">Maderas & Materiales</h3>
                  <div className="filter-materials-pills">
                    <button
                      type="button"
                      className={`material-pill ${
                        selectedMaterial === 'todos' ? 'is-active' : ''
                      }`}
                      onClick={() => setSelectedMaterial('todos')}
                    >
                      Todos
                    </button>
                    {availableMaterials.map((mat) => (
                      <button
                        key={mat}
                        type="button"
                        className={`material-pill ${
                          selectedMaterial === mat ? 'is-active' : ''
                        }`}
                        onClick={() =>
                          setSelectedMaterial(
                            selectedMaterial === mat ? 'todos' : mat
                          )
                        }
                      >
                        {mat}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Botón flotante para aplicar en móvil */}
              <div className="sidebar-mobile-apply">
                <button
                  type="button"
                  className="btn btn-primary btn-full-width"
                  onClick={() => setMobileDrawerOpen(false)}
                >
                  Ver {filteredProducts.length} productos
                </button>
              </div>
            </aside>

            {/* Sección Principal de Productos a la derecha */}
            <main className="catalog-main" aria-label="Listado de productos">
              {loading && (
                <div className="catalog-loading-state" role="status">
                  <div className="loading-spinner" aria-hidden="true" />
                  <p>Cargando piezas del catálogo…</p>
                </div>
              )}

              {!loading && error && (
                <div className="catalog-error-state" role="alert">
                  <svg
                    viewBox="0 0 24 24"
                    width="32"
                    height="32"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                  <h3>No pudimos conectar con el catálogo</h3>
                  <p>{error}</p>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => window.location.reload()}
                  >
                    Reintentar
                  </button>
                </div>
              )}

              {!loading && !error && filteredProducts.length === 0 && (
                <div className="catalog-empty" id="catalog-empty">
                  <div className="catalog-empty-icon" aria-hidden="true">
                    <svg
                      viewBox="0 0 24 24"
                      width="48"
                      height="48"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <circle cx="11" cy="11" r="8" />
                      <path d="m21 21-4.3-4.3" />
                      <line x1="8" y1="11" x2="14" y2="11" />
                    </svg>
                  </div>
                  <h2>Sin resultados para los filtros seleccionados</h2>
                  <p>
                    No encontramos ningún mueble que cumpla con los criterios de
                    búsqueda actuales. Te sugerimos ajustar los filtros o
                    explorar nuestras otras categorías.
                  </p>
                  <button
                    type="button"
                    className="btn btn-primary"
                    id="btn-reset-filters"
                    onClick={handleResetFilters}
                  >
                    Restablecer todos los filtros
                  </button>
                </div>
              )}

              {/* Grilla ordenada y consistente de tarjetas de producto */}
              {!loading && !error && filteredProducts.length > 0 && (
                <div className="catalog-grid" id="catalog-grid">
                  {filteredProducts.map((product, index) => (
                    <ProductCard
                      key={product.id ?? product._id}
                      product={product}
                      index={index}
                    />
                  ))}
                </div>
              )}
            </main>
          </div>
        </div>
      </section>
    </>
  );
}

export default ProductList;
