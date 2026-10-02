import React from 'react';
import { Link } from 'react-router-dom';

/**
 * Componente NotFound
 * Renderiza la pantalla de error 404 cuando la ruta no existe.
 */
function NotFound() {
  return (
    <section className="contact-section" aria-label="Página no encontrada">
      <div className="container">
        <div className="catalog-empty">
          <h1>Página no encontrada</h1>
          <p>La dirección que buscás no está disponible o ha sido movida.</p>
          <Link to="/" className="btn btn-primary">
            Ir al inicio
          </Link>
        </div>
      </div>
    </section>
  );
}

export default NotFound;
