import React, { useState, useEffect } from 'react';

function Navbar({ cartCount = 0 }) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 60);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    // Llamado inicial
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header
      className={`site-header ${isScrolled ? 'scrolled' : ''}`}
      id="site-header"
    >
      <div className="header-container">
        <a href="/" className="logo" aria-label="Hermanos Jota — Inicio">
          <img
            src="/assets/logo.svg"
            alt="Hermanos Jota"
            width="60"
            height="60"
          />
        </a>

        <nav
          className={`main-nav ${isMenuOpen ? 'open' : ''}`}
          id="main-nav"
          aria-label="Navegación principal"
        >
          <ul className="nav-list">
            <li>
              <a href="/" className="nav-link" aria-current="page">
                Inicio
              </a>
            </li>
            <li>
              <a href="/productos" className="nav-link">
                Productos
              </a>
            </li>
            <li>
              <a href="/contacto" className="nav-link">
                Contacto
              </a>
            </li>
          </ul>
        </nav>

        <div className="header-actions">
          <a
            href="/carrito"
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
          </a>
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
