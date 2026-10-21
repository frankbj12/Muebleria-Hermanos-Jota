import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useProducts } from '../../context/ProductsContext';
import { useToast } from '../../context/ToastContext';
import { getProductImageUrl } from '../../utils/imageUrl';

const formatPrice = (price) => {
  if (typeof price !== 'number') return '$ 0';
  return '$\u00A0' + price.toLocaleString('es-AR');
};

const getCategoryLabel = (category) => {
  const map = {
    living: 'Living & Sala',
    comedor: 'Comedor',
    dormitorio: 'Dormitorio',
    almacenamiento: 'Almacenamiento',
    trabajo: 'Espacios de Trabajo',
  };
  return map[category] || category || 'Sin categoría';
};

// Componente para la flechita de ordenamiento en los encabezados
const SortIcon = ({ columnKey, currentKey, direction }) => {
  const isActive = currentKey === columnKey;
  if (!isActive) {
    return (
      <svg
        className="admin-sort-icon admin-sort-icon--inactive"
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="m7 15 5 5 5-5" />
        <path d="m7 9 5-5 5 5" />
      </svg>
    );
  }
  return direction === 'asc' ? (
    <svg
      className="admin-sort-icon admin-sort-icon--active"
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="m18 15-6-6-6 6" />
    </svg>
  ) : (
    <svg
      className="admin-sort-icon admin-sort-icon--active"
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
};

function AdminPanel() {
  const { products, loading, error, removeProduct } = useProducts();
  const { addToast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('todos');
  const [stockFilters, setStockFilters] = useState([]); // Array con 'normal', 'bajo', 'agotado'. Vacío [] = todos
  const [sortConfig, setSortConfig] = useState({ key: 'id', direction: 'asc' });

  // Manejador de selección múltiple de stock
  // "Total" es exclusivo: al pulsarlo limpia las demás.
  // "Normal", "Bajo" y "Sin stock" se pueden combinar libremente entre sí.
  const toggleStockFilter = (type) => {
    if (type === 'todos') {
      setStockFilters([]);
      return;
    }

    setStockFilters((prev) => {
      let next;
      if (prev.includes(type)) {
        next = prev.filter((item) => item !== type);
      } else {
        next = [...prev, type];
      }
      // Si se deseleccionan todas, vuelve automáticamente a mostrar el Total
      if (next.length === 0) {
        return [];
      }
      return next;
    });
  };

  const isAllStock = stockFilters.length === 0;

  // Manejador del ordenamiento de columnas
  const handleSort = (key) => {
    setSortConfig((prev) => {
      if (prev.key === key) {
        return {
          key,
          direction: prev.direction === 'asc' ? 'desc' : 'asc',
        };
      }
      return { key, direction: 'asc' };
    });
  };

  // Métricas globales de inventario (siempre sobre el total de productos)
  const totalCount = products.length;
  const inStockCount = products.filter(
    (p) => typeof p.stock === 'number' && p.stock > 3
  ).length;
  const lowStockCount = products.filter(
    (p) => typeof p.stock === 'number' && p.stock > 0 && p.stock <= 3
  ).length;
  const outOfStockCount = products.filter(
    (p) => typeof p.stock === 'number' && p.stock === 0
  ).length;

  // Filtrado reactivo (búsqueda + categoría + multi-selección de stock)
  const filteredProducts = products.filter((product) => {
    const nameMatch = product.name
      ?.toLowerCase()
      .includes(searchTerm.toLowerCase());
    const descMatch = product.description
      ?.toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesSearch = nameMatch || descMatch;

    const matchesCategory =
      categoryFilter === 'todos' ||
      product.category?.toLowerCase() === categoryFilter.toLowerCase();

    let matchesStock = true;
    if (stockFilters.length > 0) {
      const s = product.stock;
      matchesStock = stockFilters.some((filter) => {
        if (filter === 'normal') return typeof s === 'number' && s > 3;
        if (filter === 'bajo') return typeof s === 'number' && s > 0 && s <= 3;
        if (filter === 'agotado') return typeof s === 'number' && s === 0;
        return false;
      });
    }

    return matchesSearch && matchesCategory && matchesStock;
  });

  // Ordenamiento reactivo de los productos filtrados
  const sortedAndFilteredProducts = [...filteredProducts].sort((a, b) => {
    const { key, direction } = sortConfig;
    let comparison = 0;

    if (key === 'id') {
      const idA = a.id ?? a._id;
      const idB = b.id ?? b._id;
      const numA = Number(idA);
      const numB = Number(idB);
      if (!isNaN(numA) && !isNaN(numB)) {
        comparison = numA - numB;
      } else {
        comparison = String(idA).localeCompare(String(idB), undefined, {
          numeric: true,
        });
      }
    } else if (key === 'name') {
      comparison = (a.name || '').localeCompare(b.name || '', 'es', {
        sensitivity: 'base',
      });
    } else if (key === 'price') {
      const priceA = typeof a.price === 'number' ? a.price : 0;
      const priceB = typeof b.price === 'number' ? b.price : 0;
      comparison = priceA - priceB;
    } else if (key === 'stock') {
      const stockA = typeof a.stock === 'number' ? a.stock : -1;
      const stockB = typeof b.stock === 'number' ? b.stock : -1;
      comparison = stockA - stockB;
    }

    return direction === 'asc' ? comparison : -comparison;
  });

  const handleDelete = async (product) => {
    const confirmed = window.confirm(
      `¿Estás seguro de que deseás eliminar "${product.name}" del catálogo? Esta acción no se puede deshacer.`
    );
    if (!confirmed) return;

    try {
      const id = product.id ?? product._id;
      await removeProduct(id);
      addToast(`"${product.name}" fue eliminado del catálogo.`, 'info');
    } catch (err) {
      addToast(err.message || 'No se pudo eliminar el producto.', 'error');
    }
  };

  return (
    <section
      className="admin-panel-section"
      aria-label="Panel de Administración"
    >
      <div className="container">
        {/* Cabecera del panel estilo Hermanos Jota */}
        <header className="admin-header">
          <div className="admin-header-text">
            <span className="admin-badge">Panel de Administración</span>
            <h1 className="admin-title">Inventario y Catálogo</h1>
            <p className="admin-subtitle">
              Administrá los muebles artesanales, controlá el stock disponible y
              gestioná altas y modificaciones de la colección.
            </p>
          </div>
          <div className="admin-header-actions">
            <Link
              to="/admin/crear-producto"
              className="btn-admin-cta"
              id="btn-admin-create"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              <span>+ Nuevo Producto</span>
            </Link>
          </div>
        </header>

        {/* Tarjetas de métricas interactivas (Filtros de Stock con un clic y multi-selección) */}
        <div
          className="admin-metrics-grid"
          role="region"
          aria-label="Filtrar catálogo por estado de stock"
        >
          {/* Total Productos */}
          <button
            type="button"
            className={`admin-metric-card admin-metric-card--total ${
              isAllStock ? 'admin-metric-card--active' : ''
            }`}
            onClick={() => toggleStockFilter('todos')}
            aria-pressed={isAllStock}
            title="Ver catálogo completo"
          >
            <div className="admin-metric-icon-wrapper admin-metric-icon-wrapper--total">
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
                <line x1="12" y1="22.08" x2="12" y2="12" />
              </svg>
            </div>
            <div className="admin-metric-content">
              <span className="admin-metric-label">Total Productos</span>
              <strong
                className="admin-metric-value"
                data-testid="metric-total-count"
              >
                {totalCount}
              </strong>
              <span className="admin-metric-hint">Catálogo Hermanos Jota</span>
            </div>
          </button>

          {/* En Stock Normal */}
          <button
            type="button"
            className={`admin-metric-card admin-metric-card--success ${
              stockFilters.includes('normal') ? 'admin-metric-card--active' : ''
            }`}
            onClick={() => toggleStockFilter('normal')}
            aria-pressed={stockFilters.includes('normal')}
            title="Filtrar por productos en stock normal (> 3)"
          >
            <div className="admin-metric-icon-wrapper admin-metric-icon-wrapper--success">
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
            </div>
            <div className="admin-metric-content">
              <span className="admin-metric-label">En Stock Normal</span>
              <strong className="admin-metric-value admin-metric-value--success">
                {inStockCount}
              </strong>
              <span className="admin-metric-hint">
                &gt; 3 unidades disponibles
              </span>
            </div>
          </button>

          {/* Stock Bajo */}
          <button
            type="button"
            className={`admin-metric-card admin-metric-card--warning ${
              stockFilters.includes('bajo') ? 'admin-metric-card--active' : ''
            }`}
            onClick={() => toggleStockFilter('bajo')}
            aria-pressed={stockFilters.includes('bajo')}
            title="Filtrar por productos con stock bajo (1 a 3)"
          >
            <div className="admin-metric-icon-wrapper admin-metric-icon-wrapper--warning">
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                <line x1="12" y1="9" x2="12" y2="13" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
            </div>
            <div className="admin-metric-content">
              <span className="admin-metric-label">Stock Bajo</span>
              <strong className="admin-metric-value admin-metric-value--warning">
                {lowStockCount}
              </strong>
              <span className="admin-metric-hint">
                1 a 3 unidades restantes
              </span>
            </div>
          </button>

          {/* Sin Stock */}
          <button
            type="button"
            className={`admin-metric-card admin-metric-card--danger ${
              stockFilters.includes('agotado')
                ? 'admin-metric-card--active'
                : ''
            }`}
            onClick={() => toggleStockFilter('agotado')}
            aria-pressed={stockFilters.includes('agotado')}
            title="Filtrar por productos sin stock (0)"
          >
            <div className="admin-metric-icon-wrapper admin-metric-icon-wrapper--danger">
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="15" y1="9" x2="9" y2="15" />
                <line x1="9" y1="9" x2="15" y2="15" />
              </svg>
            </div>
            <div className="admin-metric-content">
              <span className="admin-metric-label">Sin Stock</span>
              <strong className="admin-metric-value admin-metric-value--danger">
                {outOfStockCount}
              </strong>
              <span className="admin-metric-hint">Agotados actualmente</span>
            </div>
          </button>
        </div>

        {/* Barra de herramientas / Búsqueda y Filtros */}
        <div className="admin-toolbar">
          <div className="admin-search-wrapper">
            <svg
              className="admin-search-icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              className="admin-search-input"
              placeholder="Buscar por nombre o descripción..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              aria-label="Buscar producto en admin"
              id="admin-search-input"
            />
            {searchTerm && (
              <button
                type="button"
                className="admin-search-clear"
                onClick={() => setSearchTerm('')}
                aria-label="Limpiar búsqueda"
              >
                ✕
              </button>
            )}
          </div>

          <div className="admin-filter-group">
            <label
              htmlFor="admin-category-select"
              className="admin-filter-label"
            >
              Categoría:
            </label>
            <select
              id="admin-category-select"
              className="admin-select"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              aria-label="Filtrar por categoría"
            >
              <option value="todos">Todas las categorías</option>
              <option value="living">Living &amp; Sala</option>
              <option value="comedor">Comedor</option>
              <option value="dormitorio">Dormitorio</option>
              <option value="almacenamiento">Almacenamiento</option>
              <option value="trabajo">Espacios de Trabajo</option>
            </select>
          </div>

          {/* Chips de filtros de stock activos (soporte multi-selección) */}
          {stockFilters.length > 0 && (
            <div className="admin-active-filters-group">
              {stockFilters.map((filter) => {
                const label =
                  filter === 'normal'
                    ? 'Normal (>3)'
                    : filter === 'bajo'
                      ? 'Bajo (1-3)'
                      : 'Sin Stock (0)';
                return (
                  <div
                    key={filter}
                    className={`admin-active-filter-chip admin-active-filter-chip--${filter}`}
                  >
                    <span>
                      Stock: <strong>{label}</strong>
                    </span>
                    <button
                      type="button"
                      onClick={() => toggleStockFilter(filter)}
                      aria-label={`Quitar filtro ${label}`}
                      className="admin-active-filter-close"
                    >
                      ✕
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          <div className="admin-results-counter">
            <span>
              Mostrando <strong>{sortedAndFilteredProducts.length}</strong> de{' '}
              {products.length} muebles
            </span>
          </div>
        </div>

        {/* Estado de carga y error */}
        {loading && (
          <div className="products-loading" data-testid="admin-loading">
            <p>Cargando inventario de productos...</p>
          </div>
        )}

        {error && (
          <div
            className="out-of-stock-alert"
            role="alert"
            style={{ margin: '1.5rem 0' }}
          >
            <strong>Error de conexión:</strong> {error}
          </div>
        )}

        {/* Tabla tipo Django Admin con columnas ordenables */}
        {!loading && !error && (
          <div className="admin-table-container">
            {sortedAndFilteredProducts.length === 0 ? (
              <div className="admin-empty-state">
                <svg
                  width="48"
                  height="48"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                  <line x1="8" y1="11" x2="14" y2="11" />
                </svg>
                <h3>No se encontraron productos</h3>
                <p>
                  No hay muebles que coincidan con los filtros seleccionados.
                </p>
                {(searchTerm ||
                  categoryFilter !== 'todos' ||
                  stockFilters.length > 0) && (
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => {
                      setSearchTerm('');
                      setCategoryFilter('todos');
                      setStockFilters([]);
                    }}
                  >
                    Restablecer todos los filtros
                  </button>
                )}
              </div>
            ) : (
              <table className="admin-table" id="admin-products-table">
                <thead>
                  <tr>
                    {/* Columna ID Ordenable */}
                    <th scope="col" style={{ width: '80px' }}>
                      <button
                        type="button"
                        className="admin-th-sort-btn"
                        onClick={() => handleSort('id')}
                        aria-label="Ordenar por ID"
                      >
                        <span>ID</span>
                        <SortIcon
                          columnKey="id"
                          currentKey={sortConfig.key}
                          direction={sortConfig.direction}
                        />
                      </button>
                    </th>

                    {/* Columna Foto */}
                    <th scope="col" style={{ width: '76px' }}>
                      Mueble
                    </th>

                    {/* Columna Nombre Ordenable */}
                    <th scope="col">
                      <button
                        type="button"
                        className="admin-th-sort-btn"
                        onClick={() => handleSort('name')}
                        aria-label="Ordenar por Nombre"
                      >
                        <span>Nombre &amp; Detalle</span>
                        <SortIcon
                          columnKey="name"
                          currentKey={sortConfig.key}
                          direction={sortConfig.direction}
                        />
                      </button>
                    </th>

                    {/* Columna Categoría */}
                    <th scope="col">Categoría</th>

                    {/* Columna Precio Ordenable */}
                    <th scope="col">
                      <button
                        type="button"
                        className="admin-th-sort-btn"
                        onClick={() => handleSort('price')}
                        aria-label="Ordenar por Precio"
                      >
                        <span>Precio</span>
                        <SortIcon
                          columnKey="price"
                          currentKey={sortConfig.key}
                          direction={sortConfig.direction}
                        />
                      </button>
                    </th>

                    {/* Columna Disponibilidad Ordenable */}
                    <th scope="col">
                      <button
                        type="button"
                        className="admin-th-sort-btn"
                        onClick={() => handleSort('stock')}
                        aria-label="Ordenar por Disponibilidad de Stock"
                      >
                        <span>Disponibilidad</span>
                        <SortIcon
                          columnKey="stock"
                          currentKey={sortConfig.key}
                          direction={sortConfig.direction}
                        />
                      </button>
                    </th>

                    {/* Acciones */}
                    <th scope="col" style={{ textAlign: 'right' }}>
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {sortedAndFilteredProducts.map((product) => {
                    const id = product.id ?? product._id;
                    const stock = product.stock;
                    const hasStock = typeof stock === 'number';
                    const isOutOfStock = hasStock && stock === 0;
                    const isLowStock = hasStock && stock > 0 && stock <= 3;

                    return (
                      <tr key={id} id={`admin-row-${id}`}>
                        {/* ID numérico o ref */}
                        <td className="admin-id-cell">
                          <span className="admin-id-badge">#{id}</span>
                        </td>

                        {/* Foto */}
                        <td>
                          <div className="admin-thumb-wrapper">
                            <img
                              src={getProductImageUrl(product.image)}
                              alt={product.name}
                              className="admin-thumb-img"
                              referrerPolicy="no-referrer"
                              onError={(e) => {
                                e.currentTarget.onerror = null;
                                e.currentTarget.src =
                                  '/assets/placeholder-furniture.png';
                              }}
                            />
                          </div>
                        </td>

                        {/* Nombre & Detalle */}
                        <td>
                          <div className="admin-product-meta">
                            <div className="admin-product-name-row">
                              <strong className="admin-product-name">
                                {product.name}
                              </strong>
                              {product.featured && (
                                <span
                                  className="admin-featured-pill"
                                  title="Pieza destacada en página principal"
                                >
                                  ★ Destacado
                                </span>
                              )}
                            </div>
                            {product.description && (
                              <p className="admin-product-desc-snippet">
                                {product.description.length > 70
                                  ? product.description.slice(0, 70) + '...'
                                  : product.description}
                              </p>
                            )}
                          </div>
                        </td>

                        {/* Categoría */}
                        <td>
                          <span className="admin-category-tag">
                            {getCategoryLabel(product.category)}
                          </span>
                        </td>

                        {/* Precio */}
                        <td>
                          <span className="admin-price">
                            {formatPrice(product.price)}
                          </span>
                        </td>

                        {/* Stock */}
                        <td>
                          {hasStock ? (
                            <span
                              className={`stock-badge ${
                                isOutOfStock
                                  ? 'stock-badge--out'
                                  : isLowStock
                                    ? 'stock-badge--low'
                                    : 'stock-badge--in'
                              }`}
                            >
                              <span
                                className="stock-indicator-dot"
                                aria-hidden="true"
                              >
                                ●
                              </span>
                              {isOutOfStock
                                ? 'Sin stock (0)'
                                : isLowStock
                                  ? `¡Bajo! (${stock})`
                                  : `${stock} disponibles`}
                            </span>
                          ) : (
                            <span className="admin-no-stock-data">—</span>
                          )}
                        </td>

                        {/* Botones de acción: Editar y Eliminar */}
                        <td>
                          <div className="admin-actions-cell">
                            <Link
                              to={`/admin/editar-producto/${id}`}
                              className="admin-action-btn admin-action-btn--edit"
                              title="Editar este mueble"
                              aria-label={`Editar ${product.name}`}
                            >
                              <svg
                                width="14"
                                height="14"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                aria-hidden="true"
                              >
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                              </svg>
                              <span>Editar</span>
                            </Link>

                            <button
                              type="button"
                              className="admin-action-btn admin-action-btn--delete"
                              title="Eliminar del catálogo"
                              aria-label={`Eliminar ${product.name}`}
                              onClick={() => handleDelete(product)}
                            >
                              <svg
                                width="14"
                                height="14"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                aria-hidden="true"
                              >
                                <polyline points="3 6 5 6 21 6" />
                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                              </svg>
                              <span>Eliminar</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>
    </section>
  );
}

export default AdminPanel;
