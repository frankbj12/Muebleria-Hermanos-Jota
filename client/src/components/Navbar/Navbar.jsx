import React, { useState, useEffect, useContext } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { CartContext } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';

function Navbar({ cartCount: cartCountProp }) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const cartContext = useContext(CartContext);
  const { user, isAuthenticated, logout } = useAuth();
  const cartCount =
    cartCountProp !== undefined ? cartCountProp : (cartContext?.cartCount ?? 0);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 60);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    // Llamado inicial
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname, location.search]);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleLogout = () => {
    logout();
    setIsMenuOpen(false);
    navigate('/', { replace: true });
  };

  return (
    <header
      className={`site-header ${location.pathname === '/' ? 'home-page' : ''} ${isScrolled ? 'scrolled' : ''}`}
      id="site-header"
    >
      <div className="header-container">
        <Link to="/" className="logo" aria-label="Hermanos Jota — Inicio">
          <img
            src="/assets/logo.svg"
            alt="Hermanos Jota"
            width="60"
            height="60"
          />
        </Link>

        <nav
          className={`main-nav ${isMenuOpen ? 'open' : ''}`}
          id="main-nav"
          aria-label="Navegación principal"
        >
          <ul className="nav-list">
            <li>
              <NavLink to="/" end className="nav-link">
                Inicio
              </NavLink>
            </li>
            <li>
              <NavLink to="/productos" className="nav-link">
                Productos
              </NavLink>
            </li>
            <li>
              <NavLink to="/contacto" className="nav-link">
                Contacto
              </NavLink>
            </li>
            {isAuthenticated && user?.role === 'admin' && (
              <li>
                <Link to="/admin" className="nav-link">
                  Administración
                </Link>
              </li>
            )}
            {isAuthenticated ? (
              <li className="nav-auth-item">
                <div className="nav-user-widget">
                  <Link
                    to="/perfil"
                    className="nav-user-profile-link"
                    aria-label="Ir a mi perfil"
                    title="Ver mi perfil"
                  >
                    <div className="nav-user-avatar" aria-hidden="true">
                      {(user?.name || user?.email || 'U')[0].toUpperCase()}
                    </div>
                    <div className="nav-user-info">
                      <span className="nav-user-name">
                        {user?.name || user?.email || 'Mi cuenta'}
                      </span>
                      {user?.role === 'admin' && (
                        <span className="nav-user-badge">Admin</span>
                      )}
                    </div>
                  </Link>
                  <button
                    type="button"
                    className="nav-logout-button"
                    onClick={handleLogout}
                    aria-label="Cerrar sesión"
                    title="Cerrar sesión"
                  >
                    <svg
                      width="16"
                      height="16"
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
                  </button>
                </div>
              </li>
            ) : (
              <li className="nav-auth-item">
                <Link to="/login" className="nav-login-button">
                  <svg
                    width="23"
                    height="23"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <circle cx="12" cy="7" r="4" />
                    <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
                  </svg>
                  Ingresar
                </Link>
              </li>
            )}
          </ul>
        </nav>

        <div className="header-actions">
          <Link
            to="/carrito"
            className="cart-link"
            id="cart-link"
            aria-label="Carrito de compras"
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
              <circle cx="9" cy="21" r="1" />
              <circle cx="20" cy="21" r="1" />
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
            </svg>
            <span className="cart-count" id="cart-count" aria-hidden="true">
              {cartCount}
            </span>
          </Link>
        </div>

        <button
          className={`menu-toggle ${isMenuOpen ? 'open' : ''}`}
          id="menu-toggle"
          aria-expanded={isMenuOpen}
          aria-controls="main-nav"
          aria-label={
            isMenuOpen
              ? 'Cerrar menú de navegación'
              : 'Abrir menú de navegación'
          }
          onClick={toggleMenu}
        >
          <span className="menu-toggle-bar"></span>
          <span className="menu-toggle-bar"></span>
          <span className="menu-toggle-bar"></span>
        </button>
      </div>
    </header>
  );
}

export default Navbar;
