import React from 'react';

/**
 * Mensajes promocionales por defecto.
 * Configurables fácilmente aquí o mediante la prop `items`.
 */
const DEFAULT_ANNOUNCEMENTS = [
  { id: 1, icon: '✦', text: 'OFERTAS ESPECIALES EN PRODUCTOS SELECCIONADOS' },
  { id: 2, icon: '🚚', text: 'ENVÍOS A TODO EL PAÍS' },
  { id: 3, icon: '✦', text: 'PROMOCIONES EXCLUSIVAS POR TIEMPO LIMITADO' },
  { id: 4, icon: '🔒', text: 'COMPRÁ DE FORMA SEGURA' },
  { id: 5, icon: '🌿', text: 'MADERAS 100% CERTIFICADAS FSC®' },
];

/**
 * AnnouncementBar / Marquee
 * Barra promocional horizontal animada con desplazamiento continuo (seamless loop).
 *
 * @param {Object} props
 * @param {Array} [props.items] - Lista opcional de items [{ id, icon, text }]
 */
function AnnouncementBar({ items = DEFAULT_ANNOUNCEMENTS }) {
  // Renderizamos dos bloques idénticos con aria-hidden en el duplicado para lograr el bucle infinito sin saltos
  const renderTrack = (ariaHidden = false) => (
    <div
      className="announcement-bar__track"
      aria-hidden={ariaHidden ? 'true' : undefined}
    >
      {items.map((item, idx) => (
        <span
          key={`${item.id || idx}-${ariaHidden ? 'dup' : 'orig'}`}
          className="announcement-bar__item"
        >
          <span className="announcement-bar__icon" aria-hidden="true">
            {item.icon}
          </span>
          <span className="announcement-bar__text">{item.text}</span>
          <span className="announcement-bar__separator" aria-hidden="true">
            ·
          </span>
        </span>
      ))}
    </div>
  );

  return (
    <aside
      className="announcement-bar"
      role="region"
      aria-label="Anuncios y beneficios destacados"
    >
      <div className="announcement-bar__viewport">
        {renderTrack(false)}
        {renderTrack(true)}
      </div>
    </aside>
  );
}

export default AnnouncementBar;
