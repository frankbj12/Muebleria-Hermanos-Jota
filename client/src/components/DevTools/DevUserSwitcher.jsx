import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './DevUserSwitcher.css';

export default function DevUserSwitcher() {
  const [isOpen, setIsOpen] = useState(false);
  const { user, isAuthenticated, switchUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const currentRole = isAuthenticated ? user?.role || 'user' : 'guest';

  const handleSelectRole = (role) => {
    switchUser(role);
  };

  return (
    <aside
      className={`dev-switcher ${isOpen ? 'dev-switcher--open' : ''}`}
      aria-label="Panel rápido de roles de desarrollo"
    >
      {!isOpen ? (
        <button
          type="button"
          className="dev-switcher-trigger"
          onClick={() => setIsOpen(true)}
          aria-label="Abrir selector de usuarios y roles"
          title="Abrir selector de usuarios y roles (Modo Dev)"
        >
          <span className="dev-switcher-icon" aria-hidden="true">
            🛠️
          </span>
          <span className="dev-switcher-label">
            Rol:{' '}
            <strong>
              {currentRole === 'guest' ? 'Invitado' : currentRole}
            </strong>
          </span>
        </button>
      ) : (
        <div className="dev-switcher-panel">
          <div className="dev-switcher-header">
            <div>
              <span className="dev-switcher-title">🛠️ Selector de Usuario</span>
              <span className="dev-switcher-badge">Dev Mode</span>
            </div>
            <button
              type="button"
              className="dev-switcher-close"
              onClick={() => setIsOpen(false)}
              aria-label="Cerrar selector"
              title="Minimizar panel"
            >
              ✕
            </button>
          </div>

          <div className="dev-switcher-current">
            <span className="dev-switcher-text-muted">Estado actual:</span>
            <div className="dev-switcher-user-info">
              <strong>
                {isAuthenticated
                  ? user?.name || user?.email
                  : 'Sin sesión (Invitado)'}
              </strong>
              <span className={`dev-role-tag dev-role-tag--${currentRole}`}>
                {currentRole}
              </span>
            </div>
          </div>

          <div className="dev-switcher-actions">
            <button
              type="button"
              className={`dev-btn ${currentRole === 'guest' ? 'dev-btn--active' : ''}`}
              onClick={() => handleSelectRole('guest')}
            >
              <span aria-hidden="true">👤</span>
              <span>Invitado (Desconectado)</span>
            </button>

            <button
              type="button"
              className={`dev-btn ${currentRole === 'user' ? 'dev-btn--active' : ''}`}
              onClick={() => handleSelectRole('user')}
            >
              <span aria-hidden="true">🛒</span>
              <span>Cliente (role: 'user')</span>
            </button>

            <button
              type="button"
              className={`dev-btn ${currentRole === 'admin' ? 'dev-btn--active' : ''}`}
              onClick={() => handleSelectRole('admin')}
            >
              <span aria-hidden="true">🛡️</span>
              <span>Administrador (role: 'admin')</span>
            </button>
          </div>

          {currentRole === 'admin' && location.pathname !== '/admin' && (
            <button
              type="button"
              className="dev-btn dev-btn--link"
              onClick={() => navigate('/admin')}
            >
              👉 Ir al Panel de Admin (/admin)
            </button>
          )}

          {currentRole === 'user' && location.pathname !== '/perfil' && (
            <button
              type="button"
              className="dev-btn dev-btn--link"
              onClick={() => navigate('/perfil')}
            >
              👉 Ir al Perfil (/perfil)
            </button>
          )}
        </div>
      )}
    </aside>
  );
}
