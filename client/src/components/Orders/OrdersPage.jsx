import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { Link, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ProductsContext } from '../../context/ProductsContext';
import pedidosApi from '../../services/pedidosApi';
import OrderItem from './OrderItem';
import '../User/UserPages.css';

const STATUS_FILTER_ORDER = ['pending', 'processing', 'completed', 'cancelled'];

const STATUS_FILTER_LABELS = {
  pending: 'Pendientes',
  processing: 'En preparación',
  completed: 'Completados',
  cancelled: 'Cancelados',
};

/**
 * Vista de Historial de Pedidos (/mis-pedidos)
 * Muestra los pedidos realizados por el usuario autenticado con fotos de cada producto.
 */
export default function OrdersPage() {
  const { loading: authLoading, isAuthenticated } = useAuth();
  const productsContext = useContext(ProductsContext);
  const location = useLocation();

  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [error, setError] = useState('');
  const [retryCount, setRetryCount] = useState(0);
  const [statusFilter, setStatusFilter] = useState('all');

  const handleRetry = useCallback(() => {
    setRetryCount((prev) => prev + 1);
  }, []);

  const catalogProducts = productsContext?.products;
  const catalogLoading = Boolean(productsContext?.loading);

  const productsById = useMemo(() => {
    const map = new Map();
    if (!Array.isArray(catalogProducts)) return map;

    catalogProducts.forEach((product) => {
      const productId = product?.id ?? product?._id;
      if (productId) {
        map.set(String(productId), product);
      }
    });

    return map;
  }, [catalogProducts]);

  const statusCounts = useMemo(() => {
    const counts = { all: orders.length };
    orders.forEach((order) => {
      const key = STATUS_FILTER_LABELS[order.status] ? order.status : 'pending';
      counts[key] = (counts[key] || 0) + 1;
    });
    return counts;
  }, [orders]);

  const availableStatuses = useMemo(
    () =>
      STATUS_FILTER_ORDER.filter((status) => (statusCounts[status] || 0) > 0),
    [statusCounts]
  );

  const visibleOrders = useMemo(() => {
    if (statusFilter === 'all') return orders;
    return orders.filter(
      (order) =>
        (STATUS_FILTER_LABELS[order.status] ? order.status : 'pending') ===
        statusFilter
    );
  }, [orders, statusFilter]);

  useEffect(() => {
    if (statusFilter !== 'all' && !statusCounts[statusFilter]) {
      setStatusFilter('all');
    }
  }, [statusCounts, statusFilter]);

  useEffect(() => {
    if (authLoading || !isAuthenticated) {
      return undefined;
    }

    const controller = new AbortController();
    let isMounted = true;

    const loadOrders = async () => {
      setLoadingOrders(true);
      setError('');

      try {
        const fetchedOrders = await pedidosApi.getMyOrders({
          signal: controller.signal,
        });
        if (isMounted) {
          setOrders(fetchedOrders);
        }
      } catch (err) {
        if (err?.name === 'AbortError') return;
        if (isMounted) {
          setError(
            err?.message ||
              'No pudimos cargar tu historial de pedidos. Intentá nuevamente.'
          );
        }
      } finally {
        if (isMounted) {
          setLoadingOrders(false);
        }
      }
    };

    loadOrders();

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [authLoading, isAuthenticated, retryCount]);

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

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return (
    <article className="account-page">
      <header className="page-banner">
        <div className="container">
          <p className="section-eyebrow">Mi Cuenta</p>
          <h1 className="section-title">Mis Pedidos</h1>
          <p className="section-intro">
            Seguí el estado de tus compras y revisá el detalle de cada pieza
            adquirida en Hermanos Jota.
          </p>
        </div>
      </header>

      <section className="account-section" aria-label="Historial de pedidos">
        <div className="container">
          <div className="orders-shell">
            <div className="orders-top-bar">
              <Link to="/perfil" className="orders-back-link">
                <span aria-hidden="true">&larr;</span> Volver a mi perfil
              </Link>
              {!loadingOrders && !error && orders.length > 0 && (
                <span className="orders-count-summary">
                  {orders.length}{' '}
                  {orders.length === 1
                    ? 'pedido registrado'
                    : 'pedidos registrados'}
                </span>
              )}
            </div>

            {!loadingOrders && !error && availableStatuses.length > 1 && (
              <div
                className="orders-filters"
                role="group"
                aria-label="Filtrar pedidos por estado"
              >
                <button
                  type="button"
                  className={`orders-filter-chip ${
                    statusFilter === 'all' ? 'orders-filter-chip--active' : ''
                  }`.trim()}
                  aria-pressed={statusFilter === 'all'}
                  onClick={() => setStatusFilter('all')}
                >
                  {`Todos (${orders.length})`}
                </button>
                {availableStatuses.map((status) => (
                  <button
                    key={status}
                    type="button"
                    className={`orders-filter-chip ${
                      statusFilter === status
                        ? 'orders-filter-chip--active'
                        : ''
                    }`.trim()}
                    aria-pressed={statusFilter === status}
                    onClick={() => setStatusFilter(status)}
                  >
                    {`${STATUS_FILTER_LABELS[status]} (${statusCounts[status]})`}
                  </button>
                ))}
              </div>
            )}

            {loadingOrders && (
              <div className="account-loading" role="status" aria-live="polite">
                <span className="account-spinner" aria-hidden="true" />
                <p>Cargando tus pedidos...</p>
              </div>
            )}

            {!loadingOrders && error && (
              <div className="account-error-card" role="alert">
                <h2>No pudimos cargar tus pedidos</h2>
                <p>{error}</p>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleRetry}
                >
                  Reintentar
                </button>
              </div>
            )}

            {!loadingOrders && !error && orders.length === 0 && (
              <div className="account-empty-card">
                <div className="account-empty-icon" aria-hidden="true">
                  <svg
                    width="36"
                    height="36"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
                    <path d="m3.3 7 8.7 5 8.7-5" />
                    <path d="M12 22V12" />
                  </svg>
                </div>
                <h2>Todavía no realizaste ningún pedido</h2>
                <p>
                  Cuando confirmes una compra desde tu carrito, vas a poder ver
                  aquí el resumen, la fecha y el estado de cada orden.
                </p>
                <div className="account-empty-actions">
                  <Link to="/productos" className="btn btn-primary">
                    Explorar catálogo
                  </Link>
                  <Link to="/carrito" className="btn btn-secondary">
                    Ver carrito
                  </Link>
                </div>
              </div>
            )}

            {!loadingOrders && !error && orders.length > 0 && (
              <div className="orders-list">
                {visibleOrders.map((order) => (
                  <OrderItem
                    key={order.id ?? order._id}
                    order={order}
                    productsById={productsById}
                    catalogLoading={catalogLoading}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    </article>
  );
}
