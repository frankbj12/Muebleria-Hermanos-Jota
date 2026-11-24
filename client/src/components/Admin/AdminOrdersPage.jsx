import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Link, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import pedidosApi from '../../services/pedidosApi';

/* ─── Helpers ───────────────────────────────────────────────────── */

const STATUS_META = {
  pending: {
    label: 'Pendiente',
    badgeClass: 'admin-badge-warning',
    accentColor: 'var(--oro)',
  },
  processing: {
    label: 'En preparación',
    badgeClass: 'admin-badge-info',
    accentColor: '#2563eb',
  },
  completed: {
    label: 'Completado',
    badgeClass: 'admin-badge-success',
    accentColor: 'var(--salvia-dark)',
  },
  cancelled: {
    label: 'Cancelado',
    badgeClass: 'admin-badge-danger',
    accentColor: '#a14337',
  },
};

function shortId(id = '') {
  return `#${String(id).slice(-6).toUpperCase()}`;
}

function formatDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatPrice(n) {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: 0,
  }).format(n ?? 0);
}

/* ─── Componente ─────────────────────────────────────────────────── */

export default function AdminOrdersPage() {
  const { user, loading: authLoading, isAuthenticated } = useAuth();
  const location = useLocation();

  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [error, setError] = useState(null);

  const [filterStatus, setFilterStatus] = useState('all');
  const [search, setSearch] = useState('');
  const [expandedId, setExpandedId] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);
  const [updateError, setUpdateError] = useState(null);

  const abortRef = useRef(null);

  /* ── Carga de pedidos ── */
  const fetchOrders = useCallback(async () => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setLoadingOrders(true);
    setError(null);

    try {
      const data = await pedidosApi.getAllOrders({ signal: controller.signal });
      setOrders(data);
    } catch (err) {
      if (err.name !== 'AbortError') {
        setError('No se pudieron cargar los pedidos. Intentá de nuevo.');
      }
    } finally {
      setLoadingOrders(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated && user?.role === 'admin') {
      fetchOrders();
    }
    return () => abortRef.current?.abort();
  }, [isAuthenticated, user, fetchOrders]);

  /* ── Cambio de estado ── */
  const handleStatusChange = async (orderId, newStatus) => {
    setUpdatingId(orderId);
    setUpdateError(null);

    try {
      const updated = await pedidosApi.updateOrderStatus(orderId, newStatus);
      setOrders((prev) =>
        prev.map((o) =>
          o.id === updated.id || o._id === updated.id
            ? { ...o, status: updated.status }
            : o
        )
      );
    } catch {
      setUpdateError(`No se pudo actualizar el pedido ${shortId(orderId)}.`);
    } finally {
      setUpdatingId(null);
    }
  };

  /* ── Guardias ── */
  if (authLoading) {
    return (
      <div className="account-page">
        <section className="account-section">
          <div className="container">
            <div className="account-loading" role="status" aria-live="polite">
              <span className="account-spinner" aria-hidden="true" />
              <p>Verificando sesión...</p>
            </div>
          </div>
        </section>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (user.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  /* ── Filtrado y búsqueda ── */
  const filtered = orders.filter((o) => {
    const matchStatus = filterStatus === 'all' || o.status === filterStatus;
    const q = search.trim().toLowerCase();
    if (!q) return matchStatus;
    const idMatch = String(o.id ?? o._id ?? '')
      .toLowerCase()
      .includes(q);
    const nameMatch = String(o.user?.name ?? '')
      .toLowerCase()
      .includes(q);
    const emailMatch = String(o.user?.email ?? '')
      .toLowerCase()
      .includes(q);
    return matchStatus && (idMatch || nameMatch || emailMatch);
  });

  /* ── Métricas rápidas ── */
  const metrics = {
    total: orders.length,
    pending: orders.filter((o) => o.status === 'pending').length,
    processing: orders.filter((o) => o.status === 'processing').length,
    completed: orders.filter((o) => o.status === 'completed').length,
    cancelled: orders.filter((o) => o.status === 'cancelled').length,
    revenue: orders
      .filter((o) => o.status !== 'cancelled')
      .reduce((s, o) => s + (o.total ?? 0), 0),
  };

  /* ── Render ── */
  return (
    <section
      className="admin-panel-section"
      aria-label="Administración de Pedidos"
      data-testid="admin-orders-page"
    >
      <div className="container">
        {/* Cabecera idéntica a AdminPanel */}
        <header className="admin-header">
          <div className="admin-header-text">
            <span className="admin-badge">✦ GESTIÓN DE PEDIDOS</span>
            <h1 className="admin-title">Administración de Pedidos</h1>
            <p className="admin-subtitle">
              Revisá, filtrá y gestioná el progreso de todas las compras
              realizadas en la tienda Hermanos Jota.
            </p>
          </div>
          <div className="admin-header-actions">
            <Link
              to="/admin"
              className="btn-admin-cta"
              style={{
                backgroundColor: 'transparent',
                color: 'var(--siena) !important',
                borderColor: 'rgba(160, 82, 45, 0.3)',
                boxShadow: 'none',
              }}
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <line x1="19" y1="12" x2="5" y2="12" />
                <polyline points="12 19 5 12 12 5" />
              </svg>
              <span>Ver Catálogo</span>
            </Link>
          </div>
        </header>

        {/* Tarjetas de métricas interactivas idénticas a AdminPanel */}
        <div
          className="admin-metrics-grid"
          role="region"
          aria-label="Filtrar pedidos por estado"
        >
          {/* Total Pedidos */}
          <button
            type="button"
            className={`admin-metric-card admin-metric-card--total ${filterStatus === 'all' ? 'admin-metric-card--active' : ''}`}
            onClick={() => setFilterStatus('all')}
            aria-pressed={filterStatus === 'all'}
            title="Ver todos los pedidos"
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
              <span className="admin-metric-label">Total Pedidos</span>
              <strong className="admin-metric-value">{metrics.total}</strong>
              <span className="admin-metric-hint">
                {formatPrice(metrics.revenue)} facturados
              </span>
            </div>
          </button>

          {/* Pendientes */}
          <button
            type="button"
            className={`admin-metric-card admin-metric-card--warning ${filterStatus === 'pending' ? 'admin-metric-card--active' : ''}`}
            onClick={() =>
              setFilterStatus(filterStatus === 'pending' ? 'all' : 'pending')
            }
            aria-pressed={filterStatus === 'pending'}
            title="Filtrar por pedidos pendientes"
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
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
            </div>
            <div className="admin-metric-content">
              <span className="admin-metric-label">Pendientes</span>
              <strong className="admin-metric-value admin-metric-value--warning">
                {metrics.pending}
              </strong>
              <span className="admin-metric-hint">
                A la espera de confirmación
              </span>
            </div>
          </button>

          {/* En preparación */}
          <button
            type="button"
            className={`admin-metric-card ${filterStatus === 'processing' ? 'admin-metric-card--active' : ''}`}
            style={{ '--card-accent': '#2563eb', '--active-bg': '#eff6ff' }}
            onClick={() =>
              setFilterStatus(
                filterStatus === 'processing' ? 'all' : 'processing'
              )
            }
            aria-pressed={filterStatus === 'processing'}
            title="Filtrar por pedidos en preparación"
          >
            <div
              className="admin-metric-icon-wrapper"
              style={{
                backgroundColor: 'rgba(37, 99, 235, 0.12)',
                color: '#2563eb',
              }}
            >
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
                <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
              </svg>
            </div>
            <div className="admin-metric-content">
              <span className="admin-metric-label">En Taller</span>
              <strong
                className="admin-metric-value"
                style={{ color: '#2563eb' }}
              >
                {metrics.processing}
              </strong>
              <span className="admin-metric-hint">En etapa de producción</span>
            </div>
          </button>

          {/* Completados */}
          <button
            type="button"
            className={`admin-metric-card admin-metric-card--success ${filterStatus === 'completed' ? 'admin-metric-card--active' : ''}`}
            onClick={() =>
              setFilterStatus(
                filterStatus === 'completed' ? 'all' : 'completed'
              )
            }
            aria-pressed={filterStatus === 'completed'}
            title="Filtrar por pedidos entregados"
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
              <span className="admin-metric-label">Entregados</span>
              <strong className="admin-metric-value admin-metric-value--success">
                {metrics.completed}
              </strong>
              <span className="admin-metric-hint">Órdenes finalizadas</span>
            </div>
          </button>
        </div>

        {/* Barra de herramientas / Búsqueda y Filtro de estado */}
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
              placeholder="Buscar por ID, cliente o correo..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label="Buscar pedidos"
            />
            {search && (
              <button
                type="button"
                className="admin-search-clear"
                onClick={() => setSearch('')}
                aria-label="Limpiar búsqueda"
              >
                ✕
              </button>
            )}
          </div>

          <div className="admin-filter-group">
            <label
              htmlFor="admin-order-status-filter"
              className="admin-filter-label"
            >
              Estado:
            </label>
            <select
              id="admin-order-status-filter"
              className="admin-select"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">Todos los estados</option>
              <option value="pending">Pendientes</option>
              <option value="processing">En preparación</option>
              <option value="completed">Completados</option>
              <option value="cancelled">Cancelados</option>
            </select>
          </div>

          <span className="admin-results-counter">
            Mostrando <strong>{filtered.length}</strong> de{' '}
            <strong>{orders.length}</strong> pedidos
          </span>
        </div>

        {/* Alerta de error si ocurrió al actualizar */}
        {updateError && (
          <div
            className="admin-alert admin-alert-danger"
            style={{ marginBottom: 'var(--space-lg)' }}
            role="alert"
          >
            <span>{updateError}</span>
            <button
              type="button"
              className="admin-active-filter-close"
              onClick={() => setUpdateError(null)}
            >
              ✕
            </button>
          </div>
        )}

        {/* Estado de carga */}
        {loadingOrders && (
          <div className="admin-empty-state">
            <span className="account-spinner" aria-hidden="true" />
            <p>Cargando pedidos...</p>
          </div>
        )}

        {/* Error al cargar */}
        {error && !loadingOrders && (
          <div className="admin-empty-state">
            <p>{error}</p>
            <button
              type="button"
              className="btn-admin-cta"
              onClick={fetchOrders}
            >
              Reintentar
            </button>
          </div>
        )}

        {/* Tabla de pedidos con estilo Hermanos Jota */}
        {!loadingOrders && !error && filtered.length > 0 && (
          <div className="admin-table-container">
            <table className="admin-table" aria-label="Listado de pedidos">
              <thead>
                <tr>
                  <th>Orden</th>
                  <th>Cliente</th>
                  <th>Fecha</th>
                  <th>Artículos</th>
                  <th>Total</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((order) => {
                  const id = order.id ?? order._id;
                  const isExpanded = expandedId === id;
                  const isUpdating = updatingId === id;
                  const statusMeta =
                    STATUS_META[order.status] ?? STATUS_META.pending;
                  const itemsCount = (order.items ?? []).reduce(
                    (sum, item) => sum + (item.quantity || 1),
                    0
                  );

                  return (
                    <React.Fragment key={id}>
                      <tr
                        data-testid="admin-order-card"
                        style={{
                          backgroundColor: isExpanded ? '#faf7f2' : undefined,
                          transition: 'background-color 0.2s',
                        }}
                      >
                        <td>
                          <span
                            style={{
                              fontFamily: 'monospace',
                              fontWeight: '700',
                              color: 'var(--negro)',
                            }}
                          >
                            {shortId(id)}
                          </span>
                        </td>
                        <td>
                          <div
                            style={{ display: 'flex', flexDirection: 'column' }}
                          >
                            <strong
                              style={{
                                color: 'var(--negro)',
                                fontSize: '0.92rem',
                              }}
                            >
                              {order.user?.name || 'Cliente'}
                            </strong>
                            <span
                              style={{
                                color: 'var(--gris)',
                                fontSize: '0.8rem',
                              }}
                            >
                              {order.user?.email || '—'}
                            </span>
                          </div>
                        </td>
                        <td
                          style={{
                            color: 'var(--gris-oscuro)',
                            fontSize: '0.85rem',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {formatDate(order.createdAt)}
                        </td>
                        <td>
                          <span
                            style={{
                              fontWeight: '500',
                              color: 'var(--negro-suave)',
                            }}
                          >
                            {itemsCount} {itemsCount === 1 ? 'pieza' : 'piezas'}
                          </span>
                        </td>
                        <td>
                          <strong
                            style={{
                              fontFamily: 'var(--font-display)',
                              color: 'var(--siena)',
                              fontSize: '1.05rem',
                            }}
                          >
                            {formatPrice(order.total)}
                          </strong>
                        </td>
                        <td>
                          <span
                            className={`admin-stock-badge ${statusMeta.badgeClass}`}
                          >
                            {statusMeta.label}
                          </span>
                        </td>
                        <td>
                          <button
                            type="button"
                            className={`admin-action-toggle ${isExpanded ? 'admin-action-toggle--expanded' : ''}`}
                            onClick={() =>
                              setExpandedId(isExpanded ? null : id)
                            }
                            aria-expanded={isExpanded}
                            title={
                              isExpanded
                                ? 'Ocultar detalles'
                                : 'Gestionar pedido'
                            }
                          >
                            <span
                              style={{
                                color: isExpanded ? '#ffffff' : 'var(--siena)',
                                fontWeight: '700',
                              }}
                            >
                              {isExpanded ? 'Cerrar' : 'Detalles'}
                            </span>
                            <svg
                              width="14"
                              height="14"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke={isExpanded ? '#ffffff' : 'currentColor'}
                              strokeWidth="2.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              style={{
                                transform: isExpanded
                                  ? 'rotate(180deg)'
                                  : 'none',
                                transition: 'transform 0.2s',
                              }}
                            >
                              <polyline points="6 9 12 15 18 9" />
                            </svg>
                          </button>
                        </td>
                      </tr>

                      {/* Fila expandible con detalle y cambio de estado */}
                      {isExpanded && (
                        <tr>
                          <td
                            colSpan="7"
                            style={{
                              padding: 0,
                              backgroundColor: '#f9f6f1',
                              borderBottom: '2px solid rgba(160, 82, 45, 0.15)',
                            }}
                          >
                            <div
                              style={{
                                padding: '1.5rem 2rem',
                                display: 'grid',
                                gridTemplateColumns:
                                  'repeat(auto-fit, minmax(280px, 1fr))',
                                gap: '2rem',
                              }}
                            >
                              {/* Lista de productos */}
                              <div>
                                <h4
                                  style={{
                                    margin: '0 0 0.8rem',
                                    fontSize: '0.85rem',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.08em',
                                    color: 'var(--gris)',
                                  }}
                                >
                                  Piezas adquiridas ({order.items?.length ?? 0})
                                </h4>
                                <ul
                                  style={{
                                    listStyle: 'none',
                                    padding: 0,
                                    margin: 0,
                                  }}
                                >
                                  {(order.items ?? []).map((item, i) => (
                                    <li
                                      key={i}
                                      style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        padding: '0.5rem 0',
                                        borderBottom:
                                          '1px dashed rgba(92, 61, 42, 0.15)',
                                        fontSize: '0.9rem',
                                      }}
                                    >
                                      <div>
                                        <strong
                                          style={{ color: 'var(--negro)' }}
                                        >
                                          {item.name}
                                        </strong>
                                        <span
                                          style={{
                                            color: 'var(--gris)',
                                            marginLeft: '0.5rem',
                                          }}
                                        >
                                          × {item.quantity}
                                        </span>
                                      </div>
                                      <span
                                        style={{
                                          fontWeight: '600',
                                          color: 'var(--negro-suave)',
                                        }}
                                      >
                                        {formatPrice(
                                          item.price * item.quantity
                                        )}
                                      </span>
                                    </li>
                                  ))}
                                </ul>
                                <div
                                  style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    marginTop: '0.8rem',
                                    paddingTop: '0.5rem',
                                    borderTop:
                                      '2px solid rgba(92, 61, 42, 0.2)',
                                    fontWeight: '700',
                                  }}
                                >
                                  <span>Total de la orden:</span>
                                  <span
                                    style={{
                                      color: 'var(--siena)',
                                      fontFamily: 'var(--font-display)',
                                      fontSize: '1.1rem',
                                    }}
                                  >
                                    {formatPrice(order.total)}
                                  </span>
                                </div>
                              </div>

                              {/* Control de actualización de estado */}
                              <div
                                style={{
                                  backgroundColor: '#ffffff',
                                  padding: '1.25rem',
                                  borderRadius: '10px',
                                  border: '1px solid rgba(92, 61, 42, 0.1)',
                                }}
                              >
                                <h4
                                  style={{
                                    margin: '0 0 0.5rem',
                                    fontSize: '0.85rem',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.08em',
                                    color: 'var(--gris)',
                                  }}
                                >
                                  Actualizar estado del pedido
                                </h4>
                                <p
                                  style={{
                                    fontSize: '0.82rem',
                                    color: 'var(--gris)',
                                    margin: '0 0 1rem',
                                  }}
                                >
                                  Cambiá el progreso de la orden para que el
                                  cliente lo vea en su historial.
                                </p>
                                <div
                                  style={{
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(2, 1fr)',
                                    gap: '0.5rem',
                                  }}
                                >
                                  {[
                                    { key: 'pending', label: 'Pendiente' },
                                    {
                                      key: 'processing',
                                      label: 'En preparación',
                                    },
                                    { key: 'completed', label: 'Completado' },
                                    { key: 'cancelled', label: 'Cancelado' },
                                  ].map(({ key, label }) => {
                                    const isCurrent = order.status === key;
                                    return (
                                      <button
                                        key={key}
                                        type="button"
                                        disabled={isCurrent || isUpdating}
                                        onClick={() =>
                                          handleStatusChange(id, key)
                                        }
                                        style={{
                                          padding: '8px 12px',
                                          fontSize: '0.82rem',
                                          fontWeight: isCurrent ? '700' : '500',
                                          borderRadius: '6px',
                                          border: isCurrent
                                            ? '2px solid var(--siena)'
                                            : '1px solid #dfd8cf',
                                          backgroundColor: isCurrent
                                            ? 'rgba(160, 82, 45, 0.1)'
                                            : '#ffffff',
                                          color: isCurrent
                                            ? 'var(--siena-dark)'
                                            : 'var(--negro)',
                                          cursor:
                                            isCurrent || isUpdating
                                              ? 'default'
                                              : 'pointer',
                                          textAlign: 'center',
                                          transition: 'all 0.15s',
                                        }}
                                      >
                                        {isUpdating && !isCurrent
                                          ? '...'
                                          : label}
                                        {isCurrent && ' ✓'}
                                      </button>
                                    );
                                  })}
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Estado sin resultados */}
        {!loadingOrders && !error && filtered.length === 0 && (
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
              style={{ color: 'var(--gris)', marginBottom: '1rem' }}
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="8" y1="12" x2="16" y2="12" />
            </svg>
            <p>No se encontraron pedidos con los filtros aplicados.</p>
            {(search || filterStatus !== 'all') && (
              <button
                type="button"
                className="btn-admin-cta"
                onClick={() => {
                  setSearch('');
                  setFilterStatus('all');
                }}
              >
                Limpiar filtros
              </button>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
