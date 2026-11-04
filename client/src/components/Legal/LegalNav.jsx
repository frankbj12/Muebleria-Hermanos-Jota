import React from 'react';
import { NavLink } from 'react-router-dom';
import { useRepentanceModal } from '../../context/RepentanceModalContext';

const NAV_ITEMS = [
  {
    to: '/terminos-y-condiciones',
    label: 'Términos y condiciones',
    description: 'Contratación y derechos del consumidor',
    icon: (
      <svg
        viewBox="0 0 24 24"
        width="20"
        height="20"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
      </svg>
    ),
  },
  {
    to: '/politica-de-privacidad',
    label: 'Política de privacidad',
    description: 'Tratamiento seguro de tus datos',
    icon: (
      <svg
        viewBox="0 0 24 24"
        width="20"
        height="20"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),
  },
  {
    to: '/cambios-y-devoluciones',
    label: 'Cambios y devoluciones',
    description: 'Cambios, garantías y revocaciones',
    icon: (
      <svg
        viewBox="0 0 24 24"
        width="20"
        height="20"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <polyline points="1 4 1 10 7 10" />
        <polyline points="23 20 23 14 17 14" />
        <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15" />
      </svg>
    ),
  },
];

function LegalNav() {
  const { openRepentanceModal } = useRepentanceModal();

  return (
    <aside
      className="legal-sidebar"
      aria-label="Navegación entre apartados legales"
    >
      <div className="legal-sidebar-inner">
        <p className="legal-sidebar-eyebrow">Centro Legal</p>

        <nav aria-label="Secciones legales">
          <ul className="legal-sidebar-list">
            {NAV_ITEMS.map(({ to, label, description, icon }) => (
              <li key={to}>
                <NavLink
                  to={to}
                  className={({ isActive }) =>
                    `legal-sidebar-link ${isActive ? 'legal-sidebar-link--active' : ''}`
                  }
                >
                  <span className="legal-sidebar-icon">{icon}</span>
                  <span className="legal-sidebar-text">
                    <span className="legal-sidebar-label">{label}</span>
                    <span className="legal-sidebar-desc">{description}</span>
                  </span>
                  <svg
                    className="legal-sidebar-arrow"
                    viewBox="0 0 24 24"
                    width="14"
                    height="14"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className="legal-sidebar-divider" />

        <div className="legal-sidebar-repentance-box">
          <div className="legal-sidebar-repentance-header">
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
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <span>Ley 24.240 — Art. 34</span>
          </div>
          <p className="legal-sidebar-repentance-text">
            Podés revocar tu compra dentro de los{' '}
            <strong>10 días corridos</strong> de recibido el producto, sin cargo
            y sin justificar el motivo.
          </p>
          <button
            type="button"
            className="legal-sidebar-repentance-btn"
            onClick={openRepentanceModal}
          >
            <svg
              viewBox="0 0 24 24"
              width="16"
              height="16"
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
            Botón de arrepentimiento
          </button>
        </div>
      </div>
    </aside>
  );
}

export default LegalNav;
