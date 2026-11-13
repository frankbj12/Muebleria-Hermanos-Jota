import React, { useContext } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { CartContext } from '../../context/CartContext';
import { useToast } from '../../context/ToastContext';
import './UserPages.css';

function getInitials(name, email) {
  if (typeof name === 'string' && name.trim()) {
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return parts[0].slice(0, 2).toUpperCase();
  }

  if (typeof email === 'string' && email.trim()) {
    return email.trim()[0].toUpperCase();
  }

  return 'U';
}

/**
 * Vista de Perfil de Usuario (/perfil)
 * Muestra los datos de la cuenta autenticada, accesos rápidos y cierre de sesión.
 */
export default function ProfilePage() {
  const { user, loading, isAuthenticated, logout } = useAuth();
  const cartContext = useContext(CartContext);
  const toastContext = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  if (loading) {
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

  const isAdmin = user.role === 'admin';
  const roleLabel = isAdmin ? 'Administrador' : 'Cliente';
  const displayName = user.name || user.email || 'Usuario';
  const initials = getInitials(user.name, user.email);
  const cartCount = cartContext?.cartCount ?? 0;

  const handleLogout = () => {
    logout();
    toastContext?.addToast?.('Cerraste sesión correctamente.', 'info');
    navigate('/', { replace: true });
  };

  return (
    <article className="account-page">
      <header className="page-banner">
        <div className="container">
          <p className="section-eyebrow">Mi Cuenta</p>
          <h1 className="section-title">Tu Perfil</h1>
          <p className="section-intro">
            Consultá los datos de tu cuenta, revisá tus compras y gestioná tu
            sesión en Hermanos Jota.
          </p>
        </div>
      </header>

      <section className="account-section" aria-label="Información de perfil">
        <div className="container">
          <div className="profile-layout">
            {/* Tarjeta de identidad */}
            <aside
              className="profile-identity-card"
              aria-label="Datos personales"
            >
              <div className="profile-identity-header">
                <div className="profile-avatar-lg" aria-hidden="true">
                  {initials}
                </div>
                <h2 className="profile-user-name">{displayName}</h2>
                <span
                  className={`profile-role-badge ${
                    isAdmin
                      ? 'profile-role-badge--admin'
                      : 'profile-role-badge--user'
                  }`}
                >
                  {roleLabel}
                </span>
              </div>

              <dl className="profile-details-list">
                <div className="profile-detail-item">
                  <dt>Nombre completo</dt>
                  <dd>{user.name || 'No especificado'}</dd>
                </div>

                <div className="profile-detail-item">
                  <dt>Correo electrónico</dt>
                  <dd>{user.email || 'No especificado'}</dd>
                </div>

                <div className="profile-detail-item">
                  <dt>Tipo de cuenta</dt>
                  <dd>{roleLabel}</dd>
                </div>

                <div className="profile-detail-item">
                  <dt>Estado</dt>
                  <dd className="profile-session-status">
                    <span className="profile-status-dot" aria-hidden="true" />
                    Sesión activa
                  </dd>
                </div>
              </dl>

              <div className="profile-identity-footer">
                <button
                  type="button"
                  className="profile-logout-btn"
                  onClick={handleLogout}
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
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                    <polyline points="16 17 21 12 16 7" />
                    <line x1="21" y1="12" x2="9" y2="12" />
                  </svg>
                  Cerrar sesión
                </button>
              </div>
            </aside>

            {/* Panel de accesos rápidos */}
            <div className="profile-actions-panel">
              <div>
                <h2 className="profile-panel-heading">Accesos rápidos</h2>
                <p className="profile-panel-lead">
                  Navegá directamente por tus pedidos, carrito o catálogo.
                </p>
              </div>

              <div className="profile-actions-grid">
                <Link to="/mis-pedidos" className="profile-action-card">
                  <div>
                    <div className="profile-action-top">
                      <span className="profile-action-icon" aria-hidden="true">
                        <svg
                          width="20"
                          height="20"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
                          <path d="m3.3 7 8.7 5 8.7-5" />
                          <path d="M12 22V12" />
                        </svg>
                      </span>
                    </div>
                    <h3 className="profile-action-title">Mis Pedidos</h3>
                    <p className="profile-action-desc">
                      Consultá el historial de tus compras, productos
                      adquiridos, totales y estados.
                    </p>
                  </div>
                  <span className="profile-action-cta">
                    Ver mis pedidos <span aria-hidden="true">&rarr;</span>
                  </span>
                </Link>

                <Link to="/carrito" className="profile-action-card">
                  <div>
                    <div className="profile-action-top">
                      <span className="profile-action-icon" aria-hidden="true">
                        <svg
                          width="20"
                          height="20"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <circle cx="9" cy="21" r="1" />
                          <circle cx="20" cy="21" r="1" />
                          <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                        </svg>
                      </span>
                      <span className="profile-action-pill">
                        {cartCount === 0
                          ? 'Vacío'
                          : `${cartCount} ${cartCount === 1 ? 'ítem' : 'ítems'}`}
                      </span>
                    </div>
                    <h3 className="profile-action-title">Mi Carrito</h3>
                    <p className="profile-action-desc">
                      {cartCount === 0
                        ? 'Tu carrito no tiene productos agregados en este momento.'
                        : 'Revisá las piezas que guardaste antes de finalizar la compra.'}
                    </p>
                  </div>
                  <span className="profile-action-cta">
                    Ir al carrito <span aria-hidden="true">&rarr;</span>
                  </span>
                </Link>

                <Link to="/productos" className="profile-action-card">
                  <div>
                    <div className="profile-action-top">
                      <span className="profile-action-icon" aria-hidden="true">
                        <svg
                          width="20"
                          height="20"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M20 9V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v3" />
                          <path d="M2 11v5a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-5a2 2 0 0 0-4 0v2H6v-2a2 2 0 0 0-4 0Z" />
                          <path d="M4 18v2" />
                          <path d="M20 18v2" />
                        </svg>
                      </span>
                    </div>
                    <h3 className="profile-action-title">
                      Catálogo de Muebles
                    </h3>
                    <p className="profile-action-desc">
                      Explorá nuestras colecciones artesanales para living,
                      comedor, dormitorio y trabajo.
                    </p>
                  </div>
                  <span className="profile-action-cta">
                    Explorar catálogo <span aria-hidden="true">&rarr;</span>
                  </span>
                </Link>

                {isAdmin && (
                  <Link
                    to="/admin"
                    className="profile-action-card profile-action-card--accent"
                  >
                    <div>
                      <div className="profile-action-top">
                        <span
                          className="profile-action-icon"
                          aria-hidden="true"
                        >
                          <svg
                            width="20"
                            height="20"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
                            <circle cx="12" cy="12" r="3" />
                          </svg>
                        </span>
                        <span className="profile-action-pill">Admin</span>
                      </div>
                      <h3 className="profile-action-title">
                        Panel de Administración
                      </h3>
                      <p className="profile-action-desc">
                        Gestioná el inventario, creá nuevos productos y
                        actualizá precios o stock.
                      </p>
                    </div>
                    <span className="profile-action-cta">
                      Abrir administración{' '}
                      <span aria-hidden="true">&rarr;</span>
                    </span>
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </article>
  );
}
