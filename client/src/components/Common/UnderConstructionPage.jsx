import React from 'react';
import { Link } from 'react-router-dom';

/**
 * Componente genérico para rutas en desarrollo
 * Reutilizable para cualquier pantalla que aún no tenga su desarrollo final.
 */
export default function UnderConstructionPage({
  title = 'Página en construcción',
}) {
  return (
    <section
      style={{
        paddingTop: 'calc(var(--header-height) + 3rem)',
        paddingBottom: '4rem',
        minHeight: '65vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
      }}
    >
      <div className="container">
        <span
          style={{
            display: 'inline-block',
            fontSize: '0.8rem',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            color: 'var(--siena)',
            background: 'var(--alabastro)',
            padding: '0.25rem 0.75rem',
            borderRadius: '999px',
            fontWeight: 600,
            marginBottom: '1rem',
          }}
        >
          En desarrollo
        </span>
        <h1
          style={{
            fontFamily: 'var(--font-display)',
            color: 'var(--negro)',
            marginBottom: '0.75rem',
          }}
        >
          {title}
        </h1>
        <p
          style={{
            color: 'var(--gris)',
            maxWidth: '450px',
            margin: '0 auto 1.5rem auto',
          }}
        >
          Esta sección estará disponible próximamente en las siguientes
          entregas.
        </p>
        <Link to="/" className="btn btn-primary">
          Volver al inicio
        </Link>
      </div>
    </section>
  );
}
